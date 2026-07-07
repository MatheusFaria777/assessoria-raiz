---
name: registrar-conteudo
description: >
  Atualiza o pipeline de conteúdo de @omatheusfariaa rapidamente. Registra novos conteúdos
  criados, move status para publicado, adiciona métricas de posts (aceita print de tela),
  ou salva novas ideias no backlog. Chamar ao final de qualquer criação de conteúdo,
  ao publicar algo, ou ao querer registrar uma ideia rápida.
  Gatilhos: /registrar-conteudo, "adiciona no pipeline", "registra que publiquei",
  "atualiza o pipeline", "registra as métricas", "salva essa ideia".
---

# /registrar-conteudo — Atualização Rápida do Pipeline

## Dependências

- `conteudo/omatheusfariaa/pipeline.md` — arquivo central de status
- `conteudo/omatheusfariaa/publicados/_template.md` — template de post publicado
- `conteudo/planejamento/ideias/` — backlog de ideias

---

## Fluxo

### 1. Perguntar o que registrar

> "O que você quer registrar?
> 1. Novo conteúdo criado (adicionar como Em produção ou Pronto)
> 2. Publiquei algo (mover para Publicado)
> 3. Adicionar métricas de um post publicado
> 4. Nova ideia"

### 2. Execução por opção

---

#### Opção 1 — Novo conteúdo criado

Se chamado logo após `/carrossel` ou `/roteiro-post`, usar o título e formato já conhecidos — não perguntar de novo.

Se chamado de forma avulsa, pedir:
- Título
- Formato (carrossel / vídeo / roteiro)
- Status: em produção ou pronto pra postar?
- Caminho do arquivo gerado (se souber)

Atualizar `pipeline.md` na seção correta.

---

#### Opção 2 — Publiquei algo

1. Ler `pipeline.md` e mostrar o que está em "Em produção" e "Pronto"
2. Perguntar qual foi publicado
3. Pedir a data de publicação
4. Perguntar qual plataforma (Instagram, TikTok, ambos)
5. Mover o item para "Publicado" em `pipeline.md` com data e status ⚠️ pendente em métricas
6. Criar entrada em `conteudo/omatheusfariaa/publicados/[AAAA-MM-titulo].md` usando o template `_template.md`
7. Perguntar: "Quer colar a legenda que você usou agora ou preenche depois?"

---

#### Opção 3 — Adicionar métricas

1. Ler `pipeline.md` e listar posts com ⚠️ pendente
2. Perguntar qual post
3. Pedir as métricas:
   > "Pode jogar um print da tela que eu leio os números, ou digitar direto se preferir."
   - Se vier print/imagem: ler a imagem e extrair os dados automaticamente
   - Se texto: registrar como informado
4. Preencher a tabela de métricas em `publicados/[arquivo].md`
5. Atualizar `pipeline.md`: remover o ⚠️ pendente do item
6. Perguntar: "Algum aprendizado desse post? O que funcionou ou não funcionou?"
   - Se sim: salvar no campo `## Aprendizado` do arquivo
   - Se não: deixar em branco, sem problema

---

#### Opção 4 — Capturar insight / Nova ideia

Dois caminhos, perguntar qual:
> "Você tem uma observação/situação pra transformar em conteúdo, ou já tem a ideia formada?
> A) Tenho uma observação bruta (algo que aconteceu, que vi, que me chamou atenção)
> B) Já tenho a ideia formada (sei o tema e o ângulo)"

**Caminho A — Observação bruta (captura de insight):**

Pedir:
> "Me conta o que aconteceu ou o que você observou. Pode ser curto — 2-3 frases."

Com o que o usuário descrever, extrair:
1. **O caso/observação** — o fato concreto, sem interpretação ainda
2. **O mecanismo** — por que isso aconteceu? qual é a causa real?
3. **Conexão com o público** — como isso se relaciona com o dono de negócio que anuncia?
4. **Formato potencial** — qual dos formatos se encaixa melhor:
   - Case famoso / Bastidores / Opinião direta / Dado surpreendente / Desconstrução / Antes e depois

Mostrar a extração pro usuário:
> "Ângulo identificado:
> **Caso:** [o que aconteceu]
> **Mecanismo:** [o porquê real]
> **Conexão:** [o que isso significa pro dono de negócio]
> **Formato sugerido:** [formato]
>
> Esse ângulo faz sentido? Quer ajustar algo antes de salvar?"

Após confirmação, criar arquivo em `conteudo/planejamento/ideias/[titulo-slug].md` com frontmatter:
```
---
titulo: [título derivado do ângulo]
data: [data de hoje]
formato: [formato]
status: ideia
---

# [Título]

**Observação original:** [o que o usuário descreveu]

**Ângulo extraído:** [caso + mecanismo + conexão]

**Formato sugerido:** [formato]

**Momento certo para produzir:** [quando fizer mais sentido — timing, dados a coletar, evento relacionado]
```

**Caminho B — Ideia já formada:**

Pedir:
- Título da ideia
- Ângulo em 1 frase (o ponto de vista, não só o tema)
- Formato sugerido

Criar o mesmo arquivo com o que o usuário informou.

**Ambos os caminhos:** adicionar na seção "Ideias" do `pipeline.md`.

---

## Regras

- Sempre atualizar `pipeline.md` ao final, independente da opção
- Se chamado logo após `/carrossel`, não perguntar título/formato de novo — usar o que foi criado
- Manter o pipeline limpo: itens mais recentes no topo de cada seção
- Métricas com print de tela: extrair todos os campos disponíveis na imagem
- Tom direto, fluxo rápido — o objetivo é registrar e seguir
