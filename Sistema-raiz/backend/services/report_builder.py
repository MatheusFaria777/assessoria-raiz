"""Formata dados de campanha no template de relatório para WhatsApp."""
from datetime import datetime

_MONTHS_PT = {
    1: "Janeiro", 2: "Fevereiro", 3: "Março",    4: "Abril",
    5: "Maio",    6: "Junho",     7: "Julho",     8: "Agosto",
    9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro",
}
MEDAL_EMOJIS = ["🥇", "🥈", "🥉"]


def _br_currency(value: float, min_decimals: int = 2) -> str:
    decimals = min_decimals
    while decimals <= 6:
        if round(value, decimals) != 0 or value == 0:
            break
        decimals += 1
    formatted = f"{value:,.{decimals}f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return f"R$ {formatted}"


def _br_int(value: int) -> str:
    return f"{value:,}".replace(",", ".")


def _opt(current_val: str, prev_val: str | None) -> str:
    return f"{current_val} ({prev_val})" if prev_val is not None else current_val


def _fmt_date(date_str: str) -> str:
    return datetime.strptime(date_str, "%Y-%m-%d").strftime("%d/%m")


def _fmt_month(date_str: str) -> str:
    d = datetime.strptime(date_str, "%Y-%m-%d")
    return f"{_MONTHS_PT[d.month]}/{d.year}"


def format_report(
    client_name: str,
    since: str,
    until: str,
    current: dict,
    previous: dict | None,
    grupos_cfg: list,
    summary_text: str = "",
    top_ads: list = None,
    top_keywords: list = None,
    period_type: str = "week",
) -> str:
    current_tipos = current.get("tipos", {})
    prev_tipos = previous.get("tipos", {}) if previous else {}
    platform = current.get("platform", "meta")
    is_month = period_type == "month"
    lines = []

    # Header
    if is_month:
        lines.append(f"📊 *Relatório Mensal {client_name}: {_fmt_month(since)}*")
    else:
        lines.append(f"📊 *Relatório Semanal {client_name}: {_fmt_date(since)} - {_fmt_date(until)}*")
    if previous:
        lines.append("Entre parênteses ( ), estão os dados do período anterior, servindo para comparação.")

    sections = []
    if platform == "google":
        for tipo, d_at in current_tipos.items():
            if d_at["results"] == 0 and d_at["spend"] == 0:
                continue
            d_ant = prev_tipos.get(tipo)
            sections.append((d_at["label"], d_at["metrica"], d_at, d_ant))
    else:
        # Itera na ordem dos grupos configurados para o cliente
        for config in grupos_cfg:
            tipo = config["tipo"]
            d_at = current_tipos.get(tipo)
            if not d_at or (d_at["results"] == 0 and d_at["spend"] == 0):
                continue
            d_ant = prev_tipos.get(tipo)
            sections.append((config["label"], config["metrica"], d_at, d_ant))

    for label, metrica, d_at, d_ant in sections:
        lines.append(f"\n\t⁠{label}")
        lines.append(f"{metrica}: {_opt(_br_int(d_at['results']), _br_int(d_ant['results']) if d_ant else None)}")
        if d_at["cost_per_result"] > 0:
            lines.append(f"Custo por {metrica}: {_opt(_br_currency(d_at['cost_per_result']), _br_currency(d_ant['cost_per_result']) if d_ant else None)}")
        lines.append(f"Investimento: {_opt(_br_currency(d_at['spend']), _br_currency(d_ant['spend']) if d_ant else None)}")
        pv = d_at.get("purchase_value", 0.0)
        if pv > 0:
            pv_ant = d_ant.get("purchase_value", 0.0) if d_ant else None
            lines.append(f"Faturamento: {_opt(_br_currency(pv), _br_currency(pv_ant) if pv_ant else None)}")

    lines.append(f"\nInvestimento Total: {_br_currency(current['total_spend'])}" + (f" ({_br_currency(previous['total_spend'])})" if previous else ""))
    lines.append(f"\n📈 Resumo de Resultados:\n{summary_text.strip() or '[Adicione seu resumo aqui]'}")

    if top_ads:
        lines.append(f"\n🔥 Melhores criativos {'do mês' if is_month else 'da semana'}:")
        for ad in top_ads:
            lines.append(f"Nome: {ad['name']}")
            lines.append(f"Link: {ad.get('link') or '[link não disponível]'}")
        lines.append("\n📌 Acima estão os criativos que tiveram uma performance melhor, seria interessante usar eles de inspiração para produzir seus próximos criativos.")

    if top_keywords:
        lines.append("\n🔥 Melhores palavras-chave:")
        for i, kw in enumerate(top_keywords):
            medal = MEDAL_EMOJIS[i] if i < len(MEDAL_EMOJIS) else "•"
            lines.append(f"{medal} {kw}")

    return "\n".join(lines)
