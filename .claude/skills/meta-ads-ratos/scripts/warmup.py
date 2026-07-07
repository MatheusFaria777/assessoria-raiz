#!/usr/bin/env python3
"""
Warmup script: faz as chamadas obrigatorias de cada permissao
+ 500 chamadas para desbloquear o Marketing API Access Tier.
"""
import os, sys, time, requests
from pathlib import Path
from dotenv import load_dotenv

# Carrega .env da skill
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

TOKEN = os.getenv("META_ADS_TOKEN", "")
BASE  = "https://graph.facebook.com/v21.0"

if not TOKEN:
    print("[ERRO] META_ADS_TOKEN nao definida no .env")
    sys.exit(1)

session = requests.Session()
session.params = {"access_token": TOKEN}  # type: ignore

ok = 0
fail = 0

def call(endpoint, params=None, label=""):
    global ok, fail
    url = f"{BASE}{endpoint}"
    try:
        r = session.get(url, params=params or {}, timeout=15)
        data = r.json()
        if "error" in data:
            fail += 1
            print(f"  [ERRO] {label or endpoint}: {data['error'].get('message','')}")
            return None
        ok += 1
        return data
    except Exception as e:
        fail += 1
        print(f"  [EXC] {label or endpoint}: {e}")
        return None

print("=" * 55)
print("  Meta Ads Ratos — Warmup de permissoes")
print("=" * 55)

# --- Passo 1: /me (valida token) ---
print("\n[1] Validando token...")
me = call("/me", {"fields": "id,name"}, label="/me")
if not me:
    print("Token invalido. Abortando.")
    sys.exit(1)
print(f"  Logado como: {me.get('name')} (id={me.get('id')})")
USER_ID = me["id"]

# --- Passo 2: Contas de anuncio (ads_read + ads_management) ---
print("\n[2] ads_read / ads_management — listando contas de anuncio...")
accounts_data = call("/me/adaccounts", {"fields": "id,name,account_status", "limit": 50}, label="adaccounts")
account_ids = []
if accounts_data and "data" in accounts_data:
    account_ids = [a["id"] for a in accounts_data["data"]]
    print(f"  Encontradas {len(account_ids)} contas: {', '.join(account_ids[:5])}")
else:
    print("  Nenhuma conta encontrada.")

# --- Passo 3: Pages (pages_read_engagement + pages_show_list) ---
print("\n[3] pages_read_engagement / pages_show_list — listando paginas...")
pages_data = call("/me/accounts", {"fields": "id,name,fan_count", "limit": 25}, label="pages")
page_ids = []
if pages_data and "data" in pages_data:
    page_ids = [p["id"] for p in pages_data["data"]]
    print(f"  Encontradas {len(page_ids)} paginas: {', '.join(page_ids[:5])}")
else:
    print("  Nenhuma pagina encontrada.")

# --- Passo 4: Businesses (business_management) ---
print("\n[4] business_management — listando businesses...")
biz_data = call("/me/businesses", {"fields": "id,name", "limit": 25}, label="businesses")
biz_ids = []
if biz_data and "data" in biz_data:
    biz_ids = [b["id"] for b in biz_data["data"]]
    print(f"  Encontrados {len(biz_ids)} businesses: {', '.join(biz_ids[:5])}")
else:
    print("  Nenhum business encontrado.")

# --- Passo 5: Permissoes do token ---
print("\n[5] Listando permissoes do token...")
call(f"/{USER_ID}/permissions", label="permissions")

# --- Passo 6: Detalhes de contas (mais chamadas ads_read) ---
print("\n[6] Detalhes de cada conta de anuncio...")
for acc_id in account_ids[:10]:
    call(f"/{acc_id}", {"fields": "id,name,currency,timezone_name,account_status"}, label=f"account {acc_id}")

# --- Passo 7: Detalhes de cada pagina ---
print("\n[7] Detalhes de cada pagina...")
for pid in page_ids[:10]:
    call(f"/{pid}", {"fields": "id,name,fan_count,followers_count,engagement"}, label=f"page {pid}")

# --- Passo 8: Campaigns de cada conta ---
print("\n[8] Campanhas de cada conta...")
campaign_ids = []
for acc_id in account_ids[:5]:
    r = call(f"/{acc_id}/campaigns", {"fields": "id,name,status,objective", "limit": 50}, label=f"campaigns {acc_id}")
    if r and "data" in r:
        campaign_ids += [c["id"] for c in r["data"]]

# --- Passo 9: Ad sets ---
print("\n[9] Ad sets das primeiras campanhas...")
adset_ids = []
for cid in campaign_ids[:10]:
    r = call(f"/{cid}/adsets", {"fields": "id,name,status,daily_budget", "limit": 25}, label=f"adsets {cid}")
    if r and "data" in r:
        adset_ids += [a["id"] for a in r["data"]]

# --- Passo 10: Ads ---
print("\n[10] Ads dos primeiros ad sets...")
ad_ids = []
for asid in adset_ids[:10]:
    r = call(f"/{asid}/ads", {"fields": "id,name,status", "limit": 25}, label=f"ads {asid}")
    if r and "data" in r:
        ad_ids += [a["id"] for a in r["data"]]

print(f"\n[STATUS] ok={ok} | fail={fail} | total={ok+fail}")

# --- Passo 11: Loop ate 500 chamadas ---
META = 500
restantes = META - (ok + fail)
print(f"\n[11] Completando ate {META} chamadas ({restantes} restantes)...")

# Endpoints para looping
loop_endpoints = []
for acc_id in account_ids[:3]:
    loop_endpoints += [
        (f"/{acc_id}/campaigns", {"fields": "id,name,status", "limit": 25}),
        (f"/{acc_id}/adsets",    {"fields": "id,name,status,daily_budget", "limit": 25}),
        (f"/{acc_id}/ads",       {"fields": "id,name,status", "limit": 25}),
        (f"/{acc_id}",           {"fields": "id,name,currency,spend_cap,balance"}),
    ]
for cid in campaign_ids[:5]:
    loop_endpoints.append((f"/{cid}", {"fields": "id,name,status,objective,daily_budget"}))
for pid in page_ids[:5]:
    loop_endpoints.append((f"/{pid}", {"fields": "id,name,fan_count"}))

# Fallback se nao tiver endpoints suficientes
if not loop_endpoints:
    loop_endpoints = [
        ("/me", {"fields": "id,name"}),
        ("/me/adaccounts", {"fields": "id,name", "limit": 10}),
        ("/me/accounts",   {"fields": "id,name", "limit": 10}),
        ("/me/businesses", {"fields": "id,name", "limit": 10}),
    ]

i = 0
batch_size = 50
while (ok + fail) < META:
    ep, params = loop_endpoints[i % len(loop_endpoints)]
    call(ep, params, label=f"loop-{ok+fail+1}")
    i += 1
    if (ok + fail) % batch_size == 0:
        total = ok + fail
        print(f"  {total}/{META} chamadas (ok={ok}, fail={fail}) — aguardando 1s...")
        time.sleep(1)

print("\n" + "=" * 55)
print(f"  CONCLUIDO: {ok} ok | {fail} falhas | {ok+fail} total")
rate = (ok / (ok + fail) * 100) if (ok + fail) > 0 else 0
print(f"  Taxa de sucesso: {rate:.1f}% (minimo exigido: 85%)")
if rate >= 85:
    print("  Pode solicitar o token definitivo no dashboard da Meta.")
else:
    print("  Taxa abaixo de 85%. Verifique os erros acima.")
print("=" * 55)
