---
name: canvas-design
description: >
  Cria arte visual em PNG/PDF com filosofia de design — 90% visual, 10% texto.
  Ideal para capas, posters, carrosséis, thumbnails e qualquer output onde o
  impacto visual é o centro. Processo: define filosofia visual → executa composição.
  Gatilhos: "cria uma arte", "faz o visual", "gera o carrossel visual", "/canvas-design".
---

# /canvas-design — Arte Visual com Filosofia de Design

## Princípio central

90% é design visual, 10% é texto. A ideia se comunica através de espaço, forma, cor e composição — não através de palavras.

O resultado deve parecer meticulosamente trabalhado, como se alguém no topo da especialidade tivesse dedicado inúmeras horas. Nível de craftsmanship museal.

---

## Passo 1 — Carregar o contexto de marca

Se o output for para @omatheusfariaa: ler `projetos/comunidade-leitura/brand.md`.
Se for para a Assessoria Raiz: ler `marca/design-guide.md`.

---

## Passo 2 — Definir a Filosofia Visual

Antes de criar qualquer coisa, articular em 3-4 parágrafos:

- **Intenção emocional** — o que o espectador deve sentir ao ver?
- **Linguagem visual** — que formas, texturas e espaços comunicam isso?
- **Paleta justificada** — por que essas cores específicas para essa peça?
- **Hierarquia** — o que o olho encontra primeiro, segundo, terceiro?

Mostrar a filosofia antes de executar. Esperar aprovação ou ajuste.

---

## Passo 3 — Executar a composição

Criar o HTML/CSS que renderiza a peça visual:

```html
<!-- Canvas: [largura]x[altura]px -->
<!-- Formato: PNG via screenshot ou PDF via print -->
```

**Proporções por formato:**
- Instagram carrossel: 1080×1080px (quadrado) ou 1080×1350px (4:3 vertical)
- Instagram Stories / TikTok: 1080×1920px (9:16)
- YouTube thumbnail: 1280×720px (16:9)
- Post de feed: 1080×1080px

**Regras de execução:**
- Fundo nunca branco puro — sempre a versão quente da paleta
- Tipografia: respeitar hierarquia definida na filosofia
- Espaço em branco (negativo) é elemento de design, não ausência de conteúdo
- Máximo 1 ideia por composição

---

## Passo 4 — Entregar

Entregar o HTML completo pronto para screenshot/print.
Se precisar de múltiplos slides (carrossel), entregar um HTML por slide com numeração clara.

---

## Regras

- Nunca começar sem a filosofia visual aprovada
- Nunca colocar texto demais — se precisar de mais de 2-3 linhas, o conceito está errado
- Respeitar sempre o brand da marca (Raiz ou @omatheusfariaa) — nunca inventar paleta
- Output final deve ser screenshot-ready (dimensões corretas, sem scrollbar)
