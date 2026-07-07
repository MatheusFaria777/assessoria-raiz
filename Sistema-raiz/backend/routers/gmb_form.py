import json
from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.client import Client
from models.gmb_submission import GmbSubmission
from services.auth import get_current_user

router = APIRouter()


def _get_client(slug: str, db: Session) -> Client:
    client = db.query(Client).filter(Client.feedback_slug == slug, Client.active == True).first()
    if not client:
        raise HTTPException(status_code=404, detail="Formulário não encontrado")
    return client


def _create_drive_folder(client_name: str) -> str | None:
    """Cria pasta do cliente no Drive e retorna a URL. Retorna None em caso de erro."""
    try:
        from services.drive_upload import _get_drive_service, _get_or_create_folder, GMN_FOLDER_ID
        service = _get_drive_service()
        folder_id = _get_or_create_folder(service, client_name, GMN_FOLDER_ID)
        return f"https://drive.google.com/drive/folders/{folder_id}"
    except Exception as e:
        print(f"[GMN] Erro ao criar pasta Drive: {e}")
        return None


# ─── Endpoints públicos ───────────────────────────────────────────────────────

@router.get("/info/{slug}")
def get_gmb_info(slug: str, db: Session = Depends(get_db)):
    client = _get_client(slug, db)
    return {"client_name": client.name}


@router.post("/submit/{slug}", status_code=201)
async def submit_gmb_form(
    slug: str,
    db: Session = Depends(get_db),
    nome_empresa:       str = Form(...),
    responsavel:        str = Form(...),
    telefone:           str = Form(...),
    endereco:           str = Form(...),
    areas_cobertura:    str = Form(...),
    empreendedor:       str = Form(...),
    data_abertura:      str = Form(...),
    instagram:          str = Form(...),
    site:               str = Form(default=""),
    facebook:           str = Form(...),
    dias_funcionamento: str = Form(...),
    horario:            str = Form(...),
    horario_feriados:   str = Form(...),
    acessibilidade:     str = Form(...),
    estacionamento:     str = Form(...),
    pagamentos:         str = Form(...),
    descricao:          str = Form(...),
    servicos:           str = Form(...),
    faq:                str = Form(...),
):
    client = _get_client(slug, db)

    form_data = {
        "nome_empresa": nome_empresa, "responsavel": responsavel,
        "telefone": telefone, "endereco": endereco,
        "areas_cobertura": areas_cobertura, "empreendedor": empreendedor,
        "data_abertura": data_abertura, "instagram": instagram,
        "site": site, "facebook": facebook,
        "dias_funcionamento": json.loads(dias_funcionamento),
        "horario": horario, "horario_feriados": horario_feriados,
        "acessibilidade": acessibilidade, "estacionamento": estacionamento,
        "pagamentos": json.loads(pagamentos),
        "descricao": descricao, "servicos": servicos, "faq": faq,
    }

    # Cria pasta no Drive de forma síncrona
    drive_url = _create_drive_folder(client.name)

    # Salva no banco
    submission = GmbSubmission(
        client_id=client.id,
        respondent_name=responsavel,
        company_name=nome_empresa,
        drive_folder_url=drive_url,
        form_data=json.dumps(form_data, ensure_ascii=False),
    )
    db.add(submission)
    db.commit()

    return {
        "message": "Formulário enviado com sucesso!",
        "drive_folder_url": drive_url,
    }


# ─── Endpoints autenticados ───────────────────────────────────────────────────

@router.get("/overview")
def gmb_overview(db: Session = Depends(get_db), _=Depends(get_current_user)):
    clients = db.query(Client).filter(Client.active == True).order_by(Client.name).all()
    result = []
    for c in clients:
        submissions = db.query(GmbSubmission).filter(GmbSubmission.client_id == c.id).all()
        result.append({
            "client_id": c.id,
            "client_name": c.name,
            "feedback_slug": c.feedback_slug,
            "submitted": len(submissions) > 0,
            "submission_count": len(submissions),
            "last_submitted": max((s.submitted_at for s in submissions), default=None),
            "submissions": [_serialize(s) for s in submissions],
        })
    result.sort(key=lambda x: (not x["submitted"], x["client_name"]))
    return result


@router.delete("/submission/{submission_id}")
def delete_gmb_submission(submission_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    s = db.query(GmbSubmission).filter(GmbSubmission.id == submission_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Resposta não encontrada")
    db.delete(s)
    db.commit()
    return {"ok": True}


def _serialize(s: GmbSubmission) -> dict:
    return {
        "id": s.id,
        "client_id": s.client_id,
        "respondent_name": s.respondent_name,
        "company_name": s.company_name,
        "drive_folder_url": s.drive_folder_url,
        "form_data": json.loads(s.form_data) if s.form_data else {},
        "submitted_at": s.submitted_at,
    }
