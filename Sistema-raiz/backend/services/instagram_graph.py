"""
Download de posts do Instagram via API oficial do Meta (Graph API).

Substitui services/instagram.py (que usava o cookie de sessão pessoal do Matheus
pra imitar o app do Instagram — funcionava, mas colocava a conta pessoal em risco
de restrição por comportamento automatizado, exatamente o que aconteceu em jul/2026).

Esse caminho usa o mesmo token que já sobe os anúncios (System User Token), com a
permissão instagram_basic, contra a conta profissional do cliente (instagram_actor_id,
já cadastrado por conjunto pra atribuição de anúncio). Não precisa de cookie nenhum.

Limitação: a API só lista os posts RECENTES da conta (não busca por URL arbitrária de
qualquer data) — pra esse uso (carro que acabou de ser postado) isso nunca é problema,
mas um post muito antigo pode não ser encontrado.
"""
import os
import re
import tempfile
import requests

GRAPH_URL = "https://graph.facebook.com/v19.0"
MEDIA_FIELDS = "id,caption,media_type,media_url,permalink,thumbnail_url,children{media_type,media_url,thumbnail_url}"


def _shortcode(url: str) -> str:
    m = re.search(r"/(?:p|reel|tv)/([A-Za-z0-9_-]+)", url)
    if not m:
        raise ValueError(f"URL inválida — shortcode não encontrado em: {url}")
    return m.group(1)


def _save_url(url: str, path: str) -> str:
    resp = requests.get(url, timeout=60)
    resp.raise_for_status()
    with open(path, "wb") as f:
        f.write(resp.content)
    return path


def _find_media(instagram_actor_id: str, token: str, code: str, max_pages: int = 4) -> dict:
    """Procura o post pelo shortcode entre os posts recentes da conta (paginando se precisar)."""
    url = f"{GRAPH_URL}/{instagram_actor_id}/media"
    params = {"fields": MEDIA_FIELDS, "limit": 50, "access_token": token}

    for _ in range(max_pages):
        resp = requests.get(url, params=params, timeout=30)
        data = resp.json()
        if "error" in data:
            raise ValueError(f"Erro Instagram API: {data['error'].get('message', data['error'])}")

        for item in data.get("data", []):
            permalink = item.get("permalink", "")
            if f"/{code}/" in permalink or permalink.rstrip("/").endswith(f"/{code}"):
                return item

        next_page = data.get("paging", {}).get("next")
        if not next_page:
            break
        url, params = next_page, {}  # o link "next" já vem com todos os parâmetros embutidos

    raise ValueError(
        f"Post não encontrado entre os posts recentes da conta (shortcode: {code}). "
        f"Só funciona pra posts recentes — se for um post antigo, precisa buscar de outro jeito."
    )


def download_post(url: str, instagram_actor_id: str = None, token: str = None) -> dict:
    """
    Baixa imagens e/ou vídeo de um post do Instagram via API oficial do Meta.
    Requer instagram_actor_id (do conjunto/cliente) e o token Meta (mesmo das campanhas).
    """
    code = _shortcode(url)
    temp_dir = tempfile.mkdtemp(prefix=f"insta_{code}_")

    if not instagram_actor_id:
        raise ValueError(
            "Conjunto sem Instagram Actor ID configurado. "
            "Acesse Clientes → aba Conjuntos e preencha o ID da conta do Instagram."
        )
    if not token:
        raise ValueError("Token Meta não configurado.")

    try:
        item = _find_media(instagram_actor_id, token, code)
    except Exception as e:
        raise ValueError(f"Erro ao buscar post: {e}")

    caption = item.get("caption") or ""
    media_type = item.get("media_type")  # IMAGE | VIDEO | CAROUSEL_ALBUM

    # ── Carrossel ────────────────────────────────────────────────────────────
    if media_type == "CAROUSEL_ALBUM":
        images, video_path, thumb_path = [], None, None
        for i, child in enumerate(item.get("children", {}).get("data", []), start=1):
            if child.get("media_type") == "VIDEO":
                if video_path is None:
                    vurl = child.get("media_url", "")
                    turl = child.get("thumbnail_url", "")
                    if vurl:
                        video_path = _save_url(vurl, os.path.join(temp_dir, "video.mp4"))
                    if turl:
                        thumb_path = _save_url(turl, os.path.join(temp_dir, "thumb.jpg"))
            else:
                murl = child.get("media_url", "")
                if murl:
                    images.append(_save_url(murl, os.path.join(temp_dir, f"foto_{i:02d}.jpg")))
        if images:
            return {"type": "carousel", "images": images, "caption": caption, "shortcode": code, "temp_dir": temp_dir}
        if video_path:
            return {"type": "video", "video": video_path, "thumbnail": thumb_path, "caption": caption, "shortcode": code, "temp_dir": temp_dir}
        raise ValueError("Nenhuma mídia encontrada no carrossel.")

    # ── Vídeo (Reel) ─────────────────────────────────────────────────────────
    if media_type == "VIDEO":
        vurl = item.get("media_url", "")
        turl = item.get("thumbnail_url", "")
        if not vurl:
            raise ValueError("Vídeo sem URL de mídia retornada pela API.")
        video_path = _save_url(vurl, os.path.join(temp_dir, "video.mp4"))
        thumb_path = _save_url(turl, os.path.join(temp_dir, "thumb.jpg")) if turl else None
        return {"type": "video", "video": video_path, "thumbnail": thumb_path, "caption": caption, "shortcode": code, "temp_dir": temp_dir}

    # ── Foto única ───────────────────────────────────────────────────────────
    murl = item.get("media_url", "")
    if not murl:
        raise ValueError("Nenhuma imagem encontrada no post.")
    img_path = _save_url(murl, os.path.join(temp_dir, "foto_01.jpg"))
    return {"type": "carousel", "images": [img_path], "caption": caption, "shortcode": code, "temp_dir": temp_dir}
