"""Upload de arquivos e dados pro Google Drive — Google Meu Negócio."""
import json
import os
from datetime import datetime

from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaInMemoryUpload

GMN_FOLDER_ID = "1rFPgsUkVQ98zoW-yrD75wE9rze2WLWZz"

SCOPES = [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/spreadsheets",
]

CREDS_FILE = os.path.join(os.path.dirname(__file__), "..", "sheets_credentials.json")


def _get_drive_service():
    env_creds = os.environ.get("SHEETS_CREDENTIALS_JSON")
    if env_creds:
        info = json.loads(env_creds)
        creds = Credentials.from_service_account_info(info, scopes=SCOPES)
    else:
        creds = Credentials.from_service_account_file(CREDS_FILE, scopes=SCOPES)
    return build("drive", "v3", credentials=creds)


def _get_or_create_folder(service, name: str, parent_id: str) -> str:
    """Retorna ID de pasta existente ou cria nova."""
    query = (
        f"name = '{name}' and mimeType = 'application/vnd.google-apps.folder' "
        f"and '{parent_id}' in parents and trashed = false"
    )
    result = service.files().list(q=query, fields="files(id, name)").execute()
    files = result.get("files", [])
    if files:
        return files[0]["id"]

    folder = service.files().create(
        body={"name": name, "mimeType": "application/vnd.google-apps.folder", "parents": [parent_id]},
        fields="id",
    ).execute()
    return folder["id"]


def upload_gmn_submission(client_name: str, form_data: dict, logo: bytes, logo_name: str,
                           fotos: list[tuple[bytes, str]]) -> str:
    """
    Cria pasta do cliente em Google Meu Negócio, faz upload de arquivos e resumo.
    Retorna URL da pasta criada.
    """
    service = _get_drive_service()

    # Cria subpasta do cliente
    client_folder_id = _get_or_create_folder(service, client_name, GMN_FOLDER_ID)

    # Upload do logo
    if logo and logo_name:
        ext = logo_name.rsplit(".", 1)[-1].lower()
        mime = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
                "webp": "image/webp", "gif": "image/gif"}.get(ext, "application/octet-stream")
        service.files().create(
            body={"name": f"logo.{ext}", "parents": [client_folder_id]},
            media_body=MediaInMemoryUpload(logo, mimetype=mime),
            fields="id",
        ).execute()

    # Upload das fotos
    for i, (foto_bytes, foto_name) in enumerate(fotos, 1):
        ext = foto_name.rsplit(".", 1)[-1].lower() if "." in foto_name else "jpg"
        mime = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
                "webp": "image/webp"}.get(ext, "image/jpeg")
        service.files().create(
            body={"name": f"foto-{i:02d}.{ext}", "parents": [client_folder_id]},
            media_body=MediaInMemoryUpload(foto_bytes, mimetype=mime),
            fields="id",
        ).execute()

    # Cria arquivo de texto com todas as respostas
    resumo = _build_resumo(client_name, form_data)
    service.files().create(
        body={"name": "dados-gmn.txt", "parents": [client_folder_id]},
        media_body=MediaInMemoryUpload(resumo.encode("utf-8"), mimetype="text/plain"),
        fields="id",
    ).execute()

    folder_url = f"https://drive.google.com/drive/folders/{client_folder_id}"
    return folder_url


def _build_resumo(client_name: str, data: dict) -> str:
    now = datetime.now().strftime("%d/%m/%Y %H:%M")
    lines = [
        f"GOOGLE MEU NEGÓCIO — {client_name.upper()}",
        f"Preenchido em: {now}",
        "=" * 60,
        "",
        "IDENTIFICAÇÃO",
        f"Nome da empresa: {data.get('nome_empresa', '')}",
        f"Responsável: {data.get('responsavel', '')}",
        f"Telefone comercial: {data.get('telefone', '')}",
        f"Endereço: {data.get('endereco', '')}",
        f"Áreas de cobertura: {data.get('areas_cobertura', '')}",
        f"Empreendedor(a): {data.get('empreendedor', '')}",
        f"Data de abertura: {data.get('data_abertura', '')}",
        "",
        "PRESENÇA DIGITAL",
        f"Instagram: {data.get('instagram', '')}",
        f"Site: {data.get('site', '')}",
        f"Facebook: {data.get('facebook', '')}",
        "",
        "FUNCIONAMENTO",
        f"Dias: {', '.join(data.get('dias_funcionamento', []))}",
        f"Horário: {data.get('horario', '')}",
        f"Horário feriados: {data.get('horario_feriados', '')}",
        "",
        "ESTRUTURA",
        f"Acessibilidade: {data.get('acessibilidade', '')}",
        f"Estacionamento: {data.get('estacionamento', '')}",
        f"Pagamentos: {', '.join(data.get('pagamentos', []))}",
        "",
        "CONTEÚDO",
        f"Descrição:\n{data.get('descricao', '')}",
        "",
        f"Serviços/produtos:\n{data.get('servicos', '')}",
        "",
        "PERGUNTAS FREQUENTES:",
        data.get('faq', ''),
    ]
    return "\n".join(lines)
