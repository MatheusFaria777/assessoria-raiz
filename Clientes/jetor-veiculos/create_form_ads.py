import os, sys, json, time
sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, r"c:\Nova organização\Claude Raiz\ccos-ratos\.claude\skills\meta-ads-ratos\scripts")
import lib; lib._load_env()
from facebook_business.api import FacebookAdsApi
from facebook_business.adobjects.ad import Ad
from facebook_business.adobjects.adaccount import AdAccount

token = os.getenv("META_ADS_TOKEN")
FacebookAdsApi.init(access_token=token)

ACCOUNT = "act_1182722890380366"
ADSET = "120246483422190510"
LEAD_FORM_ID = "967291309468654"
PAGE_ID = "101350876159559"
IG_USER_ID = "17841478283023237"

# Active ads from mensagem campaign
MENSAGEM_ADS = [
    ("120246059588890510", "AD001 - PUNTO ESSENCE 1.6 FLEX 2014/2015"),
    ("120246059680520510", "AD002 - FIESTA 1.0 FLEX 2014"),
    ("120246059716570510", "AD003 - FORD KA 1.5 SE PLUS 2018 FLEX"),
    ("120246060419080510", "AD004 - CHEVROLET CLASSIC LIFE 1.0 2013"),
    ("120246060461730510", "AD005 - SAVEIRO CROSS 1.6 FLEX 2014/2015"),
    ("120246060903710510", "AD006 - CR-V LX 2.0 2013 AUTOMATICO"),
    ("120246060976720510", "AD007 - CIVIC SEDAN LXS 2012/2013 AUTOMATICO"),
    ("120246061250150510", "AD009 - CORSA HATCH MAXX 1.4 2010/2011"),
    ("120246062994740510", "AD010 - DUSTER DYNAMIQUE 1.6 FLEX 2011 MECANICO"),
    ("120246062997880510", "AD011 - DUSTER EXPRESSION 1.6 FLEX 2019/2020 AUTOMATICO"),
    ("120246063065740510", "AD012 - ECOSPORT XLT 1.6 FLEX 2011/2012"),
    ("120246063155770510", "AD013 - AMAROK CS 2.0 TDI 4X4 2013/2014 DIESEL"),
    ("120246063294610510", "AD014 - GRAND SIENA ESSENCE 1.6 FLEX 2014/2015"),
    ("120246063365440510", "AD015 - NISSAN KICKS S 1.6 2018 AUTOMATICO"),
    ("120246063473320510", "AD016 - CITY LX 1.5 FLEX 2014/2015 AUTOMATICO"),
    ("120246063919850510", "AD018 - CITY EXL 1.5 FLEX 2011 AUTOMATICO"),
    ("120246064018330510", "AD019 - CORSA SEDAN PREMIUM 1.4 2011"),
    ("120246108155460510", "AD021 - COROLLA XEI 2.0 FLEX 2015/2016 AUTOMATICO"),
    ("120246124946720510", "AD015 - (VIDEO) NISSAN KICKS S 1.6 2018 AUTOMATICO"),
    ("120246125104240510", "AD013 - (VIDEO) AMAROK CS 2.0 TDI 4X4 2013/2014 DIESEL"),
    ("120246125378020510", "AD004 - (VIDEO) CHEVROLET CLASSIC LIFE 1.0 2013"),
]


def transform_link_data(ld):
    new_ld = {
        "link": "http://fb.me/",
        "message": ld.get("message", ""),
        "call_to_action": {
            "type": "LEARN_MORE",
            "value": {"lead_gen_form_id": LEAD_FORM_ID}
        },
        "multi_share_end_card": ld.get("multi_share_end_card", True),
        "multi_share_optimized": ld.get("multi_share_optimized", False),
    }
    if "child_attachments" in ld:
        new_children = []
        for c in ld["child_attachments"]:
            new_c = {
                "link": "http://fb.me/",
                "call_to_action": {
                    "type": "LEARN_MORE",
                    "value": {"lead_gen_form_id": LEAD_FORM_ID, "link": "http://fb.me/"}
                }
            }
            if c.get("image_hash"):
                new_c["image_hash"] = c["image_hash"]
            if c.get("video_id"):
                new_c["video_id"] = c["video_id"]
            if c.get("name"):
                new_c["name"] = c["name"]
            if c.get("description"):
                new_c["description"] = c["description"]
            new_children.append(new_c)
        new_ld["child_attachments"] = new_children
    return new_ld


def transform_spec(spec):
    new_spec = {
        "page_id": PAGE_ID,
        "instagram_user_id": IG_USER_ID,
    }
    if "link_data" in spec:
        new_spec["link_data"] = transform_link_data(spec["link_data"])
    elif "video_data" in spec:
        vd = spec["video_data"]
        new_vd = {
            "video_id": vd.get("video_id", ""),
            "message": vd.get("message", ""),
            "call_to_action": {
                "type": "LEARN_MORE",
                "value": {"lead_gen_form_id": LEAD_FORM_ID}
            }
        }
        if vd.get("image_url"):
            new_vd["image_url"] = vd["image_url"]
        new_spec["video_data"] = new_vd
    return new_spec


def process_single(ad_id, ad_name, test_only=False):
    fields = ["adcreatives{id,object_story_spec,instagram_user_id}"]
    ad_data = Ad(ad_id).api_get(fields=fields)
    creatives = ad_data["adcreatives"]["data"]
    if not creatives:
        print(f"  SKIP: sem creative para {ad_name}")
        return None

    original_spec = creatives[0]["object_story_spec"]
    new_spec = transform_spec(original_spec)

    if test_only:
        print(f"  SPEC OK para {ad_name}")
        return new_spec

    account = AdAccount(ACCOUNT)

    # Reuse existing creative if passed via env (avoids orphan creatives on retry)
    reuse_creative_id = os.getenv("REUSE_CREATIVE_ID", "")
    if reuse_creative_id:
        creative_id = reuse_creative_id
        print(f"  Reusando criativo: {creative_id}")
    else:
        new_creative = account.create_ad_creative(fields=[], params={
            "name": "[FORM] " + ad_name,
            "object_story_spec": new_spec,
            "instagram_user_id": IG_USER_ID
        })
        creative_id = new_creative["id"]
        print(f"  Criativo criado: {creative_id}")
        time.sleep(1)

    new_ad = account.create_ad(fields=[], params={
        "name": ad_name,
        "adset_id": ADSET,
        "creative": {"creative_id": creative_id},
        "status": "PAUSED"
    })
    ad_result_id = new_ad["id"]
    print(f"  OK: {ad_result_id} - {ad_name}")
    return ad_result_id


# Default: TEST ONLY mode (set TEST_ONLY=false to actually create)
TEST_ONLY = os.getenv("TEST_ONLY", "true").lower() != "false"

if TEST_ONLY:
    print("=== MODO TESTE (TEST_ONLY=true) — nenhum ad sera criado ===")
    ad_id, ad_name = MENSAGEM_ADS[0]
    spec = process_single(ad_id, ad_name, test_only=True)
    print(json.dumps(spec, indent=2, ensure_ascii=False))
else:
    print(f"=== CRIANDO {len(MENSAGEM_ADS)} ADS no adset {ADSET} ===")
    results = []
    for i, (ad_id, ad_name) in enumerate(MENSAGEM_ADS):
        print(f"[{i+1}/{len(MENSAGEM_ADS)}] {ad_name}")
        result = process_single(ad_id, ad_name, test_only=False)
        results.append({"ad_name": ad_name, "new_ad_id": result})
        time.sleep(1)
    print("\n=== RESULTADO FINAL ===")
    for r in results:
        print(f"  {r['ad_name']}: {r['new_ad_id']}")
