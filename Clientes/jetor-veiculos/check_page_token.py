import os, sys, json, requests
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, r'c:\Nova organização\Claude Raiz\ccos-ratos\.claude\skills\meta-ads-ratos\scripts')
import lib; lib._load_env()
token = os.getenv('META_ADS_TOKEN')
BASE = 'https://graph.facebook.com/v21.0'

pages = requests.get(f'{BASE}/me/accounts', params={'access_token': token, 'fields': 'id,name,access_token'}).json()
jetor_token = None
for p in pages.get('data', []):
    print(f"  {p['id']} - {p['name']}")
    if p['id'] == '101350876159559':
        jetor_token = p.get('access_token', '')
        print(f"  PAGE TOKEN obtido: {jetor_token[:40]}...")

if jetor_token:
    tos = requests.get(f'{BASE}/101350876159559', params={'fields': 'leadgen_tos_accepted', 'access_token': jetor_token}).json()
    print('ToS com page token:', json.dumps(tos, ensure_ascii=False))

    # Tentar criar ad com page token
    from facebook_business.api import FacebookAdsApi
    from facebook_business.adobjects.adaccount import AdAccount
    FacebookAdsApi.init(access_token=jetor_token)
    account = AdAccount('act_1182722890380366')
    try:
        r = account.create_ad(fields=[], params={
            'name': 'AD001 TESTE PAGE TOKEN',
            'adset_id': '120246483422190510',
            'creative': {'creative_id': '1722470155560355'},
            'status': 'PAUSED'
        })
        print('AD criado com page token:', dict(r))
    except Exception as e:
        print('Erro com page token:', str(e)[:600])
else:
    print('Página Jetor não encontrada em /me/accounts')
