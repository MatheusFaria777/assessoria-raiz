"""Formata mensagens curtas para os pontos de contato semanais da Cadência."""
from datetime import datetime, timedelta, date

MEDAL_EMOJIS = ["🥇", "🥈", "🥉"]

MESES_PT = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]


def _br_currency(v: float) -> str:
    formatted = f"{v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return f"R$ {formatted}"


def _br_int(v: float) -> str:
    return f"{int(v):,}".replace(",", ".")


def get_week_range() -> tuple[str, str]:
    """Retorna (since, until) dos últimos 7 dias completos (até ontem)."""
    hoje = date.today()
    until = hoje - timedelta(days=1)
    since = until - timedelta(days=6)
    return since.strftime("%Y-%m-%d"), until.strftime("%Y-%m-%d")


def get_month_range() -> tuple[str, str]:
    """Retorna (since, until) do último mês completo."""
    hoje = date.today()
    ultimo = hoje.replace(day=1) - timedelta(days=1)
    primeiro = ultimo.replace(day=1)
    return primeiro.strftime("%Y-%m-%d"), ultimo.strftime("%Y-%m-%d")


def is_first_weekday(weekday: int) -> bool:
    """True se hoje for a primeira ocorrência do weekday no mês (ex: 0=segunda, 2=quarta)."""
    hoje = date.today()
    return hoje.weekday() == weekday and hoje.day <= 7


def _month_label(since: str) -> str:
    """'Junho/2026' a partir de '2026-06-01'."""
    d = datetime.strptime(since, "%Y-%m-%d")
    return f"{MESES_PT[d.month - 1]}/{d.year}"


def _mini_report(tipos: dict, total_spend: float, since: str, until: str) -> str:
    """Bloco de balanço mensal adicionado no final da mensagem de segunda."""
    LEAD_LABEL = {
        "messages":       "Mensagens",
        "lead_generation": "Leads (formulário)",
        "conversions":    "Compras",
        "sales":          "Compras",
    }

    d_since = datetime.strptime(since, "%Y-%m-%d").strftime("%d/%m")
    d_until = datetime.strptime(until, "%Y-%m-%d").strftime("%d/%m")

    lead_lines = []
    for tipo, d in tipos.items():
        if d.get("results", 0) == 0:
            continue
        label = LEAD_LABEL.get(tipo)
        if label:
            lead_lines.append(f"👥 {label}: {_br_int(d['results'])}")

    lines = [
        "",
        "━━━━━━━━━━━━━━━━━━━━━",
        f"📊 Balanço de {_month_label(since)} ({d_since} – {d_until})",
        "",
    ]
    lines.extend(lead_lines if lead_lines else ["👥 Leads: —"])
    lines += [
        f"💹 Investimento: {_br_currency(total_spend)}",
        "",
        "🛒 Vendas: (me manda esse número)",
        "💵 Faturamento: R$ (me manda esse número)",
        "",
        "💰 Lucro Bruto: (calculo após ter as vendas)",
        "↪️ ROAS: (calculo após ter as vendas)",
        "📉 Taxa de Conversão: (calculo após ter as vendas)",
        "🔄 Média de Leads por Compra: (calculo após ter as vendas)",
        "💵 CAC: (calculo após ter as vendas)",
    ]
    return "\n".join(lines)


def _mini_report_google(tipos: dict, total_spend: float, since: str, until: str) -> str:
    """Bloco de balanço mensal para clientes Google Ads."""
    d_since = datetime.strptime(since, "%Y-%m-%d").strftime("%d/%m")
    d_until = datetime.strptime(until, "%Y-%m-%d").strftime("%d/%m")

    lead_lines = []
    for d in tipos.values():
        results = d.get("results", 0)
        if results == 0:
            continue
        metrica = d.get("metrica", "Resultado")
        lead_lines.append(f"👥 {metrica}: {_br_int(results)}")

    lines = [
        "",
        "━━━━━━━━━━━━━━━━━━━━━",
        f"📊 Balanço de {_month_label(since)} ({d_since} – {d_until})",
        "",
    ]
    lines.extend(lead_lines if lead_lines else ["👥 Leads: —"])
    lines += [
        f"💹 Investimento: {_br_currency(total_spend)}",
        "",
        "🛒 Vendas: (me manda esse número)",
        "💵 Faturamento: R$ (me manda esse número)",
        "",
        "💰 Lucro Bruto: (calculo após ter as vendas)",
        "↪️ ROAS: (calculo após ter as vendas)",
        "📉 Taxa de Conversão: (calculo após ter as vendas)",
        "🔄 Média de Leads por Compra: (calculo após ter as vendas)",
        "💵 CAC: (calculo após ter as vendas)",
    ]
    return "\n".join(lines)


def format_segunda(
    client_name: str,
    since: str,
    until: str,
    data: dict,
    grupos_cfg: list,
    contexto: str = "",
    period_type: str = "weekly",
) -> str:
    """Mensagem de segunda: relatório separado por campanha (sem criativos)."""
    d_since = datetime.strptime(since, "%Y-%m-%d").strftime("%d/%m")
    d_until = datetime.strptime(until, "%Y-%m-%d").strftime("%d/%m")

    tipos = data.get("tipos", {})
    total_spend = data.get("total_spend", 0.0)

    is_monthly = period_type == "monthly"
    abertura = f"Bom dia! Aqui o relatório de {_month_label(since)} 👇" if is_monthly else "Bom dia! Aqui o relatório da semana 👇"

    lines = [
        abertura,
        "",
        f"📅 *{d_since} a {d_until}*",
    ]

    for config in grupos_cfg:
        tipo = config["tipo"]
        d = tipos.get(tipo)
        if not d or d["results"] == 0:
            continue

        label = d.get("label", config.get("label", tipo.capitalize()))
        metrica = d.get("metrica", "Resultado")
        cpr = d.get("cost_per_result", 0.0)
        spend = d.get("spend", 0.0)

        lines.append(f"\n\t⁠{label}")
        lines.append(f"{metrica}: {_br_int(d['results'])}")
        if cpr > 0:
            lines.append(f"Custo por {metrica.lower()}: {_br_currency(cpr)}")
        lines.append(f"Investimento: {_br_currency(spend)}")

    lines.append(f"\nInvestimento Total: {_br_currency(total_spend)}")

    if is_monthly:
        lines.append(_mini_report(tipos, total_spend, since, until))
    else:
        lines.append("\nMe passa um feedback: quantas visitas vocês agendaram essa semana? Quantas vendas fecharam?")

    return "\n".join(lines)


def format_segunda_google(
    client_name: str,
    since: str,
    until: str,
    data: dict,
    contexto: str = "",
    period_type: str = "weekly",
) -> str:
    """Mensagem de segunda para clientes Google Ads."""
    d_since = datetime.strptime(since, "%Y-%m-%d").strftime("%d/%m")
    d_until = datetime.strptime(until, "%Y-%m-%d").strftime("%d/%m")

    tipos = data.get("tipos", {})
    total_spend = data.get("total_spend", 0.0)

    is_monthly = period_type == "monthly"
    abertura = f"Bom dia! Aqui o relatório de {_month_label(since)} 👇" if is_monthly else "Bom dia! Aqui o relatório da semana 👇"

    lines = [abertura, "", f"📅 *{d_since} a {d_until}*"]

    for tipo_data in tipos.values():
        if tipo_data.get("results", 0) == 0:
            continue
        label   = tipo_data.get("label", "Campanha")
        metrica = tipo_data.get("metrica", "Resultado")
        cpr     = tipo_data.get("cost_per_result", 0.0)
        spend   = tipo_data.get("spend", 0.0)
        results = tipo_data["results"]

        lines.append(f"\n\t⁠{label}")
        lines.append(f"{metrica}: {_br_int(results)}")
        if cpr > 0:
            lines.append(f"Custo por {metrica.lower()}: {_br_currency(cpr)}")
        lines.append(f"Investimento: {_br_currency(spend)}")

    lines.append(f"\nInvestimento Total: {_br_currency(total_spend)}")

    if is_monthly:
        lines.append(_mini_report_google(tipos, total_spend, since, until))
    else:
        lines.append("\nMe passa um feedback: quantas visitas vocês agendaram essa semana? Quantas vendas fecharam?")

    return "\n".join(lines)


def format_quarta_google(
    client_name: str,
    top_keywords: list,
    contexto: str = "",
    period_type: str = "weekly",
    since: str = "",
) -> str:
    """Mensagem de quarta para clientes Google Ads — top palavras-chave."""
    if not top_keywords:
        return f"Sem dados de palavras-chave disponíveis para {client_name} nesse período."

    is_monthly = period_type == "monthly"
    periodo_label = f"de {_month_label(since)}" if is_monthly and since else "dessa semana"
    lines = [f"Aqui as palavras-chave que mais trouxeram resultados {periodo_label} 👇", ""]
    for i, kw in enumerate(top_keywords):
        medal = MEDAL_EMOJIS[i] if i < len(MEDAL_EMOJIS) else "•"
        lines.append(f"{medal} {kw}")

    return "\n".join(lines)


def format_quarta(
    client_name: str,
    top_ads: list,
    grupos_cfg: list = None,
    primary_type: str = None,
    contexto: str = "",
    period_type: str = "weekly",
    since: str = "",
) -> str:
    """Mensagem de quarta: top 3 criativos com métrica específica do tipo de campanha."""
    if not top_ads:
        return f"Sem dados de criativos disponíveis para {client_name} nesse período."

    metrica_label = "resultados"
    if primary_type and grupos_cfg:
        for config in grupos_cfg:
            if config["tipo"] == primary_type:
                metrica_label = config.get("metrica", "resultados").lower()
                break

    is_monthly = period_type == "monthly"
    periodo_label = f"de {_month_label(since)}" if is_monthly and since else "dessa semana"
    lines = [f"Aqui os criativos que mais performaram {periodo_label} 👇", ""]

    for i, ad in enumerate(top_ads):
        medal = MEDAL_EMOJIS[i] if i < len(MEDAL_EMOJIS) else "•"
        name = ad.get("name", "Sem nome")
        results = int(ad.get("results", 0))
        spend = ad.get("spend", 0.0)
        link = ad.get("link", "")

        cpr_str = ""
        if spend > 0 and results > 0:
            cpr = spend / results
            cpr_str = f" | {_br_currency(cpr)} por {metrica_label.rstrip('s').lower()}"

        linha_resultado = f"{_br_int(results)} {metrica_label}{cpr_str}"

        lines.append(f"{medal} {name}")
        lines.append(f"   {linha_resultado}")
        if link:
            lines.append(f"   {link}")
        if i < len(top_ads) - 1:
            lines.append("")

    return "\n".join(lines)
