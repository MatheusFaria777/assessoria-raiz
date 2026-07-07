"""Download de posts públicos do Instagram — API mobile direta."""
import os, re, tempfile, requests
from urllib.parse import unquote


def _shortcode(url: str) -> str:
    m = re.search(r"/(?:p|reel|tv)/([A-Za-z0-9_-]+)", url)
    if not m:
        raise ValueError(f"URL inválida — shortcode não encontrado em: {url}")
    return m.group(1)


def _shortcode_to_pk(code: str) -> int:
    """Converte shortcode do Instagram para media PK numérico."""
    alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
    n = 0
    for char in code:
        n = n * 64 + alphabet.index(char)
    return n


def _ig_session(sessionid: str) -> requests.Session:
    s = requests.Session()
    decoded = unquote(sessionid)
    s.cookies.set("sessionid", decoded, domain=".instagram.com")
    s.headers.update({
        "User-Agent": (
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
            "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 "
            "Mobile/15E148 Safari/604.1"
        ),
        "X-IG-App-ID": "936619743392459",
        "Accept": "*/*",
        "Accept-Language": "pt-BR,pt;q=0.9",
    })
    return s


def _save_url(url: str, path: str, session: requests.Session = None) -> str:
    req = session or requests
    resp = req.get(url, timeout=60)
    resp.raise_for_status()
    with open(path, "wb") as f:
        f.write(resp.content)
    return path


def _fetch_post_info(code: str, sessionid: str) -> dict:
    """Busca dados do post via API mobile do Instagram."""
    pk = _shortcode_to_pk(code)
    session = _ig_session(sessionid)
    resp = session.get(
        f"https://www.instagram.com/api/v1/media/{pk}/info/",
        timeout=20,
    )
    if not resp.ok or not resp.text.strip():
        raise ValueError(f"Instagram API retornou HTTP {resp.status_code} para o post")
    try:
        data = resp.json()
    except Exception:
        raise ValueError(
            f"Instagram API retornou resposta inválida (não-JSON) — "
            f"provável sessão expirada. Início: {resp.text[:150]}"
        )
    items = data.get("items", [])
    if not items:
        raise ValueError("Post não encontrado ou sem mídia")
    return items[0]


def download_post(url: str, sessionid: str = None) -> dict:
    """
    Baixa imagens e/ou vídeo de um post do Instagram.
    Requer sessionid para funcionar em servidores (IPs de datacenter).
    """
    code = _shortcode(url)
    temp_dir = tempfile.mkdtemp(prefix=f"insta_{code}_")

    if not sessionid:
        raise ValueError(
            "Instagram Session ID não configurado. "
            "Acesse Configurações → Instagram Session ID e cole o valor do cookie 'sessionid' do instagram.com."
        )

    try:
        item = _fetch_post_info(code, sessionid)
    except Exception as e:
        raise ValueError(f"Erro ao buscar post: {e}")

    session = _ig_session(sessionid)
    caption = (item.get("caption") or {}).get("text", "")
    media_type = item.get("media_type")  # 1=foto, 2=vídeo, 8=carrossel

    # ── Carrossel ────────────────────────────────────────────────────────────
    if media_type == 8:
        images, video_path, thumb_path = [], None, None
        for i, child in enumerate(item.get("carousel_media", []), start=1):
            if child.get("media_type") == 2:
                if video_path is None:
                    vurl = (child.get("video_versions") or [{}])[0].get("url", "")
                    turl = (child.get("image_versions2", {}).get("candidates") or [{}])[0].get("url", "")
                    if vurl:
                        video_path = _save_url(vurl, os.path.join(temp_dir, "video.mp4"), session)
                    if turl:
                        thumb_path = _save_url(turl, os.path.join(temp_dir, "thumb.jpg"), session)
            else:
                candidates = child.get("image_versions2", {}).get("candidates") or []
                if candidates:
                    images.append(_save_url(candidates[0]["url"], os.path.join(temp_dir, f"foto_{i:02d}.jpg"), session))
        if images:
            return {"type": "carousel", "images": images, "caption": caption, "shortcode": code, "temp_dir": temp_dir}
        if video_path:
            return {"type": "video", "video": video_path, "thumbnail": thumb_path, "caption": caption, "shortcode": code, "temp_dir": temp_dir}
        raise ValueError("Nenhuma mídia encontrada no carrossel.")

    # ── Vídeo (Reel) ─────────────────────────────────────────────────────────
    if media_type == 2:
        vurl = (item.get("video_versions") or [{}])[0].get("url", "")
        turl = (item.get("image_versions2", {}).get("candidates") or [{}])[0].get("url", "")
        video_path = _save_url(vurl, os.path.join(temp_dir, "video.mp4"), session)
        thumb_path = _save_url(turl, os.path.join(temp_dir, "thumb.jpg"), session) if turl else None
        return {"type": "video", "video": video_path, "thumbnail": thumb_path, "caption": caption, "shortcode": code, "temp_dir": temp_dir}

    # ── Foto única ───────────────────────────────────────────────────────────
    candidates = (item.get("image_versions2") or {}).get("candidates") or []
    if not candidates:
        raise ValueError("Nenhuma imagem encontrada no post.")
    img_path = _save_url(candidates[0]["url"], os.path.join(temp_dir, "foto_01.jpg"), session)
    return {"type": "carousel", "images": [img_path], "caption": caption, "shortcode": code, "temp_dir": temp_dir}
