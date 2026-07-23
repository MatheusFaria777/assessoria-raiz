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


def get_campaign_map(client) -> list:
    """Campanhas mapeadas explicitamente (ativas) — [] se o cliente não configurou a aba Campanhas."""
    return [c for c in client.campaigns if c.active]


def get_sheet_map(client) -> dict:
    """
    Retorna {tipo: tab_name} para o cliente.
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
