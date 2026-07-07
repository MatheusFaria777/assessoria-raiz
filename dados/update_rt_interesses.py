"""
Atualiza Variados: lógica AND com interesses automotivos/financeiros no Grupo 2
"""
import os, json
from pathlib import Path

env_path = Path("D:/DOWNLOAD/Claude Raiz/ccos-ratos/.claude/skills/meta-ads-ratos/.env")
for line in env_path.read_text().splitlines():
    if "=" in line and not line.strip().startswith("#"):
        k, _, v = line.partition("=")
        os.environ[k.strip()] = v.strip().strip('"')

from facebook_business.api import FacebookAdsApi
from facebook_business.adobjects.adset import AdSet

FacebookAdsApi.init(access_token=os.environ["META_ADS_TOKEN"])

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

targeting = {
    "age_max": 55,
    "age_min": 35,
    "genders": [1],
    "geo_locations": {
        "regions": [{"key": "456", "name": "Rio Grande do Sul", "country": "BR"}],
        "location_types": ["home", "recent"]
    },
    "excluded_geo_locations": {
        "regions": excluded_regions,
        "location_types": ["home", "recent"]
    },
    "flexible_spec": [
        # Grupo 1: comportamento de comprador ativo
        {
            "behaviors": [{"id": "6071631541183", "name": "Engaged Shoppers"}]
        },
        # Grupo 2 (AND): interesse automotivo ou financeiro
        {
            "interests": [
                {"id": "6004484839610", "name": "iCarros"},
                {"id": "6832284024121", "name": "Sites de vendas de veículos (sites)"},
                {"id": "6003284404179", "name": "Concessionária (varejista)"},
                {"id": "6003321839097", "name": "Financiamento"},
                {"id": "6003368878735", "name": "Crossover (automóvel)"},
                {"id": "6003693537583", "name": "Propriedade de imóveis (imóveis)"},
            ],
            "behaviors": [
                {"id": "6002714898572", "name": "Proprietários de pequenas empresas"}
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

print("Atualizando Variados com lógica AND...")
adset = AdSet("120239237209480002")
adset.update({"targeting": targeting})
adset.remote_update()
print("Variados OK — Grupo 2 com 7 interesses/comportamentos em AND com Engaged Shoppers.")
