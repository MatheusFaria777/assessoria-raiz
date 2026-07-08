# /carrossel-livros — Carrossel para @omatheusfariaa

## Princípio central

Cada carrossel é uma extensão do que o Matheus já disse — em vídeo, no clube do livro ou numa ideia que ficou. Não é resumo. É a transformação que o livro gerou, slide a slide.

**Sistema base (@orodolfosouza):**
1. Capa tem 1 função: parar o scroll
2. Slide 2 valida o gancho e o motivo para ficar
3. Cada slide funciona sozinho (1 ideia, contraste alto, sem poluição)
4. Todo carrossel precisa de um slide salvável
5. A legenda continua o post — o CTA ativa a ação

---

## Passo 1 — Entender o conteúdo

Antes de montar qualquer slide, identificar:

- **Qual é a ideia central?** (em uma frase — o que esse carrossel existe pra dizer?)
- **De onde veio?** (livro, vídeo, clube do livro, insight do dia)
- **Para quem?** (quem precisa ouvir isso?)

Se o carrossel deriva de um vídeo publicado, ler a transcrição em `videos/[nome]/transcricao.md`.
Se é ideia nova, o Matheus traz o preenchimento do template de `conteudo.md`.

---

## Passo 2 — Montar os slides

### SLIDE 1 — CAPA
**Função:** parar o scroll. Não explicar tudo.

Regras:
- Uma promessa, um número ou uma tensão
- Máximo 6-8 palavras
- Tom: convicto, sem rodeio
- Evitar: "X coisas que...", "Como fazer...", "O segredo..."

Perguntar internamente: *se essa frase aparecer no feed, alguém para pra ler o resto?*

---

### SLIDE 2 — VALIDAR O GANCHO
**Função:** mostrar que vale o tempo de quem parou.

Mostrar uma das três:
- O problema que o leitor reconhece em si mesmo
- A transformação que o carrossel vai mostrar
- O que está em jogo se ignorar

Máximo 3-4 linhas. Se a pessoa não pensar "isso vale meu tempo", perde a atenção aqui.

---

### SLIDES 3 a N — DESENVOLVIMENTO
**Função:** entregar a ideia, ponto a ponto.

Regras obrigatórias:
- 1 ideia por slide — se tiver duas, quebra em dois slides
- Cada slide funciona sozinho (se alguém printar, ainda faz sentido)
- Até 4 linhas de texto por slide
- Frases curtas, diretas — não parágrafos
- Tom: Matheus contando, não resumindo o livro

Padrão de estrutura por slide:
```
[Frase-título do insight — a mais forte]
[Desenvolvimento em 2-3 linhas]
[Exemplo ou aplicação prática, se houver]
```

---

### SLIDE SALVÁVEL — obrigatório em todo carrossel
**Função:** transformar alcance em salvamentos.

Deve conter um dos seguintes:
- Uma frase que vale guardar (citação do livro ou do Matheus)
- Um framework simples (ex: FORMA, domínios da possibilidade)
- Uma pergunta que muda perspectiva

Marcar qual slide é o salvável na entrega. É o que o algoritmo usa pra medir engajamento real.

---

### ÚLTIMO SLIDE — CTA
**Função:** ativar uma ação específica.

Nunca: "me segue para mais" ou "curte se gostou"

Opções válidas:
- Pergunta que gera comentário: "Qual dessas frases ficou com você?"
- Direcionamento para a comunidade: "Se você quer ler com propósito, me acompanha aqui."
- Salvamento: "Salva esse carrossel pra não perder."
- Combinação de dois: pergunta + direcionamento

---

## Passo 3 — Legenda

A legenda continua o carrossel — não repete.

Estrutura:
```
[Frase de abertura — a mais forte do carrossel, reformulada]

[1-2 linhas de contexto: de onde veio esse insight, por que importa agora]

[CTA alinhado com o último slide]
```

Máximo 150 palavras. Sem hashtags no corpo — se usar, colocar no primeiro comentário.

---

## Passo 4 — Referência de design

Ver `brand.md` para a paleta e tipografia completas. Resumo:

**Paleta** (fria e escura — alinhada com a página do link na bio):
- `#0A0C10` — fundo principal (preto noite)
- `#13161E` — fundo alternativo (azul noite)
- `#3e636f` — acento teal médio (bordas, slide salvável, destaques)
- `#4d7a87` — acento teal claro (CTA, hover)
- `#EDF0F7` — fundo claro (capa ou slide de contraste)
- `#7A8499` — texto muted, handles, labels
- Nunca branco puro `#FFFFFF` nem preto puro `#000000`
- Nunca cores quentes (terracota, âmbar)

**Tipografia:**
- Títulos e destaques: Playfair Display (weight 600/700, itálico)
- Texto corrido e subtítulos: DM Sans (weight 300/400/500)
- Máximo 2 fontes por carrossel

**Formato:** 1080x1350px (portrait 4:5)

---

## Passo 5 — Checkpoint de texto

Mostrar todos os slides no chat com o formato abaixo. Esperar aprovação antes de gerar o HTML.

```
## SLIDE 1 — CAPA
[texto]

## SLIDE 2 — GANCHO
[texto]

## SLIDE 3
[texto]
...

## SLIDE [N] — SALVÁVEL ⭐
[texto]

## ÚLTIMO SLIDE — CTA
[texto]

---
## LEGENDA
[texto]
```

Só avançar pra fase visual quando o texto estiver aprovado.

---

## Passo 6 — Geração de HTML

Gerar um arquivo HTML por slide em `projetos/comunidade-leitura/conteudo/carrosseis/[tema]/`.

### Spec técnica

- **Dimensões:** 1080x1350px (portrait 4:5)
- **CSS inline** dentro de `<style>` — sem arquivos externos
- **Fontes via Google Fonts:**
  - Títulos e destaques: `Playfair Display` (weight 600/700, incluindo itálico)
  - Texto corrido e subtítulos: `DM Sans` (weight 300/400/500/600)
- **Safe area:** 80px em todos os lados

### Paleta do brand (brand.md)

| Variável | Hex | Uso |
|----------|-----|-----|
| `--bg-dark` | `#0A0C10` | Fundo principal (preto noite) |
| `--bg-navy` | `#13161E` | Fundo alternativo (azul noite) |
| `--teal` | `#3e636f` | Acento principal — bordas, slide salvável |
| `--teal-light` | `#4d7a87` | Acento CTA, destaques |
| `--bg-light` | `#EDF0F7` | Fundo claro (capa ou slide de contraste) |
| `--text` | `#EDF0F7` | Texto principal sobre fundos escuros |
| `--muted` | `#7A8499` | Handles, labels, textos secundários |

Nunca usar `#FFFFFF` nem `#000000`. Nunca cores quentes.

### Layout por tipo de slide

**Slide 1 — Capa:**
- Fundo: `#EDF0F7` (claro) para máximo contraste com os slides seguintes
- Título grande em `Playfair Display` itálico, cor `#0A0C10`
- Label do livro em `DM Sans` uppercase, cor `#3e636f`
- Handle e referência do livro no rodapé

**Slide 2 — Gancho:**
- Fundo escuro (`#0A0C10` ou `#13161E`) — contraste com a capa clara
- Texto em `DM Sans`, cor `#EDF0F7`
- Palavra-chave ou citação em `Playfair Display` itálico, cor `#4d7a87`

**Slides internos:**
- Variar entre `#0A0C10` e `#13161E` (nunca o mesmo fundo em 2 slides seguidos)
- Border-left `#3e636f` (2-3px) em blocos de texto para hierarquia
- Palavra-chave em `Playfair Display` itálico + cor `#4d7a87`

**Slide salvável (⭐):**
- Fundo `#3e636f` (teal médio) — diferente de todos os outros
- Frase principal em `Playfair Display` — o slide precisa funcionar como print isolado

**Último slide — CTA:**
- Fundo `#4d7a87` (teal claro)
- Texto principal em `DM Sans`, cor `#EDF0F7`
- CTA em bloco escuro semi-transparente com `Playfair Display` itálico

### Estrutura HTML base

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1080px; height: 1350px; overflow: hidden;
      background: [cor do slide];
      font-family: 'DM Sans', sans-serif;
      padding: 80px 64px;
      position: relative;
    }
    /* estilos específicos do slide */
  </style>
</head>
<body>
  <!-- conteúdo do slide -->
</body>
</html>
```

---

## Passo 7 — Renderizar PNGs

Verificar Playwright:

```bash
npx playwright screenshot --help 2>/dev/null && echo "OK" || echo "INSTALAR"
```

Se precisar instalar:
```bash
npx playwright install chromium
```

Renderizar slide 1 primeiro e mostrar pro usuário:

```bash
npx playwright screenshot --viewport-size=1080,1350 "file:///[caminho absoluto]/slide-01.html" "[caminho absoluto]/slide-01.png"
```

**CHECKPOINT:** Mostrar slide 1. Se aprovado, renderizar os demais. Se pedir ajuste, editar o HTML e re-renderizar só aquele slide.

Salvar todos os PNGs na mesma pasta dos HTMLs.

---

## Output final

```
projetos/comunidade-leitura/conteudo/carrosseis/[tema]/
  slide-01.html + slide-01.png  ← capa
  slide-02.html + slide-02.png  ← gancho
  slide-03.html + slide-03.png
  ...
  slide-0N.html + slide-0N.png  ← CTA
```

---

## Regras

- Nada inventado — tudo tem raiz no que o Matheus disse ou leu
- Tom do Faria: convicto, direto, fala pra uma pessoa
- Nunca "o autor diz que..." — sempre o que o Matheus aprendeu
- O slide salvável é obrigatório — se não tiver um candidato óbvio, criar um
- CTA nunca genérico — sempre específico e conectado ao conteúdo
- Marcar claramente qual slide é o salvável com ⭐
- Texto aprovado no checkpoint não muda na fase visual
- Nunca `#FFFFFF` nem `#000000` — sempre as versões quentes do brand
- Mostrar slide 1 renderizado antes de continuar os demais
