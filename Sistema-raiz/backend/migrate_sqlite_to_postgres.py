"""
Migra dados do SQLite local para o PostgreSQL do Railway.
Uso: DATABASE_URL=postgresql://... python migrate_sqlite_to_postgres.py
"""
import os, sys, sqlite3
from sqlalchemy import create_engine, text, inspect, Boolean

SQLITE_PATH = os.path.join(os.path.dirname(__file__), "raiz.db")
PG_URL = os.environ.get("DATABASE_URL", "")

if not PG_URL:
    print("ERRO: defina DATABASE_URL=postgresql://... antes de rodar")
    sys.exit(1)

if not os.path.exists(SQLITE_PATH):
    print(f"ERRO: {SQLITE_PATH} não encontrado")
    sys.exit(1)

print(f"SQLite: {SQLITE_PATH}")
print(f"PostgreSQL: {PG_URL[:40]}...")

sqlite = sqlite3.connect(SQLITE_PATH)
sqlite.row_factory = sqlite3.Row
pg = create_engine(PG_URL)

os.environ["DATABASE_URL"] = PG_URL
sys.path.insert(0, os.path.dirname(__file__))

from database import Base, engine as pg_engine_models
from models import client, campaign_group, report, uploader, user
from models import settings as settings_model, feedback

print("\nCriando tabelas no PostgreSQL...")
Base.metadata.create_all(bind=pg_engine_models)
print("Tabelas criadas.")

# Detecta colunas booleanas (SQLite guarda como 0/1)
_inspector = inspect(pg_engine_models)
_bool_cols: dict[str, set] = {}
for _t in _inspector.get_table_names():
    _bool_cols[_t] = {c["name"] for c in _inspector.get_columns(_t) if isinstance(c["type"], Boolean)}

TABLES = [
    "users",
    "global_settings",
    "campaign_groups",
    "clients",
    "client_campaign_groups",
    "adsets",
    "reports",
    "report_schedules",
    "upload_queue",
    "surveys",
    "client_feedback",
    "sync_logs",
]

# Tabelas com unique constraint conhecida — deduplicar mantendo o ID mais alto
DEDUP_BY = {
    "clients": "feedback_slug",
}


def load_rows(table: str, cols: list) -> list[dict]:
    """Carrega linhas do SQLite, deduplica se necessário."""
    cur = sqlite.execute(f"SELECT * FROM {table}")
    raw = cur.fetchall()
    rows = [dict(zip(cols, r)) for r in raw]

    dedup_col = DEDUP_BY.get(table)
    if dedup_col and dedup_col in cols:
        seen: dict = {}
        for r in rows:
            key = r.get(dedup_col)
            if key is None or key not in seen or r.get("id", 0) > seen[key].get("id", 0):
                seen[key] = r
        removed = len(rows) - len(seen)
        if removed:
            print(f"  {table}: removendo {removed} duplicata(s) por {dedup_col}")
        rows = list(seen.values())

    return rows


with pg.connect() as pg_conn:
    # Limpa tudo de uma vez com CASCADE para lidar com FKs entre tabelas
    all_tables = ", ".join(TABLES)
    pg_conn.execute(text(f"TRUNCATE {all_tables} RESTART IDENTITY CASCADE"))
    pg_conn.commit()
    print("Tabelas limpas.")

    for table in TABLES:
        cur = sqlite.execute(f"SELECT * FROM {table}")
        cols = [d[0] for d in cur.description]
        rows = load_rows(table, cols)

        if not rows:
            print(f"  {table}: vazia, pulando")
            continue

        placeholders = ", ".join([f":{c}" for c in cols])
        col_list = ", ".join(cols)
        bool_cols = _bool_cols.get(table, set())

        inserted = 0
        for data in rows:
            for bc in bool_cols:
                if bc in data and data[bc] is not None:
                    data[bc] = bool(data[bc])
            try:
                # Savepoint por linha: erro em uma linha não aborta a tabela inteira
                pg_conn.execute(text("SAVEPOINT row_save"))
                pg_conn.execute(
                    text(f"INSERT INTO {table} ({col_list}) VALUES ({placeholders})"),
                    data,
                )
                pg_conn.execute(text("RELEASE SAVEPOINT row_save"))
                inserted += 1
            except Exception as e:
                pg_conn.execute(text("ROLLBACK TO SAVEPOINT row_save"))
                err_str = str(e).encode("ascii", "replace").decode("ascii")
                print(f"  WARN {table} row {data.get('id','?')}: {err_str[:200]}")

        # Reseta sequência de IDs para o valor máximo
        if "id" in cols:
            try:
                pg_conn.execute(text(
                    f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), "
                    f"COALESCE(MAX(id), 1)) FROM {table}"
                ))
            except Exception:
                pass

        pg_conn.commit()
        print(f"  {table}: {inserted}/{len(rows)} registros migrados")

sqlite.close()
print("\nMigração concluída!")
