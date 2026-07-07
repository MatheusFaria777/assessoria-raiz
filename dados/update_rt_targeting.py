"""
Atualiza targeting dos ad sets da RT Motors:
1. Remove SC (key 459) do geo — fica só RS
2. Variados: adiciona interesses automotivos (OR com Engaged Shoppers)
"""
import os, sys, json
from pathlib import Path

# Carrega env da skill
env_path = Path("D:/DOWNLOAD/Claude Raiz/ccos-ratos/.claude/skills/meta-ads-ratos/.env")
for line in env_path.read_text().splitlines():
    if "=" in line and not line.strip().startswith("#"):
        k, _, v = line.partition("=")
        os.environ[k.strip()] = v.strip().strip('"')

from facebook_business.api import FacebookAdsApi
from facebook_business.adobjects.adset import AdSet

FacebookAdsApi.init(access_token=os.environ["META_ADS_TOKEN"])

# Geo excluidos (todos os estados BR exceto RS e SC — SC vamos remover do include)
excluded_regions = [
    {"key": "438", "country": "BR"}, {"key": "439", "country": "BR"},
    {"key": "440", "country": "BR"}, {"key": "441", "country": "BR"},
    {"key": "442", "country": "BR"}, {"key": "443", "country": "BR"},
    {"key": "444", "country": "BR"}, {"key": "445", "country": "BR"},
    {"key": "446", "country": "BR"}, {"key": "447", "country": "BR"},
    {"key": "448", "country": "BR"}, {"key": "449", "country": "BR"},
    {"key": "450", "country": "BR"}, {"key": "451", "country": "BR"},
    {"key": "452", "country": "BR"}, {"key": "453", "country": "BR"},
    {"key": "454", "country": "BR"}, {"key": "455", "country": "BR"},
    {"key": "457", "country": "BR"}, {"key": "458", "country": "BR"},
    {"key": "460", "country": "BR"}, {"key": "461", "country": "BR"},
    {"key": "462", "country": "BR"}, {"key": "463", "country": "BR"},
    {"key": "464", "country": "BR"},
]

# Geo somente RS
geo_rs_only = {
    "regions": [{"key": "456", "name": "Rio Grande do Sul", "country": "BR"}],
    "location_types": ["home", "recent"]
}

excluded_geo = {
    "regions": excluded_regions,
    "location_types": ["home", "recent"]
}

# === VARIADOS (120239237209480002) ===
# Remove SC + adiciona interesses automotivos (OR com Engaged Shoppers)
variados_targeting = {
    "age_max": 55,
    "age_min": 35,
    "genders": [1],
    "geo_locations": geo_rs_only,
    "excluded_geo_locations": excluded_geo,
    "flexible_spec": [
        {
            "behaviors": [{"id": "6071631541183", "name": "Engaged Shoppers"}],
            "interests": [
                {"id": "6003284404179", "name": "Concessionária (varejista)"},
                {"id": "6004484839610", "name": "iCarros"},
                {"id": "6003368878735", "name": "Crossover (automóvel)"},
            ]
        }
    ],
    "brand_safety_content_filter_levels": ["FACEBOOK_RELAXED", "AN_RELAXED"],
    "targeting_automation": {
        "advantage_audience": 0,
        "individual_setting": {"geo": 0}
    },
    "user_age_unknown": False
}

print("Atualizando Variados...")
adset_variados = AdSet("120239237209480002")
adset_variados.update({"targeting": variados_targeting})
adset_variados.remote_update()
print("Variados OK — SC removido, interesses adicionados.")

# === DUAS RODAS E MAR (120239239890150002) ===
# Remove SC, mantém interesses de moto/náutica
duas_rodas_targeting = {
    "age_max": 55,
    "age_min": 35,
    "genders": [1],
    "geo_locations": geo_rs_only,
    "excluded_geo_locations": excluded_geo,
    "flexible_spec": [
        {
            "interests": [
                {"id": "6002878991172", "name": "Embarcação"},
                {"id": "6003122958658", "name": "Náutica (atividades ao ar livre)"},
                {"id": "6003301848228", "name": "clube de motocicleta (clubes e associações com base em interesses)"},
                {"id": "6003353550130", "name": "Motocicletas (veículos)"},
                {"id": "6003533331798", "name": "Jet ski"},
                {"id": "6004043882148", "name": "esporte com motocicleta (motocicletas)"},
                {"id": "6004142186306", "name": "Veículo aquático pessoal"},
                {"id": "6004165590024", "name": "Motociclismo (veículos)"},
            ],
            "behaviors": [{"id": "6071631541183", "name": "Engaged Shoppers"}]
        }
    ],
    "brand_safety_content_filter_levels": ["FACEBOOK_RELAXED", "AN_RELAXED"],
    "targeting_automation": {
        "advantage_audience": 0,
        "individual_setting": {"geo": 0}
    },
    "user_age_unknown": False
}

print("Atualizando Duas rodas e mar...")
adset_duasrodas = AdSet("120239239890150002")
adset_duasrodas.update({"targeting": duas_rodas_targeting})
adset_duasrodas.remote_update()
print("Duas rodas e mar OK — SC removido.")
