from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import shutil, json, os

from database import get_db
from models.client import Client, Adset
from models.uploader import UploadQueueItem
from config import decrypt

router = APIRouter()


class AddToQueueRequest(BaseModel):
    client_id: int
    adset_id: int
    instagram_url: str


class QueueItemOut(BaseModel):
    id: int
    client_id: int
    adset_id: int
    instagram_url: str
    status: str
    ai_copy: Optional[str] = None
    meta_ad_id: Optional[str] = None
    error_message: Optional[str] = None
    attempts: int
    created_at: Optional[str] = None
    processed_at: Optional[str] = None

    model_config = {"from_attributes": True}


@router.get("/queue")
def get_all_queues(db: Session = Depends(get_db)):
    """Retorna fila de todos os clientes agrupada."""
    from models.client import Client
    items = (
        db.query(UploadQueueItem)
        .order_by(UploadQueueItem.created_at.desc())
        .limit(300)
        .all()
    )
    adsets  = {a.id: a for a in db.query(Adset).all()}
    clients = {c.id: c for c in db.query(Client).all()}
    return [
        {
            "id": i.id, "client_id": i.client_id, "adset_id": i.adset_id,
            "client_name": clients[i.client_id].name if i.client_id in clients else "?",
            "adset_label": adsets[i.adset_id].label if i.adset_id in adsets else "?",
            "instagram_url": i.instagram_url, "status": i.status,
            "ai_copy": i.ai_copy, "meta_ad_id": i.meta_ad_id,
            "error_message": i.error_message, "attempts": i.attempts,
            "created_at": i.created_at.isoformat() if i.created_at else None,
            "processed_at": i.processed_at.isoformat() if i.processed_at else None,
        }
        for i in items
    ]


@router.post("/process-all")
async def process_all(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Dispara processamento para cada cliente que tem itens pendentes."""
    from models.client import Client
    pending = (
        db.query(UploadQueueItem.client_id)
        .filter(UploadQueueItem.status == "pending")
        .distinct()
        .all()
    )
    client_ids = [row[0] for row in pending]
    for cid in client_ids:
        item = (
            db.query(UploadQueueItem)
            .filter(UploadQueueItem.client_id == cid, UploadQueueItem.status == "pending")
            .order_by(UploadQueueItem.created_at.asc())
            .first()
        )
        if item:
            # Não marca como processing aqui — o claim atômico dentro de _process_item faz isso
            background_tasks.add_task(_process_item, item.id)
    return {"started": client_ids}


@router.get("/queue/{client_id}")
def get_queue(client_id: int, db: Session = Depends(get_db)):
    items = (
        db.query(UploadQueueItem)
        .filter(UploadQueueItem.client_id == client_id)
        .order_by(UploadQueueItem.created_at.desc())
        .limit(100)
        .all()
    )
    adsets = {a.id: a for a in db.query(Adset).filter(Adset.client_id == client_id).all()}
    return [
        {
            "id": i.id, "client_id": i.client_id, "adset_id": i.adset_id,
            "adset_label": adsets.get(i.adset_id, {}).label if adsets.get(i.adset_id) else "?",
            "instagram_url": i.instagram_url, "status": i.status,
            "ai_copy": i.ai_copy, "meta_ad_id": i.meta_ad_id,
            "error_message": i.error_message, "attempts": i.attempts,
            "created_at": i.created_at.isoformat() if i.created_at else None,
            "processed_at": i.processed_at.isoformat() if i.processed_at else None,
        }
        for i in items
    ]


@router.post("/queue")
def add_to_queue(req: AddToQueueRequest, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == req.client_id, Client.active == True).first()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    adset = db.query(Adset).filter(Adset.id == req.adset_id, Adset.client_id == req.client_id).first()
    if not adset:
        raise HTTPException(status_code=404, detail="Adset não encontrado")

    item = UploadQueueItem(
        client_id=req.client_id,
        adset_id=req.adset_id,
        instagram_url=req.instagram_url,
        status="pending",
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"id": item.id, "status": "pending"}


@router.post("/process-next/{client_id}")
async def process_next(client_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Processa o próximo item pendente da fila."""
    item = (
        db.query(UploadQueueItem)
        .filter(UploadQueueItem.client_id == client_id, UploadQueueItem.status == "pending")
        .order_by(UploadQueueItem.created_at.asc())
        .first()
    )
    if not item:
        return {"done": True, "message": "Nenhum item pendente"}

    background_tasks.add_task(_process_item, item.id)
    return {"done": False, "processing_id": item.id}


def _process_item(item_id: int):
    """Processa um item da fila — executado em background."""
    import logging
    log = logging.getLogger("uploader")

    from database import SessionLocal
    from services.instagram import download_post
    from services.ai_copy import generate_copy
    from services.meta_uploader import (
        get_next_ad_number, upload_images,
        create_carousel_ad, duplicate_and_update_ad,
    )
    from models.client import Client, Adset
    from models.uploader import UploadQueueItem
    from config import decrypt
    from models.settings import GlobalSetting

    db = SessionLocal()
    temp_dir = None
    try:
        # Claim atômico: só processa se ainda estiver pending (evita duplicatas por race condition)
        claimed = (
            db.query(UploadQueueItem)
            .filter(UploadQueueItem.id == item_id, UploadQueueItem.status == "pending")
            .update({"status": "processing", "attempts": UploadQueueItem.attempts + 1}, synchronize_session="fetch")
        )
        db.commit()
        if not claimed:
            print(f"[uploader] item {item_id} já processado/cancelado — ignorando", flush=True)
            return

        item = db.query(UploadQueueItem).filter(UploadQueueItem.id == item_id).first()
        if not item:
            return

        print(f"[uploader] iniciando item {item_id} — {item.instagram_url}", flush=True)

        client = db.query(Client).filter(Client.id == item.client_id).first()
        adset  = db.query(Adset).filter(Adset.id == item.adset_id).first()

        if not client or not adset:
            item.status = "error"
            item.error_message = "Cliente ou adset não encontrado"
            db.commit()
            return

        from services.token_manager import get_meta_token, get_anthropic_key
        token = get_meta_token(client, db)
        account_id = client.meta_account_id

        api_key = get_anthropic_key(db)
        if not api_key:
            item.status = "error"
            item.error_message = "Chave da API Claude não configurada"
            db.commit()
            return

        # 1. Download do post Instagram
        print(f"[uploader] item {item_id} — step 1: baixando post Instagram", flush=True)
        _ig_setting = db.query(GlobalSetting).filter(GlobalSetting.key == "instagram_sessionid").first()
        _ig_sessionid = decrypt(_ig_setting.value) if _ig_setting and _ig_setting.value else None
        post = download_post(item.instagram_url, sessionid=_ig_sessionid)
        temp_dir = post["temp_dir"]
        print(f"[uploader] item {item_id} — post baixado: type={post['type']}, {len(post.get('images',[]))} imagens", flush=True)

        # 2. Dados da loja do adset
        loja = {
            "nome":             adset.store_name or client.name,
            "diferenciais":     adset.store_description or "",
            "endereco":         adset.store_address or "",
            "telefone":         adset.store_phone or "",
            "whatsapp_display": adset.store_whatsapp_display or adset.whatsapp or "",
            "site":             adset.store_website or "",
        }

        # 3. Gera copy com IA
        print(f"[uploader] item {item_id} — step 3: gerando copy com Claude", flush=True)
        copy = generate_copy(post["caption"], api_key, loja, post_type=post["type"])
        print(f"[uploader] item {item_id} — copy gerado: {copy.get('nome_anuncio','?')}", flush=True)

        # 4. Upload das imagens (só para carrossel) — Meta limita 10 cards
        images_to_upload = post["images"][:10] if post["type"] == "carousel" else []
        print(f"[uploader] item {item_id} — step 4: upload de {len(images_to_upload)} imagens para Meta", flush=True)
        image_hashes = upload_images(account_id, token, images_to_upload) if images_to_upload else []

        # 5. Próximo número de anúncio
        print(f"[uploader] item {item_id} — step 5: buscando próximo número de anúncio", flush=True)
        ad_number = get_next_ad_number(account_id, token, adset.adset_id)

        # 6. Cria anúncio do zero (sem template) — carrossel ou vídeo
        print(f"[uploader] item {item_id} — step 6: criando anúncio no Meta (type={post['type']})", flush=True)
        lead_gen_form_id = adset.lead_gen_form_id or ""
        if post["type"] == "video":
            from services.meta_uploader import upload_video, create_video_ad
            video_id = upload_video(account_id, token, post["video"])
            thumb_hash = upload_images(account_id, token, [post["thumbnail"]])[0] if post.get("thumbnail") else ""
            result = create_video_ad(
                account_id=account_id, token=token,
                adset_id=adset.adset_id, page_id=adset.page_id or "",
                video_id=video_id, ad_number=ad_number, copy=copy,
                image_hash=thumb_hash,
                instagram_actor_id=adset.instagram_actor_id or "",
                lead_gen_form_id=lead_gen_form_id,
            )
        else:
            result = create_carousel_ad(
                account_id=account_id, token=token,
                adset_id=adset.adset_id, page_id=adset.page_id or "",
                image_hashes=image_hashes,
                ad_number=ad_number, copy=copy,
                instagram_actor_id=adset.instagram_actor_id or "",
                lead_gen_form_id=lead_gen_form_id,
            )
        print(f"[uploader] item {item_id} — anúncio criado: {result.get('ad_id','?')}", flush=True)

        item.status = "done"
        item.ai_copy = json.dumps(copy, ensure_ascii=False)
        item.meta_ad_id = result["ad_id"]
        item.processed_at = datetime.utcnow()
        db.commit()

        # Dispara o próximo da fila automaticamente com delay de 30s
        # (evita rate limit no endpoint de adimages após uploads em sequência)
        next_item = (
            db.query(UploadQueueItem)
            .filter(UploadQueueItem.client_id == item.client_id, UploadQueueItem.status == "pending")
            .order_by(UploadQueueItem.id)
            .first()
        )
        if next_item:
            import threading
            t = threading.Timer(30, _process_item, args=[next_item.id])
            t.daemon = True
            t.start()
            print(f"[uploader] próximo item {next_item.id} agendado em 30s", flush=True)

    except Exception as e:
        err = str(e)
        print(f"[uploader] item {item_id} — ERRO: {err[:300]}", flush=True)
        if not db:
            return
        item = db.query(UploadQueueItem).filter(UploadQueueItem.id == item_id).first()
        if item:
            rate_limit = any(x in err.lower() for x in [
                "rate limit", "user request limit",
                "[code 17]", "code 17",
                "too many calls", "request limit reached", "2446079",
            ])
            # Erro transiente da Anthropic (500 Internal Server Error) — retry rápido
            anthropic_transient = (
                "api_error" in err.lower() and "internal server error" in err.lower()
            ) or "overloaded_error" in err.lower()

            attempts = item.attempts  # já incrementado no início

            if rate_limit:
                if attempts <= 3:
                    wait = {1: 120, 2: 300, 3: 600}.get(attempts, 600)
                    item.status = "pending"
                    item.error_message = (
                        f"Rate limit Meta (tentativa {attempts}/3) — "
                        f"aguardando {wait//60} min para retry automático..."
                    )
                    db.commit()
                    import threading
                    t = threading.Timer(wait, _process_item, args=[item_id])
                    t.daemon = True
                    t.start()
                else:
                    item.status = "error"
                    item.error_message = (
                        "Rate limit persistente após 3 tentativas. "
                        "Aguarde 15+ minutos e clique em Retry manualmente."
                    )
                    db.commit()
            elif anthropic_transient:
                if attempts <= 3:
                    wait = {1: 30, 2: 60, 3: 120}.get(attempts, 120)
                    item.status = "pending"
                    item.error_message = (
                        f"Erro temporário Claude API (tentativa {attempts}/3) — "
                        f"retry em {wait}s..."
                    )
                    db.commit()
                    import threading
                    t = threading.Timer(wait, _process_item, args=[item_id])
                    t.daemon = True
                    t.start()
                    print(f"[uploader] item {item_id} — Anthropic 500, retry em {wait}s", flush=True)
                else:
                    item.status = "error"
                    item.error_message = "Erro persistente na Claude API. Clique em Retry."
                    db.commit()
            else:
                item.status = "error"
                item.error_message = err[:500]
                db.commit()
    finally:
        if temp_dir:
            try:
                shutil.rmtree(temp_dir)
            except Exception:
                pass
        db.close()


@router.post("/queue/{item_id}/retry")
def retry_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(UploadQueueItem).filter(UploadQueueItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    item.status = "pending"
    item.error_message = None
    item.attempts = 0  # reseta contador para não chegar no limite de 3 imediatamente
    db.commit()
    return {"ok": True}


@router.post("/queue/{item_id}/reset")
def reset_item(item_id: int, db: Session = Depends(get_db)):
    """Força reset de item travado em 'processing' de volta para pending."""
    item = db.query(UploadQueueItem).filter(UploadQueueItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    item.status = "pending"
    item.error_message = None
    item.attempts = max(0, item.attempts - 1)
    db.commit()
    return {"ok": True}


@router.post("/queue/{item_id}/cancel")
def cancel_item(item_id: int, db: Session = Depends(get_db)):
    """Cancela um retry agendado — move para error sem tentar de novo."""
    item = db.query(UploadQueueItem).filter(UploadQueueItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    item.status = "error"
    item.error_message = "Cancelado manualmente."
    db.commit()
    return {"ok": True}


@router.delete("/queue/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(UploadQueueItem).filter(UploadQueueItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    db.delete(item)
    db.commit()
    return {"ok": True}
