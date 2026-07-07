from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from database import create_tables
from routers import clients, campaign_groups, reports, sheets, uploader, settings as settings_router, dashboard, auth as auth_router, feedback as feedback_router, gmb_form as gmb_router, cadencia as cadencia_router
from routers.settings import google_oauth_router
from services.auth import get_current_user
from services.scheduler import create_scheduler
import os

scheduler = create_scheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    _run_migrations()
    _seed_users()
    _reset_stuck_processing()
    scheduler.start()
    yield
    scheduler.shutdown()


def _run_migrations():
    """Adiciona colunas novas em tabelas existentes (idempotente)."""
    from database import engine
    from sqlalchemy import text
    migrations = [
        "ALTER TABLE adsets ADD COLUMN IF NOT EXISTS lead_gen_form_id VARCHAR",
    ]
    with engine.connect() as conn:
        for sql in migrations:
            try:
                conn.execute(text(sql))
                conn.commit()
            except Exception as e:
                print(f"[migration] aviso: {e}", flush=True)


def _reset_stuck_processing():
    """Reseta itens presos em 'processing' de deploys/crashes anteriores."""
    from database import SessionLocal
    from models.uploader import UploadQueueItem
    db = SessionLocal()
    try:
        stuck = db.query(UploadQueueItem).filter(UploadQueueItem.status == "processing").all()
        for item in stuck:
            item.status = "pending"
            item.error_message = "Reiniciado — servidor foi reiniciado durante o processamento."
            item.attempts = max(0, item.attempts - 1)
        if stuck:
            db.commit()
    finally:
        db.close()


def _seed_users():
    """Cria usuários iniciais se não existirem."""
    from database import SessionLocal
    from models.user import User
    from services.auth import hash_password
    db = SessionLocal()
    try:
        if not db.query(User).first():
            db.add(User(name="Matheus", email="matheus@assessoriaraiz.com.br",
                        password_hash=hash_password("raiz2026"), role="admin"))
            db.add(User(name="Lucas", email="lucas@assessoriaraiz.com.br",
                        password_hash=hash_password("raiz2026"), role="operational"))
            db.commit()
    finally:
        db.close()


app = FastAPI(title="Sistema Raiz", version="3.0.0", lifespan=lifespan, redirect_slashes=False)

_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:8001").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if os.getenv("ENVIRONMENT") == "production" else _origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "version": "3.0.0"}


# Rotas públicas
app.include_router(auth_router.router, prefix="/api/auth", tags=["auth"])
app.include_router(feedback_router.router, prefix="/api/feedback", tags=["feedback"])
app.include_router(gmb_router.router,      prefix="/api/gmb",      tags=["gmb"])
app.include_router(google_oauth_router, prefix="/api/settings/google-oauth", tags=["google-oauth"])

# Rotas protegidas por login
_auth = [Depends(get_current_user)]
app.include_router(clients.router,         prefix="/api/clients",         tags=["clients"],         dependencies=_auth)
app.include_router(campaign_groups.router, prefix="/api/campaign-groups", tags=["campaign-groups"], dependencies=_auth)
app.include_router(reports.router,         prefix="/api/reports",         tags=["reports"],          dependencies=_auth)
app.include_router(sheets.router,          prefix="/api/sheets",          tags=["sheets"],           dependencies=_auth)
app.include_router(uploader.router,        prefix="/api/uploader",        tags=["uploader"],         dependencies=_auth)
app.include_router(settings_router.router, prefix="/api/settings",        tags=["settings"],         dependencies=_auth)
app.include_router(dashboard.router,       prefix="/api/dashboard",       tags=["dashboard"],        dependencies=_auth)
app.include_router(cadencia_router.router, prefix="/api/cadencia",        tags=["cadencia"],         dependencies=_auth)

# Serve frontend em produção
frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    def _html(name: str) -> str:
        path = os.path.join(frontend_dist, name)
        return path if os.path.exists(path) else os.path.join(frontend_dist, "index.html")

    @app.get("/gmb")
    def serve_gmb():
        return FileResponse(_html("gmb.html"))

    @app.get("/nps")
    def serve_nps():
        return FileResponse(_html("feedback.html"))

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        return FileResponse(_html("index.html"))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
