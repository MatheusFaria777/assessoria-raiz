from pydantic_settings import BaseSettings
from cryptography.fernet import Fernet
import os


class Settings(BaseSettings):
    secret_key: str = "dev-secret-change-in-production"
    fernet_key: str = ""
    database_url: str = "sqlite:///./raiz.db"
    environment: str = "development"
    anthropic_api_key: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()


def get_fernet() -> Fernet:
    key = settings.fernet_key
    if not key:
        # gera chave temporária em dev (não persiste entre restarts)
        key = Fernet.generate_key().decode()
    return Fernet(key.encode() if isinstance(key, str) else key)


def encrypt(value: str) -> str:
    if not value:
        return ""
    return get_fernet().encrypt(value.encode()).decode()


def decrypt(value: str) -> str:
    if not value:
        return ""
    try:
        return get_fernet().decrypt(value.encode()).decode()
    except Exception:
        return value  # retorna raw se não conseguir descriptografar (migração)
