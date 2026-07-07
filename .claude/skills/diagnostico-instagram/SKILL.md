---
name: diagnostico-instagram
description: >
  Gera um diagnóstico visual do perfil de Instagram de um cliente em HTML.
  Analisa bio, métricas, destaques, conteúdo e presença orgânica com base em
  checklist específico por nicho. Identidade visual adaptada ao cliente (não usa cores da Raiz).
  Salva em Clientes/[slug]/diagnostico-instagram.html.
  Use quando pedir "diagnóstico de Instagram do [cliente]", "analisa o Instagram do [cliente]",
  "direcionamento de Instagram", ou "/diagnostico-instagram [cliente]".
---

# /diagnostico-instagram — Diagnóstico de Instagram

## Arquivos de apoio (ler no início)

- `_contexto/preferencias.md` — tom e estilo de escrita
- Checklist de nicho (ler conforme identificado no Passo 1):
  - `.claude/skills/diagnostico-instagram/checklist-automotivo.md` — loja de carro/moto
  - `.claude/skills/diagnostico-instagram/checklist-estetica.md` — estética/beleza/saúde
- **Referência visual HTML:** `Clientes/estetica-tiara/Entregaveis/diagnostico-instagram.html` — modelo de estrutura e estilo

---

## Passo 1 — Identificar o cliente e o nicho

Receber nome do cliente via argumento: `/diagnostico-instagram [nome-cliente]`

Verificar se existe `Clientes/[slug]/`. Se existir, **ler todos os arquivos .md da pasta** antes de continuar — não só briefing e contexto. Incluir subpastas como `Transcrições/` se existirem.

Arquivos comuns a procurar e ler:
- `briefing.md` — dados básicos do cliente (nicho, cidade, instagram, ticket, etc.)
- `contexto.md` — histórico, situação atual, o que já foi feito
- `onboarding.md` — roteiro e perguntas feitas no onboarding
- `feedback.md` — o que o cliente falou, objeções, pontos levantados
- `Transcrições/*.md` — transcrições de reuniões (onboarding, estratégica, alinhamentos)
- Qualquer outro `.md` encontrado na pasta

Absorver todo esse contexto antes de prosseguir. Isso garante que o diagnóstico reflita o que já se sabe do cliente, não só o que está no Instagram.

Se a pasta não existir, perguntar ao usuário o nome do cliente e o nicho antes de continuar.

Extrair dos arquivos lidos:
- Nome completo da empresa
- Handle do Instagram
- Nicho / tipo de negócio
- Cidade
- Qualquer contexto relevante (histórico de campanhas, público, diferenciais, problemas conhecidos)

**Mapeamento de nicho:**
- Loja de carro, concessionária, revenda, seminovos, multimarcas → `checklist-automotivo.md`
- Moto, loja de motos → `checklist-automotivo.md`
- Estética, clínica, esteticista, beleza, laser, procedimento estético → `checklist-estetica.md`
- Outro nicho → usar estrutura geral (sem checklist pré-definido, adaptar com base no negócio)

Se o handle não estiver nos arquivos, perguntar ao usuário antes de continuar.

---

## Passo 2 — Coletar dados do perfil

### Tentativa automática via WebFetch

Tentar acessar `https://www.instagram.com/[handle]/` para capturar dados básicos (bio, número de posts, seguidores, seguindo).

> Atenção: o Instagram bloqueia muitas requisições sem login. Se o WebFetch não retornar dados úteis, não insistir — partir para coleta manual.

### Coleta manual (quando WebFetch falha ou dados estão incompletos)

Pedir ao usuário as informações que faltarem. Perguntar uma coisa por vez:

1. "Qual o @ do perfil?" (se não tiver)
2. "Quantos seguidores, seguindo e posts?" (números do perfil)
3. "Me manda um print da bio" ou "cola o texto da bio atual"
4. "Quais destaques existem? (nomes deles)"
5. "Posta com que frequência? Stories todo dia ou esporádico?"
6. "Tem alguma coisa específica que você quer que eu destaque como problema?"

Se o usuário tiver prints, ler as imagens que forem anexadas.
Se o usuário tiver material de referência extra (mapa mental, transcrição de aula, checklist externo), ler e incorporar na análise.

**Dados mínimos para gerar o HTML:**
- Handle do Instagram
- Seguidores + seguindo + posts (ao menos aproximados)
- Bio atual (texto)
- Lista de destaques existentes

---

## Passo 3 — Analisar o perfil

Com os dados coletados, ler o checklist do nicho identificado e fazer a análise.

Para cada item do checklist, avaliar:
- **OK** — está bem
- **Atenção** — existe mas precisa de melhoria
- **Problema** — ausente ou feito de forma incorreta

Montar a lista de recomendações priorizando os pontos com maior impacto em conversão:
1. Problemas críticos que afetam diretamente leads (bio, link, CTA)
2. Ausência de prova social (depoimentos, antes/depois)
3. Deficiências de autoridade (certificações, presença humana)
4. Oportunidades de crescimento orgânico (Reels, Stories, frequência)
5. Métricas e acompanhamento

Gerar 6-9 recomendações, ordenadas por impacto. Cada uma com:
- Tag de categoria (ex: "Posicionamento", "Conversão", "Destaques")
- Título claro
- Explicação do problema atual, **citando o que existe hoje no perfil** (bio real, nome do destaque, número real de seguindo vs seguidores, etc.)
- Como corrigir, **com exemplos escritos para esse cliente específico** — não genéricos

**Regra de personalização obrigatória:**

O checklist é um guia, não um template a copiar. Cada recomendação precisa:

- **Bio**: mostrar a bio atual (exatamente como está) e a bio sugerida. Para loja de carro, seguir obrigatoriamente a estrutura de 4 linhas: (1) transformação — o que muda na vida da pessoa depois de comprar, não lista de produto; (2) diferenciais únicos da loja — o que ela tem que nenhuma outra tem, específico e real; (3) endereço com 📍; (4) CTA direto ("Fale no WhatsApp 👇"). Nunca usar "ótimo atendimento", "qualidade garantida" ou qualquer genérico que qualquer loja poderia copiar.
- **Link**: se não tem link, sugerir o link de WhatsApp já formatado com o número do cliente (se disponível nos arquivos da pasta)
- **Destaques**: listar os destaques que o cliente tem hoje e sugerir a estrutura ideal comparando com o que falta
- **Conteúdo**: citar exemplos de Reels ou posts que fariam sentido para o nicho e momento desse cliente (ex: "um Reel mostrando o [modelo de carro mais vendido deles]", não "um Reel de apresentação de veículo")
- **Ratio**: mostrar os números reais (ex: "2.646 seguindo · 1.725 seguidores") e o que isso comunica
- Qualquer dado que esteja nos arquivos da pasta do cliente deve aparecer nas recomendações — histórico de campanhas, público-alvo, diferenciais — não deixar isso de fora

O cliente precisa ler o diagnóstico e pensar "isso foi feito pra mim", não "isso é um relatório genérico".

---

## Passo 4 — Definir identidade visual do HTML

Por padrão, o HTML usa a identidade do **cliente**. A identidade da Assessoria Raiz só é usada se o usuário pedir explicitamente, ou se a análise indicar que as cores do cliente não vão funcionar bem (ver abaixo).

### Como definir as cores do cliente:

**Fonte 1 — Arquivos da pasta do cliente:**
Verificar se briefing.md ou contexto.md mencionam cores, paleta ou identidade visual da marca.

**Fonte 2 — O usuário informa:**
Perguntar: "Você sabe as cores da marca deles? (ex: azul e branco, vermelho e preto)"

**Fonte 3 — Inferir pelo nicho (fallback):**
Se nenhuma das fontes acima tiver a informação:

| Nicho | Esquema sugerido |
|-------|-----------------|
| Loja de carro (premium/luxo) | Dark charcoal `#1a1a1a` + branco `#f5f5f5` + acento vermelho `#c0392b` ou prata `#8e8e93` |
| Loja de carro (popular/acessível) | Azul escuro `#1a2744` + branco `#f5f5f5` + acento amarelo `#f5a623` |
| Estética / Beleza | Escuro quente `#1a1714` + creme `#faf7f3` + dourado/rose `#c9a77c` |
| Saúde / Clínica | Azul petróleo `#1a3444` + branco `#f8f8f8` + turquesa `#4aabb8` |
| Restaurante | Escuro `#1a1a14` + creme `#fdf8f0` + acento terracota `#c9674a` |

### Avaliar se as cores funcionam:

Antes de usar as cores do cliente, avaliar mentalmente se elas produzem um documento elegante e legível:
- Cores muito saturadas ou vibrantes (verde limão, laranja forte, roxo neon) dificilmente funcionam bem num documento escuro editorial
- Combinações de baixo contraste (claro sobre claro, escuro sobre escuro) comprometem a leitura
- Marcas com identidade muito simples (só preto e branco, ou sem cor definida) podem ficar sem personalidade

**Se as cores não funcionarem bem**, avisar antes de gerar:
> "Olhando as cores do cliente ([descrever o problema: ex: 'verde neon + fundo branco'] não vai ficar bonito nesse formato de documento). Quer que eu use a identidade da Assessoria Raiz no lugar?"

Se o usuário disser sim — ou se pedir isso explicitamente em qualquer momento — usar a paleta da Raiz (`marca/design-guide.md`):
- Fundo: `#1E3D34` (Verde Petróleo)
- Texto: `#F5F5F5` (Branco Gelo)
- Destaque: `#CBA135` (Dourado Suave)
- Cards: tom intermediário entre o verde e o preto

Definir pelo menos:
- `cor_fundo_dark` — cor de fundo principal (escura)
- `cor_fundo_mid` — cor de cards/blocos (um tom mais claro que o fundo)
- `cor_acento` — cor principal de destaque (links, números, tags)
- `cor_texto` — texto principal (geralmente creme ou branco suave)
- `cor_muted` — texto secundário (mais apagado)

---

## Passo 5 — Gerar o HTML

Gerar um HTML completo seguindo a estrutura e estilo de `Clientes/estetica-tiara/Entregaveis/diagnostico-instagram.html`.

**Estrutura obrigatória:**

### Hero
- Label: "Assessoria Raiz · Diagnóstico Digital"
- Título grande: "Sua [presença/identidade/perfil] digital, analisada."
- Subtítulo: "Uma análise completa do perfil @[handle] com recomendações concretas para [objetivo do nicho]."
- Handle do cliente e cidade

### Seção 01 — Situação Atual
- Cards com métricas: Posts publicados · Seguidores · Seguindo
- Cards de alerta para problemas mais graves (seguindo > seguidores, bio genérica, etc.)
- Tom direto, sem suavizar os problemas — o cliente precisa entender o que está errado

### Seção 02 — Recomendações
- Cards expandíveis (onclick toggle) com +/- para abrir/fechar
- Numerados (01, 02, 03...)
- Cada card: tag de categoria + título + corpo com análise e recomendação concreta
- **Obrigatório no card de Bio:** separar em dois blocos distintos — primeiro o **Título do Perfil** (nome + campo de nome, indexado na busca do Instagram) com `.title-compare` mostrando antes vs depois, depois a **Bio** (texto abaixo do nome). Para a bio, usar o formato em duas etapas:
  1. **Framework visual** (`.bio-framework`): 4 linhas numeradas explicando a estrutura — (01) Resultado/Transformação, (02) Diferencial único da loja, (03) Endereço, (04) Chamada para ação. Cada linha tem label, descrição do que escrever e um exemplo em itálico. Isso ensina o cliente a pensar na própria bio, não só copiar uma sugestão.
  2. **Template em branco** (`.bio-template`): rascunho com as 4 linhas marcadas por tag ("linha 01", "linha 02"...) e campos entre colchetes pra preencher, seguido da bio atual como referência de "como está hoje".
  - Referência de código e CSS: `Clientes/efatah-veiculos/Entregaveis/diagnostico-instagram-v2.html` (card 01).
- **Obrigatório no card de Link:** o link de WhatsApp já montado com o número do cliente, com botão "Copiar link" funcional ao lado (usar `navigator.clipboard.writeText`). O botão deve mudar o texto para "Copiado!" por 2 segundos.
- **Obrigatório no card de Destaques:** grid visual mostrando os destaques que existem hoje e os que estão faltando. Se algum destaque tiver nome truncado ou incompleto nos dados fornecidos, perguntar o nome completo antes de incluir no HTML.
- **Obrigatório no card de Seguidores/Seguindo:** mostrar os números reais em destaque, não abstratos
- Recomendações com sugestões de conteúdo devem citar exemplos específicos do negócio do cliente (produto real, serviço real, diferencial real) — nunca exemplos genéricos
- 6-9 cards no total

### Seção 03 — Plano de Implementação
- Roadmap no estilo da Tiara: linha vertical à esquerda com gradiente, ponto circular em cada etapa, período em letras pequenas com acento, título em fonte serif, lista com `→` nos bullets
- 3-4 etapas (Semana 1, Semana 2, Semana 3, Mês 2+)
- Semana 1 sempre com ações que não precisam de câmera/produção (ajustes de perfil)
- Referência de CSS do roadmap: ver `Clientes/estetica-tiara/Entregaveis/diagnostico-instagram.html` (seção `.roadmap`, `.rm-item`, `.rm-dot`, `.rm-tasks`)

### Footer
- "Assessoria Raiz"
- "Diagnóstico preparado para @[handle] · [Nome] · [Cidade]"

**Detalhes técnicos do HTML:**
- Fonte: Google Fonts (escolher par adequado ao nicho — ex: Cormorant Garamond + DM Sans para estética, ou Inter + Playfair Display para automotivo premium)
- Animações: fadeUp no hero, IntersectionObserver para reveal nas seções
- Cards de diagnóstico: expandíveis via JavaScript (toggle class `open`)
- **Bullets e marcadores de lista:** usar `→` como marcador. Nunca usar `—` (traço) em nenhuma parte do HTML — nem em bullets, nem em separadores de texto, nem em legendas. Se quiser separar, usar `·`
- Responsive: breakpoint em 640px
- Sem dependências externas além de Google Fonts

---

## Passo 6 — Salvar o arquivo

Salvar em: `Clientes/[slug]/Entregaveis/diagnostico-instagram.html`

Se a pasta `Entregaveis/` não existir, criar antes de salvar.

---

## Passo 7 — Publicar no Cloudflare Pages (opcional)

Após salvar o HTML, perguntar:
> "Quer que eu publique no Cloudflare pra você ter um link pra enviar pro cliente?"

**Projeto:** `assessoriaraiz` (já criado). URL base: `https://assessoriaraiz.pages.dev`

**Estrutura de URL:** `assessoriaraiz.pages.dev/[slug]/diagnostico`

Se sim, montar a pasta de deploy com a estrutura correta e publicar via PowerShell:

```powershell
$deploy = "$env:TEMP\assessoriaraiz-pages"

# Copiar todos os entregáveis existentes (pra não sobrescrever clientes anteriores)
# Depois adicionar o novo
New-Item -ItemType Directory -Force -Path "$deploy\[slug]" | Out-Null
Copy-Item "Clientes\[slug]\Entregaveis\diagnostico-instagram-v2.html" "$deploy\[slug]\diagnostico.html" -Force

$env:CLOUDFLARE_API_TOKEN = "..."  # ler do .env
$env:CLOUDFLARE_ACCOUNT_ID = "..."
npx wrangler pages deploy $deploy --project-name assessoriaraiz --commit-dirty=true
```

**Importante:** o deploy substitui todo o projeto. Sempre incluir os HTMLs de clientes anteriores na pasta de deploy pra não tirar do ar o que já está publicado. Consultar o histórico em `Clientes/*/Entregaveis/` pra saber o que já foi publicado.

O link gerado: `https://assessoriaraiz.pages.dev/[slug]/diagnostico`

Informar após o deploy:
> "Publicado. Link pra enviar pro cliente: https://assessoriaraiz.pages.dev/[slug]/diagnostico"

Depois do link, exibir a mensagem de envio já preenchida com o nome do cliente e o link, pronta pra copiar e mandar no grupo:

---
**Mensagem pra copiar e mandar no grupo do cliente:**

```
[Nome], passei no Instagram de vocês e vi algumas coisas que dá pra ajustar. Umas bem simples, que vocês conseguem fazer ainda essa semana sem precisar de câmera nem produção.

Montei um diagnóstico completo: bio, destaques, conteúdo, o que o perfil tá comunicando hoje e o que muda com cada ajuste.

Organizei tudo com análise e um plano semana a semana pra facilitar a implementação.

👉 [link]
```
---

Substituir `[Nome]` pelo primeiro nome do dono ou responsável pelo Instagram do cliente (ex: Ricardo, Adailton). Substituir `[link]` pela URL gerada no deploy.

Se o deploy falhar:
> "Deploy falhou. Verifique se `CLOUDFLARE_API_TOKEN` está no `.env` da raiz do projeto."

---

## Regras

- Nunca gerar o HTML sem ter pelo menos seguidores, seguindo, posts e bio
- A identidade visual é sempre do cliente — nunca usar as cores da Assessoria Raiz no HTML (a não ser que o usuário peça ou as cores do cliente não funcionem)
- **Tom:** como um amigo que entende do assunto falando com o dono da loja. Direto, mas nunca agressivo. Não bater no mesmo ponto várias vezes. Não usar comparações que diminuem o cliente (ex: "poderia ser uma loja de colchão"). O tom certo é: "olha o que eu encontrei e como a gente resolve"
- **Linguagem simples:** evitar jargão que o cliente não conhece. "Feed", "Reels", "Stories" são ok — todo mundo sabe o que é. "Follow-back", "ratio", "algoritmo", "CTR", "engagement" devem ser trocados por frases diretas. Ex: em vez de "ratio preocupante", escrever "você segue quase tanta gente quanto te segue — e isso tem um custo"
- **Escrita como pessoa falando:** o texto deve parecer que tem uma pessoa falando, não um relatório. Frases curtas, linguagem do dia a dia, sem formalidade excessiva. Referência de tom: o livro "Como Falar Bem e Ficar Rico"
- **Sem traços em nenhum lugar do HTML:** não usar `—` como bullet, separador ou elemento decorativo em texto. Usar `→` nos bullets de lista. Se precisar separar informações inline, usar `·`
- Se algum destaque tiver nome truncado, perguntar o nome completo antes de gerar
- Não inventar dados — se não tem a informação, perguntar
- Cada recomendação deve ter uma ação concreta, não só um diagnóstico vago
- Sempre gerar o roadmap no estilo Tiara (linha vertical + pontos)
- Ao adicionar novos checklists de nicho, salvar em `.claude/skills/diagnostico-instagram/checklist-[nicho].md`
