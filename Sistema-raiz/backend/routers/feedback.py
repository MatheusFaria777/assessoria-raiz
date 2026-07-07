import json
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models.client import Client
from models.feedback import Survey, ClientFeedback
from services.auth import get_current_user
from services.feedback_insights import generate_insights, slugify

router = APIRouter()

_NPS_SURVEY_DEFAULT = json.dumps([
    {"id": "nps", "type": "nps", "label": "De 0 a 10, o quanto você nos indicaria para um colega?", "required": True, "is_nps": True},
    {"id": "what_worked", "type": "textarea", "label": "O que mais te agrada no nosso trabalho?", "required": False},
    {"id": "what_was_lacking", "type": "textarea", "label": "Se houve algo que deixou a desejar no atendimento, o que foi?", "required": False},
    {"id": "suggested_change", "type": "textarea", "label": "Se você pudesse mudar alguma coisa no nosso serviço, o que seria?", "required": False},
    {"id": "missing_info", "type": "textarea", "label": "Tem alguma informação, relatório ou suporte que você sente falta e hoje não recebe?", "required": False,
     "show_if": {"field": "nps", "operator": "lte", "value": 8}},
], ensure_ascii=False)


def _get_active_survey(db: Session) -> Survey:
    survey = db.query(Survey).filter(Survey.is_active == True).first()
    if not survey:
        # Cria o survey padrão na primeira vez
        survey = Survey(name="NPS Mensal", questions=_NPS_SURVEY_DEFAULT, is_active=True)
        db.add(survey)
        db.commit()
        db.refresh(survey)
    return survey


def _extract_nps(answers: dict, questions: list) -> Optional[int]:
    for q in questions:
        if q.get("is_nps") and q["id"] in answers:
            try:
                return int(answers[q["id"]])
            except (ValueError, TypeError):
                pass
    return None


# ─── Endpoints públicos (sem autenticação) ────────────────────────────────────

class FormInfoResponse(BaseModel):
    client_name: str
    period: str


@router.get("/form/{slug}", response_model=FormInfoResponse)
def get_form(slug: str, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.feedback_slug == slug, Client.active == True).first()
    if not client:
        raise HTTPException(status_code=404, detail="Formulário não encontrado")
    return FormInfoResponse(client_name=client.name, period=datetime.now().strftime("%Y-%m"))


class FeedbackSubmit(BaseModel):
    survey_id: Optional[int] = None
    respondent_name: Optional[str] = None
    answers: dict


@router.post("/submit/{slug}", status_code=201)
def submit_feedback(slug: str, body: FeedbackSubmit, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.feedback_slug == slug, Client.active == True).first()
    if not client:
        raise HTTPException(status_code=404, detail="Formulário não encontrado")

    survey = _get_active_survey(db)
    questions = json.loads(survey.questions)
    nps = body.answers.get("nps") or _extract_nps(body.answers, questions)
    period = datetime.now().strftime("%Y-%m")

    feedback = ClientFeedback(
        client_id=client.id,
        survey_id=body.survey_id or survey.id,
        period=period,
        respondent_name=body.respondent_name,
        nps_score=nps,
        answers=json.dumps(body.answers, ensure_ascii=False),
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    background_tasks.add_task(generate_insights, feedback, db)

    return {"message": "Obrigado pelo seu feedback!", "id": feedback.id}


# ─── Endpoints autenticados ───────────────────────────────────────────────────

@router.get("/overview")
def feedback_overview(db: Session = Depends(get_db), _=Depends(get_current_user)):
    clients = db.query(Client).filter(Client.active == True).order_by(Client.name).all()
    all_scores = []
    client_list = []

    for c in clients:
        feedbacks = db.query(ClientFeedback).filter(ClientFeedback.client_id == c.id).all()
        if feedbacks:
            scores = [f.nps_score for f in feedbacks if f.nps_score is not None]
            all_scores.extend(scores)
            nps_avg = round(sum(scores) / len(scores), 1) if scores else None
            client_list.append({
                "client_id": c.id, "client_name": c.name, "feedback_slug": c.feedback_slug,
                "nps_avg": nps_avg, "response_count": len(feedbacks),
                "last_period": max(f.period for f in feedbacks), "has_responded": True,
            })
        else:
            client_list.append({
                "client_id": c.id, "client_name": c.name, "feedback_slug": c.feedback_slug,
                "nps_avg": None, "response_count": 0, "last_period": None, "has_responded": False,
            })

    # Responderam primeiro (por NPS asc), sem resposta depois (já vêm em ordem alfabética)
    client_list.sort(key=lambda x: (not x["has_responded"], x["nps_avg"] if x["nps_avg"] is not None else 99))

    # Métricas globais
    total = len(all_scores)
    clients_responded = sum(1 for c in client_list if c["has_responded"])
    clients_total = len(client_list)
    metrics = {
        "nps_global_avg": round(sum(all_scores) / total, 1) if total else None,
        "total_responses": total,
        "clients_responded": clients_responded,
        "clients_total": clients_total,
        "response_rate": round(clients_responded / clients_total * 100, 1) if clients_total else 0,
        "pct_promotores": round(sum(1 for s in all_scores if s >= 9) / total * 100, 1) if total else 0,
        "pct_neutros":    round(sum(1 for s in all_scores if 7 <= s <= 8) / total * 100, 1) if total else 0,
        "pct_detratores": round(sum(1 for s in all_scores if s <= 6) / total * 100, 1) if total else 0,
    }

    return {"metrics": metrics, "clients": client_list}


@router.get("/client/{client_id}")
def get_client_feedback(client_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    client = db.query(Client).filter(Client.id == client_id, Client.active == True).first()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    feedbacks = (
        db.query(ClientFeedback)
        .filter(ClientFeedback.client_id == client_id)
        .order_by(ClientFeedback.submitted_at.desc())
        .all()
    )
    return [_serialize_feedback(f) for f in feedbacks]


@router.delete("/response/{feedback_id}")
def delete_feedback(feedback_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    fb = db.query(ClientFeedback).filter(ClientFeedback.id == feedback_id).first()
    if not fb:
        raise HTTPException(status_code=404, detail="Resposta não encontrada")
    db.delete(fb)
    db.commit()
    return {"ok": True}


@router.post("/client/{client_id}/insights")
def regenerate_insights(client_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db), _=Depends(get_current_user)):
    feedbacks = db.query(ClientFeedback).filter(ClientFeedback.client_id == client_id).all()
    if not feedbacks:
        raise HTTPException(status_code=404, detail="Nenhuma resposta encontrada")
    for f in feedbacks:
        background_tasks.add_task(generate_insights, f, db)
    return {"message": f"{len(feedbacks)} resposta(s) enviadas para geração de insights"}


@router.get("/response/{feedback_id}")
def get_feedback_insights(feedback_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    feedback = db.query(ClientFeedback).filter(ClientFeedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Resposta não encontrada")
    return _serialize_feedback(feedback)


# ─── Survey (form builder) ────────────────────────────────────────────────────

@router.get("/surveys")
def list_surveys(db: Session = Depends(get_db), _=Depends(get_current_user)):
    surveys = db.query(Survey).order_by(Survey.created_at.desc()).all()
    return [{"id": s.id, "name": s.name, "is_active": s.is_active,
             "questions": json.loads(s.questions), "created_at": s.created_at} for s in surveys]


class SurveyCreate(BaseModel):
    name: str
    questions: list


@router.post("/surveys", status_code=201)
def create_survey(body: SurveyCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    survey = Survey(name=body.name, questions=json.dumps(body.questions, ensure_ascii=False), is_active=False)
    db.add(survey)
    db.commit()
    db.refresh(survey)
    return {"id": survey.id, "name": survey.name}


class SurveyUpdate(BaseModel):
    name: Optional[str] = None
    questions: Optional[list] = None


@router.put("/surveys/{survey_id}")
def update_survey(survey_id: int, body: SurveyUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey não encontrado")
    if body.name is not None:
        survey.name = body.name
    if body.questions is not None:
        survey.questions = json.dumps(body.questions, ensure_ascii=False)
    db.commit()
    return {"id": survey.id, "name": survey.name, "questions": json.loads(survey.questions)}


@router.post("/surveys/{survey_id}/activate")
def activate_survey(survey_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    db.query(Survey).update({"is_active": False})
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey não encontrado")
    survey.is_active = True
    db.commit()
    return {"message": f"Survey '{survey.name}' ativado"}


# ─── Utilitários ──────────────────────────────────────────────────────────────

@router.post("/clients/{client_id}/set-slug")
def set_client_slug(client_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Gera e salva feedback_slug para um cliente."""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    if client.feedback_slug:
        return {"slug": client.feedback_slug, "message": "Slug já existia"}
    slug = slugify(client.name)
    # Garante unicidade
    base, n = slug, 1
    while db.query(Client).filter(Client.feedback_slug == slug, Client.id != client_id).first():
        slug = f"{base}-{n}"
        n += 1
    client.feedback_slug = slug
    db.commit()
    return {"slug": slug, "message": "Slug gerado"}


@router.post("/seed-slugs")
def seed_all_slugs(db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Atribui feedback_slug a todos os clientes que ainda não têm."""
    clients = db.query(Client).filter(Client.feedback_slug == None).all()
    updated = []
    for c in clients:
        slug = slugify(c.name)
        base, n = slug, 1
        while db.query(Client).filter(Client.feedback_slug == slug).first():
            slug = f"{base}-{n}"
            n += 1
        c.feedback_slug = slug
        updated.append({"id": c.id, "name": c.name, "slug": slug})
    db.commit()
    return {"updated": updated}


def _serialize_feedback(f: ClientFeedback) -> dict:
    return {
        "id": f.id,
        "client_id": f.client_id,
        "period": f.period,
        "respondent_name": f.respondent_name,
        "nps_score": f.nps_score,
        "answers": json.loads(f.answers) if f.answers else {},
        "ai_summary": json.loads(f.ai_summary) if f.ai_summary else None,
        "action_items": json.loads(f.action_items) if f.action_items else None,
        "submitted_at": f.submitted_at,
        "insights_generated_at": f.insights_generated_at,
    }
