"""
Meta Ads Ratos — Shared library
Utilities used by all scripts (init_api, resolve_account, print_json, etc.)
"""

import json
import os
import sys
import time
from pathlib import Path


# ---------------------------------------------------------------------------
# .env loader (runs at import time)
# ---------------------------------------------------------------------------

def _load_env():
    # lib/__init__.py → scripts/lib/ → scripts/ → meta-ads-ratos/
    env_path = Path(__file__).parent.parent.parent / ".env"
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                v = v.strip().strip('"').strip("'")
                if v and not os.environ.get(k.strip()):
                    os.environ[k.strip()] = v


_load_env()


# ---------------------------------------------------------------------------
# API
# ---------------------------------------------------------------------------

def init_api():
    """Initialize Facebook Ads API. Returns the access token."""
    from facebook_business.api import FacebookAdsApi

    token = os.environ.get("META_ADS_TOKEN")
    if not token:
        print(
            "Erro: META_ADS_TOKEN não definida. Configure em "
            ".claude/skills/meta-ads-ratos/.env",
            file=sys.stderr,
        )
        sys.exit(1)
    FacebookAdsApi.init(access_token=token)
    return token


def resolve_account(account_id: str) -> str:
    """Ensure account ID has 'act_' prefix."""
    if account_id and not account_id.startswith("act_"):
        return f"act_{account_id}"
    return account_id


# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------

def _sdk_to_dict(obj):
    """Recursively convert Facebook SDK objects to plain dicts."""
    if hasattr(obj, "export_all_data"):
        return obj.export_all_data()
    if hasattr(obj, "_data") and isinstance(obj._data, dict):
        return {k: _sdk_to_dict(v) for k, v in obj._data.items()}
    if isinstance(obj, list):
        return [_sdk_to_dict(item) for item in obj]
    if isinstance(obj, dict):
        return {k: _sdk_to_dict(v) for k, v in obj.items()}
    return obj


def print_json(data):
    """Pretty-print an SDK object or plain dict/list as JSON."""
    data = _sdk_to_dict(data)
    print(json.dumps(data, indent=2, ensure_ascii=False, default=str))


def print_error(msg: str):
    """Print an error message to stderr."""
    print(f"Erro: {msg}", file=sys.stderr)


def handle_fb_error(func):
    """
    Decorator that catches FacebookRequestError and exits cleanly.

    Usage:
        @handle_fb_error
        def cmd_something(args): ...
    """
    import functools

    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            # Try to extract a clean Facebook API error message
            msg = str(e)
            try:
                from facebook_business.exceptions import FacebookRequestError
                if isinstance(e, FacebookRequestError):
                    body = e.api_error_message() or msg
                    print(f"Erro Meta Ads API: {body}", file=sys.stderr)
                    sys.exit(1)
            except ImportError:
                pass
            print(f"Erro: {msg}", file=sys.stderr)
            sys.exit(1)

    return wrapper


# ---------------------------------------------------------------------------
# argparse helpers
# ---------------------------------------------------------------------------

def add_account_arg(parser):
    parser.add_argument(
        "--account", "-a",
        required=True,
        help="ID da conta de anúncio (act_XXX)",
    )


def add_fields_arg(parser, default="id,name"):
    parser.add_argument(
        "--fields",
        default=default,
        help="Campos a retornar (separados por vírgula)",
    )


def add_pagination_args(parser):
    parser.add_argument("--limit", type=int, default=100, help="Resultados por página (máx 100)")
    parser.add_argument("--offset", type=int, default=0, help="Deslocamento inicial")
    parser.add_argument("--after", default=None, help="Cursor 'after' para paginação")
    parser.add_argument("--before", default=None, help="Cursor 'before' para paginação")


def add_status_filter_arg(parser):
    parser.add_argument(
        "--status",
        default=None,
        help=(
            "Filtrar por status: ACTIVE, PAUSED, DELETED, ARCHIVED, "
            "ALL (pode ser lista separada por vírgula)"
        ),
    )


# ---------------------------------------------------------------------------
# Parsers
# ---------------------------------------------------------------------------

def parse_fields(fields_str: str) -> list:
    """Parse a comma-separated fields string into a list."""
    if not fields_str:
        return []
    return [f.strip() for f in fields_str.split(",") if f.strip()]


def parse_status_filter(status_str: str):
    """Return a list of statuses or None if not specified."""
    if not status_str:
        return None
    upper = status_str.upper()
    if upper == "ALL":
        return ["ACTIVE", "PAUSED", "DELETED", "ARCHIVED"]
    return [s.strip().upper() for s in status_str.split(",") if s.strip()]


def parse_json_arg(value: str, name: str = "json"):
    """Parse a JSON string argument. Exit with error if invalid."""
    if not value:
        return None
    try:
        return json.loads(value)
    except json.JSONDecodeError as e:
        print(f"Erro ao parsear --{name}: {e}\nValor recebido: {value!r}", file=sys.stderr)
        sys.exit(1)


# ---------------------------------------------------------------------------
# Rate-limit helper
# ---------------------------------------------------------------------------

def safe_delay(seconds: float = 1.0):
    """Sleep between write operations to respect Meta rate limits."""
    time.sleep(seconds)
