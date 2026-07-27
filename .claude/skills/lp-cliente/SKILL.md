---
name: lp-cliente
description: >
  Cria uma landing page de conversão para um cliente novo ou existente, com estrutura
  e copy adaptadas ao negócio dele (lê briefing, contexto, feedback e transcrições da
  pasta do cliente). Estrutura padrão de LP de tráfego pago: hero, prova/autoridade,
  diferenciais, prova social, CTA. Inclui placeholders de pixel do Meta Ads e tag de
  conversão do Google Ads prontos pra colar o ID. Identidade visual adaptada ao cliente
  (não usa cores da Raiz por padrão). Salva em Clientes/[slug]/Entregaveis/.
  Use quando pedir "cria a landing page do [cliente]", "faz o site do [cliente]",
  "monta uma LP pro [cliente]", "preciso de uma página pro [cliente]", ou "/lp-cliente [cliente]".
---

# /lp-cliente — Landing Page de Cliente

Gera a landing page de conversão que sustenta o tráfego pago de um cliente (Meta Ads
ou Google Ads). Página única, HTML puro, sem framework. Pensada pra ser publicada
rápido e servir de base pras campanhas que o time já roda com `/meta-ads-ratos` e
`/google-ads-ratos`.

**Por que HTML puro e não um framework (Astro, Next):** framework robusto só compensa
quando o site tem várias páginas recorrentes (blog, múltiplas páginas de categoria)
que precisam de componentização. Uma LP de página única não tem esse problema. Se
algum cliente crescer pra precisar de site institucional completo com várias páginas
e blog, ver `referencia-astro.md` nesta pasta antes de decidir — lá tem a análise
completa e um prompt pronto pra planejar isso com Astro.

---

## Passo 1 — Ler contexto do cliente

Receber o nome via argumento: `/lp-cliente [nome-cliente]`

Verificar se existe `Clientes/[slug]/`. Se existir, ler **todos os arquivos .md da pasta**
antes de continuar, igual ao `/diagnostico-instagram`:

- `briefing.md` — nicho, público, diferenciais, acesso, palavras-chave
- `contexto.md` — histórico, situação atual
- `onboarding.md` / `Transcricoes/onboarding.md` — perguntas e respostas do onboarding
- `feedback.md` — objeções e pontos levantados pelo cliente
- `Transcricoes/estrategica.md` e `Transcricoes/comercial.md` — contexto de reuniões
- Qualquer outro `.md` na pasta

Se a pasta não existir, perguntar nome da empresa, nicho e diferenciais antes de continuar.

Extrair especificamente:
- Objetivo da campanha (gerar lead via WhatsApp, formulário, ligação, agendamento)
- Diferenciais reais (nunca genéricos — o que esse cliente tem que concorrente não tem)
- Prova de autoridade (anos de experiência, número de clientes atendidos, certificações)
- Ticket médio / tipo de decisão (compra rápida vs decisão que precisa de mais confiança)
- Se já existe rascunho em `Entregaveis/` — usar como base em vez de recomeçar do zero

---

## Passo 2 — Definir o CTA principal

Baseado no que está no briefing:

| Canal do cliente | CTA da LP |
|---|---|
| Atende por WhatsApp | Botão verde fixo/destacado, `wa.me/[numero]` com mensagem pré-preenchida contextual (ex: "Olá, vi o anúncio e quero saber mais sobre [serviço]") |
| Precisa qualificar antes (ticket alto, agenda) | Formulário curto (nome + telefone + 1 pergunta de qualificação) |
| Quer ligação | Botão de telefone + WhatsApp como alternativa |

Se não estiver claro no briefing, perguntar: "O CTA principal é WhatsApp, formulário ou os dois?"

---

## Passo 3 — Estrutura da página

Seções obrigatórias, nessa ordem:

1. **Hero** — headline de resultado/transformação (não de produto), subheadline com
   o diferencial mais forte, CTA principal visível sem precisar rolar
2. **Prova/autoridade** — números reais (anos de experiência, clientes atendidos,
   projetos feitos) logo abaixo do hero, formato de faixa ou cards pequenos
3. **Diferenciais** — 3 a 4 cards. Cada um específico do negócio real do cliente,
   citando o que está no briefing. Nunca "qualidade garantida" ou "atendimento
   diferenciado" sem contexto concreto por trás
4. **Como funciona** (opcional, incluir se o serviço tiver etapas ou gerar dúvida
   sobre o processo — ex: "como funciona o orçamento", "como funciona a visita técnica")
5. **Prova social** — depoimentos ou cases, se existirem nos arquivos do cliente.
   Se não existir nada, perguntar antes de inventar: "Tem algum depoimento ou case
   que posso usar? Se não tiver ainda, eu tiro essa seção."
6. **CTA final** — repete o CTA principal, mais informações de localização/atendimento
7. **Footer** — nome da empresa, cidade, WhatsApp/telefone

---

## Passo 4 — Identidade visual

Mesma lógica do `/diagnostico-instagram` (Passo 4):

1. Verificar se `briefing.md`/`contexto.md` menciona cores ou identidade visual
2. Se não, perguntar: "Você sabe as cores da marca deles?"
3. Se não souber, inferir pelo nicho (tabela de referência em
   `.claude/skills/diagnostico-instagram/SKILL.md`, mesma tabela vale aqui)
4. Avaliar se as cores funcionam bem num layout de conversão (contraste, legibilidade
   do CTA). Se não funcionar, avisar antes de gerar e sugerir alternativa
5. Nunca usar a paleta da Assessoria Raiz, a não ser que o usuário peça

---

## Passo 5 — Tracking (Meta Pixel + Google Ads)

Toda LP de cliente de tráfego pago precisa ter os placeholders de rastreamento
prontos, mesmo que a conta ainda não exista (caso do Mônego, por exemplo). Incluir
no `<head>`:

```html
<!-- Meta Pixel — substituir SEU_PIXEL_ID quando a conta Meta Ads estiver pronta -->
<script>
!function(f,b,e,v,n,t,s){...}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'SEU_PIXEL_ID');
fbq('track', 'PageView');
</script>

<!-- Google Ads Tag — substituir AW-SEU_CONVERSION_ID quando a conta Google Ads estiver pronta -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-SEU_CONVERSION_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-SEU_CONVERSION_ID');
</script>
```

No clique do CTA principal, disparar o evento de conversão:

```html
onclick="fbq('track','Lead'); gtag('event','conversion',{'send_to':'AW-SEU_CONVERSION_ID/LABEL'});"
```

Deixar um comentário no topo do arquivo listando o que precisa ser substituído antes
de rodar tráfego de verdade:

```html
<!--
  ANTES DE RODAR TRÁFEGO:
  1. Substituir SEU_PIXEL_ID pelo ID do Meta Pixel (criar conta Meta Ads primeiro se não existir)
  2. Substituir AW-SEU_CONVERSION_ID/LABEL pela tag de conversão do Google Ads
-->
```

---

## Passo 6 — Copy

Seguir `_contexto/preferencias.md`: direto, narrativo, sem travessão, sem construções
contrastivas artificiais ("não é X, é Y"). Usar dados reais do briefing, nunca frases
que qualquer concorrente poderia usar. Regra igual ao `/diagnostico-instagram`: o
cliente precisa ler e pensar "isso foi feito pra mim".

**Detalhes técnicos do HTML:**
- Arquivo único, CSS inline em `<style>`, sem dependências externas além de Google Fonts
- Mobile-first (maioria do tráfego de anúncio é mobile)
- Botão de WhatsApp fixo ou sticky em mobile, sempre visível
- Sem `—` em nenhum lugar do texto. Usar `→` em bullets, `·` pra separar informação inline

---

## Passo 7 — Fotos e assets do cliente

Antes de usar qualquer foto que o cliente mandou (pasta `Materiais/`), comprimir:
redimensionar pro lado maior ficar em ~1400px e salvar com `quality=80` (JPEG).
Foto de celular pode vir com vários MB (já aconteceu de uma foto sozinha ter 5,9MB
e pesar mais que o resto do site inteiro somado) — isso derruba a nota de
performance e o Core Web Vitals. Nunca usar a foto original sem passar por isso.

Script de referência (Python + Pillow):

```python
from PIL import Image
img = Image.open(caminho_original)
w, h = img.size
if w > 1400:
    img = img.resize((1400, int(h * 1400 / w)), Image.LANCZOS)
img.convert('RGB').save(caminho_destino, quality=80, optimize=True)
```

No HTML: a imagem do hero (fundo, LCP) leva `fetchpriority="high"`. Todas as
outras imagens abaixo da dobra levam `loading="lazy"`.

---

## Passo 8 — Fundação técnica de SEO

Toda LP nova sai com essa base, mesmo que o domínio final ainda não esteja pronto
(os caminhos `/assets/...` e a URL absoluta já ficam certos, só o domínio muda depois):

- **Favicon:** gerar a partir do ícone/símbolo da marca (não a logo completa com
  texto — em tamanho de aba de navegador, texto vira ilegível). `favicon.png` (256x256)
  + `favicon.ico`, referenciados com `<link rel="icon">` e `<link rel="apple-touch-icon">`
- **Open Graph + Twitter Card:** `og:title`, `og:description`, `og:image` (1200x630),
  `og:url`, `og:type`, `og:locale`, `og:site_name`, mais os equivalentes `twitter:*`
  com `twitter:card=summary_large_image`
  - **A imagem OG precisa ter todo texto/logo centralizado**, dentro de uma zona
    seguro de ~1080x600 no centro. WhatsApp e a maioria dos apps cortam a miniatura
    num quadrado a partir do centro — texto perto da borda esquerda/direita corta.
  - Se precisar trocar a imagem depois de já ter sido compartilhada uma vez, **trocar
    o nome do arquivo** (ex: `og-image-v2.jpg`). O WhatsApp cacheia por URL, então só
    sobrescrever o conteúdo no mesmo nome não força atualizar.
- **`<link rel="canonical">`** apontando pra URL final com `https://` e domínio certo
- **Título:** até ~60 caracteres. **Meta description:** até ~160 caracteres
- **`robots.txt`** simples (`Allow: /` + linha `Sitemap:`) e **`sitemap.xml`** com a
  URL da página — subir junto na raiz do deploy, não só o HTML
- **Schema JSON-LD:** `LocalBusiness` (nome, telefone, área de atendimento, endereço
  ao menos com cidade/UF) sempre. Se a página tiver seção de FAQ, adicionar também
  `FAQPage` com as mesmas perguntas/respostas que já estão no HTML — não duplicar
  conteúdo escrito diferente, só estruturar o que já existe
- **H1 vs. headline visual:** o H1 semântico (o que o Google/IA lê como título)
  não precisa ser o texto visualmente maior da página. Pode usar a linha pequena
  ("eyebrow") acima do headline principal como H1 de verdade — com palavra-chave
  do negócio + localização — e deixar o headline emocional grande como elemento
  visual comum (não H1). Isso dá SEO sem mudar nada visualmente pro visitante.
  Só um H1 por página.

---

## Passo 9 — Salvar

Salvar em `Clientes/[slug]/Entregaveis/lp-[slug].html`. Se a pasta `Entregaveis/`
não existir, criar antes.

Se já existia um rascunho (`lp-rascunho.html` ou similar), perguntar se é pra
substituir ou versionar (`lp-[slug]-v2.html`).

---

## Passo 10 — Deploy

Perguntar: "Quer um link de preview pra você ou o cliente revisar antes de ir pro
domínio final?"

Se sim, publicar como preview no projeto `assessoriaraiz` do Cloudflare Pages
(mesma lógica do `/diagnostico-instagram` Passo 7), em
`assessoriaraiz.pages.dev/preview/[slug]`.

**Importante — isso é só preview.** O domínio final do cliente (ex: `monegoeletromec.com.br`)
precisa ser registrado e apontado separadamente. Quando o cliente aprovar e o domínio
existir:

1. Criar um **projeto novo e separado** no Cloudflare Pages só pra esse cliente
   (`wrangler pages project create [slug]`) — não usar o projeto `assessoriaraiz`
   compartilhado pra site de produção de cliente
2. **Sempre passar `--branch=main`** explicitamente em todo `wrangler pages deploy`
   neste workspace. Sem isso, o wrangler usa a branch git local (aqui é `dev`) e o
   deploy vira "Preview" em vez de "Produção" — sem erro nenhum, só o domínio
   principal não atualiza. Ver `feedback_cloudflare_pages_branch.md` na memória
3. Conectar o domínio: se o cliente tiver DNS externo (Registro.br etc) e não quiser
   trocar nameserver, configurar CNAME pro `www` (`[projeto].pages.dev`) direto no
   próprio DNS dele — mas o domínio raiz (sem www) só funciona de verdade com o
   DNS migrado pro Cloudflare (nameserver), por causa de regra de CNAME em domínio
   raiz. Perguntar a preferência do usuário antes de escolher o caminho
4. Depois que os dois (raiz e www) estiverem no ar, criar uma regra de redirecionamento
   301 de `www` pra raiz (ou vice-versa) — evita conteúdo duplicado pro Google.
   Marcar "preservar string de consulta" pra não perder parâmetro de campanha (utm,
   gclid) no redirect

---

## Passo 11 — Auditoria de SEO (depois do domínio final no ar)

Depois que o site estiver publicado no domínio de verdade (não vale rodar isso só
no preview), rodar as 3 skills de SEO instaladas, nessa ordem:

1. `/seo-audit` — técnico + on-page (crawlability, indexação, títulos, headings)
2. `/ai-seo` — visibilidade em resposta de IA (schema, robots.txt pra bots de IA)
3. `/seo` (Addy Osmani, web-quality-skills) — performance e Core Web Vitals

Aplicar os achados de prioridade alta/média direto (não só reportar), e voltar
pro Passo 8 desta skill se algo básico (favicon, OG, schema) tiver ficado faltando.

---

## Regras

- Nunca gerar sem ler a pasta do cliente primeiro
- Nunca inventar diferenciais, números ou depoimentos — perguntar se faltar
- CTA sempre alinhado ao canal que o cliente já usa hoje
- Identidade visual do cliente, nunca da Raiz, a não ser que peçam
- Placeholders de pixel/tag sempre presentes, mesmo sem conta de anúncio criada ainda
- Se o cliente tiver ou vier a precisar de várias páginas recorrentes (blog, múltiplas
  categorias de serviço), não forçar nessa skill — avisar o usuário e considerar
  `referencia-astro.md` como próximo passo
