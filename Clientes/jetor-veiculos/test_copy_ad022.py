import os, sys, json, requests
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, r'c:\Nova organização\Claude Raiz\ccos-ratos\.claude\skills\meta-ads-ratos\scripts')
import lib; lib._load_env()
token = os.getenv('META_ADS_TOKEN')
BASE = 'https://graph.facebook.com/v21.0'

# Duplicar AD022 (criado pelo Ads Manager) sem standard enhancements
for attempt, params in enumerate([
    {'adset_id': '120246483422190510', 'status_option': 'PAUSED'},
    {'adset_id': '120246483422190510', 'status_option': 'PAUSED', 'deep_copy': False},
    {'adset_id': '120246483422190510', 'status_option': 'PAUSED', 'existing_campaign_id': '120246059507210510'},
    {'adset_id': '120246483422190510', 'status_option': 'PAUSED', 'rename_options': {'rename_strategy': 'KEEP_EXISTING_NAME'}},
]):
    r = requests.post(f'{BASE}/120246492199790510/copies', params={'access_token': token}, json=params)
    j = r.json()
    print(f'Tentativa {attempt+1}: {r.status_code}')
    if r.ok:
        print('SUCESSO:', json.dumps(j, indent=2, ensure_ascii=False))
        break
    else:
        err = j.get('error', {})
        print(f"  Subcode: {err.get('error_subcode')} | {err.get('error_user_title','')}")
        print(f"  Msg: {err.get('error_user_msg','')[:120]}")
    print()
