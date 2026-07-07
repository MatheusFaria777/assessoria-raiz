---
name: roteiro-post
description: >
  Transforma uma ideia, texto, link ou arquivo em roteiro de post para redes sociais,
  vídeo curto, thread ou newsletter. Calibra o formato e o tom ao canal pedido.
  Use quando o usuário pedir "faz um roteiro", "transforma isso num post",
  "escreve um roteiro de vídeo", "cria uma thread", "faz uma newsletter sobre isso".
---

# /roteiro-post — Roteiro de Conteúdo

## Dependências

- **Contexto do negócio:** `_contexto/empresa.md`
- **Tom de voz:** `_contexto/preferencias.md`
- **Referência de estilo:** `conteudo/referencias/referencia-mentora.md` — estrutura narrativa, padrão de abertura e tom base
- **Tons disponíveis:** `.claude/skills/pesquisar-tema/references/tons-de-voz.md` — usar quando o briefing vier com tom definido pelo /pesquisar-tema

---

## Workflow

### Passo 1 — Entender o pedido

Identificar:
1. **O conteúdo fonte:** ideia, link, texto, arquivo, transcrição, briefing do /pesquisar-tema ou assunto livre
2. **O formato de saída:** post Instagram, vídeo curto (Reels/TikTok), thread X/LinkedIn, newsletter, roteiro de YouTube
3. **O tom de voz:** se vier briefing do /pesquisar-tema com driver emocional e tom definidos, respeitar. Se não, perguntar ou inferir do contexto

Se não estiver claro o formato, perguntar: "Pra qual formato é esse roteiro? (post, vídeo curto, thread, newsletter, YouTube)"

Se for um link, usar WebFetch para buscar o conteúdo. Se retornar pouco, usar `https://r.jina.ai/{URL}`.

### Passo 2 — Ler o contexto

Ler `_contexto/empresa.md` e `_contexto/preferencias.md` pra calibrar:
- Tom (informal/formal, gíria ou não, etc)
- Público (quem lê/assiste)
- Posicionamento (o que a marca defende)

Se vier briefing do /pesquisar-tema, usar o driver emocional e tom como direção central.

### Passo 3 — Escrever o roteiro

---

**Post (Instagram/LinkedIn):**
- Hook nas primeiras 2 linhas (antes do "ver mais") — específico, não genérico
- Desenvolvimento em parágrafos curtos ou lista com contexto
- CTA no final com pergunta que divide opiniões (nunca "segue pra mais")
- Sugestão de hashtags (5–10)

---

**Vídeo curto (Reels/TikTok — 15–35 segundos):**

Escrever no formato de produção — cada segmento com Visual (sugestão de enquadramento ou B-roll) e Script falado. Sem Text Overlay genérico — o visual é a instrução de filmagem/edição.

Referência de enquadramento: alternar entre tela cheia do criador falando, tela dividida (criador embaixo + B-roll em cima) e B-roll em tela cheia com voz de fundo. Estilo Nêmora Schuh.

```
=== HOOK (0–2s) ===
Visual: [tela cheia / tela dividida / B-roll — descrever o que aparece]
Script: [fala ou silêncio]

=== SETUP (2–5s) ===
Visual: [enquadramento — tela cheia do criador ou corte pra B-roll]
Script: [1–2 frases de contexto rápido]

=== DELIVERY (5–[X]s) ===
Visual: [descrever alternância entre criador e B-roll, corte a cada 3–5s. Sugerir imagens/cenas concretas de B-roll para cada ideia]
Script: [script completo]

=== CTA (últimos 3–5s) ===
Visual: [criador em tela cheia, direto pra câmera]
Script: [1 frase]

=== CAPTION ===
[Hook 125 chars — standalone, funciona sem ver o vídeo]
[1–2 linhas de desenvolvimento]
[CTA específico]

=== AUDIO NOTE ===
[Trending sound relevante OU "áudio original" — indicar o estilo/ritmo]

=== HASHTAGS ===
[5–12 hashtags]
```

**Regras do vídeo curto:**
- Hook NUNCA começa com apresentação ("Oi pessoal, eu sou...")
- Hook deve ter resultado numérico ou fato específico — não promessa vaga
- Sem Text Overlay em bloco — não agrega. O visual instrui o enquadramento e o B-roll
- Duração alvo: 15–35 segundos — cada segundo deve justificar o próximo
- CTA específico e divisivo — pergunta que divide opiniões, não "curta e siga"
- Audio note obrigatória — faz diferença no alcance de descoberta
- B-roll sugerido deve ser concreto e filmável — não "imagens de negócios", mas "prateleira de supermercado com latinha de Red Bull em destaque"

---

**Thread (X ou LinkedIn):**
- Post 1: hook que para o scroll — fato ou afirmação que cria tensão
- Posts 2–8: um ponto por post, progressão lógica, cada um prepara o próximo
- Post final: conclusão + CTA com pergunta

---

**Newsletter:**
- Linha de assunto + pré-header (duas opções)
- Abertura pessoal (2–4 linhas)
- Desenvolvimento em seções curtas com subtítulos
- Encerramento com CTA

---

**YouTube (roteiro longo — 8–15 min):**

Seguir a estrutura de 7 partes do estilo Nêmora:

```
=== TÍTULO ===
[PERGUNTA PROVOCATIVA? | ENTENDA [MECANISMO]] — 50–70 chars

=== THUMBNAIL CONCEPT ===
Face/expressão + Texto (máx 4 palavras) + Paleta de cor

=== HOOK EM CASCATA (0:00–0:50) ===
[3–5 fatos surpreendentes encadeados sem nomear o tema ainda]

=== SELF-INTRO (0:50–1:15) ===
[Apresentação — SEMPRE após o hook, nunca antes]

=== CONTEXTO (1:15–2:30) ===
[Por que esse fenômeno existe? Dados, contexto de mercado]

=== CASES (2:30–7:00) ===
[2–3 exemplos reais: o que fizeram → como funciona → resultado]

=== CLIMAX (posicionar em 60–70% do vídeo) ===
[Key insight — o momento "aha"]

=== RESPOSTA À OBJEÇÃO ===
["Agora vem a pergunta que todo mundo faz..." — responder antes que o espectador feche]

=== TENDÊNCIA FUTURA ===
[O que vai mudar — posiciona como analista]

=== CTA DUPLO ===
[Pergunta de debate nos comentários] + [Inscrição/contato Assessoria Raiz]

=== DESCRIÇÃO DO VÍDEO ===
[Hook + keywords + TIMESTAMPS + links]
```

**Regras do YouTube:**
- Hook em cascata obrigatório — nunca anunciar o tema diretamente no início
- Self-intro vem DEPOIS do gancho, nunca antes
- Pattern interrupt a cada 30–60 segundos (indicar B-roll, gráfico, zoom)
- Pelo menos 2 cases de marcas reais com detalhes técnicos
- CTA duplo no fechamento (pergunta + inscrição)

---

### Passo 4 — Salvar

Salvar em `conteudo/roteiros/roteiro-[tema]-[data].md`

---

## Regras gerais

- Tom segue `_contexto/preferencias.md` estritamente — sem travessões por padrão
- Nunca fórmulas de criador de conteúdo ("ei pessoal", "não esquece de dar like", "hoje vamos falar sobre")
- O roteiro deve soar como o usuário fala, não como conteúdo genérico
- Frases de transição naturais, não clichês
- Especificidade sempre — "R$ 4.200" não "pouco investimento", "3 semanas" não "algumas semanas"
- Não narrar o fato, revelar o mecanismo — o leitor já sabe o que aconteceu, o valor é entender o porquê
- CTA sempre específico e que divide opiniões — nunca genérico
