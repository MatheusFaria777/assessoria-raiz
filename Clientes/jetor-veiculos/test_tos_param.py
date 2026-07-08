import os, sys, json, requests
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, r'c:\Nova organização\Claude Raiz\ccos-ratos\.claude\skills\meta-ads-ratos\scripts')
import lib; lib._load_env()
from facebook_business.api import FacebookAdsApi
from facebook_business.adobjects.adaccount import AdAccount

token = os.getenv('META_ADS_TOKEN')
BASE = 'https://graph.facebook.com/v21.0'

# Tentar criar ad passando leadgen_tos_accepted direto na request
r = requests.post(
    f'{BASE}/act_1182722890380366/ads',
    params={'access_token': token},
    json={
        'name': 'AD001 TESTE TOS PARAM',
        'adset_id': '120246483422190510',
        'creative': {'creative_id': '1722470155560355'},
        'status': 'PAUSED',
        'leadgen_tos_accepted': True
    }
)
print('Tentativa 1 (leadgen_tos_accepted no body):')
print(r.status_code, json.dumps(r.json(), indent=2, ensure_ascii=False))
