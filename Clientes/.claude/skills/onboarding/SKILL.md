---
name: onboarding
description: >
  Gera os materiais de onboarding de um novo cliente: slides visuais para a reunião de boas-vindas,
  roteiro de fala com perguntas adaptadas ao nicho, e apresentação estratégica em HTML.
  Cria pasta no Google Drive e prepara tudo automaticamente a partir do briefing do Lucas.
  Use quando o usuário chamar /onboarding [link-do-drive] ou pedir "prepara o onboarding do [cliente]".
---

# /onboarding — Onboarding de Novo Cliente

## Dependências

- **Fathom MCP:** para buscar transcrições das reuniões de triagem e proposta
- **Google Drive MCP:** para criar a pasta do cliente e copiar a planilha base
- **Playwright:** para capturar screenshot do Instagram e extrair cores
- **Arquivos de apoio (ler no início):**
  - `.claude/skills/onboarding/roteiro.md` — Guia 1 completo (texto de fala das Partes 1 e 2)
  - `.claude/skills/onboarding/prazos.md` — prazos operacionais da Raiz
  - `.claude/skills/onboarding/perguntas-automotivo.md` — perguntas padrão pra loja de carro
- **Referência visual:** `.claude/skills/onboarding/ref-prazos.png` — layout de referência para slide de prazos
- **Identidade da Raiz:** `marca/design-guide.md`
- **Referência de HTML (automotivo):** `Clientes/jetor-veiculos/Entregaveis/estrategia.html` — template canônico para nicho automotivo

---

## Passo 1 — Obter dados do cliente

Receber o nome do cliente via argumento: `/onboarding [nome do cliente]`

### Fonte primária: Fathom MCP

Buscar no Fathom as reuniões relacionadas ao cliente pelo nome. Procurar por duas calls:
- **Reunião de triagem** — primeiro contato, qualificação
- **Reunião de proposta** — apresentação e fechamento comercial

Para cada reunião encontrada, buscar a transcrição completa via Fathom MCP.

Extrair os dados necessários dos transcritos combinados. Se a informação não aparecer na transcrição, marcar como `[não mencionado]` e seguir — não bloquear o fluxo.

### Fallback 1: Gmail MCP

Buscar no Gmail (`mkt.matheusfaria@gmail.com`, conectado ao MCP) por e-mails do Fathom contendo o nome do cliente. Os e-mails de transcrição chegam encaminhados automaticamente de `assessoriaraizz@gmail.com` (conta da agência onde o Lucas grava as reuniões). O encaminhamento automático está configurado no Gmail da agência para todos os e-mails do domínio Fathom.

### Fallback 2: briefing manual

Se nem Fathom nem Gmail encontrarem, pedir ao usuário um link do Google Drive com o briefing criado pelo Lucas e ler via `mcp__claude_ai_Google_Drive__read_file_content`.

### Dados a extrair (de qualquer fonte):

| Campo | Onde encontrar |
|-------|---------------|
| `nome_empresa` | Título do briefing ou seção 1 |
| `nome_responsavel` | Seção 1 — Visão geral |
| `nicho` | Inferir: "automotivo" se mencionar carros/loja/multimarcas/concessionária; senão "novo" |
| `instagram` | Campo `Instagram:` |
| `cidade` | Campo `Cidade/Região:` |
| `ticket_medio` | Faixa de preço / ticket médio |
| `margem` | Margem por venda (R$ ou %) |
| `meta` | Meta de resultado do cliente |
| `investimento_midia` | Verba mensal em tráfego |
| `valor_gestao` | Mensalidade da assessoria |
| `dores` | Seção "Principais dores" |
| `diferenciais` | Seção "Diferenciais do negócio" |
| `prometido` | Seção "O que o comercial prometeu" |
| `prazo_contrato` | Duração do contrato negociado |
| `frase_marcante` | Frase forte dita pelo cliente (se houver) |

**Se `cidade` estiver ausente no briefing:**
Pausar e pedir ao usuário antes de continuar.

**Nota:** `instagram` continua sendo extraído do briefing para registrar no roteiro, mas **não é mais usado para definir paleta de cores**. Os slides usam sempre a identidade visual da Assessoria Raiz.

---

## Passo 2 — Gerar o onboard.md (briefing + perguntas)

O `onboard.md` **não contém mais o roteiro de fala** (Partes 1 e 2). O roteiro está nos slides e em `.claude/skills/onboarding/roteiro.md` como referência. O `onboard.md` é um documento operacional de onboarding com duas seções:

### Seção 1: Briefing do comercial

Redigir um briefing compacto com o que o Lucas apresentou e o que Matheus precisa saber antes de entrar na reunião. Estrutura:

**Quem é [nome do responsável]**
Resumo do negócio: segmento, tempo de mercado, estrutura da equipe, ticket médio, volume de vendas atual e meta.

**O que o Lucas apresentou**
Bullet list do que foi prometido/vendido explicitamente nas reuniões comerciais (ex: script de pré-venda, Pack Raiz, suporte CAJ, relatórios, GMN etc.). Só incluir o que realmente consta nas transcrições.

**O que o Matheus precisa saber antes do onboarding**
Pontos de atenção práticos: perfil do cliente, gargalos conhecidos, promessas específicas, sazonalidade, condições especiais de contrato, qualquer detalhe que afete como conduzir a reunião.

### Seção 2: Perguntas da Parte 3

Para as perguntas, verificar o nicho:

**Se automotivo:**
Ler `.claude/skills/onboarding/perguntas-automotivo.md` e usar as perguntas sem adaptar.

**Se nicho novo:**
Usar as categorias das perguntas automotivo como estrutura base e adaptar cada uma ao nicho identificado. Manter as mesmas categorias:
1. Quem é o cliente ideal (qualificado e desqualificado)
2. Produto/serviço com maior margem
3. Ticket médio
4. Margem por venda
5. Meta de resultado
6. Histórico com marketing/tráfego
7. Maior gargalo atual para vender mais
8. Equipe e estrutura interna
9. Responsável por redes sociais/conteúdo
10. Canal de vendas principal hoje
11. Investimento disponível para tráfego
12. Perfil do público-alvo (gênero, idade, localização)
13. Concorrentes ou referências que admira
14. O que espera da parceria e onde quer chegar

Adicionar anotações contextuais em cada pergunta quando houver informação prévia nas transcrições (ex: "Já sabemos: média de X/mês. Confirmar o melhor mês histórico.").

Salvar em **dois lugares**:

1. **Local:** `Clientes/[slug]/Entregaveis/onboard.md`
2. **Google Drive:** upload na pasta `Onboarding` do cliente via `mcp__claude_ai_Google_Drive__create_file`:
   - `contentMimeType: text/plain` (SEM `disableConversionToGoogleType`) → converte automaticamente para Google Docs
   - `title: "Onboarding — [Nome Empresa]"`
   - `parentId`: ID da subpasta Onboarding do cliente

---

## Passo 3 — Gerar slides de apresentação (HTML)

**Padrão atual: deck em HTML** (substituiu o PPTX — mais leve, mais rápido de gerar, sem dependências quebráveis, e abre direto no navegador sem precisar de PowerPoint).

Os slides usam **sempre a identidade visual da Assessoria Raiz** — nunca cores do cliente.

**Paleta fixa:**
- Fundo: `#1E3D34` (Verde Petróleo)
- Texto: `#F5F5F5` (Branco Gelo)
- Destaque: `#CBA135` (Dourado Suave)
- Cards: `#254337` com borda `#356050`
- Slide 17 (transição): fundo `#CBA135` com texto `#1E3D34`

**Geração via script Node (sem dependências externas):**

O script template está em `dados/gerar_slides_onboarding_html.js`. Para cada novo cliente:
1. Copiar o script
2. Atualizar no topo: `NOME_EMPRESA`, `NOME_RESPONSAVEL`, `CIDADE`, `NICHO`
3. Atualizar o caminho de saída (`OUT`) para `clientes/[slug]/Entregaveis/onboard-slides.html`
4. Executar: `node dados/gerar_slides_onboarding_html.js`

**Output:** `clientes/[slug]/Entregaveis/onboard-slides.html` — deck autocontido (HTML+CSS+JS num arquivo só), 17 slides em formato 16:9, navegação por setas do teclado ou botões prev/next, identidade Raiz. Abre em qualquer navegador, inclusive em apresentação de tela cheia (F11).

**Upload para Drive:** subir o `.html` pra pasta `Onboarding` do cliente via `mcp__claude_ai_Google_Drive__create_file` com `contentMimeType: text/html` e `disableConversionToGoogleType: true` (não converter — o Drive não tem equivalente nativo pra apresentação HTML, então mantém o arquivo navegável como está).

**Nota sobre tipografia:** o guia de marca recomenda a fonte Agatho, mas os arquivos `.otf` são pesados (~1.5MB cada) pra embutir num deliverable HTML portátil. O deck usa Fraunces (títulos) + Inter (corpo) via Google Fonts — combinação editorial que mantém o tom sóbrio da marca sem inflar o arquivo.

**Histórico:** a versão antiga via PptxGenJS (`dados/gerar_slides_onboarding.js`) ainda existe no repo, mas não é mais o padrão — tinha problema de dependência quebrada (`pako`/`jszip`) e gerava arquivo pesado pra subir no Drive.

**Estrutura dos 17 slides (conteúdo fixo — adaptar apenas nome e cidade no Slide 1):**
1. Abertura. "Hoje a gente define as regras do jogo" + nome do responsável
2. Como funciona essa reunião. Slide só de apoio visual (mostra as 3 partes na tela: acesso/parceria, onde a maioria erra, perguntas do negócio); o presenter explica com as próprias palavras, sem script fixo
3. CAJ. ☕ Café · 🍽️ Almoço · 🌙 Janta
4. O grupo do WhatsApp (onde tudo mora, parte 1: print real do grupo, link da pasta do Drive fixado; nicho automotivo também menciona o link do Pack Raiz)
5. A pasta do Drive (onde tudo mora, parte 2: slide com o print real da pasta em destaque, sozinho e grande, sem texto ao lado)
6. Como você acompanha tudo (relatórios semanal + mensal, com nota pra mostrar um modelo real na tela ao vivo)
7. Além das campanhas (GMN, incluindo nota de manutenção mensal da ficha + direcionamento de redes)
8. Erro 1. Começar sem método (GPS: Embarque, Estrada, Ajuste de rota, em 3 fases)
9. Erro 2. Focar só na ferramenta (4 peças: oferta, criativo, atendimento, tráfego)
10. 50% do resultado (slide visual de estatística: "50% dos resultados de venda estão relacionados ao Criativo")
11. Metade vem do criativo (3 blocos com ícones estilo Instagram: aparecer nos Stories, produzir com frequência, "gravar novos anúncios coloca mais dinheiro no seu bolso", com a frase exata do mentor)
12. A outra metade: oferta e comercial (oferta clara + sistema de vendas, com ícones de etiqueta de preço e fachada de loja)
13. Erro 3. Querer resultado do dia pra noite (a criança + roadmap de 3 meses: 1º planejamento/estruturação, 2º testes/validação, 3º escala/metas)
14. Erro 4. Achar que depende só do gestor (piloto e torre, compactado em 3 blocos: caminho livre pra operação rodar, material quando a gente pedir, conduzir bem a venda e contar o resultado)
15. Prazos. Alterações pontuais (1 dia útil) / estratégia, roteiro ou campanha nova (7 dias úteis) / campanhas sazonais (30 dias corridos de antecedência) — ler `.claude/skills/onboarding/prazos.md` pra tabela completa com exemplos
16. Próximos passos (linha do tempo visual com ícones: assinatura do contrato, reunião de onboarding, configuração dos acessos, reunião estratégica, Largada 🏁 em até 3 dias úteis depois da estratégica)
17. Transição. "Agora vamos falar do seu negócio" (fundo dourado)

---

## Passo 4 — Criar pasta no Google Drive

**Antes de criar qualquer pasta, verificar se já existe uma com o nome do cliente.**

Buscar via `mcp__claude_ai_Google_Drive__search_files` com query:
```
name = "[Nome Empresa]" and mimeType = "application/vnd.google-apps.folder" and trashed = false
```

**Se encontrar pasta existente:**
- Usar o `id` da pasta encontrada como pasta raiz
- Informar ao usuário: "Encontrei uma pasta existente do [Nome Empresa] no Drive. Vou usar ela e criar só as subpastas que faltam."
- Para cada subpasta da lista abaixo, verificar se já existe dentro da pasta raiz antes de criar:
  ```
  name = "[nome da subpasta]" and "[id_pasta_raiz]" in parents and mimeType = "application/vnd.google-apps.folder" and trashed = false
  ```
  Só criar as que não existirem.

**Se não encontrar pasta existente:**
- Criar pasta raiz: `[Nome Empresa]` com `mimeType: application/vnd.google-apps.folder`
- Criar todas as subpastas abaixo.

**Subpastas obrigatórias (criar as que não existirem):**
1. `Comprovantes`
2. `Contrato`
3. `Depósito de Criativos`
4. `Gravação de Reuniões`
5. `Lista de Clientes`
6. `Notas Fiscais`
7. `Onboarding`
8. `Plano de Ação`
9. `Banco de Referências`
10. `Treinamento Comercial`

Usar `mcp__claude_ai_Google_Drive__create_file` com `contentMimeType: application/vnd.google-apps.folder`.

**Planilha base:** verificar se já existe planilha com nome `[Nome Empresa] - Planilhamento de dados` na pasta raiz antes de copiar. Se não existir, copiar via `mcp__claude_ai_Google_Drive__copy_file`:
- ID do template: `1pDzKQbkeRgbwD3vMx7E8IlAL3cYh5PmiOjWaNj_DiUY`
- Renomear para: `[Nome Empresa] - Planilhamento de dados`
- Mover para a pasta raiz do cliente

Informar o link da pasta raiz ao usuário.

---

## Passo 5 — Estratégia (`estrategia.html`)

**Antes de gerar qualquer coisa, perguntar ao Matheus:**

> "Antes de montar a estratégia, preciso alinhar dois pontos com você:
>
> **1. Distribuição da verba:** como você quer dividir os R$ [investimento_trafego]/mês? (ex: 70% formulário / 20% mensagem / 10% seguidores, ou 100% mensagem, ou outro formato)
>
> **2. CPL estimado:** qual custo por lead você quer usar no funil? (ex: R$15 conservador, R$10 se tiver referência anterior, etc.)"

Só seguir para geração depois de ter as respostas. Nunca usar a distribuição 70/20/10 como padrão automático — cada cliente tem contexto diferente (verba, maturidade, nicho dentro do automotivo).

**Se automotivo:**

Gerar `Clientes/[slug]/Entregaveis/estrategia.html` seguindo o template abaixo. O HTML é uma página scrollável (não slides), com identidade visual da Raiz e dados do cliente preenchidos.

### Design base

- Fundo: `#1E3D34` (Verde Petróleo)
- Texto: `#F5F5F5` (Branco Gelo)
- Destaque: `#CBA135` (Dourado Suave)
- Card: `#254337`, borda `#356050`
- Fontes: Fraunces (títulos) + Inter (corpo) via Google Fonts
- Formato: `max-width: 680px`, centralizado, sem header com nome do cliente

### Seções fixas (nessa ordem)

**Seção 1 — PCZ: Publicidade a Custo Zero** `[TODOS OS NICHOS]`

Apresentar a lógica de que 1 venda cobre o investimento inteiro. Estrutura:

```
Tráfego: R$ [investimento_trafego]/mês
Gestão:  R$ [valor_gestao]/mês
─────────────────────────────────────
Total:   R$ [soma] vs R$ [ticket × margem]  →  1 venda cobre tudo
```

Calcular: `vendas_necessarias = total_investimento ÷ (ticket_medio × margem_pct)`

Se `vendas_necessarias < 1` ou `≈ 1`, usar a frase "1 venda cobre tudo" como destaque.
Mostrar o quanto sobra: `R$ [ticket × margem - total_investimento] de margem livre`.

**Seção 2 — Distribuição das campanhas** `[AUTOMOTIVO — padrão 70/20/10, adaptar por nicho]`

3 cards lado a lado:
- Formulários: 70% — R$ [0.70 × investimento_trafego]/mês
- Mensagem: 20% — R$ [0.20 × investimento_trafego]/mês
- Seguidores: 10% — R$ [0.10 × investimento_trafego]/mês

Nota abaixo: "Formulários são a alavanca principal — geram o maior volume de leads qualificados."

**Seção 3 — Funil de resultados esperados (visual em cascata)** `[TODOS OS NICHOS — benchmarks variam por nicho]`

5 barras horizontais com larguras decrescentes usando CSS `width: var(--w)`:

| Barra | --w | Ícone | Conteúdo |
|-------|-----|-------|---------|
| 1 | 100% | 💰 | R$ [investimento_leads] investidos em leads |
| 2 | 87% | 🎯 | CPL R$15 (benchmark conservador) |
| 3 | 72% | 📋 | ~[contatos] contatos |
| 4 | 55% | 🚗 | ~[visitas] visitas na loja (15%) |
| 5 | 38% | ✅ | ~[vendas] vendas (2%) — destaque dourado |

Fórmulas de cálculo:
- `investimento_leads = investimento_trafego × 0.90` (descontando % de seguidores)
- `contatos = round(investimento_leads ÷ 15)`
- `visitas = round(contatos × 0.15)`
- `vendas = round(contatos × 0.02)`

Nota abaixo do funil: "Média real dos nossos clientes automotivos está em R$9/lead. Usamos R$15 pra garantir uma estimativa conservadora."

**Seção 4 — Criativos (o que preparar antes de começar)** `[EXCLUSIVO AUTOMOTIVO]`

Grid de fotos de carros (layout 3×3, célula principal ocupa 2×2) + story lateral.

Imagens de referência (usar até receber fotos reais do cliente):
- Pasta: `dados/Onboarding Vanesmar/Carrossel/`
- Path relativo a partir de `Entregaveis/`: `../../../dados/Onboarding%20Vanesmar/Carrossel/`
- Principal: `IMG_8892.PNG`
- Células 2-6: usar as 5 fotos `SnapInsta.to_*.jpg` / `snapinsta.com.br-*.jpg` da pasta
- Story: `ref-story.png`

CSS do grid:
```css
.mc-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 3px;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1;
  width: 100%;
}
.mc-foto { overflow: hidden; min-height: 0; min-width: 0; }
.mc-foto img { width: 100%; height: 100%; object-fit: cover; display: block; }
.mc-foto.principal { grid-column: 1 / span 2; grid-row: 1 / span 2; }
```

Lista ao lado do grid:
- Fotos e vídeos apresentando os carros
- Lista do estoque enviada antes de começar
- Avisar no grupo quando um carro sair ou entrar no estoque
- Vídeo de apresentação da loja **só se houver campanha de seguidores no mix**

**Seção 5 — O que acompanhar** `[TODOS OS NICHOS — métricas mudam por nicho]`

Apenas 2 métricas — não listar CPM, CTR ou outras métricas de plataforma:
- Vendas vindas do tráfego pago
- Qualidade dos leads (nota no relatório mensal)

**Seção 6 — Próximos passos (timeline vertical)** `[TODOS OS NICHOS — datas e treinamento adaptáveis]`

5 etapas com ícones e datas reais:
1. Reunião estratégica (data da reunião)
2. Treinamento de pré-venda com Lucas (data acordada): "Estruturação de processo de pré-vendas para agendar mais visitas na loja."
3. Campanhas no ar (3 dias úteis após a estratégica)
4. Relatório de 7 dias
5. Diagnóstico do Instagram (15 dias após campanhas no ar)

### O que varia por cliente

| Campo | Padrão automotivo | Adaptar para |
|-------|-------------------|-------------|
| `investimento_trafego` | — | valor real do contrato |
| `valor_gestao` | — | mensalidade negociada |
| `ticket_medio` | — | faixa de preço dos veículos |
| `margem_pct` | — | margem por venda (ex: 0.05 = 5%) |
| Distribuição da verba | **perguntar ao Matheus antes de gerar** | nunca assumir 70/20/10 automaticamente |
| Fotos do grid | referência Vanesmar | substituir por fotos reais do estoque |
| Datas dos próximos passos | — | datas reais acordadas na estratégica |

### Regra de estilo

Sem travessão (—) em nenhum texto do HTML. Separadores: vírgula, ponto, dois-pontos ou `·`.

Output: `Clientes/[slug]/Entregaveis/estrategia.html`

**Antes de marcar como pronto — revisão obrigatória via /falar-bem:**

Depois de gerar o HTML, revisar o arquivo com os critérios abaixo antes de informar ao Matheus que está pronto. O cliente final vai ler esse documento — ele precisa entender tudo sem depender do Matheus para traduzir:

- `budget` → `verba` ou `investimento`
- `lead` / `leads` → `contato` / `contatos` (quando referência a pessoa que chegou via anúncio)
- `CPL` → `custo por contato`
- `benchmark` / `benchmarks` → `resultado` / `resultados`
- `algoritmo` → `campanhas` ou "o sistema"
- `Click-to-WhatsApp` → remover o termo técnico, descrever o que faz ("o anúncio leva direto pra uma conversa no WhatsApp")
- `CTR`, `CPM`, `ROAS`, `CPC` e outras siglas de plataforma → remover ou traduzir em linguagem de negócio
- Travessão (—) → vírgula, ponto ou dois-pontos
- `WhatsApp Business` → `WhatsApp` (a versão "Business" é detalhe operacional, não precisa aparecer no slide de estratégia)

Só avisar "tá pronto" depois de passar por esses pontos.

**Se nicho novo — modo colaborativo:**

Iniciar com:

> "Slides e roteiro prontos. Agora vamos montar a estratégia para [nome do cliente] juntos.
>
> Preciso do teu olhar antes de gerar o HTML. Três perguntas:
>
> **1.** Você já pesquisou algo sobre o nicho [nicho]? Tem algum case no Circle do Subido Pro que se aplica aqui?
>
> **2.** Olhando as dores do cliente — [listar 2-3 dores principais do briefing] — qual você acha que é o ponto de entrada mais forte para a primeira campanha?
>
> **3.** Como você enxerga a divisão de verba entre as campanhas? (ex: % conversão, % conteúdo, % remarketing)"

Fazer uma pergunta por vez se o usuário parecer sobrecarregado.

Após alinhar a estratégia, gerar `estrategia.html` no mesmo estilo de `D:\DOWNLOAD\estrategia_thiara_4.html`, com:
- Cores do cliente (`cor_primaria`, `cor_secundaria`, `cor_acento`)
- Dados reais do briefing preenchidos nos cards
- PCZ calculado com os números reais: `investimento_total ÷ (ticket × margem) = vendas para cobrir`
- **Funil de expectativa de leads** (camada que antecede o PCZ): `investimento ÷ CPL médio de mercado do nicho = leads estimados`, e a partir disso o teto realista de vendas — alinha desde o início que "gerar mais que isso é matematicamente difícil com essa verba", evitando expectativa fora da curva
- Campanhas com percentuais de verba alinhados
- Seção de prazos (ler `.claude/skills/onboarding/prazos.md`)
- Seção "Próximos passos" com linha do tempo
- Assinatura: Assessoria Raiz

---

## Output final

```
clientes/[slug]/
  Entregaveis/
    onboard.md              ← cópia local do roteiro
    onboard-slides.html     ← deck de slides

Google Drive — [Nome Empresa]/
  Comprovantes/
  Contrato/
  Depósito de Criativos/
  Gravação de Reuniões/
  Lista de Clientes/
  Notas Fiscais/
  Onboarding/
    Roteiro de Onboarding — [Nome Empresa]  ← Google Docs (formatado, upload automático)
    onboard-slides.html                     ← deck HTML (upload mantendo formato, sem conversão)
  Plano de Ação/
  Banco de Referências/
  Treinamento Comercial/
  [Nome Empresa] - Planilhamento de dados   ← cópia do template
```

`estrategia.html` é gerado em etapa separada: automotivo segue o template documentado no Passo 5 | nicho novo: após alinhamento colaborativo com o Matheus.

---

## Regras

- **Nunca usar travessão (—) em nenhum texto, slide, roteiro ou pergunta gerada por essa skill.** Trocar por vírgula, ponto, dois pontos, parênteses ou "·" (caso seja separador estrutural, como em marcadores de slide ou títulos de seção). Regra de estilo da Raiz (`_contexto/preferencias.md`), reforçada aqui porque o roteiro é lido em voz alta na reunião e o traço quebra o ritmo da fala
- **Nunca gerar `estrategia.html` antes da reunião de onboarding acontecer.** O Passo 5 só executa depois que o Matheus mandar a transcrição do onboarding. O fluxo correto é: onboard.md + slides (antes da reunião) → reunião acontece → Matheus envia transcrição → aí sim gera a estrategia.html
- Nunca gerar `estrategia.html` sem ter alinhado a estratégia primeiro (nicho novo)
- **Slides sempre com identidade Raiz** — nunca extrair cores do cliente para os slides de onboarding
- Se faltar `Cidade/Região:` no briefing, pausar e pedir antes de continuar
- Criar `clientes/[slug]/` (e `clientes/[slug]/Entregaveis/`) se a pasta ainda não existir
- **Outputs locais do onboarding (`onboard.md`, `onboard-slides.html`, `estrategia.html`) vão sempre em `clientes/[slug]/Entregaveis/`** — nunca soltos na raiz da pasta do cliente, que fica reservada pra `briefing.md`, `contexto.md`, `onboarding.md` e `feedback.md`
- Slug: nome em minúsculas com hífens (ex: "Cipriani Multimarcas" → `cipriani-multimarcas`)
- Não inventar dados que não estão no briefing — se falta informação, perguntar
- Slides de onboarding usam sempre identidade Raiz — nunca cores do cliente
- Script de geração fica em `dados/gerar_slides_onboarding_html.js` — adaptar nome/cidade/responsável por cliente e gerar `clientes/[slug]/Entregaveis/onboard-slides.html`
- Após gerar o HTML: fazer upload pra subpasta Onboarding do Drive com `contentMimeType: text/html` e `disableConversionToGoogleType: true`
