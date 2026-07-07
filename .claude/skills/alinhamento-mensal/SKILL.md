---
name: alinhamento-mensal
description: >
  Gera a apresentação de alinhamento mensal de um cliente em HTML — 9 slides com copy humanizada
  (Método Bezos + Gallo) e sugestão de fala por slide. Substitui o processo manual de copiar e colar no Canva.
  Use quando o usuário pedir "faz o alinhamento do [cliente]", "apresentação do mês de [cliente]",
  "gera os slides do [cliente]", "reunião mensal do [cliente]".
---

# /alinhamento-mensal — Apresentação Mensal de Resultado

## Dependências

- **Identidade visual:** `marca/design-guide.md`
- **Contexto do cliente:** `clientes/[nome-cliente]/contexto.md` (se existir)
- **Playwright:** para renderizar os slides em PNG

---

## Passo 1 — Identificar o cliente

Perguntar: "Qual cliente é esse alinhamento?"

Com o nome, verificar se existe `clientes/[nome-cliente]/contexto.md`.

- **Se existir:** ler o arquivo pra carregar histórico, métricas anteriores, tom do cliente e analogias que já funcionaram
- **Se não existir:** avisar que vai criar o contexto após gerar a apresentação

---

## Passo 2 — Coletar os dados do mês

Pedir ao usuário que cole os dados do mês no formato que tiver (tabela, texto, emojis — qualquer formato funciona).

Se disponível, também pedir dados dos meses anteriores para comparação. Sem comparação, o slide de evolução histórica fica limitado — avisar se não tiver.

**Métricas padrão monitoradas:**

| Métrica | O que significa |
|---------|----------------|
| Leads totais | Volume de oportunidades geradas |
| Vendas | Conversões confirmadas |
| Faturamento | Receita atribuída às campanhas |
| Investimento | Verba aplicada em mídia |
| ROAS | Retorno sobre investimento (faturamento ÷ investimento) |
| Taxa de Conversão | % de leads que viraram venda |
| Leads por Venda | Quantos leads precisa para fechar 1 venda |
| CAC | Custo de Aquisição de Cliente (investimento ÷ vendas) |

Nem todo cliente tem todas as métricas — adaptar os slides ao que foi fornecido.

---

## Passo 3 — Definir a linha mestra antes de escrever qualquer slide

Antes de escrever qualquer palavra dos slides, responder as 4 perguntas abaixo. Isso funciona como um filtro: qualquer frase que não se conecte com essas respostas, sai.

**1. Linha mestra do mês** (até 15 palavras, provocante):
Resume a história do mês em uma frase que funciona como estrada — você pode ir pra direita ou esquerda, mas o destino final fica claro. Exemplo: *"Gastamos menos, geramos mais, e agora sabemos exatamente o que fazer."*

**2. O que o cliente deve SABER ao final?**
O fato mais importante do mês — o número ou mudança que define o quadro.

**3. O que o cliente deve SENTIR ao final?**
Confiança no trabalho? Urgência pra agir? Alívio de que está no caminho certo?

**4. O que o cliente deve FAZER ao final?**
A decisão ou ação concreta que precisa sair da reunião.

Apresentar essas 4 respostas no chat antes de gerar qualquer slide. Elas guiam toda a copy.

---

## Passo 4 — Gerar a copy (texto de cada slide)

Aplicar as regras de narrativa antes de escrever qualquer slide:

**Hierarquia obrigatória em toda apresentação:**
1. O que aconteceu (fato)
2. Por que aconteceu (causa)
3. O que isso significa (interpretação)
4. O que fazemos agora (direção)

**Humanização de números (obrigatório):**
- ROAS 39x → "cada R$1 investido voltou R$39"
- Leads por venda 2 → "bastaram 2 pessoas para fechar 1 venda"
- CAC R$61 → "cada novo cliente custou R$61"
- Sempre comparar com o mês anterior — número isolado não conta história

**Método Gallo no Slide 2 (obrigatório):**
- Tópico frasal: a história do mês em até 30 palavras
- Exatamente 3 mensagens de apoio
- 1 elemento que dá vida a cada ponto (dado humanizado, analogia ou história curta)
- Se o elemento for uma história curta: estruturar com quem, o quê, onde, quando, por quê (Cap 17) — só o essencial, excesso de detalhe é pior que detalhe nenhum
- **Antes de criar uma analogia ou história nova:** consultar `comunicacao/historias.md` — se houver uma entrada que encaixe no contexto do mês e do cliente, reusar (atualizar "Última vez usada"). Se criar uma nova que funcionar bem, adicionar automaticamente na tabela ao final da skill (junto do Passo 8), sem perguntar

**Metáforas (A é B) — usar quando o dado é técnico demais:**
- Exemplo: "O marketing virou uma máquina de trazer clientes até a porta. Agora precisamos melhorar o atendimento dentro da loja."
- Consultar o contexto do cliente pra ver se tem analogias que já funcionaram com ele

**Tom:** analista sênior que fala como parceiro de negócio, não como fornecedor de relatório. Direto, claro, sem jargão. Quando o mês foi ruim — não esconde, contextualiza e aponta o caminho.

---

### Regras anti-prolixidade para as falas sugeridas (obrigatório)

Baseadas no capítulo "A arte de dizer mais com menos" (Giovanni Begossi):

**Comece pelo mais importante.**
O número ou insight principal vem na primeira frase. Contexto e explicação só se necessário depois. Nunca construa a narrativa antes de revelar o ponto.

**Sem repetição desnecessária.**
Se um argumento já foi dito num slide anterior, não repita no seguinte. Cada slide carrega uma informação nova. A única exceção é a anáfora intencional — repetir uma expressão para dar ritmo e emoção.

**Máximo 3 pontos por slide (regra dos três).**
Se a fala sugerida tiver mais de 3 ideias, cortar até sobrarem as 3 mais fortes. O cliente retém tríades, não listas.

**Linguagem de sinalização nas transições.**
Ao passar de um slide pro outro, a fala sugerida deve anunciar o próximo ponto de forma natural: *"e agora que vimos o volume, vamos entender o retorno..."*. O cliente nunca deve se perguntar onde está na apresentação.

**Teste do elevador para cada fala.**
Antes de aprovar uma fala sugerida, imaginar que a conversa vai ser cortada no meio. O que o cliente vai lembrar? Se a parte mais importante estiver no final da fala, reordenar — o essencial vem primeiro.

**Meta de tempo por slide:** até 2 minutos de fala. Se a fala sugerida passar disso quando lida em voz alta, está prolixo — cortar.

**Uma ideia por slide (Cap 15 — canal visual).** O slide é para o cliente ler, não cola para quem apresenta. Slide cheio de texto força o cliente a escolher entre ouvir e ler — ele perde os dois. Cada slide carrega uma frase, um número ou uma imagem central. Detalhe e explicação ficam na fala sugerida, não no slide.

### Estrutura dos 6 slides

Cada slide tem um papel único — sem sobreposição. Resultado, causa e direção entram juntos onde fazem sentido, não em slides separados.

**SLIDE 1 — CAPA**
- Título dourado: "Alinhamento de [Mês]"
- Nome do cliente
- Subtítulo: "Resultados de [Mês Referência] + Direção Estratégica"
- Fala sugerida: abertura curta que cria expectativa sem revelar o resultado

**SLIDE 2 — ABERTURA (Método Gallo)**
- Título dourado: tópico frasal — a linha mestra do mês em 1 frase (conectada ao que foi definido no Passo 3)
- 3 bullets: os 3 fatos mais importantes do mês
- Tarja dourada: o contraste ou virada do mês
- Fala sugerida: gancho que conecta com o mês anterior — começa pelo mais importante

**SLIDE 3 — OS 3 NÚMEROS DO MÊS**
- Título dourado: síntese do resultado
- Métricas: as 3 métricas mais relevantes do mês com comparação (mês anterior → atual) — escolher as que contam a história, não todas disponíveis
- Dentro de cada métrica: 1 linha de contexto explicando o porquê (causa integrada ao número, não num slide separado)
- Tarja dourada: humanização do número mais impactante ou metáfora (A é B) quando o dado for técnico
- Fala sugerida: leitura dos 3 números em sequência — do mais importante ao menos importante

**SLIDE 4 — EVOLUÇÃO HISTÓRICA**
- Título dourado: a jornada do projeto
- Conteúdo: linha do tempo com os meses anteriores — fase e número principal de cada período
- Tarja dourada: síntese da direção ("estamos no mês X, e o padrão mostra Y")
- Fala sugerida: narrativa de progresso — onde estava, onde está, onde vai
- Se não houver histórico suficiente: substituir por um slide de contexto do mercado ou omitir e ir direto pro slide 5

**SLIDE 5 — PRÓXIMO MÊS**
- Título dourado: o que fazemos agora
- 3 ações: priorizadas e diretas — máximo 3, sem lista longa
- Tarja dourada: lógica da decisão em 1 frase ("com ROAS de X, fazer Y faz sentido")
- Fala sugerida: justificativa das 3 ações com base nos dados do slide anterior — sem repetir os números, só referenciar

**SLIDE 6 — FECHAMENTO**
- Título dourado: síntese do mês
- 3 destaques com números (não 4 — regra dos três)
- Tarja dourada: frase de encerramento orientada ao futuro
- Fala sugerida: fechamento que convida para próximos passos e abre espaço para perguntas

---

## Passo 5 — Mostrar a copy antes de gerar o HTML

Apresentar o texto de todos os 9 slides + falas sugeridas no chat.

**CHECKPOINT:** Esperar aprovação ou ajustes antes de gerar o HTML. Se pedir pra mudar um slide, ajustar só aquele.

---

## Passo 6 — Gerar o HTML da apresentação

Criar **um único arquivo HTML** com os 6 slides e navegação embutida. Nunca criar um arquivo por slide.

**Estrutura do HTML:**
- Cada slide é uma `div.slide` — apenas o slide ativo tem `display:flex`, os demais `display:none`
- JavaScript com `show(n)` controla qual slide está visível
- Escala responsiva via `transform: scale()` para adaptar ao tamanho da tela
- Navegação: → / Espaço / clique = próximo | ← = anterior | F = tela cheia
- Contador de slides visível (ex: "3 / 6")

**Paleta obrigatória:**
- Fundo: Verde Petróleo `#1E3D34`
- Títulos (DOURADO): `#CBA135`
- Texto principal: Branco Gelo `#F5F5F5`
- Tarja dourada: `border-left: 6px solid #CBA135` com `background: rgba(203,161,53,.12)`

**Tipografia:** Georgia, 'Times New Roman', serif — não usar Agatho (não suporta acentos do português)
- Títulos: 58-64px bold
- Corpo: 32-38px
- Métricas em destaque: 68-120px bold

**Elementos fixos em todos os slides:**
- Logo: `../../../../marca/logo-bege-fundo-verde.png` — 120px, canto inferior direito
- Número do slide: canto inferior esquerdo, cor `#CBA135`

**Arquivo de notas separado:** criar `notas.html` na mesma pasta — mostra título + fala sugerida de cada slide em sequência, para abrir na segunda tela.

**Nomenclatura dos arquivos:**
- Alinhamento mensal padrão: `YYYY-MM-alinhamento.html`
- Reunião com tema específico: `YYYY-MM-DD-[tema].html` (ex: `2026-05-13-retencao.html`)
- O arquivo de notas segue o mesmo nome com sufixo `-notas.html`

Salvar em `clientes/[nome-cliente]/relatorios/[YYYY-MM]/`

---

## Passo 7 — Confirmar entrega

Não é necessário renderizar com Playwright — o HTML já funciona como apresentação diretamente no navegador.

Informar ao usuário:
- Abrir `[nome].html` no navegador para apresentar
- Abrir `[nome]-notas.html` na segunda tela para ver as falas sugeridas
- Teclas: → ou Espaço = avançar | ← = voltar | F = tela cheia

---

## Passo 8 — Atualizar o contexto do cliente

Após a apresentação aprovada, atualizar ou criar `clientes/[nome-cliente]/contexto.md` com:
- Métricas do mês gerado
- Fase do projeto (mês N)
- Analogias ou metáforas que foram usadas
- Qualquer observação específica do cliente

---

## Output final

```
clientes/[nome-cliente]/relatorios/[YYYY-MM]/
  YYYY-MM-alinhamento.html       ← apresentação completa (abre no navegador)
  YYYY-MM-alinhamento-notas.html ← falas sugeridas (segunda tela)

  # Reunião com tema específico:
  YYYY-MM-DD-[tema].html
  YYYY-MM-DD-[tema]-notas.html
```

---

## Regras

- Nunca gerar o HTML sem aprovação da copy primeiro
- Sempre renderizar o slide 1 antes de renderizar todos
- Se não tiver dados de meses anteriores, omitir comparações e adaptar os slides — nunca inventar números
- Humanizar todos os números — nunca apresentar métrica crua sem explicação
- Se o mês foi ruim, não esconder: contextualizar e apontar direção
- Consultar contexto do cliente antes de escrever — tom e analogias variam por cliente
