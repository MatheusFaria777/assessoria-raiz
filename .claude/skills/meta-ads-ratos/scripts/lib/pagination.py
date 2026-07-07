"""
Meta Ads Ratos — Pagination helper
Fetches raw pagination URLs from the Meta Graph API.
"""

import json
import os
import sys

import requests


def fetch_url(url: str) -> dict:
    """
    Fetch a Graph API pagination URL and return the JSON response.
    Appends the access token if not already in the URL.
    """
    token = os.environ.get("META_ADS_TOKEN")
    if not token:
        print("Erro: META_ADS_TOKEN não definida.", file=sys.stderr)
        sys.exit(1)

    if "access_token" not in url:
        sep = "&" if "?" in url else "?"
        url = f"{url}{sep}access_token={token}"

    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.HTTPError as e:
        print(f"Erro HTTP ao buscar URL: {e}\nResposta: {response.text[:500]}", file=sys.stderr)
        sys.exit(1)
    except requests.RequestException as e:
        print(f"Erro de rede ao buscar URL: {e}", file=sys.stderr)
        sys.exit(1)
