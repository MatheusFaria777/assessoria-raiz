# Aprendizados — Meta Ads Ratos

Regras aprendidas durante o uso. O Claude DEVE ler este arquivo antes de criar qualquer objeto.

---

### 2026-04-03 — Sempre incluir CTA no criativo
**Regra:** Ao criar criativos (create.py creative), SEMPRE incluir call_to_action_type. Padrão: LEARN_MORE pra tráfego, SIGN_UP pra leads, SHOP_NOW pra vendas. Nunca criar criativo sem CTA.
**Contexto:** Criou carrossel sem botão de CTA. Usuário teve que corrigir manualmente.

### 2026-04-03 — Carrossel Instagram: multi_share_end_card=false
**Regra:** Em campanhas de visita ao perfil Instagram, SEMPRE usar multi_share_end_card=false e multi_share_optimized=false no criativo.
**Contexto:** Cartão "Ver mais" sem URL quebrou o anúncio em 10 posicionamentos. O end_card exige uma URL de destino que não existe em campanhas de perfil.

### 2026-04-03 — Sempre passar instagram_user_id no criativo
**Regra:** Ao criar criativos pra Instagram, SEMPRE usar --instagram-user-id com o ID da conta Instagram do cliente (do contas.yaml).
**Contexto:** Sem instagram_user_id, o ad não publica no Instagram. Erro: "Seu anúncio deve ser associado a uma conta do Instagram."

### 2026-05-20 — Audiences de engajamento do Instagram: formato correto

**Regra:** Para criar audiences de engajamento do Instagram via API, usar:
- `subtype: ENGAGEMENT`
- `source type: "ig_business"` (não "instagram_business")
- `id: instagram_biz_id` como **inteiro** (não string) — ver campo `instagram_biz_id` no contas.yaml
- Events conhecidos: `ig_business_profile_all` (todos, lowercase) e `INSTAGRAM_PROFILE_FOLLOW` (seguidores, UPPERCASE)
- Antes de criar, aceitar ToS em: `https://business.facebook.com/ads/manage/customaudiences/tos/?act={conta_anuncio}`
**Contexto:** Tentamos criação com instagram_user_id e types errados. O ID correto é o "IG Business Profile ID" (diferente do user ID do Instagram). Descoberto lendo a rule de uma audience criada manualmente no Ads Manager.

### 2026-05-20 — Audiences de Video Views do Instagram: formato diferente

**Regra:** Audiences de Video Views NÃO usam o formato `inclusions`. Usam um array flat:
```json
[{"event_name": "video_view_25_percent", "object_id": "IG_VIDEO_ID", "context_id": "PAGE_ID"}, ...]
```
Requer os IDs individuais de cada vídeo do perfil. Para obter esses IDs via API, o token precisa da scope `instagram_basic`. Sem essa scope, é necessário criar manualmente no Ads Manager e fazer o lookalike via API depois.
**Contexto:** Visto em audiences reais de RE Imports e Efatah. O `context_id` é o Facebook Page ID.

### 2026-04-03 — Desligar format options em carrosséis
**Regra:** Ao criar ads de carrossel, SEMPRE passar --degrees-of-freedom-spec com OPT_OUT pra carousel_to_video, image_touchups e standard_enhancements.
**Contexto:** "Blocos de coleção" e "mídia única" distorcem o carrossel sequencial. Desligar pra manter ordem dos slides.
