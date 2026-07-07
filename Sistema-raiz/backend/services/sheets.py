"""Google Sheets integration — portado do sistema v1."""
import os
from datetime import datetime
import gspread
from google.oauth2.service_account import Credentials

CREDS_FILE = os.path.join(os.path.dirname(__file__), "..", "sheets_credentials.json")
SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]


def _get_credentials():
    """Retorna credenciais do Google — via env var (produção) ou arquivo (local)."""
    import json as _json
    env_creds = os.environ.get("SHEETS_CREDENTIALS_JSON")
    if env_creds:
        info = _json.loads(env_creds)
        return Credentials.from_service_account_info(info, scopes=SCOPES)
    return Credentials.from_service_account_file(CREDS_FILE, scopes=SCOPES)

MONTHS_PT = {
    1: "janeiro", 2: "fevereiro", 3: "março",    4: "abril",
    5: "maio",    6: "junho",     7: "julho",     8: "agosto",
    9: "setembro", 10: "outubro", 11: "novembro", 12: "dezembro",
}

HEADER_ALIASES: dict[str, list[str]] = {
    "impressoes":  ["impressões", "impressoes", "impressao", "impressão"],
    "results":     ["compras", "mensagens", "mensagem", "leads", "lead", "vagas",
                    "conversões", "conversoes", "resultados", "resultado", "contatos",
                    "contato", "cadastros", "inscrições", "inscricoes",
                    "engajamento", "alcance", "reach", "engagement"],
    "link_clicks": ["cliques no link", "cliques", "link clicks", "clicks"],
    "spend":       ["valor gasto", "valor investido", "investimento", "gasto total", "investido"],
    "revenue":     ["faturamento", "receita", "valor de compra", "valor das compras"],
}


def is_configured() -> bool:
    return os.path.exists(os.path.abspath(CREDS_FILE))


def _gc() -> gspread.Client:
    return gspread.authorize(_get_credentials())


def _to_br_date(iso_date: str) -> str:
    return datetime.strptime(iso_date, "%Y-%m-%d").strftime("%d/%m/%Y")


def _find_columns(ws) -> dict[str, int]:
    rows = ws.get_all_values()[:5]
    best_row = None
    best_score = 0
    for row in rows:
        score = sum(
            1 for cell in row
            if any(cell.strip().lower() == alias
                   for aliases in HEADER_ALIASES.values()
                   for alias in aliases)
        )
        if score > best_score:
            best_score = score
            best_row = row
    if not best_row or best_score == 0:
        return {}
    col_map: dict[str, int] = {}
    for col_idx, cell in enumerate(best_row, start=1):
        cell_lower = cell.strip().lower()
        for metric, aliases in HEADER_ALIASES.items():
            if metric not in col_map and cell_lower in aliases:
                col_map[metric] = col_idx
                break
    return col_map


def write_weekly(sheet_id: str, tab_name: str, since: str,
                 impressoes: int, results: int, link_clicks: int,
                 spend: float, revenue: float = 0.0) -> dict:
    try:
        gc = _gc()
        sh = gc.open_by_key(sheet_id)
    except Exception as e:
        return {"ok": False, "error": f"Planilha não encontrada: {e}"}
    try:
        ws = sh.worksheet(tab_name)
    except Exception:
        return {"ok": False, "error": f"Aba '{tab_name}' não encontrada na planilha"}

    col_map = _find_columns(ws)
    if not col_map:
        return {"ok": False, "error": f"Nenhum cabeçalho reconhecido na aba '{tab_name}'"}

    since_br = _to_br_date(since)
    col_a = ws.col_values(1)
    row_num = next((i for i, v in enumerate(col_a, 1) if v.strip() == since_br), None)
    if row_num is None:
        return {"ok": False, "error": f"Semana {since_br} não encontrada na aba '{tab_name}'"}

    writes = {}
    if "impressoes" in col_map: writes["impressoes"] = (col_map["impressoes"], impressoes)
    if "results"    in col_map: writes["results"]    = (col_map["results"], results)
    if "link_clicks" in col_map: writes["link_clicks"] = (col_map["link_clicks"], link_clicks)
    if "spend"      in col_map: writes["spend"]      = (col_map["spend"], round(spend, 2))
    if "revenue" in col_map and revenue > 0:
        writes["revenue"] = (col_map["revenue"], round(revenue, 2))

    for col, val in writes.values():
        ws.update_cell(row_num, col, val)

    return {"ok": True, "row": row_num, "date": since_br, "cols": {k: v[0] for k, v in writes.items()}}


def write_monthly(sheet_id: str, since: str, meta_invest: float, meta_leads: int) -> dict:
    try:
        gc = _gc()
        sh = gc.open_by_key(sheet_id)
    except Exception as e:
        return {"ok": False, "error": f"Planilha não encontrada: {e}"}

    ws = None
    for tab in ["VISÃO GERAL", "VISAO GERAL", "Visão Geral", "visão geral"]:
        try:
            ws = sh.worksheet(tab)
            break
        except Exception:
            continue
    if ws is None:
        return {"ok": False, "error": "Aba 'VISÃO GERAL' não encontrada"}

    dt = datetime.strptime(since, "%Y-%m-%d")
    year = dt.year
    month_lower = MONTHS_PT[dt.month]

    col_b = ws.col_values(2)
    col_c = ws.col_values(3)
    row_num = next(
        (i for i, (y, m) in enumerate(zip(col_b, col_c), 1)
         if str(y).strip() == str(year) and m.strip().lower() == month_lower),
        None
    )
    if row_num is None:
        return {"ok": False, "error": f"Mês {month_lower.capitalize()}/{year} não encontrado na aba VISÃO GERAL"}

    ws.update_cell(row_num, 16, round(meta_invest, 2))
    ws.update_cell(row_num, 19, meta_leads)
    return {"ok": True, "row": row_num, "month": f"{month_lower.capitalize()}/{year}"}
