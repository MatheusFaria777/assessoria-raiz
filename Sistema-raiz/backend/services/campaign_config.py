"""
Ponto único de resolução de "como esse cliente é classificado".

Antes, cada consumidor (sync, cadência, relatórios) montava essa lógica
na mão, cada um do seu jeito — foi isso que causou o mapeamento ficar
desalinhado entre planilha e cálculo. Esse módulo centraliza as duas
perguntas que todo mundo precisa responder:

  - get_campaign_map(client): quais campanhas têm mapeamento explícito
    (aba Campanhas / ClientCampaign)? Usado por get_account_data()/get_top_ads()
    pra classificar por ID real do Meta em vez de palavra-chave.
  - get_sheet_map(client): {tipo: aba_da_planilha} — prioriza o mapeamento
    explícito, cai pro campo antigo (sheets_tabs) se não tiver nada configurado.
"""
import json
import re

# Lista única de tipos de campanha — antes existia copiada em 3 lugares (routers/campaign_mapping.py,
# services/meta.py, ClientModal.jsx no frontend). Qualquer lugar que precisar dessa lista importa daqui;
# o frontend busca via GET /api/clients/campaign-mapping/types em vez de ter cópia própria.
CAMPAIGN_TYPES = [
    {"value": "mensagem",    "label": "Mensagem"},
    {"value": "lead",        "label": "Lead"},
    {"value": "formulario",  "label": "Formulário"},
    {"value": "engajamento", "label": "Engajamento"},
    {"value": "vendas",      "label": "Vendas"},
    {"value": "alcance",     "label": "Alcance"},
    {"value": "trafego",     "label": "Tráfego"},
    {"value": "consignacao", "label": "Consignação"},
    {"value": "vagas",       "label": "Vagas"},
    {"value": "manutencao",  "label": "Manutenção"},
    {"value": "live",        "label": "Live"},
]

VALID_TYPES = {t["value"] for t in CAMPAIGN_TYPES}

# Objetivo Meta → tipo de campanha, usado pra pré-selecionar o tipo em "Buscar do Meta".
# O Meta manda esse campo junto com cada campanha; hoje ele é descartado no fluxo de mapeamento.
OBJECTIVE_TO_TYPE = {
    "OUTCOME_LEADS":        "lead",
    "OUTCOME_SALES":        "vendas",
    "OUTCOME_ENGAGEMENT":   "engajamento",
    "OUTCOME_TRAFFIC":      "trafego",
    "OUTCOME_AWARENESS":    "alcance",
    "OUTCOME_APP_PROMOTION": "engajamento",
    "MESSAGES":             "mensagem",
    "LEAD_GENERATION":      "lead",
    "CONVERSIONS":          "vendas",
    "LINK_CLICKS":          "trafego",
    "REACH":                "alcance",
    "BRAND_AWARENESS":      "alcance",
    "POST_ENGAGEMENT":      "engajamento",
}


def suggest_type(objective: str) -> str | None:
    """Sugere um campaign_type a partir do objective que o Meta devolve pra campanha. None se não reconhecer."""
    return OBJECTIVE_TO_TYPE.get((objective or "").upper())


def suggest_label(name: str) -> str:
    """
    Sugere um nome limpo pro relatório a partir do nome real da campanha no Meta —
    ex: '[ENGAJ] [MENSAGEM] [ABO] [F] - Venda carros — Cópia' → 'Venda carros — Cópia'.
    Só um ponto de partida — o usuário confirma ou edita na tela.
    """
    if not name:
        return ""
    sem_tags = re.sub(r"\[[^\]]*\]", "", name)
    limpo = re.sub(r"^[\s\-–—]+|[\s\-–—]+$", "", sem_tags)
    limpo = re.sub(r"\s{2,}", " ", limpo).strip()
    return limpo or name.strip()


def get_campaign_map(client) -> list:
    """Campanhas mapeadas explicitamente (ativas) — [] se o cliente não configurou a aba Campanhas."""
    return [c for c in client.campaigns if c.active]


def get_sheet_map(client) -> dict:
    """
    Retorna {tipo: tab_name} para o cliente — usado como checagem de "tem alguma coisa
    configurada" e como fallback pro modo palavra-chave em build_tab_candidates().
    Prioriza ClientCampaign (aba Campanhas) se configurado, senão sheets_tabs (campo antigo).
    """
    mapped = get_campaign_map(client)
    if mapped:
        m = {c.campaign_type: c.sheet_tab for c in mapped if c.sheet_tab}
        if m:
            return m
    if client.sheets_tabs:
        try:
            return json.loads(client.sheets_tabs)
        except Exception:
            pass
    return {}


def list_client_tabs(client) -> set:
    """
    Todas as abas que esse cliente já usa, independente de período — usado pra
    varrer a planilha inteira procurando buracos, sem precisar rodar get_account_data
    primeiro (que só sabe as abas de um período específico, não de todo o histórico).
    """
    tabs = {c.sheet_tab for c in get_campaign_map(client) if c.sheet_tab}
    if not tabs and client.sheets_tabs:
        try:
            tabs = set(json.loads(client.sheets_tabs).values())
        except Exception:
            pass
    return tabs


def build_tab_candidates(client, tipos: dict) -> dict:
    """
    A partir do resultado de get_account_data()["tipos"], decide em qual aba da
    planilha cada bucket escreve, somando quem cai na mesma aba.

    Modo explícito (aba Campanhas): cada campanha já carrega sua própria aba
    (bucket["sheet_tab"]) — duas campanhas do mesmo tipo com abas diferentes
    escrevem separado, do jeito certo.
    Modo palavra-chave (cliente sem Campanhas configurado): usa get_sheet_map()
    (tipo → aba), igual sempre funcionou.
    """
    sheet_map = get_sheet_map(client)
    candidates: dict[str, dict] = {}

    for key, dados in tipos.items():
        if key == "outro":
            continue
        tab_name = dados.get("sheet_tab") or sheet_map.get(dados.get("tipo", key))
        if not tab_name:
            continue
        if dados.get("results", 0) == 0 and dados.get("spend", 0) == 0:
            continue

        if tab_name not in candidates:
            candidates[tab_name] = {
                "impressions": 0, "results": 0, "link_clicks": 0,
                "spend": 0.0, "purchase_value": 0.0,
            }
        c = candidates[tab_name]
        c["impressions"]    += dados.get("impressions", 0)
        c["results"]        += dados.get("results", 0)
        c["link_clicks"]    += dados.get("link_clicks", 0)
        c["spend"]          += dados.get("spend", 0.0)
        c["purchase_value"] += dados.get("purchase_value", 0.0)

    return candidates
