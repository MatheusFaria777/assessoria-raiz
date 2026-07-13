from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import os

from database import get_db
from models.settings import GlobalSetting
from config import encrypt, decrypt

router = APIRouter()

# Router separado para OAuth (sem autenticação — callback vem do Google)
google_oauth_router = APIRouter()

# Estado temporário do fluxo OAuth (app de usuário único)
_oauth_state: dict = {}

GOOGLE_SCOPES = ["https://www.googleapis.com/auth/adwords"]


def _get_google_client_creds(db: Session):
    """Lê client_id e client_secret das credenciais Google salvas em qualquer cliente."""
    import json
    from models.client import Client
    clients = db.query(Client).filter(
        Client.has_google == True,
        Client.google_credentials != None,
        Client.google_credentials != "",
    ).all()
    for client in clients:
        try:
            raw = decrypt(client.google_credentials)
            if not raw:
                continue
            creds = json.loads(raw)
            cid = creds.get("client_id")
            csecret = creds.get("client_secret")
            if cid and csecret:
                return cid, csecret
        except Exception:
            continue
    return None, None


def _oauth_done_html(success: bool, msg: str) -> str:
    icon = "✅" if success else "❌"
    color = "#4ade80" if success else "#f87171"
    status = "success" if success else "error"
    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Google OAuth</title>
<style>
  body{{font-family:sans-serif;background:#121212;color:#f5f5f5;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}}
  .box{{text-align:center;padding:2rem}}
  .icon{{font-size:3rem}}
  .msg{{color:{color};margin:1rem 0;font-size:1.1rem}}
  .note{{font-size:.8rem;color:rgba(245,245,245,.4)}}
</style></head>
<body>
<div class="box">
  <div class="icon">{icon}</div>
  <p class="msg">{msg}</p>
  <p class="note">Fechando automaticamente...</p>
</div>
<script>
  if (window.opener) {{
    window.opener.postMessage({{google_oauth:'{status}',msg:{repr(msg)}}}, '*');
  }}
  setTimeout(() => window.close(), 1800);
</script>
</body></html>"""


@google_oauth_router.get("/start")
def google_oauth_start(request: Request, db: Session = Depends(get_db)):
    """Gera a URL de autorização Google OAuth2 e retorna pro frontend abrir."""
    from google_auth_oauthlib.flow import Flow

    client_id, client_secret = _get_google_client_creds(db)
    if not client_id or not client_secret:
        raise HTTPException(
            status_code=400,
            detail="Configure o Client ID e Client Secret Google antes de autenticar.",
        )

    # Permite HTTP em desenvolvimento
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

    proto = request.headers.get("x-forwarded-proto", request.url.scheme)
    host = request.headers.get("x-forwarded-host", request.url.netloc)
    redirect_uri = f"{proto}://{host}/api/settings/google-oauth/callback"

    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": client_id,
                "client_secret": client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [redirect_uri],
            }
        },
        scopes=GOOGLE_SCOPES,
        redirect_uri=redirect_uri,
    )

    auth_url, state = flow.authorization_url(
        access_type="offline",
        prompt="consent",
    )

    _oauth_state.clear()
    _oauth_state.update({"state": state, "client_id": client_id, "client_secret": client_secret, "redirect_uri": redirect_uri})

    return {"auth_url": auth_url, "redirect_uri": redirect_uri}


@google_oauth_router.get("/callback")
def google_oauth_callback(
    code: str = None, state: str = None, error: str = None,
    db: Session = Depends(get_db),
):
    """Recebe o code do Google, salva o refresh_token e fecha o popup."""
    import json
    from google_auth_oauthlib.flow import Flow

    if error:
        return HTMLResponse(_oauth_done_html(False, f"Erro: {error}"))

    if not code or not state or _oauth_state.get("state") != state:
        return HTMLResponse(_oauth_done_html(False, "Estado OAuth inválido ou expirado. Tente de novo."))

    try:
        os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": _oauth_state["client_id"],
                    "client_secret": _oauth_state["client_secret"],
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [_oauth_state["redirect_uri"]],
                }
            },
            scopes=GOOGLE_SCOPES,
            redirect_uri=_oauth_state["redirect_uri"],
            state=state,
        )

        flow.fetch_token(code=code)
        credentials = flow.credentials
        refresh_token = credentials.refresh_token

        if not refresh_token:
            return HTMLResponse(_oauth_done_html(
                False,
                "Google não retornou refresh_token. Revogue o acesso em myaccount.google.com/permissions e tente de novo.",
            ))

        from models.client import Client
        clients = db.query(Client).filter(
            Client.has_google == True,
            Client.google_credentials != None,
        ).all()
        updated = 0
        last_creds = None
        for c in clients:
            try:
                creds = json.loads(decrypt(c.google_credentials))
            except Exception:
                creds = {}
            creds["refresh_token"] = refresh_token
            c.google_credentials = encrypt(json.dumps(creds))
            last_creds = creds
            updated += 1

        # Atualiza também a GlobalSetting usada pelos relatórios
        if last_creds:
            _upsert(db, "google_ads_credentials", encrypt(json.dumps(last_creds)), is_encrypted=True)

        db.commit()
        _oauth_state.clear()

        return HTMLResponse(_oauth_done_html(True, f"Conectado! Refresh token atualizado em {updated} cliente(s)."))

    except Exception as e:
        return HTMLResponse(_oauth_done_html(False, str(e)))


class SettingIn(BaseModel):
    value: str
    is_encrypted: bool = True


class SettingOut(BaseModel):
    key: str
    has_value: bool
    preview: Optional[str] = None  # primeiros/últimos chars (nunca o valor real)


SENSITIVE_KEYS = {
    "meta_system_token",
    "anthropic_api_key",
    "openai_api_key",
}


def _preview(value: str) -> str:
    if not value or len(value) < 10:
        return "****"
    return value[:6] + "..." + value[-4:]


@router.get("/", response_model=list[SettingOut])
def list_settings(db: Session = Depends(get_db)):
    settings = db.query(GlobalSetting).all()
    result = []
    for s in settings:
        raw = decrypt(s.value) if s.is_encrypted else s.value
        result.append(SettingOut(key=s.key, has_value=bool(raw), preview=_preview(raw) if raw else None))
    return result


@router.get("/{key}")
def get_setting(key: str, db: Session = Depends(get_db)):
    s = db.query(GlobalSetting).filter(GlobalSetting.key == key).first()
    if not s:
        return {"key": key, "has_value": False, "preview": None}
    raw = decrypt(s.value) if s.is_encrypted else s.value
    return {"key": key, "has_value": bool(raw), "preview": _preview(raw) if raw else None}


@router.put("/{key}")
def save_setting(key: str, data: SettingIn, db: Session = Depends(get_db)):
    value = encrypt(data.value) if data.is_encrypted else data.value
    s = db.query(GlobalSetting).filter(GlobalSetting.key == key).first()
    if s:
        s.value = value
        s.is_encrypted = data.is_encrypted
    else:
        s = GlobalSetting(key=key, value=value, is_encrypted=data.is_encrypted)
        db.add(s)
    db.commit()
    raw = decrypt(s.value) if s.is_encrypted else s.value
    return {"ok": True, "key": key, "preview": _preview(raw)}


@router.delete("/{key}")
def delete_setting(key: str, db: Session = Depends(get_db)):
    s = db.query(GlobalSetting).filter(GlobalSetting.key == key).first()
    if s:
        db.delete(s)
        db.commit()
    return {"ok": True}


class TokenExchangeIn(BaseModel):
    token: str  # token curto ou longo a converter



@router.post("/meta-token/exchange")
def exchange_meta_token(data: TokenExchangeIn, db: Session = Depends(get_db)):
    """Converte token curto em token de 60 dias e salva no banco."""
    from services.meta_token import exchange_for_long_lived, get_token_info
    from datetime import datetime, timedelta

    app_id_s  = db.query(GlobalSetting).filter(GlobalSetting.key == "meta_app_id").first()
    app_sec_s = db.query(GlobalSetting).filter(GlobalSetting.key == "meta_app_secret").first()

    if not app_id_s or not app_sec_s:
        raise HTTPException(status_code=400, detail="Configure o App ID e App Secret antes de trocar o token")

    app_id     = decrypt(app_id_s.value)
    app_secret = decrypt(app_sec_s.value)

    try:
        result = exchange_for_long_lived(data.token, app_id, app_secret)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao trocar token: {str(e)}")

    new_token  = result["access_token"]
    expires_in = result.get("expires_in", 60 * 24 * 3600)
    expires_at = (datetime.now() + timedelta(seconds=expires_in)).isoformat()

    # Salva o token longo
    _upsert(db, "meta_system_token", encrypt(new_token), is_encrypted=True)
    _upsert(db, "meta_token_expires", encrypt(expires_at), is_encrypted=True)
    db.commit()

    days = int(expires_in / 86400)
    return {
        "ok": True,
        "preview": _preview(new_token),
        "expires_at": expires_at,
        "days": days,
        "message": f"Token convertido! Válido por {days} dias (até {expires_at[:10]})",
    }


@router.get("/meta-token/info")
def meta_token_info(db: Session = Depends(get_db)):
    """Retorna informações sobre o token Meta armazenado."""
    from services.meta_token import get_token_info

    token_s   = db.query(GlobalSetting).filter(GlobalSetting.key == "meta_system_token").first()
    expires_s = db.query(GlobalSetting).filter(GlobalSetting.key == "meta_token_expires").first()
    app_id_s  = db.query(GlobalSetting).filter(GlobalSetting.key == "meta_app_id").first()
    app_sec_s = db.query(GlobalSetting).filter(GlobalSetting.key == "meta_app_secret").first()

    if not token_s:
        return {"has_token": False}

    token = decrypt(token_s.value)
    expires_at = decrypt(expires_s.value) if expires_s else None

    info = {"has_token": True, "expires_at": expires_at}
    if expires_at:
        from datetime import datetime
        try:
            days = (datetime.fromisoformat(expires_at) - datetime.now()).days
            info["days_left"] = days
        except Exception:
            pass

    # Verifica no Meta se tiver App ID/Secret
    if app_id_s and app_sec_s:
        try:
            meta_info = get_token_info(token, decrypt(app_id_s.value), decrypt(app_sec_s.value))
            info.update(meta_info)
        except Exception:
            pass

    return info


class GoogleCredsIn(BaseModel):
    developer_token: str
    client_id: str
    client_secret: str
    refresh_token: str
    login_customer_id: Optional[str] = ""


@router.post("/google-credentials")
def update_google_credentials(data: GoogleCredsIn, db: Session = Depends(get_db)):
    """Atualiza as credenciais Google Ads em todos os clientes e na GlobalSetting."""
    import json
    from models.client import Client

    creds = {
        "developer_token": data.developer_token,
        "client_id": data.client_id,
        "client_secret": data.client_secret,
        "refresh_token": data.refresh_token or "",
        "login_customer_id": data.login_customer_id or "",
    }
    creds_json = encrypt(json.dumps(creds))

    clients = db.query(Client).filter(Client.has_google == True, Client.active == True).all()
    for c in clients:
        c.google_credentials = creds_json

    # Salva também na GlobalSetting usada pelos relatórios
    _upsert(db, "google_ads_credentials", creds_json, is_encrypted=True)
    db.commit()

    return {"ok": True, "updated": len(clients), "message": f"Credenciais atualizadas em {len(clients)} cliente(s)."}


def _upsert(db, key: str, value: str, is_encrypted: bool = False):
    s = db.query(GlobalSetting).filter(GlobalSetting.key == key).first()
    if s:
        s.value = value
        s.is_encrypted = is_encrypted
    else:
        db.add(GlobalSetting(key=key, value=value, is_encrypted=is_encrypted))
