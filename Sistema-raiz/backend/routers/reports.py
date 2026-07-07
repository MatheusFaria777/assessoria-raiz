from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import date, timedelta
import json
import logging
import traceback

logger = logging.getLogger(__name__)

from database import get_db
from models.client import Client
from models.report import Report
from models.campaign_group import CampaignGroup
from config import decrypt
from services.token_manager import get_meta_token
from services.meta import get_account_data as meta_data, get_top_ads, grupos_to_tipos
from services.report_builder import format_report

router = APIRouter()


class GenerateRequest(BaseModel):
    client_id: int
    since: str
    until: str
    period_type: str = "week"    # week | month
    include_previous: bool = True
    summary_text: str = ""


class GenerateResponse(BaseModel):
    content: str
    platform: str
    total_spend: float
    tipos: dict = {}
    top_ads: list = []
    top_keywords: list = []
    report_id: Optional[int] = None


@router.post("/generate", response_model=GenerateResponse)
def generate_report(req: GenerateRequest, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == req.client_id, Client.active == True).first()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    # Determina plataforma
    if client.has_meta and client.meta_account_id:
        platform = "meta"
    elif client.has_google and client.google_customer_id:
        platform = "google"
    else:
        raise HTTPException(status_code=400, detail="Cliente sem plataforma configurada")

    # Período anterior (mesma duração)
    since_dt = date.fromisoformat(req.since)
    until_dt = date.fromisoformat(req.until)
    delta = (until_dt - since_dt).days + 1
    prev_since = (since_dt - timedelta(days=delta)).isoformat()
    prev_until  = (since_dt - timedelta(days=1)).isoformat()

    if platform == "meta":
        token = get_meta_token(client, db)
        if not token:
            raise HTTPException(status_code=400, detail="Token Meta não configurado. Configure o System User Token em Configurações → Meta Ads.")

        # Grupos associados ao cliente
        grupos = client.campaign_groups
        tipos_cfg = grupos_to_tipos(grupos) if grupos else []

        try:
            current = meta_data(client.meta_account_id, token, req.since, req.until, tipos_cfg)
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Erro Meta API: {str(e)}")

        previous = None
        if req.include_previous:
            try:
                previous = meta_data(client.meta_account_id, token, prev_since, prev_until, tipos_cfg)
            except Exception:
                pass

        top_ads = []
        try:
            top_ads = get_top_ads(client.meta_account_id, token, req.since, req.until, tipos_cfg, current.get("primary_type"), n=3)
        except Exception:
            pass

        content = format_report(
            client_name=client.name,
            since=req.since, until=req.until,
            current=current, previous=previous,
            grupos_cfg=tipos_cfg,
            summary_text=req.summary_text,
            top_ads=top_ads,
            period_type=req.period_type,
        )

        # Salva no histórico
        try:
            raw = json.dumps({"current": current, "previous": previous}, default=str)
            report = Report(
                client_id=client.id, type=req.period_type, platform="meta",
                period_start=date.fromisoformat(req.since),
                period_end=date.fromisoformat(req.until),
                content=content, raw_data=raw,
            )
            db.add(report)
            db.commit()
            db.refresh(report)
            report_id = report.id
        except Exception as e:
            db.rollback()
            report_id = None

        # Serializa tipos removendo tipos não-serializáveis
        tipos_out = {k: {kk: vv for kk, vv in v.items()} for k, v in current["tipos"].items()}

        return GenerateResponse(
            content=content, platform="meta",
            total_spend=float(current["total_spend"]),
            tipos=tipos_out,
            top_ads=top_ads,
            report_id=report_id,
        )

    # ── Google Ads ─────────────────────────────────────────────────────
    from services.google_ads import get_account_data as google_data, get_top_keywords
    from services.token_manager import get_google_credentials

    creds = get_google_credentials(db)
    if not creds:
        raise HTTPException(status_code=400, detail="Credenciais Google Ads não configuradas. Configure em Configurações → Google Ads.")

    try:
        current = google_data(client.google_customer_id, creds, req.since, req.until)
    except Exception as e:
        logger.error("Google Ads error for client %s: %s\n%s", client.name, e, traceback.format_exc())
        raise HTTPException(status_code=502, detail=f"Erro Google Ads API: {str(e)}")

    previous = None
    if req.include_previous:
        try:
            previous = google_data(client.google_customer_id, creds, prev_since, prev_until)
        except Exception:
            pass

    top_keywords = []
    try:
        top_keywords = get_top_keywords(client.google_customer_id, creds, req.since, req.until, n=3)
    except Exception:
        pass

    content = format_report(
        client_name=client.name,
        since=req.since, until=req.until,
        current=current, previous=previous,
        grupos_cfg=[],
        summary_text=req.summary_text,
        top_keywords=top_keywords,
        period_type=req.period_type,
    )

    try:
        raw = json.dumps({"current": current, "previous": previous}, default=str)
        report = Report(
            client_id=client.id, type=req.period_type, platform="google",
            period_start=date.fromisoformat(req.since),
            period_end=date.fromisoformat(req.until),
            content=content, raw_data=raw,
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        report_id = report.id
    except Exception:
        db.rollback()
        report_id = None

    return GenerateResponse(
        content=content, platform="google",
        total_spend=float(current["total_spend"]),
        tipos=current["tipos"],
        top_keywords=top_keywords,
        report_id=report_id,
    )


@router.get("/latest/{client_id}")
def get_latest(client_id: int, since: str = None, until: str = None, db: Session = Depends(get_db)):
    """Retorna o relatório mais recente de um cliente para um período específico."""
    q = db.query(Report).filter(Report.client_id == client_id)
    if until:
        q = q.filter(Report.period_end == until)
    r = q.order_by(Report.created_at.desc()).first()
    if not r:
        return None
    return {
        "id": r.id, "content": r.content, "type": r.type,
        "platform": r.platform, "total_spend": 0,
        "tipos": {}, "top_ads": [], "top_keywords": [],
        "report_id": r.id, "status": r.status,
    }


@router.get("/history/{client_id}")
def get_history(client_id: int, limit: int = 50, db: Session = Depends(get_db)):
    reports = (
        db.query(Report)
        .filter(Report.client_id == client_id)
        .order_by(Report.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": r.id,
            "type": r.type,
            "platform": r.platform,
            "period_start": str(r.period_start),
            "period_end": str(r.period_end),
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in reports
    ]


@router.get("/history/{client_id}/{report_id}")
def get_report(client_id: int, report_id: int, db: Session = Depends(get_db)):
    r = db.query(Report).filter(Report.id == report_id, Report.client_id == client_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Relatório não encontrado")
    return {"id": r.id, "content": r.content, "type": r.type, "platform": r.platform,
            "period_start": str(r.period_start), "period_end": str(r.period_end)}


@router.get("/pending")
def get_pending(db: Session = Depends(get_db)):
    """Relatórios gerados automaticamente aguardando revisão."""
    from models.client import Client
    reports = (
        db.query(Report)
        .filter(Report.status == "pending_review")
        .order_by(Report.created_at.desc())
        .all()
    )
    result = []
    for r in reports:
        client = db.query(Client).filter(Client.id == r.client_id).first()
        result.append({
            "id": r.id, "client_id": r.client_id,
            "client_name": client.name if client else "?",
            "type": r.type, "platform": r.platform,
            "period_start": str(r.period_start), "period_end": str(r.period_end),
            "content": r.content,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        })
    return result


@router.post("/pending/dismiss-all")
def dismiss_all_pending(db: Session = Depends(get_db)):
    """Marca todos os relatórios pending_review como enviados de uma vez."""
    reports = db.query(Report).filter(Report.status == "pending_review").all()
    count = len(reports)
    for r in reports:
        r.status = "sent"
    db.commit()
    return {"dismissed": count}


@router.post("/pending/{report_id}/mark-sent")
def mark_sent(report_id: int, db: Session = Depends(get_db)):
    from models.client import Client
    from services.token_manager import get_meta_token
    from services.meta import get_account_data, grupos_to_tipos
    from services.sheets import write_weekly, is_configured
    from models.report import SyncLog
    import json as _json

    r = db.query(Report).filter(Report.id == report_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Relatório não encontrado")
    r.status = "sent"
    db.commit()

    # Sync automático da planilha ao marcar enviado
    sync_result = None
    client = db.query(Client).filter(Client.id == r.client_id).first()
    if client and client.sheets_id and client.sheets_tabs and is_configured():
        try:
            since = str(r.period_start)
            until = str(r.period_end)

            # Busca dados da plataforma correta
            if client.has_google and client.google_customer_id and r.platform == "google":
                from services.token_manager import get_google_credentials
                from services.google_ads import get_account_data as google_data
                creds = get_google_credentials(db)
                data = google_data(client.google_customer_id, creds, since, until) if creds else None
            else:
                token = get_meta_token(client, db)
                tipos_cfg = grupos_to_tipos(client.campaign_groups) if client.campaign_groups else []
                data = get_account_data(client.meta_account_id, token, since, until, tipos_cfg)

            tipos = data.get("tipos", {}) if data else {}
            sheets_tabs = _json.loads(client.sheets_tabs)

            tab_candidates = {}
            for tipo_name, tipo_data in tipos.items():
                tab_name = sheets_tabs.get(tipo_name)
                if tab_name and (tipo_data.get("spend", 0) > 0 or tipo_data.get("results", 0) > 0):
                    if tab_name not in tab_candidates:
                        tab_candidates[tab_name] = tipo_data

            errors = []
            for tab_name, tipo_data in tab_candidates.items():
                res = write_weekly(
                    sheet_id=client.sheets_id, tab_name=tab_name, since=since,
                    impressoes=tipo_data.get("impressions", 0),
                    results=tipo_data.get("results", 0),
                    link_clicks=tipo_data.get("link_clicks", 0),
                    spend=tipo_data.get("spend", 0.0),
                    revenue=tipo_data.get("purchase_value", 0.0),
                )
                if not res.get("ok"):
                    errors.append(f"{tab_name}: {res.get('error')}")

            log = SyncLog(
                client_id=client.id, type="weekly",
                status="success" if not errors else "error",
                rows_synced=len(tab_candidates),
                error_message="; ".join(errors) if errors else None,
            )
            db.add(log)
            db.commit()
            sync_result = {"ok": not errors, "tabs": len(tab_candidates), "errors": errors}
        except Exception as e:
            sync_result = {"ok": False, "error": str(e)}

    return {"ok": True, "sync": sync_result}


@router.post("/run-scheduler")
async def run_scheduler_now():
    """Dispara o agendamento manualmente (para testar sem esperar as 7h)."""
    from services.scheduler import run_scheduled_reports
    await run_scheduled_reports()
    return {"ok": True, "message": "Relatórios agendados processados"}


@router.delete("/history/{report_id}")
def delete_report(report_id: int, db: Session = Depends(get_db)):
    r = db.query(Report).filter(Report.id == report_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Relatório não encontrado")
    db.delete(r)
    db.commit()
    return {"ok": True}
