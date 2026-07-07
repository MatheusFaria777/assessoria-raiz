import json
import os
import re
from datetime import datetime, timezone

import anthropic
from sqlalchemy.orm import Session

from config import settings
from models.feedback import ClientFeedback, Survey


def slugify(name: str) -> str:
    """Converte 'RT Motors' → 'rt-motors'."""
    slug = name.lower().strip()
    slug = re.sub(r"[àáâãäå]", "a", slug)
    slug = re.sub(r"[èéêë]", "e", slug)
    slug = re.sub(r"[ìíîï]", "i", slug)
    slug = re.sub(r"[òóôõö]", "o", slug)
    slug = re.sub(r"[ùúûü]", "u", slug)
    slug = re.sub(r"[ç]", "c", slug)
    slug = re.sub(r"[ñ]", "n", slug)
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"[\s_]+", "-", slug)
    slug = re.sub(r"-+", "-", slug).strip("-")
    return slug


def generate_insights(feedback: ClientFeedback, db: Session) -> dict:
    """Chama Claude API e gera insights estruturados para uma resposta de feedback."""
    if not settings.anthropic_api_key:
        return {}

    answers = json.loads(feedback.answers) if feedback.answers else {}
    survey = db.query(Survey).filter(Survey.id == feedback.survey_id).first()
    questions = json.loads(survey.questions) if survey else []

    respostas_formatadas = []
    for q in questions:
        val = answers.get(q["id"])
        if val is not None and val != "":
            respostas_formatadas.append(f"- {q['label']}: {val}")
    if not respostas_formatadas:
        return {}

    client_obj = feedback.client
    nps = feedback.nps_score
    nps_label = "Promotor" if nps and nps >= 9 else ("Neutro" if nps and nps >= 7 else "Detrator")

    prompt = f"""Você é um consultor de atendimento analisando o feedback de um cliente de uma assessoria de tráfego pago.

Cliente: {client_obj.name}
Período: {feedback.period}
Respondente: {feedback.respondent_name or "não informado"}
NPS: {nps}/10 ({nps_label})

Respostas:
{chr(10).join(respostas_formatadas)}

Analise esse feedback e responda APENAS com um JSON válido, sem markdown, sem texto fora do JSON:
{{
  "pontos_fortes": ["ponto 1", "ponto 2"],
  "pontos_de_dor": ["dor 1", "dor 2"],
  "itens_de_acao": [
    {{"acao": "descrição objetiva da ação", "prioridade": "alta|média|baixa"}},
    {{"acao": "descrição objetiva da ação", "prioridade": "alta|média|baixa"}},
    {{"acao": "descrição objetiva da ação", "prioridade": "alta|média|baixa"}}
  ],
  "followup_whatsapp": "mensagem de follow-up para o WhatsApp do cliente, tom informal e direto, máximo 3 linhas"
}}

Se não há pontos fortes ou dores claros, deixe a lista vazia. Seja direto nos itens de ação."""

    client_api = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    message = client_api.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = message.content[0].text.strip()
    # Remove markdown code blocks se o modelo incluir
    if '```' in raw:
        raw = re.sub(r'```(?:json)?\s*', '', raw).strip()
    if not raw:
        return {}
    insights = json.loads(raw)

    feedback.ai_summary = json.dumps(insights, ensure_ascii=False)
    feedback.action_items = json.dumps(insights.get("itens_de_acao", []), ensure_ascii=False)
    feedback.insights_generated_at = datetime.now(timezone.utc)
    db.commit()

    _sync_feedback_md(feedback, insights)
    return insights


def _sync_feedback_md(feedback: ClientFeedback, insights: dict):
    """Atualiza Clientes/[slug]/feedback.md se a pasta existir."""
    slug = feedback.client.feedback_slug
    if not slug:
        return

    clientes_dir = os.path.normpath(
        os.path.join(os.path.dirname(__file__), "..", "..", "..", "Clientes")
    )
    client_dir = os.path.join(clientes_dir, slug)
    if not os.path.isdir(client_dir):
        return

    nps = feedback.nps_score
    nps_label = "Promotor" if nps and nps >= 9 else ("Neutro" if nps and nps >= 7 else "Detrator")
    pontos_fortes = "\n".join(f"- {p}" for p in insights.get("pontos_fortes", [])) or "- (não mencionado)"
    pontos_dor = "\n".join(f"- {p}" for p in insights.get("pontos_de_dor", [])) or "- (não mencionado)"
    acoes = "\n".join(
        f"- [ ] {a['acao']} ({a.get('prioridade', '')})"
        for a in insights.get("itens_de_acao", [])
    ) or "- [ ] (nenhuma ação identificada)"
    followup = insights.get("followup_whatsapp", "")

    path = os.path.join(client_dir, "feedback.md")

    historico_existente = ""
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        match = re.search(r"## Histórico\n\|.*?\n\|.*?\n(.*?)$", content, re.DOTALL)
        if match:
            historico_existente = match.group(1).strip()

    nps_val = nps if nps is not None else "?"
    historico_nova_linha = f"| {feedback.period} | {nps_val} | {(str(insights.get('pontos_de_dor', ['']))[:60])} |"
    novo_historico = (historico_existente + "\n" + historico_nova_linha).strip() if historico_existente else historico_nova_linha

    md = f"""# Feedback — {feedback.client.name}

## Última pesquisa
Período: {feedback.period} | NPS: {nps_val}/10 ({nps_label}) | Respondente: {feedback.respondent_name or 'não informado'}

## Pontos positivos
{pontos_fortes}

## Pontos de atenção
{pontos_dor}

## Itens de ação
{acoes}

## Rascunho de follow-up (WhatsApp)
{followup}

## Histórico
| Período | NPS | Pontos de atenção |
|---------|-----|-------------------|
{novo_historico}
"""
    with open(path, "w", encoding="utf-8") as f:
        f.write(md)
