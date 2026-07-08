---
name: maquina-conteudo
description: >
  Transforma um vídeo do YouTube (ou transcrição já salva) em todos os formatos
  de conteúdo derivados: cortes rankeados, roteiro TikTok, carrossel, post de feed,
  descrição do YouTube e comentário fixado. Use quando o usuário publicar um vídeo
  e quiser extrair o máximo dele sem regravar nada.
  Gatilhos: "máquina de conteúdo", "gera os formatos", "transforma o vídeo", "/maquina-conteudo".
---

# /maquina-conteudo — Máquina de Conteúdo

## Princípio central

A máquina parte do que o Matheus já disse. Não inventa, não parafraseia além do necessário.
Tudo que sair daqui precisa ter raiz na transcrição real do vídeo.

---

## Passo 1 — Obter a transcrição

**Se o usuário passar um link do YouTube:**
```bash
yt-dlp --write-auto-sub --sub-lang pt --skip-download --sub-format ttml -o "C:\temp\maquina-temp" "[URL]"
```
Depois extrair o texto do TTML via PowerShell (padrão já estabelecido no projeto).

**Se o usuário passar o nome do vídeo salvo em `videos/`:**
Ler diretamente de `videos/[nome]/transcricao.md`.

**Se o usuário colar a transcrição no chat:**
Usar o texto diretamente.

---

## Passo 2 — Ler o contexto

Ler `CLAUDE.md` para carregar:
- Tom do Faria (convicto, conversa, não performance)
- Referência de estilo
- Estado atual da comunidade (pra calibrar CTAs)

Ler `brand.md` para aplicar identidade visual nos outputs.

---

## Passo 3 — Cortes rankeados

Analisar a transcrição com timestamps e identificar os **top 3 momentos** que funcionam como Reels/TikTok/YouTube Shorts sem contexto adicional.

Para cada corte, avaliar em 5 critérios (nota 1-10):

| Critério | O que mede |
|----------|-----------|
| **Gancho** | A primeira frase prende sem precisar do vídeo completo? |
| **Completude** | O trecho tem início, meio e fim sozinho? |
| **Virada** | Há um "antes → depois" claro de perspectiva? |
| **Frase memorável** | Tem uma linha que alguém compartilharia? |
| **Aplicabilidade** | Dá pra aplicar na vida de quem assiste? |

Score final = média dos 5 critérios.

**Formato de saída:**

```
## CORTES RANKEADOS

### #1 — [Título do momento] | Score: 8.4/10
Timestamp: 1:36 – 2:06
Gancho: 9 | Completude: 8 | Virada: 10 | Memorável: 8 | Aplicabilidade: 7

Trecho:
> "[texto exato da transcrição]"

Por que funciona: [1-2 frases explicando o score]
Instrução de corte: [o que editar, se algo sobra ou falta nos extremos]
```

---

## Passo 4 — Roteiro TikTok/Reels novo

Quando nenhum dos cortes for forte o suficiente como clip direto, ou quando quiser conteúdo adicional além dos cortes.

Extrair **a ideia mais forte** da transcrição e montar um roteiro novo de 15-35 segundos no formato da skill `/roteiro-post` (HOOK → SETUP → DELIVERY → CTA).

O roteiro deve soar como o Matheus falando — não como resumo do vídeo.

---

## Passo 5 — Carrossel

Extrair os pontos principais do vídeo e organizar em estrutura de carrossel:

```
Slide 1 — CAPA: título provocativo (o gancho do vídeo em uma frase)
Slide 2 — O problema / a crença comum
Slide 3 — A virada / o insight principal
Slide 4 — Ponto 1
Slide 5 — Ponto 2
Slide 6 — Ponto 3 (se houver)
Slide 7 (último) — CTA: o que o seguidor deve fazer agora
```

Cada slide: máximo 2-3 linhas. Linguagem direta, sem introdução.
Aplicar paleta e tipografia do `brand.md`.

---

## Passo 6 — Post de feed

Uma frase forte ou reflexão curta extraída do vídeo.

Formato:
```
[Frase de abertura — a mais forte do vídeo]

[1-2 linhas de contexto ou desenvolvimento]

[CTA curto: pergunta ou direcionamento]
```

---

## Passo 7 — Descrição do YouTube

A descrição continua o vídeo — não resume. As **primeiras 2 linhas são SEO**: aparecem no resultado de busca antes do "ver mais", então precisam ter a palavra-chave principal e prender sem depender do vídeo.

Estrutura:
```
[Linha 1 — gancho + palavra-chave principal do livro/conceito]
[Linha 2 — continua a tensão, sem resolver]

[3-4 linhas de contexto — reforça a ideia central,
introduz palavras-chave naturalmente (autor, conceito, livro)]

[Capítulos com timestamps]

[CTA da comunidade]
📸 Instagram: @omatheusfariaa

#hashtags relevantes ao livro e tema
```

Regras:
- Primeira linha: keyword do livro ou conceito + hook — é o que aparece na busca
- Segunda linha: aprofunda a tensão, não a resolve
- Corpo: palavras-chave naturais (nome do autor, conceito central, área do livro)
- Hashtags: no final, não no corpo
- Capítulos: mínimo 3, primeiro em 0:00, cada capítulo com pelo menos 10 segundos de intervalo
- Título: usar extensão do YouTube (VidIQ/TubeBuddy) para validar com dados de busca real

---

## Passo 8 — Comentário fixado

CTA curto para a comunidade, pra fixar no próprio vídeo.

Deve:
- Ser pessoal e direto (não genérico)
- Perguntar algo específico relacionado ao conteúdo do vídeo
- Direcionar para a comunidade

---

## Saída final

Entregar tudo em sequência, com cabeçalhos claros.

Ordem:
1. Cortes rankeados (com timestamps prontos pra recortar)
2. Roteiro TikTok novo
3. Carrossel (slide a slide)
4. Post de feed
5. Descrição do YouTube (com capítulos)
6. Comentário fixado

---

## Regras

- Nada inventado — tudo tem raiz na transcrição
- Tom do Faria: convicto, presente, fala pra uma pessoa — não pra uma audiência
- CTA sempre específico — nunca "me siga" ou "curta o vídeo"
- Capítulos: conferir que nenhum intervalo é menor que 10 segundos
- Se a transcrição não tiver timestamps, gerar os outros formatos e avisar que capítulos e cortes precisam de revisão manual
- Aplicar brand do @omatheusfariaa em todos os outputs textuais
