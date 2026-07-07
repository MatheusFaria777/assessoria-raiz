"""
Migra todos os dados do SQLite local para o Supabase (PostgreSQL).
Rodar uma vez: python migrate_to_supabase.py
"""
import os
os.environ["DATABASE_URL"] = "sqlite:///./raiz.db"

from sqlalchemy import create_engine, text, inspect

SUPABASE_URL = "postgresql://postgres.scsabrfskmerutxoszsz:XwqRjHq2hsYOVSYc@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"

sqlite_engine = create_engine("sqlite:///./raiz.db", connect_args={"check_same_thread": False})
pg_engine     = create_engine(SUPABASE_URL)

# Cria todas as tabelas no Supabase
from database import Base
from models import client, campaign_group, report, uploader, user, settings as settings_model, feedback
Base.metadata.create_all(bind=pg_engine)
print("Tabelas criadas no Supabase.")

# Ordem respeitando foreign keys
TABLES = [
    "users",
    "global_settings",
    "clients",
    "campaign_groups",
    "client_campaign_groups",
    "adsets",
    "report_schedules",
    "reports",
    "sync_logs",
    "upload_queue",
    "surveys",
    "client_feedback",
]

sqlite_conn = sqlite_engine.connect()
pg_conn     = pg_engine.connect()

# Desabilita FK constraints temporariamente para limpar tudo
print("Limpando Supabase...")
pg_conn.execute(text("SET session_replication_role = 'replica'"))
for table in reversed(TABLES):
    try:
        pg_conn.execute(text(f"DELETE FROM {table}"))
    except Exception as e:
        print(f"  AVISO ao limpar {table}: {e}")
pg_conn.execute(text("SET session_replication_role = 'origin'"))
pg_conn.commit()
print("Limpeza concluída.")

sqlite_inspector = inspect(sqlite_engine)
pg_inspector     = inspect(pg_engine)

for table in TABLES:
    if table not in sqlite_inspector.get_table_names():
        print(f"  SKIP {table} (não existe no SQLite)")
        continue

    rows = sqlite_conn.execute(text(f"SELECT * FROM {table}")).mappings().all()
    if not rows:
        print(f"  {table}: vazio")
        continue

    # Detecta colunas boolean no PostgreSQL
    bool_cols = {
        c["name"] for c in pg_inspector.get_columns(table)
        if str(c["type"]).upper() in ("BOOLEAN", "BOOL")
    }

    # Monta upsert: INSERT ... ON CONFLICT (id) DO UPDATE
    sample = dict(rows[0])
    cols = list(sample.keys())
    col_str  = ", ".join(cols)
    val_str  = ", ".join([f":{c}" for c in cols])

    has_id = "id" in cols
    if has_id:
        update_str = ", ".join([f"{c} = EXCLUDED.{c}" for c in cols if c != "id"])
        sql = f"INSERT INTO {table} ({col_str}) VALUES ({val_str}) ON CONFLICT (id) DO UPDATE SET {update_str}"
    else:
        sql = f"INSERT INTO {table} ({col_str}) VALUES ({val_str}) ON CONFLICT DO NOTHING"

    pg_conn.execute(text("SET session_replication_role = 'replica'"))
    seen_slugs = {}
    for row in rows:
        row_dict = dict(row)
        for col in bool_cols:
            if col in row_dict and row_dict[col] is not None:
                row_dict[col] = bool(row_dict[col])
        # Desambigua feedback_slug duplicado
        if "feedback_slug" in row_dict and row_dict["feedback_slug"]:
            slug = row_dict["feedback_slug"]
            if slug in seen_slugs:
                seen_slugs[slug] += 1
                row_dict["feedback_slug"] = f"{slug}-{seen_slugs[slug]}"
            else:
                seen_slugs[slug] = 0
        pg_conn.execute(text(sql), row_dict)

    pg_conn.execute(text("SET session_replication_role = 'origin'"))
    pg_conn.commit()

    # Reseta sequence
    if has_id:
        max_id = max((r["id"] for r in rows if r.get("id")), default=0)
        try:
            pg_conn.execute(text(f"SELECT setval('{table}_id_seq', {max_id})"))
            pg_conn.commit()
        except Exception:
            pg_conn.rollback()

    print(f"  {table}: {len(rows)} registros migrados")

sqlite_conn.close()
pg_conn.close()
print("\nMigração concluída!")
