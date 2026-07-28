"""Consulta a submissao do formulario GMN (/gmb?c=slug) de um cliente no banco do Sistema Raiz.

Uso: python consultar_submissao.py <slug>
Roda com o venv do Sistema-raiz/backend, que ja tem as deps (sqlalchemy, pydantic-settings).
"""
import json
import os
import sys

BACKEND_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "Sistema-raiz", "backend")
)
sys.path.insert(0, BACKEND_DIR)
os.chdir(BACKEND_DIR)

from database import SessionLocal  # noqa: E402
# Importa todos os models pra registro do SQLAlchemy resolver os relationships do Client
from models import client as _client, campaign_group, report, uploader, user, settings as _settings, feedback, gmb_submission  # noqa: E402,F401
from models.client import Client  # noqa: E402
from models.gmb_submission import GmbSubmission  # noqa: E402


def main(slug: str) -> None:
    db = SessionLocal()
    try:
        client = db.query(Client).filter(Client.feedback_slug == slug).first()
        if not client:
            print(json.dumps({"erro": f"cliente com slug '{slug}' nao encontrado"}, ensure_ascii=False))
            return

        submission = (
            db.query(GmbSubmission)
            .filter(GmbSubmission.client_id == client.id)
            .order_by(GmbSubmission.submitted_at.desc())
            .first()
        )
        if not submission:
            print(json.dumps({
                "cliente": client.name,
                "formulario_preenchido": False,
            }, ensure_ascii=False))
            return

        dados = json.loads(submission.form_data) if submission.form_data else {}
        print(json.dumps({
            "cliente": client.name,
            "formulario_preenchido": True,
            "respondente": submission.respondent_name,
            "pasta_drive": submission.drive_folder_url,
            "enviado_em": submission.submitted_at.isoformat() if submission.submitted_at else None,
            "dados": dados,
        }, ensure_ascii=False, indent=2))
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"erro": "uso: consultar_submissao.py <slug>"}, ensure_ascii=False))
        sys.exit(1)
    main(sys.argv[1])
