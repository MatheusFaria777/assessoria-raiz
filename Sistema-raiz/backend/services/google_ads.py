"""Google Ads API service — REST direto via HTTP (sem gRPC)."""
import requests
from google.oauth2.credentials import Credentials as OAuthCredentials
from google.auth.transport.requests import Request as AuthRequest

CHANNEL_LABELS = {
    "SEARCH":          {"label": "Campanha de Pesquisa",  "metrica": "Leads"},
    "DISPLAY":         {"label": "Campanha de Display",   "metrica": "Cliques"},
    "VIDEO":           {"label": "Campanha de YouTube",   "metrica": "Visualizações"},
    "PERFORMANCE_MAX": {"label": "Performance Max",        "metrica": "Conversões"},
    "SHOPPING":        {"label": "Campanha de Shopping",  "metrica": "Cliques"},
}

_API_VERSION = "v22"
_BASE_URL = f"https://googleads.googleapis.com/{_API_VERSION}"


def _get_access_token(credentials: dict) -> str:
    cred = OAuthCredentials(
        token=None,
        refresh_token=credentials["refresh_token"],
        token_uri="https://oauth2.googleapis.com/token",
        client_id=credentials["client_id"],
        client_secret=credentials["client_secret"],
    )
    cred.refresh(AuthRequest())
    return cred.token


def _search(credentials: dict, customer_id: str, query: str) -> list:
    token = _get_access_token(credentials)
    if not token:
        raise Exception("Falha ao obter access token OAuth Google")
    cid = str(customer_id).replace("-", "")
    headers = {
        "Authorization": f"Bearer {token}",
        "developer-token": credentials["developer_token"],
        "Content-Type": "application/json",
    }
    if credentials.get("login_customer_id"):
        headers["login-customer-id"] = str(credentials["login_customer_id"]).replace("-", "")

    results = []
    page_token = None
    while True:
        body: dict = {"query": query}
        if page_token:
            body["pageToken"] = page_token
        resp = requests.post(
            f"{_BASE_URL}/customers/{cid}/googleAds:search",
            headers=headers,
            json=body,
            timeout=30,
        )
        if not resp.text.strip():
            raise Exception(f"Google Ads API retornou corpo vazio (HTTP {resp.status_code})")
        try:
            data = resp.json()
        except Exception:
            raise Exception(f"Google Ads API retornou resposta não-JSON (HTTP {resp.status_code}): {resp.text[:300]}")
        if not resp.ok:
            err = data.get("error", {})
            details = err.get("details", [])
            detail_str = ""
            for d in details:
                for e in d.get("errors", []):
                    loc = ".".join(e.get("location", {}).get("fieldPathElements", [{}])[0].get("fieldName", "") for _ in [1])
                    detail_str += f" | {e.get('message', '')} (campo: {loc or '?'})"
            raise Exception(f"HTTP {resp.status_code}: {err.get('message', str(data)[:200])}{detail_str}")
        results.extend(data.get("results", []))
        page_token = data.get("nextPageToken")
        if not page_token:
            break
    return results


def get_account_data(customer_id: str, credentials: dict, since: str, until: str) -> dict:
    query = f"""
        SELECT campaign.advertising_channel_type, metrics.cost_micros,
               metrics.conversions, metrics.conversions_value,
               metrics.clicks, metrics.impressions
        FROM campaign
        WHERE segments.date BETWEEN '{since}' AND '{until}'
          AND campaign.status != REMOVED
          AND metrics.cost_micros > 0
    """
    rows = _search(credentials, customer_id, query)
    tipos = {}
    total_spend = 0.0

    for row in rows:
        channel = row.get("campaign", {}).get("advertisingChannelType", "SEARCH")
        m = row.get("metrics", {})
        spend       = int(m.get("costMicros", 0) or 0) / 1_000_000
        conversions = float(m.get("conversions", 0) or 0)
        clicks      = int(m.get("clicks", 0) or 0)
        impressions = int(m.get("impressions", 0) or 0)
        total_spend += spend
        tipo = channel.lower()
        info = CHANNEL_LABELS.get(channel, {"label": "Campanha", "metrica": "Conversões"})

        if tipo not in tipos:
            tipos[tipo] = {
                "spend": 0.0, "_conversions": 0.0, "_clicks": 0,
                "impressions": 0, "link_clicks": 0, "purchase_value": 0.0,
                "label": info["label"], "metrica": info["metrica"],
            }

        tipos[tipo]["spend"]        += spend
        tipos[tipo]["_conversions"] += conversions
        tipos[tipo]["_clicks"]      += clicks
        tipos[tipo]["impressions"]  += impressions
        tipos[tipo]["link_clicks"]  += clicks

    for dados in tipos.values():
        if dados["_conversions"] > 0:
            dados["results"] = int(round(dados["_conversions"]))
        else:
            dados["results"] = dados["_clicks"]
            dados["metrica"] = "Cliques"
        r = dados["results"]
        dados["cost_per_result"] = dados["spend"] / r if r > 0 else 0.0
        del dados["_conversions"], dados["_clicks"]

    return {"tipos": tipos, "total_spend": total_spend, "primary_type": next(iter(tipos), None), "platform": "google"}


def get_top_keywords(customer_id: str, credentials: dict, since: str, until: str, n: int = 3) -> list:
    query = f"""
        SELECT ad_group_criterion.keyword.text, metrics.conversions, metrics.clicks
        FROM keyword_view
        WHERE segments.date BETWEEN '{since}' AND '{until}'
          AND ad_group_criterion.status != REMOVED
          AND campaign.status != REMOVED
          AND ad_group_criterion.type = KEYWORD
    """
    try:
        rows = _search(credentials, customer_id, query)
    except Exception:
        # keyword_view não disponível para contas sem campanhas de Search (ex: apenas Performance Max)
        return []
    by_kw: dict[str, float] = {}
    for row in rows:
        kw = row.get("adGroupCriterion", {}).get("keyword", {}).get("text", "")
        if not kw:
            continue
        m = row.get("metrics", {})
        conv   = float(m.get("conversions", 0) or 0)
        clicks = int(m.get("clicks", 0) or 0)
        score  = conv if conv > 0 else clicks * 0.001
        by_kw[kw] = by_kw.get(kw, 0.0) + score
    ranked = sorted(((k, s) for k, s in by_kw.items() if s > 0), key=lambda x: x[1], reverse=True)
    return [kw for kw, _ in ranked[:n]]
