---
name: planejar-semana
description: >
  Ritual semanal de criação de conteúdo para @omatheusfariaa. Começa revisando o pipeline
  (pendências, status, métricas a preencher), depois ajuda a planejar o conteúdo da semana:
  puxa backlog de ideias, faz 3 perguntas sobre a semana, apresenta opções e define o mini-brief.
  Use quando for sentar pra decidir o que criar, ou pra ver o estado do pipeline.
  Gatilhos: /planejar-semana, "o que eu faço essa semana", "vamos planejar o conteúdo",
  "qual o estado do pipeline", "o que tá em produção".
---

# /planejar-semana — Ritual de Conteúdo Semanal

## Dependências

- `conteudo/omatheusfariaa/pipeline.md` — status central de todo conteúdo
- `conteudo/omatheusfariaa/publicados/` — histórico de posts com métricas
- `conteudo/planejamento/ideias/` — backlog de ideias salvas
- `_contexto/empresa.md` — contexto do negócio e público
- `_contexto/preferencias.md` — tom de voz
- `comunicacao/aplicacoes.md` — princípios de comunicação (linha mestra, estrutura)

---

## Fluxo

### Parte 1 — Revisão do pipeline (sempre começa aqui)

1. Ler `conteudo/omatheusfariaa/pipeline.md`
2. Mostrar o estado atual de forma resumida:

   > **Pipeline atual:**
   >
   > 🔨 Em produção: [lista ou "nenhum"]
   > ✅ Pronto: [lista ou "nenhum"]
   > ⚠️ Métricas pendentes: [lista de posts publicados sem métricas, ou "nenhum"]
   > 💡 Ideias no backlog: [N ideias]

3. Tratar pendências — uma por vez, nessa ordem de prioridade:

   **Métricas pendentes (prioridade maior):**
   Se tem post publicado com ⚠️ pendente:
   > "[Título] foi publicado e ainda não tem métricas. Quer preencher agora?
   > Pode digitar os números ou jogar um print da tela — eu leio a imagem."

   Se sim: extrair os dados (via leitura de imagem ou digitação), atualizar `publicados/[arquivo].md`.
   Se não: anotar "métricas adiadas" e seguir para a próxima pendência.

   **Conteúdo em produção há mais de 2 semanas:**
   > "[Título] está em produção desde [data]. Foi publicado ou ainda está em andamento?"
   - Publicado → pedir data, mover para Publicado no pipeline, criar/atualizar entrada em `publicados/`
   - Ainda em andamento → manter onde está
   - Abandonado → perguntar se remove ou retorna para Ideias

   **Conteúdo Pronto sem data de publicação:**
   > "[Título] está marcado como Pronto. Já foi ao ar?"
   - Mesma lógica do item acima

4. Se não houver nenhuma pendência, informar: "Pipeline limpo." e seguir diretamente para Parte 2.

---

### Parte 2 — Planejamento da semana

Só inicia após resolver as pendências da Parte 1 (ou se não houver nenhuma).

1. Ler os arquivos em `conteudo/planejamento/ideias/` e listar os títulos disponíveis.

2. **Se tiver 3 ou mais posts em `publicados/` com campo `## Aprendizado` preenchido:** ler esses arquivos e extrair padrões antes de sugerir temas.

   Mostrar brevemente:
   > "Com base nos posts anteriores:
   > ✅ Funcionou bem: [padrão — ex: 'casos com dado numérico específico', 'posts com conexão pessoal', 'ganchos com dado surpreendente']
   > ⚠️ Performou abaixo: [padrão — ex: 'posts muito técnicos', 'ganchos genéricos']
   > → Vou usar isso pra priorizar as sugestões desta semana."

   Se não tiver aprendizados suficientes, pular essa etapa sem mencionar.

   **Se o padrão identificado for estrutural** (ex: "slides estão parando no 3", "ganchos genéricos não prendem", "posts sem dado numérico performam menos") — não só informar, mas perguntar:
   > "Esse padrão afeta como a gente produz. Quer que eu atualize a skill [nome] agora pra refletir isso?"
   Se sim, atualizar a skill correspondente e registrar em `conteudo/omatheusfariaa/CLAUDE.md` na tabela de aprendizados permanentes.

3. Fazer 3 perguntas sobre a semana (numa mensagem só):

   > "Antes de sugerir um tema, me conta:
   > 1. Aconteceu algo essa semana que ficou na sua cabeça — com cliente, campanha, leitura, qualquer coisa?
   > 2. Tem algo que você assistiu ou ouviu que poderia virar conteúdo?
   > 3. Tem algum tema que você quer falar faz tempo e ainda não criou?"
   >
   > (Responde só o que vier. Se não tiver nada essa semana, eu uso o backlog ou pesquiso um tema novo.)

3. Com o que surgiu + ideias do backlog, apresentar **2-3 opções de tema**. Para cada opção, escolher o formato que melhor serve o tema — não forçar sempre o mesmo estilo:

   Formatos disponíveis (sugerir o mais adequado ao tema e ao momento):
   - **Case famoso** — marca/evento conhecido → mecanismo → dono de negócio
   - **Bastidores** — situação real da agência/cliente → aprendizado
   - **Opinião direta** — tomada clara sobre algo que o mercado faz errado
   - **Dado surpreendente** — estatística + implicação prática
   - **Desconstrução de crença** — "você acha X, na prática é Y"
   - **Antes e depois** — resultado concreto sem jargão
   - **Tático/Aplicado** — N estratégias práticas ligadas a timing (Copa, evento, data) — preferir quando o tema tem janela de tempo curta

   > **Opção 1 — [Título]**
   > Ângulo: [em 1 frase]
   > Formato sugerido: [formato + por que esse e não outro]
   > Por que agora: [timing, relevância ou evergreen]
   >
   > **Opção 2 — [Título]**
   > ...
   >
   > **Opção 3 — [Título]**
   > ...
   >
   > Ou: pesquisa um tema novo pra mim.

   Se o usuário pedir pesquisa nova: disparar `/pesquisar-tema` modo livre e voltar com opções.

4. Após o usuário escolher, definir o mini-brief:

   > **Tema:** [título]
   > **Ângulo:** [em 1 frase — a tese do conteúdo]
   > **Formato:** [carrossel / vídeo falado]
   > **Linha mestra:** [frase de até 15 palavras que resume o ponto — filtro anti-prolixidade]
   > **O que o dono de negócio vai sentir:** [identificação, curiosidade, urgência, reconhecimento?]

5. Atualizar `pipeline.md`: adicionar o novo item na seção "Em produção".

6. Perguntar:
   > "Quer criar agora?
   > - `/carrossel` — se for carrossel
   > - `/roteiro-post` — se for vídeo ou post escrito"

---

## Regras

- A Parte 1 é obrigatória — sempre verificar o pipeline antes de planejar, mesmo rápido
- Uma pendência por vez — não listar tudo e esperar resolução em bloco
- Métricas: aceitar print de tela (Claude lê a imagem) ou digitação manual
- Não pressionar frequência — a meta é 1 post/semana, não cobrar mais
- Tom direto, sessão de 15-30 minutos
- Se o usuário estiver sem energia ou com pouco tempo: reduzir ao essencial (1 opção de tema, sem aprofundamento)
