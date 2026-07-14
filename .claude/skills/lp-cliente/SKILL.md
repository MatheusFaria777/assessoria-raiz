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

## Passo 7 — Salvar

Salvar em `Clientes/[slug]/Entregaveis/lp-[slug].html`. Se a pasta `Entregaveis/`
não existir, criar antes.

Se já existia um rascunho (`lp-rascunho.html` ou similar), perguntar se é pra
substituir ou versionar (`lp-[slug]-v2.html`).

---

## Passo 8 — Deploy (opcional)

Perguntar: "Quer um link de preview pra você ou o cliente revisar antes de ir pro
domínio final?"

Se sim, publicar como preview no projeto `assessoriaraiz` do Cloudflare Pages
(mesma lógica do `/diagnostico-instagram` Passo 7), em
`assessoriaraiz.pages.dev/preview/[slug]`.

**Importante — isso é só preview.** O domínio final do cliente (ex: `monegoeletromec.com.br`)
precisa ser registrado e apontado separadamente pro Cloudflare Pages do cliente. Isso
fica fora do escopo automático desta skill — avisar o usuário que esse passo é manual
(registro de domínio + DNS) quando a LP estiver aprovada.

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
