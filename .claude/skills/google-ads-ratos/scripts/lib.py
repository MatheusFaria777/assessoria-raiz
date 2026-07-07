#!/usr/bin/env python3
"""
Google Ads Ratos - Shared library
Imported by read.py, insights.py, create.py, update.py, delete.py
"""

import json
import os
import sys
import time
import functools
from pathlib import Path


# ---------------------------------------------------------------------------
# .env loader
# ---------------------------------------------------------------------------

def _load_env():
    script_dir = Path(__file__).resolve().parent
    # Check most specific first: skill dir, then global, then project root
    candidates = [
        script_dir / "../.env",              # skill dir (google-ads-ratos/.env)
        Path.home() / ".claude/skills/google-ads-ratos/.env",
        script_dir / "../../../../.env",     # project root (ccos-ratos/.env)
        script_dir / "../../../.env",
    ]
    for candidate in candidates:
        env_path = candidate.resolve()
        if env_path.exists():
            _parse_env(env_path)
            # Keep going to pick up any missing vars from other files



def _parse_env(path):
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" not in line:
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = value


_load_env()


def _load_env_file():
    """Public alias used by setup.py — reloads .env from skill dir."""
    _load_env()


def mask_token(token):
    """Return masked token for safe display: first 6 chars + ..."""
    if not token:
        return ""
    return token[:6] + "..." if len(token) > 6 else token


# ---------------------------------------------------------------------------
# Google Ads client
# ---------------------------------------------------------------------------

def init_client():
    from google.ads.googleads.client import GoogleAdsClient

    config = {
        "developer_token": os.environ["GOOGLE_ADS_DEVELOPER_TOKEN"],
        "client_id": os.environ["GOOGLE_ADS_CLIENT_ID"],
        "client_secret": os.environ["GOOGLE_ADS_CLIENT_SECRET"],
        "refresh_token": os.environ["GOOGLE_ADS_REFRESH_TOKEN"],
        "login_customer_id": os.environ.get("GOOGLE_ADS_LOGIN_CUSTOMER_ID", ""),
        "use_proto_plus": True,
    }
    return GoogleAdsClient.load_from_dict(config)


# ---------------------------------------------------------------------------
# Customer ID
# ---------------------------------------------------------------------------

def resolve_customer_id(customer_id=None):
    if customer_id:
        return str(customer_id).replace("-", "")
    env_id = os.environ.get("GOOGLE_ADS_CUSTOMER_ID", "")
    if env_id:
        return env_id.replace("-", "")
    print_error("customer_id obrigatorio. Use --customer-id ou defina GOOGLE_ADS_CUSTOMER_ID.")
    sys.exit(1)


# ---------------------------------------------------------------------------
# Query runner
# ---------------------------------------------------------------------------

def run_query(customer_id, query):
    from google.protobuf.json_format import MessageToDict

    client = init_client()
    service = client.get_service("GoogleAdsService")
    customer_id = str(customer_id).replace("-", "")

    stream = service.search_stream(customer_id=customer_id, query=query)
    results = []
    for batch in stream:
        for row in batch.results:
            d = MessageToDict(
                row._pb,
                preserving_proto_field_name=True,
            )
            results.append(d)
    return results


# ---------------------------------------------------------------------------
# Output helpers
# ---------------------------------------------------------------------------

def _convert_micros(obj):
    if isinstance(obj, dict):
        new = {}
        for k, v in obj.items():
            if k.endswith("_micros") and isinstance(v, (int, float)):
                new[k] = v
                new[k.replace("_micros", "_reais")] = round(v / 1_000_000, 2)
            else:
                new[k] = _convert_micros(v)
        return new
    elif isinstance(obj, list):
        return [_convert_micros(i) for i in obj]
    return obj


def print_json(data):
    data = _convert_micros(data)
    print(json.dumps(data, ensure_ascii=False, indent=2))


def print_error(msg):
    print(f"ERRO: {msg}", file=sys.stderr)


# ---------------------------------------------------------------------------
# Error handler decorator
# ---------------------------------------------------------------------------

def handle_google_error_decorator(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except SystemExit:
            raise
        except Exception as e:
            try:
                from google.ads.googleads.errors import GoogleAdsException
                if isinstance(e, GoogleAdsException):
                    for error in e.failure.errors:
                        print_error(f"[{error.error_code}] {error.message}")
                    sys.exit(1)
            except ImportError:
                pass
            print_error(str(e))
            sys.exit(1)
    return wrapper


# ---------------------------------------------------------------------------
# argparse helpers
# ---------------------------------------------------------------------------

def add_customer_arg(parser):
    parser.add_argument("--customer-id", help="Customer ID (sem hifens)")


def add_date_args(parser):
    parser.add_argument(
        "--date-range",
        default="LAST_30_DAYS",
        help="Periodo nomeado: LAST_7_DAYS, LAST_30_DAYS, THIS_MONTH, LAST_MONTH",
    )
    parser.add_argument("--since", help="Data inicio (YYYY-MM-DD)")
    parser.add_argument("--until", help="Data fim (YYYY-MM-DD)")


def add_limit_arg(parser, default=None):
    parser.add_argument("--limit", type=int, default=default, help="Limite de resultados")


def add_campaign_filter(parser):
    parser.add_argument("--campaign-id", help="Filtrar por campaign ID")


def build_date_clause(args):
    since = getattr(args, "since", None)
    until = getattr(args, "until", None)
    if since and until:
        return f"segments.date BETWEEN '{since}' AND '{until}'"
    date_range = getattr(args, "date_range", None) or "LAST_30_DAYS"
    return f"segments.date DURING {date_range}"


# ---------------------------------------------------------------------------
# Rate limit helper
# ---------------------------------------------------------------------------

def safe_delay(seconds=60):
    print(f"Rate limit atingido. Aguardando {seconds}s...", file=sys.stderr)
    time.sleep(seconds)
