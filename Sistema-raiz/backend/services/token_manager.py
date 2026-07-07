"""
Gerencia tokens de acesso ao Meta Ads.
Prioridade: System User Token (global, sem expiração) > token do cliente.
"""
from config import decrypt


def get_meta_token(client, db) -> str:
    """
    Retorna o melhor token disponível para o cliente.
    Tenta: 1) System User Token global  2) Token do cliente
    """
    from models.settings import GlobalSetting

    # System User Token — sem expiração, funciona para todos os clientes
    sys_setting = db.query(GlobalSetting).filter(GlobalSetting.key == "meta_system_token").first()
    if sys_setting and sys_setting.value:
        token = decrypt(sys_setting.value)
        if token:
            return token

    # Fallback: token individual do cliente
    return decrypt(client.meta_access_token or "")


def get_anthropic_key(db) -> str:
    """Retorna a chave da API Claude configurada nas configurações globais."""
    import os
    from models.settings import GlobalSetting

    setting = db.query(GlobalSetting).filter(GlobalSetting.key == "anthropic_api_key").first()
    if setting and setting.value:
        key = decrypt(setting.value)
        if key:
            return key
    return os.getenv("ANTHROPIC_API_KEY", "")


def get_google_credentials(db) -> dict | None:
    """Retorna as credenciais do Google Ads configuradas nas configurações globais."""
    import json
    from models.settings import GlobalSetting

    setting = db.query(GlobalSetting).filter(GlobalSetting.key == "google_ads_credentials").first()
    if not setting or not setting.value:
        return None
    raw = decrypt(setting.value)
    if not raw:
        return None
    try:
        return json.loads(raw)
    except Exception:
        return None
