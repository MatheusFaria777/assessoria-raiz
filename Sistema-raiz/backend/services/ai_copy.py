"""Geração de copy de anúncio de veículo via Claude."""
import json, re

INSTRUCOES = """Você é um especialista em copywriting para revendas de veículos. Estilo direto, honesto e próximo — como um bom vendedor que fala a verdade, não um anúncio genérico."""

PROMPT = """{instrucoes}

Com base na descrição abaixo de um veículo postado no Instagram, gere os elementos do anúncio.

Descrição original do post:
{caption}

Gere um JSON com exatamente estas 3 chaves:
- "nome_anuncio": modelo + ano + versão curta (ex: "Civic LXL 2011 Automático")
- "titulo": preço com traço e modelo curto (ex: "R$ 58.990 - Honda Civic 2011")
- "descricao_principal": texto completo seguindo OBRIGATORIAMENTE este formato:

[Uma frase direta com o diferencial principal do carro — extraída da descrição]

[1 a 2 frases sobre o benefício para quem vai usar — audiência e proposta de valor]

• Ano: [extrair] | Versão: [extrair]
• Câmbio: [extrair]
• Km: [extrair — OMITIR ESTA LINHA COMPLETAMENTE SE NÃO HOUVER KM NA DESCRIÇÃO]
• Valor: R$[extrair]
• Entrada a partir de: R$[extrair — OMITIR ESTA LINHA COMPLETAMENTE SE NÃO HOUVER ENTRADA NA DESCRIÇÃO]

{cta}

{loja_padrao}

Regras obrigatórias:
- Sem emojis no diferencial, benefício ou bullets
- Km: omitir a linha inteira se não estiver na descrição original
- Entrada: omitir a linha inteira se não estiver na descrição original
- CTA: usar exatamente o modelo acima, natural e direto
- Retorne APENAS o JSON válido, sem texto adicional, sem markdown
"""

CTA_VIDEO    = "Quer ver o vídeo completo ou tirar uma dúvida?\nManda mensagem agora ↓"
CTA_CAROUSEL = "Quer mais detalhes ou tirar uma dúvida?\nManda mensagem agora ↓"

LOJA_TEMPLATE = "📍 {cidade} — {telefone}"
LOJA_VAZIA    = "📍 [CIDADE/UF] — [TELEFONE]"


def _cidade(endereco: str) -> str:
    """Extrai cidade/UF do endereço completo — pega o último segmento após vírgula."""
    if not endereco:
        return ""
    partes = [p.strip() for p in endereco.split(",")]
    return partes[-1]


def _format_loja(loja: dict) -> str:
    if not loja or not loja.get("telefone"):
        return LOJA_VAZIA
    cidade = _cidade(loja.get("endereco", "")) or "[CIDADE/UF]"
    return LOJA_TEMPLATE.format(cidade=cidade, telefone=loja.get("telefone", "[TELEFONE]"))


def _parse(text: str) -> dict:
    text = re.sub(r"```(?:json)?\s*|\s*```", "", text).strip()
    if not text:
        raise ValueError("Claude retornou resposta vazia ao gerar copy")
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        raise ValueError(f"Claude retornou resposta não-JSON ao gerar copy: {text[:300]}")
    if "descricao_principal" in data:
        data["descricao_principal"] = re.sub(r"\n{3,}", "\n\n", data["descricao_principal"]).strip()
    return data


def generate_copy(caption: str, api_key: str, loja: dict = None, post_type: str = "carousel") -> dict:
    """Gera copy do anúncio usando Claude. Retorna {nome_anuncio, titulo, descricao_principal}."""
    if not caption.strip():
        raise ValueError("Caption vazio — o post não tem descrição.")

    cta = CTA_VIDEO if post_type == "video" else CTA_CAROUSEL
    loja_padrao = _format_loja(loja or {})

    prompt = PROMPT.format(
        instrucoes=INSTRUCOES,
        caption=caption,
        cta=cta,
        loja_padrao=loja_padrao,
    )

    import anthropic
    client = anthropic.Anthropic(api_key=api_key, timeout=90.0)
    resp = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=1500,
        messages=[{"role": "user", "content": prompt}],
    )
    try:
        return _parse(resp.content[0].text)
    except ValueError:
        # Claude não conseguiu estruturar o JSON (legenda sem dados do veículo)
        # Usa a legenda original como descricao_principal
        nome_loja = (loja or {}).get("nome", "Veículo")
        return {
            "nome_anuncio": nome_loja,
            "titulo": nome_loja,
            "descricao_principal": caption.strip(),
        }
