"""
Upload de anúncios de veículos no Meta Ads.
Usa requests direto em vez do SDK — o SDK não passa o token corretamente em POST.
"""
import json, re
import requests as _req

API = "https://graph.facebook.com/v19.0"


def _act(account_id: str) -> str:
    return f"act_{account_id}" if not account_id.startswith("act_") else account_id


def _parse_json(resp) -> dict:
    if not resp.text.strip():
        raise Exception(f"Meta API retornou resposta vazia (HTTP {resp.status_code})")
    try:
        return resp.json()
    except Exception:
        raise Exception(f"Meta API retornou resposta inválida (HTTP {resp.status_code}): {resp.text[:200]}")


def _post(path: str, token: str, **kwargs) -> dict:
    params = kwargs.pop("params", {})
    params["access_token"] = token
    resp = _req.post(f"{API}/{path}", params=params, timeout=60, **kwargs)
    data = _parse_json(resp)
    if "error" in data:
        err = data["error"]
        msg = err.get("message", str(err))
        details = err.get("error_user_msg") or err.get("error_data") or ""
        raise Exception(f"{msg}{(' — ' + str(details)) if details else ''} [code {err.get('code', '?')}]")
    return data


def _get(path: str, token: str, **kwargs) -> dict:
    params = kwargs.pop("params", {})
    params["access_token"] = token
    resp = _req.get(f"{API}/{path}", params=params, timeout=30, **kwargs)
    data = _parse_json(resp)
    if "error" in data:
        raise Exception(data["error"].get("message", str(data["error"])))
    return data


def get_next_ad_number(account_id: str, token: str, adset_id: str) -> int:
    """Varre anúncios do conjunto buscando padrão AD### e retorna o próximo número."""
    act = _act(account_id)
    data = _get(f"{act}/ads", token, params={"fields": "name", "adset_id": adset_id, "limit": 500})
    pattern = re.compile(r"AD(\d+)", re.IGNORECASE)
    max_num = max(
        (int(m.group(1)) for ad in data.get("data", []) for m in [pattern.search(ad.get("name", ""))] if m),
        default=0,
    )
    return max_num + 1


def upload_images(account_id: str, token: str, image_paths: list) -> list:
    """Faz upload das imagens e retorna os hashes."""
    act = _act(account_id)
    hashes = []
    for path in image_paths:
        with open(path, "rb") as f:
            resp = _req.post(
                f"{API}/{act}/adimages",
                params={"access_token": token},
                files={"filename": f},
                timeout=60,
            )
        data = _parse_json(resp)
        if "error" in data:
            raise Exception(data["error"].get("message", str(data["error"])))
        images = data.get("images", {})
        if images:
            hashes.append(list(images.values())[0]["hash"])
        else:
            raise Exception(f"Hash não retornado para {path}")
    return hashes


def upload_video(account_id: str, token: str, video_path: str) -> str:
    """Faz upload do vídeo e retorna o video_id."""
    act = _act(account_id)
    with open(video_path, "rb") as f:
        data = _post(f"{act}/advideos", token, files={"source": f})
    return data["id"]


def create_carousel_ad(
    account_id: str, token: str, adset_id: str, page_id: str,
    image_hashes: list, ad_number: int, copy: dict,
    instagram_actor_id: str = "",
    lead_gen_form_id: str = "",
) -> dict:
    """Cria anúncio carrossel click-to-WhatsApp (ou lead gen) via requests direto."""
    act = _act(account_id)
    # Limpa e trunca campos com limites da API Meta
    import re as _re
    def _clean(s: str, max_len: int = 0) -> str:
        s = _re.sub(r'[^\w\s\-.,!?áéíóúâêîôûãõçÁÉÍÓÚÂÊÎÔÛÃÕÇ@#$%&*()+=\'":/]', '', str(s))
        return s[:max_len] if max_len else s

    nome_upper   = _clean(copy["nome_anuncio"]).upper()[:50]
    titulo_upper = _clean(copy["titulo"]).upper()[:255]
    ad_name = f"AD{ad_number:03d} - {nome_upper}"[:255]

    descricao = copy["descricao_principal"][:2000]  # limite Meta para message

    card_description = "⭐⭐⭐⭐⭐ 5.0 avaliação"
    if lead_gen_form_id:
        cta = {"type": "SIGN_UP", "value": {"lead_gen_form_id": lead_gen_form_id}}
    else:
        cta = {"type": "WHATSAPP_MESSAGE", "value": {"app_destination": "WHATSAPP"}}

    lead_gen_link = "https://www.facebook.com/"
    child_extra = {"link": lead_gen_link} if lead_gen_form_id else {}

    link_data: dict = {
        "message":           copy["descricao_principal"],
        "child_attachments": [
            {"image_hash": h, "name": titulo_upper, "description": card_description,
             "call_to_action": cta, **child_extra}
            for h in image_hashes
        ],
        "call_to_action": cta,
    }
    if lead_gen_form_id:
        link_data["link"] = lead_gen_link

    story_spec = {
        "page_id": page_id,
        "link_data": link_data,
    }
    if instagram_actor_id:
        story_spec["instagram_actor_id"] = instagram_actor_id

    dof = {
        "creative_features_spec": {
            **{k: {"enroll_status": "OPT_OUT"} for k in [
                "adapt_to_placement", "add_text_overlay", "ads_with_benefits",
                "advantage_plus_creative", "app_highlights", "biz_ai",
                "carousel_to_video", "catalog_feed_tag", "creative_stickers",
                "cv_transformation", "description_automation", "dha_optimization",
                "dynamic_partner_content", "enable_ncs_testimonials", "enhance_cta",
                "feed_caption_optimization", "generate_cta", "hide_price",
                "ig_glados_feed", "ig_video_native_subtitle", "image_animation",
                "image_auto_crop", "image_background_gen", "image_brightness_and_contrast",
                "image_enhancement", "image_templates", "image_text_translation",
                "image_touchups", "image_uncrop", "inline_comment",
                "local_store_extension", "media_liquidity_animated_image", "media_order",
                "media_type_automation", "multi_photo_to_video", "pac_recomposition",
                "pac_relaxation", "product_browsing", "product_extensions",
                "product_metadata_automation", "replace_media_text", "reveal_details_over_time",
                "show_destination_blurbs", "show_summary", "site_extensions",
                "standard_enhancements_catalog", "text_optimizations", "text_translation",
                "translate_voiceover", "video_auto_crop", "video_filtering",
                "video_highlight", "video_highlights", "video_to_image",
                "video_uncrop", "wa_mm_image_filtering",
            ]},
            "audio":             {"enroll_status": "OPT_IN"},
            "profile_card":      {"enroll_status": "OPT_IN"},
            "multi_destination": {"enroll_status": "OPT_IN"},
        }
    }

    # Substitui descricao pelo valor truncado
    story_spec["link_data"]["message"] = descricao

    # Cria o AdCreative
    creative_data = _post(f"{act}/adcreatives", token, json={
        "name":                   f"Creative - {ad_name}"[:100],
        "object_story_spec":      story_spec,
        "degrees_of_freedom_spec": dof,
    })
    creative_id = creative_data["id"]

    # Cria o Ad (pausado para lead gen — usuário ativa manualmente no Ads Manager)
    ad_status = "PAUSED" if lead_gen_form_id else "ACTIVE"
    ad_data = _post(f"{act}/ads", token, json={
        "name":     ad_name,
        "adset_id": adset_id,
        "creative": {"creative_id": creative_id},
        "status":   ad_status,
    })

    return {"ad_id": ad_data["id"], "ad_name": ad_name, "creative_id": creative_id}


def create_video_ad(
    account_id: str, token: str, adset_id: str, page_id: str,
    video_id: str, ad_number: int, copy: dict,
    image_hash: str = "", instagram_actor_id: str = "",
    lead_gen_form_id: str = "",
) -> dict:
    """Cria anúncio de vídeo click-to-WhatsApp (ou lead gen) via requests direto."""
    act = _act(account_id)
    nome_upper   = copy["nome_anuncio"].upper()
    titulo_upper = copy["titulo"].upper()
    ad_name = f"AD{ad_number:03d} - (VIDEO) {nome_upper}"

    if lead_gen_form_id:
        video_cta = {"type": "SIGN_UP", "value": {"lead_gen_form_id": lead_gen_form_id}}
    else:
        video_cta = {"type": "WHATSAPP_MESSAGE", "value": {"app_destination": "WHATSAPP"}}

    video_data_spec = {
        "video_id": video_id,
        "message":  copy["descricao_principal"],
        "title":    titulo_upper,
        "call_to_action": video_cta,
    }
    if image_hash:
        video_data_spec["image_hash"] = image_hash

    story_spec = {"page_id": page_id, "video_data": video_data_spec}
    if instagram_actor_id:
        story_spec["instagram_actor_id"] = instagram_actor_id

    dof = {
        "creative_features_spec": {
            **{k: {"enroll_status": "OPT_OUT"} for k in [
                "ig_video_native_subtitle", "image_animation", "product_browsing",
                "product_metadata_automation", "standard_enhancements_catalog",
                "text_overlay_translation",
            ]},
            "profile_card": {"enroll_status": "OPT_IN"},
        }
    }

    creative_data = _post(f"{act}/adcreatives", token, json={
        "name": f"Creative - {ad_name}",
        "object_story_spec": story_spec,
        "degrees_of_freedom_spec": dof,
    })
    creative_id = creative_data["id"]

    ad_status = "PAUSED" if lead_gen_form_id else "ACTIVE"
    ad_data = _post(f"{act}/ads", token, json={
        "name":     ad_name,
        "adset_id": adset_id,
        "creative": {"creative_id": creative_id},
        "status":   ad_status,
    })

    return {"ad_id": ad_data["id"], "ad_name": ad_name, "creative_id": creative_id}


def duplicate_and_update_ad(
    account_id: str, token: str, adset_id: str,
    template_ad_id: str, image_hashes: list, ad_number: int, copy: dict,
) -> dict:
    """Duplica um anúncio modelo e atualiza com novas imagens e copy."""
    act = _act(account_id)
    nome_upper   = copy["nome_anuncio"].upper()
    titulo_upper = copy["titulo"].upper()
    ad_name = f"AD{ad_number:03d} - {nome_upper}"

    # Duplica
    dup = _post(f"{template_ad_id}/copies", token, json={
        "adset_id": adset_id, "status_option": "PAUSED",
    })
    new_ad_id = dup.get("copied_ad_id") or dup.get("id")
    if not new_ad_id:
        raise Exception(f"Resposta inesperada ao duplicar: {dup}")

    # Busca creative do duplicado
    ad_info = _get(f"{new_ad_id}", token, params={"fields": "creative"})
    creative_id = ad_info.get("creative", {}).get("id")

    # Busca spec atual
    creative_info = _get(f"{creative_id}", token, params={"fields": "object_story_spec"})
    story_spec = creative_info.get("object_story_spec", {})

    # Atualiza com novos dados
    link_data = story_spec.get("link_data", {})
    original_cta = {}
    if link_data.get("child_attachments"):
        original_cta = link_data["child_attachments"][0].get("call_to_action", {})

    wa_message = f"Olá! Gostaria de saber mais informações sobre o {copy['nome_anuncio']}."
    link_data["page_welcome_message"] = json.dumps(
        {"type": "WHATSAPP", "version": 2, "message": {"type": "text", "text": wa_message}},
        ensure_ascii=False,
    )
    link_data["message"] = copy["descricao_principal"]
    link_data["child_attachments"] = [
        {"image_hash": h, "name": titulo_upper, "description": "⭐⭐⭐⭐⭐ 5.0 avaliação",
         "call_to_action": original_cta or {"type": "WHATSAPP_MESSAGE", "value": {"app_destination": "WHATSAPP"}}}
        for h in image_hashes
    ]
    story_spec["link_data"] = link_data

    # Atualiza o creative existente
    _post(f"{creative_id}", token, json={
        "name": f"Creative - {ad_name}",
        "object_story_spec": json.dumps(story_spec, ensure_ascii=False),
    })

    # Ativa e renomeia
    _post(f"{new_ad_id}", token, json={"name": ad_name, "status": "ACTIVE"})

    return {"ad_id": new_ad_id, "ad_name": ad_name, "creative_id": creative_id}
