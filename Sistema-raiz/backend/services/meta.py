"""
Meta Ads API service — adaptado do sistema v1.
Usa grupos de campanha do banco de dados em vez do campaign_types.json.
"""
from facebook_business.api import FacebookAdsApi
from facebook_business.adobjects.adaccount import AdAccount
from facebook_business.adobjects.ad import Ad
import json

# Mapeamento tipo_grupo → tipo_contagem → ação Meta API
_CONTAGEM_MAP = {
    "mensagem":    {"acao": "onsite_conversion.messaging_conversation_started_7d", "campo": None},
    "lead":        {"acao": ["leadgen_other", "onsite_conversion.lead_grouped", "lead", "contact_total"], "campo": None},
    "engajamento": {"acao": "post_engagement",  "campo": None},
    "cliques":     {"acao": "link_click",        "campo": None},
    "alcance":     {"acao": None,                "campo": "reach"},
    "compras":     {"acao": "purchase",          "campo": None},
}

# Grupos de tipo → métrica de contagem (para grupos do banco)
_TYPE_TO_CONTAGEM = {
    "mensagem":    "mensagem",
    "lead":        "lead",
    "formulario":  "lead",
    "engajamento": "engajamento",
    "vendas":      "compras",
    "venda":       "compras",
    "alcance":     "alcance",
    "trafego":     "cliques",
    "live":        "cliques",
    "consignacao": "mensagem",
    "vagas":       "mensagem",
    "manutencao":  "mensagem",
}

_PRIMARY_CONTAGEM = {"mensagem", "lead"}

CAMPAIGN_FIELDS = ["campaign_id", "campaign_name", "spend", "actions", "action_values", "reach", "impressions", "inline_link_clicks"]
AD_FIELDS = ["ad_id", "ad_name", "campaign_id", "campaign_name", "actions", "spend"]


def _init(token: str):
    FacebookAdsApi.init(access_token=token)


def _ensure_act(account_id: str) -> str:
    return f"act_{account_id}" if not account_id.startswith("act_") else account_id


def _sum_action(actions: list, action_type) -> float:
    if not actions:
        return 0.0
    types = [action_type] if isinstance(action_type, str) else action_type
    for t in types:
        for a in actions:
            if a.get("action_type") == t:
                val = float(a.get("value", 0))
                if val > 0:
                    return val
    return 0.0


def grupos_to_tipos(grupos: list) -> list:
    """Converte lista de CampaignGroup (do banco) para o formato tipos_cfg usado pelas funções da API."""
    tipos = []
    for g in grupos:
        tipo_contagem = _TYPE_TO_CONTAGEM.get(g.type, "mensagem")
        mapping = _CONTAGEM_MAP.get(tipo_contagem, {"acao": None, "campo": None})
        palavras = json.loads(g.keywords) if isinstance(g.keywords, str) else g.keywords
        tipos.append({
            "tipo":          g.type,
            "tipo_contagem": tipo_contagem,
            "palavras":      palavras,
            "label":         g.name,
            "metrica":       _metrica_label(tipo_contagem),
            "acao":          mapping["acao"],
            "campo":         mapping["campo"],
        })
    return tipos


def _metrica_label(tipo_contagem: str) -> str:
    return {
        "mensagem":    "Mensagem",
        "lead":        "Leads",
        "engajamento": "Engajamento",
        "cliques":     "Cliques",
        "alcance":     "Alcance",
        "compras":     "Compras",
    }.get(tipo_contagem, "Resultado")


def _detect_tipo(campaign_name: str, tipos: list) -> str:
    name_lower = campaign_name.lower()
    primary_set = {t["tipo"] for t in tipos if t.get("tipo_contagem") in _PRIMARY_CONTAGEM}
    best_tipo = "outro"
    best_score = 0
    for t in tipos:
        tier = 2 if t["tipo"] in primary_set else 1
        for palavra in t.get("palavras", []):
            if palavra in name_lower:
                score = len(palavra) * tier
                if score > best_score:
                    best_score = score
                    best_tipo = t["tipo"]
    return best_tipo


def _config_for(tipo: str, tipos: list) -> dict | None:
    return next((t for t in tipos if t["tipo"] == tipo), None)


def get_campaigns_for_account(account_id: str, token: str) -> list[dict]:
    """Retorna todas as campanhas ativas da conta, para exibir na UI de mapeamento."""
    _init(token)
    account = AdAccount(_ensure_act(account_id))
    rows = list(account.get_campaigns(
        fields=["id", "name", "status", "objective"],
        params={"limit": 500},
    ))
    return [
        {
            "id": r.get("id", ""),
            "name": r.get("name", ""),
            "status": r.get("status", ""),
            "objective": r.get("objective", ""),
        }
        for r in rows
    ]


def get_adsets_for_campaign(account_id: str, token: str, campaign_id: str) -> list[dict]:
    """Retorna os conjuntos (ad sets) de uma campanha — pra mapear individualmente por vendedor/pessoa."""
    _init(token)
    from facebook_business.adobjects.campaign import Campaign
    camp = Campaign(campaign_id)
    rows = list(camp.get_ad_sets(fields=["id", "name", "status"], params={"limit": 500}))
    return [
        {"id": r.get("id", ""), "name": r.get("name", ""), "status": r.get("status", "")}
        for r in rows
    ]


def _config_from_row(c) -> dict:
    tipo_contagem = _TYPE_TO_CONTAGEM.get(c.campaign_type, "mensagem")
    mapping = _CONTAGEM_MAP.get(tipo_contagem, {"acao": None, "campo": None})
    from services.campaign_config import suggest_label
    return {
        "type": c.campaign_type,
        "label": c.label or suggest_label(c.name) or c.campaign_type.capitalize(),
        "sheet_tab": c.sheet_tab,
        "tipo_contagem": tipo_contagem,
        "metrica": _metrica_label(tipo_contagem),
        "acao": mapping["acao"],
        "campo": mapping["campo"],
    }


def _build_campaign_maps(campaign_map: list) -> tuple[dict, dict]:
    """
    Separa o mapeamento salvo em dois níveis:
    - by_campaign: {meta_campaign_id: config} — mapeamento da campanha inteira
    - by_adset: {meta_adset_id: config} — mapeamento de um conjunto específico
      dentro de uma campanha (pra separar por vendedor/pessoa, por exemplo)
    """
    by_campaign, by_adset = {}, {}
    for c in campaign_map:
        cfg = _config_from_row(c)
        if c.meta_adset_id:
            by_adset[str(c.meta_adset_id)] = cfg
        else:
            by_campaign[str(c.meta_campaign_id)] = cfg
    return by_campaign, by_adset


def _match_explicit(row: dict, by_campaign: dict, by_adset: dict) -> dict | None:
    """Acha a config certa pra uma linha de insight — conjunto específico tem prioridade sobre a campanha inteira."""
    adset_id = str(row.get("adset_id", ""))
    if adset_id and adset_id in by_adset:
        return by_adset[adset_id]
    campaign_id = str(row.get("campaign_id", ""))
    return by_campaign.get(campaign_id)


def get_account_data(account_id: str, token: str, since: str, until: str, tipos_cfg: list, campaign_map: list | None = None) -> dict:
    _init(token)
    account = AdAccount(_ensure_act(account_id))

    # Mapeamento explícito por ID tem prioridade sobre keyword detection
    by_campaign, by_adset = _build_campaign_maps(campaign_map) if campaign_map else ({}, {})
    use_explicit = bool(by_campaign) or bool(by_adset)

    # Precisa buscar por conjunto (não só por campanha) quando tiver mapeamento nesse nível —
    # ex: campanha com um conjunto por vendedor, cada um contando separado.
    if by_adset:
        insight_fields = CAMPAIGN_FIELDS + ["adset_id", "adset_name"]
        insight_level = "adset"
    else:
        insight_fields = CAMPAIGN_FIELDS
        insight_level = "campaign"

    rows = list(account.get_insights(
        fields=insight_fields,
        params={
            "level": insight_level,
            "time_range": {"since": since, "until": until},
            "limit": 500,
        },
    ))

    agregado: dict[str, dict] = {}

    for row in rows:
        spend = float(row.get("spend", 0))

        if use_explicit:
            # Mapeamento explícito: conjunto específico tem prioridade, senão cai pra campanha inteira
            config = _match_explicit(row, by_campaign, by_adset)
            if not config:
                # Campanha/conjunto não mapeado → ignora (não vai para "outro")
                continue
            tipo = config["type"]
            # Agrupa pelo nome configurado (label), não pelo ID — duas campanhas/conjuntos com o
            # MESMO nome somam junto (ex: campanha principal + remarketing do mesmo vendedor),
            # com nomes DIFERENTES ficam separados, mesmo sendo do mesmo tipo.
            chave = config["label"]
        else:
            # Fallback: keyword detection por nome
            nome = row.get("campaign_name", "")
            tipo = _detect_tipo(nome, tipos_cfg)
            chave = tipo
            config = _config_for(tipo, tipos_cfg)

            if tipo == "outro":
                agregado.setdefault("outro", {"results": 0.0, "spend": 0.0})
                agregado["outro"]["spend"] += spend
                continue

            if not config:
                continue

        if chave not in agregado:
            agregado[chave] = {
                "results": 0.0, "spend": 0.0, "impressions": 0,
                "link_clicks": 0, "purchase_value": 0.0,
                "label": config["label"], "metrica": config["metrica"],
                "tipo": tipo, "tipo_contagem": config.get("tipo_contagem"),
                "sheet_tab": config.get("sheet_tab"),
            }

        agregado[chave]["spend"] += spend
        agregado[chave]["impressions"] += int(row.get("impressions", 0) or 0)
        agregado[chave]["link_clicks"] += int(row.get("inline_link_clicks", 0) or 0)

        if config.get("campo"):
            agregado[chave]["results"] += float(row.get(config["campo"], 0))
        elif config.get("acao"):
            agregado[chave]["results"] += _sum_action(row.get("actions", []), config["acao"])

        if config.get("tipo_contagem") == "compras":
            agregado[chave]["purchase_value"] += _sum_action(row.get("action_values", []), "purchase")

    total_spend = 0.0
    for chave, dados in agregado.items():
        total_spend += dados["spend"]
        if chave == "outro":
            continue
        r = dados["results"]
        dados["results"] = int(round(r))
        dados["cost_per_result"] = dados["spend"] / r if r > 0 else 0.0

    # primary_type: tipo com mais resultados entre os tipos primários (mensagem/lead).
    # Soma por tipo antes de comparar — no modo explícito pode ter várias campanhas do mesmo tipo.
    primary_type = None
    best_results = 0
    tipo_totals: dict[str, float] = {}
    for chave, dados in agregado.items():
        if chave == "outro":
            continue
        if dados.get("tipo_contagem") in _PRIMARY_CONTAGEM:
            t = dados.get("tipo", chave)
            tipo_totals[t] = tipo_totals.get(t, 0) + dados["results"]
    for t, total in tipo_totals.items():
        if total > best_results:
            best_results = total
            primary_type = t

    tipos_out = {}
    for chave, dados in agregado.items():
        if chave == "outro":
            continue
        tipos_out[chave] = dados

    return {
        "tipos": tipos_out,
        "total_spend": total_spend,
        "primary_type": primary_type,
        "platform": "meta",
    }


def get_top_ads(account_id: str, token: str, since: str, until: str, tipos_cfg: list, primary_type: str | None = None, n: int = 3, campaign_map: list | None = None) -> list:
    """Retorna top N anúncios com melhor performance usando requests direto."""
    import requests as _req

    act = _ensure_act(account_id)
    # Nota: "melhores criativos" hoje só reconhece mapeamento por campanha inteira, não por
    # conjunto/vendedor específico — um anúncio de qualquer conjunto da campanha mapeada entra.
    explicit, _by_adset = _build_campaign_maps(campaign_map) if campaign_map else ({}, {})
    use_explicit = bool(explicit)

    if use_explicit:
        primary_config = next((cfg for cfg in explicit.values() if cfg["type"] == primary_type), None) if primary_type else None
        primary_campaign_ids = {cid for cid, cfg in explicit.items() if cfg["type"] == primary_type} if primary_type else set(explicit.keys())
    else:
        primary_config = _config_for(primary_type, tipos_cfg) if primary_type else None

    # Busca insights por anúncio
    resp = _req.get(
        f"https://graph.facebook.com/v19.0/{act}/insights",
        params={
            "access_token": token,
            "level": "ad",
            "time_range": json.dumps({"since": since, "until": until}),
            "fields": ",".join(AD_FIELDS),
            "limit": 500,
        },
        timeout=30,
    )
    data = resp.json()
    if "error" in data:
        raise Exception(data["error"].get("message", str(data["error"])))

    rows = data.get("data", [])

    def _matches(row) -> bool:
        if use_explicit:
            return str(row.get("campaign_id", "")) in primary_campaign_ids
        if not primary_config:
            return True
        return any(p in row.get("campaign_name", "").lower() for p in primary_config["palavras"])

    def _score(row) -> float:
        actions = row.get("actions", [])
        if primary_config and primary_config.get("acao"):
            return _sum_action(actions, primary_config["acao"])
        if use_explicit:
            return sum(_sum_action(actions, cfg["acao"]) for cfg in explicit.values() if cfg.get("acao"))
        return sum(_sum_action(actions, cfg["acao"]) for cfg in tipos_cfg if cfg.get("acao"))

    filtered = []
    for row in rows:
        if not _matches(row):
            continue
        score = _score(row)
        if score > 0:
            filtered.append({
                "id": row.get("ad_id", ""),
                "name": row.get("ad_name", ""),
                "results": score,
                "spend": float(row.get("spend", 0)),
            })

    by_name: dict[str, dict] = {}
    for ad in filtered:
        if ad["name"] not in by_name:
            by_name[ad["name"]] = {**ad}
        else:
            by_name[ad["name"]]["results"] += ad["results"]
            by_name[ad["name"]]["spend"] = by_name[ad["name"]].get("spend", 0) + ad.get("spend", 0)

    top = sorted(by_name.values(), key=lambda x: x["results"], reverse=True)[:n]

    # Busca link do Instagram para cada anúncio
    for ad_data in top:
        ad_data["link"] = ""
        try:
            r = _req.get(
                f"https://graph.facebook.com/v19.0/{ad_data['id']}/adcreatives",
                params={"access_token": token, "fields": "instagram_permalink_url"},
                timeout=10,
            )
            creatives = r.json().get("data", [])
            if creatives:
                url = creatives[0].get("instagram_permalink_url", "")
                if url:
                    ad_data["link"] = url.rstrip("/") + "/#advertiser"
        except Exception:
            pass
        ad_data.pop("id", None)

    return top


def get_active_ads(account_id: str, token: str) -> list[str]:
    """
    Retorna os nomes de todos os anúncios com effective_status = ACTIVE.
    Deduplica por nome do veículo — se o mesmo carro está em duas campanhas, aparece uma vez.
    Usa requests direto para garantir que o token é passado corretamente.
    """
    import requests
    act = f"act_{account_id}" if not account_id.startswith("act_") else account_id
    ads = []
    url = f"https://graph.facebook.com/v19.0/{act}/ads"
    params = {
        "access_token":    token,
        "fields":          "name",
        "effective_status": '["ACTIVE","IN_PROCESS"]',
        "limit":           500,
    }
    while url:
        resp = requests.get(url, params=params, timeout=30)
        data = resp.json()
        if "error" in data:
            raise Exception(data["error"].get("message", str(data["error"])))
        for ad in data.get("data", []):
            if ad.get("name"):
                ads.append(ad["name"])
        next_url = data.get("paging", {}).get("next")
        url = next_url if next_url else None
        params = {}

    return sorted(set(ads))


def get_account_balance(account_id: str, token: str) -> dict:
    """Retorna saldo da forma de pagamento da conta Meta Ads (PIX/prepago)."""
    import requests, re
    act = _ensure_act(account_id)
    resp = requests.get(
        f"https://graph.facebook.com/v19.0/{act}",
        params={"access_token": token, "fields": "currency,account_status,funding_source_details"},
        timeout=10,
    )
    data = resp.json()
    if "error" in data:
        raise Exception(data["error"].get("message", "Erro Meta API"))

    fsd = data.get("funding_source_details", {})
    display = fsd.get("display_string", "")
    funding_type = fsd.get("type")

    # Extrai valor de strings como "Saldo disponível (R$411,30 BRL)" ou "R$1.234,56"
    balance = None
    m = re.search(r"R\$\s*([\d.]+,\d{2})", display)
    if m:
        raw = m.group(1).replace(".", "").replace(",", ".")
        balance = float(raw)

    return {
        "balance": balance,           # None = forma de pagamento sem saldo exposto (cartão)
        "display": display,           # string original para debug
        "funding_type": funding_type, # 1=cartão, 2=boleto, 20=PIX/prepago
        "currency": data.get("currency", "BRL"),
        "account_status": int(data.get("account_status", 1)),
    }
