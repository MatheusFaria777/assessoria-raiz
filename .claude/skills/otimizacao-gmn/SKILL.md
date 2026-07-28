---
name: otimizacao-gmn
description: >
  Gera o pacote completo de otimização da ficha do Google Meu Negócio (Google Business
  Profile) de um cliente: nome otimizado, categorias, descrição, lista de serviços,
  perguntas e respostas, templates de resposta a avaliação, sugestões de postagem do
  mês e checklist de ações manuais. Na primeira vez com um cliente, gera a mensagem
  de WhatsApp pra pedir acesso de Gerente na ficha e mandar o link do formulário
  `/gmb?c=slug` do Sistema Raiz. Depois, junta o que já existe na pasta do cliente
  e no formulário preenchido, e só pergunta o que estiver faltando.
  Salva em Clientes/[slug]/Entregaveis/otimizacao-gmn.md.
  Use quando pedir "otimização do Google Meu Negócio do [cliente]", "otimiza a ficha
  do [cliente]", "faz o GBP do [cliente]", "pacote de GMN do [cliente]", ou
  "/otimizacao-gmn [cliente]".
---

# /otimizacao-gmn — Otimização de Ficha do Google Meu Negócio

## Contexto

Hoje a otimização de GMN só acontece no fim dos 30 primeiros dias de contrato. A ideia
dessa skill é gerar o pacote logo no início, pra o cliente sentir progresso rápido.
Fase 1 de um plano maior: mais pra frente a Raiz pretende automatizar a aplicação
direto na ficha via Business Profile API (edição de dados, posts, resposta a
avaliação) e rodar isso mensalmente sem intervenção manual — ver
`memory/project_gmn_automacao.md`. Por enquanto essa skill só gera o conteúdo; quem
aplica na ficha ainda é o Matheus, manualmente, dentro do painel do Google.

## Arquivos de apoio (ler no início)

- `_contexto/preferencias.md` — tom de escrita (esse output é interno/operacional,
  não vai pro cliente ler, então prioriza clareza e ser copiável direto pro painel
  do Google, não precisa ser "vendável")
- `.claude/skills/otimizacao-gmn/references/exemplo-pacote.md` — exemplo real de um
  pacote gerado anteriormente (MJ Sondagem), pra calibrar formato, nível de detalhe
  e tom de cada seção

## Passo 0 — Primeiro contato (só se for a primeira vez com esse cliente)

Receber o cliente via argumento: `/otimizacao-gmn [slug-ou-nome-do-cliente]`. Se não vier
argumento, perguntar qual cliente. Resolver o slug (nome da pasta em `Clientes/`).

Rodar, a partir da raiz do projeto, pra checar se o cliente já tem formulário GMN
preenchido no Sistema Raiz:

```bash
"Sistema-raiz/backend/venv/Scripts/python.exe" ".claude/skills/otimizacao-gmn/scripts/consultar_submissao.py" [slug]
```

Guardar esse resultado — vai ser reusado no Passo 1, não precisa rodar de novo.

Se vier `formulario_preenchido: false` ou o cliente não for encontrado, esse é o
primeiro contato sobre GMN — ainda não tem dados de entrada pra gerar nada. Nesse caso:

1. Montar a mensagem de abertura usando `references/mensagem-acesso-e-formulario.md`
   como modelo, com o nome do responsável (se souber, pela pasta do cliente) e o nome
   da empresa. O link do formulário é sempre `https://sistema.assessoriaraiz.com.br/gmb?c=[slug]`.
2. Entregar a mensagem pronta pro Matheus copiar e mandar por WhatsApp.
3. **Parar por aqui** — não seguir pros próximos passos, porque ainda não tem dados
   pra montar o pacote. Avisar que quando o cliente preencher o formulário é só rodar
   `/otimizacao-gmn [slug]` de novo pra esse mesmo cliente.

Se já existir submissão, pular a mensagem de abertura e seguir direto pro Passo 1.

## Passo 1 — Reunir o que já existe

Ler **tudo** que existir na pasta `Clientes/[slug]/`:

- `briefing.md`, `contexto.md`, `feedback.md`, `onboarding.md`
- `Transcricoes/*.md` (ou `Transcrições/*.md`)
- Qualquer outro `.md` na raiz da pasta do cliente

Extrair dessas fontes o que for relevante pra ficha do GMN: nome da empresa, nicho,
cidade/região de atuação, diferenciais, público, serviços, contato, redes sociais,
histórico relevante (ex: já teve suspensão, já tem ficha verificada, etc).

Juntar isso com os dados do formulário GMN já consultados no Passo 0: nome da
empresa, responsável, telefone, endereço, áreas de cobertura, se é empreendedor
individual, data de abertura, Instagram, site, Facebook, dias e horário de
funcionamento, horário de feriados, acessibilidade, estacionamento, formas de
pagamento, descrição, serviços, FAQ e o link da pasta no Drive com as fotos
enviadas pelo cliente.

## Passo 2 — Perguntar só o que estiver faltando

Depois de juntar pasta do cliente + formulário GMN, checar se dá pra montar o pacote
completo (passo 3) com o que já se tem. Os campos que mais costumam faltar depois
dessa junção:

- Categoria principal e categorias adicionais do Google (o formulário não pergunta isso)
- Se o negócio tem endereço físico que recebe cliente ou é área de atendimento (SAB)
- Palavra-chave de nicho + cidade que deve entrar no nome otimizado (respeitando a
  política do Google: não dá pra colocar "Sondagem de Solo" se o nome real da empresa
  não tem isso — só é permitido se for um descritor real do negócio ou já usado na
  fachada/documentação)
- Alguma promoção, diferencial ou sazonalidade que valha virar postagem do mês

Perguntar **uma coisa de cada vez**, não uma lista inteira. Se o campo não for
crítico pro pacote, pode seguir com uma suposição razoável e sinalizar no output
como "a confirmar com o cliente" em vez de travar o processo perguntando tudo.

## Passo 3 — Gerar o pacote

Estrutura do pacote (seguir esse formato, adaptando o que for preciso pro negócio
específico — ver `references/exemplo-pacote.md` pra tom e nível de detalhe):

1. **Nome otimizado do negócio** — nome real + descritor de nicho/cidade quando
   permitido pela política do Google. Nunca inventar palavra-chave que não reflita
   o negócio real.
2. **Categoria principal + categorias adicionais** — pesquisar as categorias reais
   do Google Business Profile mais próximas do nicho (não inventar nomes de categoria).
3. **Descrição da empresa** — até 750 caracteres, incluindo o que a empresa faz,
   onde atua, diferenciais e um CTA no fim.
4. **Lista de serviços** — nome + descrição curta de cada serviço.
5. **Perguntas e respostas** — 8 a 12 pares P/R cobrindo as dúvidas mais comuns do
   nicho (preço, prazo, área de atendimento, forma de contato). **Avisar no pacote
   que isso precisa ser cadastrado manualmente** — a API de Q&A do Google foi
   desativada em novembro/2025, não tem como automatizar.
6. **Templates de resposta a avaliações** — 3 modelos para 5 estrelas, 3 para
   3-4 estrelas, 3 para 1-2 estrelas.
7. **Sugestões de postagem do mês** — 4 posts (título, texto, CTA, tipo: Atualização/
   Novidade/Oferta), já organizados por semana (Semana 1 a 4, pensando na cadência de
   uma postagem por sexta-feira que o plano de automação futuro vai seguir).
8. **Nomes de arquivos de mídia sugeridos** — nomes SEO-friendly pro que já está na
   pasta do Drive (padrão: `assunto-cidade-uf.jpg`), sem inventar fotos que não existem.
9. **Link do WhatsApp em 1 clique** — gerar a partir do telefone coletado, no formato
   `https://wa.me/55[DDD][numero]` e uma versão com mensagem pré-definida relevante
   pro nicho do cliente.
10. **Checklist de ações manuais** — ordem de execução pro Matheus seguir dentro do
    painel do Google, incluindo: esperar alguns dias após ganhar acesso de gerente
    antes de mexer, não publicar mais de 3 fotos no mesmo dia, definir horário de
    funcionamento e feriados, decidir SAB vs endereço físico, cadastrar telefone/site/
    data de fundação, subir logo/capa/fotos/vídeo, responder avaliações existentes,
    publicar P&R, publicar a primeira postagem.

## Passo 4 — Salvar

Salvar o pacote completo em `Clientes/[slug]/Entregaveis/otimizacao-gmn.md`, em
markdown puro (sem HTML) — é pra ser copiado e colado direto nos campos do painel
do Google Business Profile, não é output visual pro cliente ver.

Ao final, avisar em uma frase o que ficou pendente de confirmação com o cliente
(se houver) e lembrar que a aplicação na ficha ainda é manual.
