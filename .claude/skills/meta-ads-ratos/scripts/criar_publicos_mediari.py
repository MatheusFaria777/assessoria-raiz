#!/usr/bin/env python3
"""Cria audiencias de engajamento + semelhantes para Mediari Cobrancas."""
import os, sys, json, time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from lib import init_api
from facebook_business.adobjects.adaccount import AdAccount
from facebook_business.adobjects.customaudience import CustomAudience
from facebook_business.exceptions import FacebookRequestError

ACCOUNT_ID = "act_1758945342145133"
IG_ID      = "17841457411777765"
PAGE_ID    = "109035622099165"
TODAY      = "20/05/26"
R365       = 31536000  # 365 dias em segundos


def try_create(account, name, rule_dict):
    """Testa uma variacao de rule. Retorna (ok, audience_id)."""
    try:
        params = {
            "name": name,
            "subtype": "ENGAGEMENT",
            "rule": json.dumps(rule_dict),
        }
        result = account.create_custom_audience(params=params)
        time.sleep(1)
        aud_id = result["id"]
        print(f"OK  {name} -> {aud_id}")
        return True, aud_id
    except FacebookRequestError as e:
        err = e.api_error_message() or str(e)
        print(f"FAIL  {name}")
        print(f"      {err[:180]}")
        return False, None
    except Exception as e:
        print(f"ERR   {name}: {str(e)[:180]}")
        return False, None


def delete_audience(aud_id):
    try:
        CustomAudience(aud_id).api_delete()
    except Exception:
        pass


def create_lookalike(account, name, source_id):
    params = {
        "name": name,
        "subtype": "LOOKALIKE",
        "origin_audience_id": source_id,
        "lookalike_spec": json.dumps({"country": "BR", "ratio": 0.01}),
    }
    result = account.create_custom_audience(params=params)
    time.sleep(1)
    lal_id = result["id"]
    print(f"  -> Semelhante: {name} -> {lal_id}")
    return lal_id


# ---------------------------------------------------------------------------
# Formatos a testar
# ---------------------------------------------------------------------------

def rules_to_test():
    # Grupo 1: page source — testar varios nomes de evento
    for evt in ["page_fans", "post_engagement", "page_visit", "page_fan",
                "page_content_interaction", "page_post_save", "page_save",
                "video_view", "video_watched", "page_engagement"]:
        yield f"page+{evt}", {
            "inclusions": {
                "operator": "or",
                "rules": [{
                    "event_sources": [{"id": PAGE_ID, "type": "page"}],
                    "retention_seconds": R365,
                    "filter": {"operator": "and", "filters": [
                        {"field": "event", "operator": "eq", "value": evt}
                    ]}
                }]
            }
        }

    # Grupo 2: instagram_business — tentar sem chave "type" (so id)
    yield "ig_no_type", {
        "inclusions": {
            "operator": "or",
            "rules": [{
                "event_sources": [{"id": IG_ID}],
                "retention_seconds": R365
            }]
        }
    }

    # Grupo 3: page source sem filter (all engagement)
    yield "page-no-filter-retry", {
        "inclusions": {
            "operator": "or",
            "rules": [{
                "event_sources": [{"id": PAGE_ID, "type": "page"}],
                "retention_seconds": R365,
                "filter": {"operator": "and", "filters": []}
            }]
        }
    }


def main():
    init_api()
    account = AdAccount(ACCOUNT_ID)

    print("=" * 60)
    print("Testando formatos de rule para audiences de engajamento IG")
    print("=" * 60)

    found = None
    for label, rule in rules_to_test():
        ok, aud_id = try_create(account, f"[TESTE] {label}", rule)
        if ok:
            found = (label, rule, aud_id)
            delete_audience(aud_id)
            print(f"  => Formato valido encontrado: {label}")
            # nao para — continua pra ver todos que funcionam

    print()
    if found:
        print(f"SUCESSO: usar formato '{found[0]}' para criar as audiencias reais.")
    else:
        print("FALHA: nenhum formato funcionou. Verificar permissoes do token ou IDs.")

    print("=" * 60)


if __name__ == "__main__":
    main()
