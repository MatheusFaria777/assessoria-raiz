from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from config import settings

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    from models import client, campaign_group, report, uploader, user, settings as settings_model, feedback, gmb_submission
    _apply_migrations()
    Base.metadata.create_all(bind=engine)


def _apply_migrations():
    """Adapta tabelas existentes ao schema atual sem usar Alembic."""
    from sqlalchemy import text, inspect as sa_inspect
    inspector = sa_inspect(engine)
    tables = inspector.get_table_names()

    with engine.connect() as conn:
        # Adiciona feedback_slug ao clients se não existir
        if "clients" in tables:
            clients_cols = [c["name"] for c in inspector.get_columns("clients")]
            if "feedback_slug" not in clients_cols:
                conn.execute(text("ALTER TABLE clients ADD COLUMN feedback_slug VARCHAR"))
                conn.commit()
            if "cadencia_ativa" not in clients_cols:
                conn.execute(text("ALTER TABLE clients ADD COLUMN cadencia_ativa BOOLEAN DEFAULT TRUE"))
                conn.commit()
            if "cadencia_contexto" not in clients_cols:
                conn.execute(text("ALTER TABLE clients ADD COLUMN cadencia_contexto TEXT"))
                conn.commit()

        # Recria client_feedback se ainda tiver o schema antigo (sem survey_id / answers)
        if "client_feedback" in tables:
            feedback_cols = [c["name"] for c in inspector.get_columns("client_feedback")]
            if "survey_id" not in feedback_cols or "answers" not in feedback_cols:
                conn.execute(text("DROP TABLE client_feedback"))
                conn.commit()
