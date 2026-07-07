"""
Gerenciamento de token Meta de longa duração (60 dias).
Troca token curto por longo e renova automaticamente antes de vencer.
"""
import requests
from datetime import datetime, timedelta
from config import decrypt, encrypt


def exchange_for_long_lived(short_token: str, app_id: str, app_secret: str) -> dict:
    """
    Troca qualquer token (curto ou longo) por um novo token de 60 dias.
    Funciona com token curto (~2h) e também com token longo antes de vencer.

    Retorna: {"access_token": str, "token_type": str, "expires_in": int}
    """
    resp = requests.get(
        "https://graph.facebook.com/oauth/access_token",
        params={
            "grant_type":      "fb_exchange_token",
            "client_id":       app_id,
            "client_secret":   app_secret,
            "fb_exchange_token": short_token,
        },
        timeout=15,
    )
    resp.raise_for_status()
    data = resp.json()
    if "error" in data:
        raise Exception(data["error"].get("message", str(data["error"])))
    return data


def get_token_info(token: str, app_id: str, app_secret: str) -> dict:
    """
    Consulta a validade e informações do token na Meta API.
    Retorna dados de expiração e permissões.
    """
    resp = requests.get(
        "https://graph.facebook.com/debug_token",
        params={
            "input_token":  token,
            "access_token": f"{app_id}|{app_secret}",
        },
        timeout=15,
    )
    data = resp.json().get("data", {})
    expires_at = data.get("expires_at", 0)
    return {
        "valid":       data.get("is_valid", False),
        "expires_at":  datetime.fromtimestamp(expires_at).isoformat() if expires_at else None,
        "days_left":   max(0, (datetime.fromtimestamp(expires_at) - datetime.now()).days) if expires_at else None,
        "never_expires": expires_at == 0,
        "scopes":      data.get("scopes", []),
    }


def should_renew(expires_at_iso: str | None, days_threshold: int = 15) -> bool:
    """Retorna True se o token expira em menos de `days_threshold` dias."""
    if not expires_at_iso:
        return False
    try:
        expires = datetime.fromisoformat(expires_at_iso)
        return (expires - datetime.now()).days < days_threshold
    except Exception:
        return False


async def auto_renew_token(db) -> bool:
    """
    Chamado pelo scheduler. Verifica e renova o token se necessário.
    Retorna True se renovou, False se não precisou.
    """
    import logging
    from models.settings import GlobalSetting

    logger = logging.getLogger(__name__)

    token_setting   = db.query(GlobalSetting).filter(GlobalSetting.key == "meta_system_token").first()
    expires_setting = db.query(GlobalSetting).filter(GlobalSetting.key == "meta_token_expires").first()
    app_id_setting  = db.query(GlobalSetting).filter(GlobalSetting.key == "meta_app_id").first()
    app_sec_setting = db.query(GlobalSetting).filter(GlobalSetting.key == "meta_app_secret").first()

    if not all([token_setting, app_id_setting, app_sec_setting]):
        logger.info("[token] Configurações incompletas — nada a renovar")
        return False

    token      = decrypt(token_setting.value)
    app_id     = decrypt(app_id_setting.value)
    app_secret = decrypt(app_sec_setting.value)
    expires_at = decrypt(expires_setting.value) if expires_setting else None

    if not should_renew(expires_at):
        days = (datetime.fromisoformat(expires_at) - datetime.now()).days if expires_at else "?"
        logger.info(f"[token] Token válido por mais {days} dias — sem renovação necessária")
        return False

    try:
        result = exchange_for_long_lived(token, app_id, app_secret)
        new_token = result["access_token"]
        expires_in = result.get("expires_in", 60 * 24 * 3600)
        new_expires = (datetime.now() + timedelta(seconds=expires_in)).isoformat()

        token_setting.value = encrypt(new_token)
        if expires_setting:
            expires_setting.value = encrypt(new_expires)
        else:
            db.add(GlobalSetting(key="meta_token_expires", value=encrypt(new_expires), is_encrypted=True))

        db.commit()
        logger.info(f"[token] Renovado com sucesso! Válido até {new_expires[:10]}")
        return True
    except Exception as e:
        logger.error(f"[token] Erro na renovação: {e}")
        return False
