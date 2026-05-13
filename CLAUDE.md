# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Assessoria Raiz — Claude Code OS

## O que é esse workspace
Workspace operacional da Assessoria Raiz — assessoria de tráfego pago (Meta Ads e Google Ads) com foco em clientes do setor automotivo. Usado no dia a dia pra produzir entregáveis pro cliente, automatizar processos e criar conteúdo.

**Estrutura de pastas:**
- `clientes/` — uma pasta por cliente com briefing, onboard e apresentação de estratégia
- `conteudo/` — carrosséis, roteiros, scripts de vídeo e newsletter
- `sistema-raiz/` — documentação e evolução da plataforma Flask interna
- `_contexto/` — contexto do negócio e preferências
- `marca/` — logos, fonte Agatho e guia de design
- `dados/` — drop zone pra arquivos de análise (CSV, PDF, prints)
- `templates/skills/` — templates de skills prontos pra personalizar com /mapear
- `templates/ferramentas/catalogo.md` — APIs e ferramentas disponíveis pra usar em skills

## Sobre o negócio
Assessoria Raiz é uma assessoria de tráfego pago fundada por Matheus (operacional/estratégico) e Lucas (sócio, comercial). A maior parte dos clientes são concessionárias e lojas de carro. Equipe: Matheus, Lucas, namorada do Matheus (criadora de conteúdo — vídeos e carrosséis) e um video maker adicional provisório.

## O que mais fazemos aqui
- Relatórios mensais e planilhamento de dados de campanhas
- Estrutura e upload de campanhas (Meta Ads e Google Ads)
- Upload de criativos de carros via Sistema Raiz (automação de anúncios de concessionárias)
- Onboarding de novos clientes (documento + apresentação de estratégia em HTML)
- Diagnóstico de perfil do Instagram (HTML)
- Reuniões de alinhamento mensal (humanização de dados pro cliente)
- Produção de conteúdo orgânico (carrosséis, roteiros, scripts de vídeo)

## Clientes e contexto
Clientes externos, principalmente concessionárias e lojas de carro. Fluxo de entrada: Lucas faz triagem + reunião comercial → cliente assina → Lucas cria briefing (transcrição via Faton) → Matheus faz onboarding e apresentação de estratégia → 3 dias úteis pra subir campanhas.

## Tom de voz
Direto, prático e que transmita confiança. Estilo narrativo — parece pessoa falando, não texto de IA. Tom informal no dia a dia, mais sério quando o output vai pro cliente. Sem travessões. Sem construções contrastivas típicas de IA.

## Ferramentas conectadas
- Meta Ads, Google Ads
- ClickUp (gestão de tasks)
- Obsidian (anotações pessoais — cursos, livros, conteúdos)
- Canva — MCP instalado (`@canva/canva-mcp-server`)
- Google Drive — MCP instalado (`@gongrzhe/server-google-drive-autoauth-mcp`)
- Sistema Raiz (Flask local: localhost:8000)

---

## Contexto do negócio

No início de toda conversa, ler os seguintes arquivos (se existirem e estiverem configurados):

1. `_contexto/empresa.md` — quem é o usuário, o que faz, como funciona o negócio
2. `_contexto/preferencias.md` — tom de voz, estilo de escrita, o que evitar
3. `_contexto/estrategia.md` — foco atual, prioridades, o que pode esperar

Usar essas informações como base pra qualquer resposta ou decisão. Ao sugerir prioridades, formatos ou abordagens, considerar o foco atual descrito em `estrategia.md`.

Para qualquer tarefa visual (carrossel, proposta, slide, landing page), consultar `marca/design-guide.md` como referência de estilo.

Não é necessário listar o que foi lido nem confirmar a leitura. Apenas usar o contexto naturalmente.

---

## Fluxo de trabalho

Antes de executar qualquer tarefa, verificar se existe uma skill relevante em `.claude/skills/` ou `.claude/commands/`.
Se encontrar, seguir as instruções da skill.
Se não encontrar, executar a tarefa normalmente.

Ao concluir uma tarefa que não tinha skill mas parece repetível, perguntar:

> "Isso pode virar uma skill pra próxima vez. Quer que eu crie?"

Não perguntar pra tarefas pontuais ou perguntas simples. Só quando o padrão de repetição for claro.

---

## Aprender com correções

Quando o usuário corrigir algo ou dar uma instrução permanente (frases como "na verdade é assim", "não faça mais isso", "prefiro assim", "sempre que...", "evita..."), perguntar:

> "Quer que eu salve isso pra não precisar repetir?"

Se sim, identificar onde salvar:

- **Sobre o negócio** → `_contexto/empresa.md`
- **Sobre preferências e estilo** → `_contexto/preferencias.md`
- **Sobre prioridades e foco atual** → `_contexto/estrategia.md`
- **Regra de comportamento nessa pasta** → `CLAUDE.md`

Salvar com uma linha nova clara, sem reformatar o arquivo inteiro.

---

## Manter contexto atualizado

Ao terminar uma tarefa que mudou algo relevante no projeto, perguntar:

> "Isso mudou algo no teu contexto. Quer que eu atualize os arquivos de memória?"

Se sim, identificar o que precisa atualizar e mostrar o que vai mudar antes de salvar.

**Quando NÃO perguntar:** tarefas pontuais (email avulso, post avulso), perguntas simples, mudanças já salvas pelo bloco anterior.

**Dica:** se não sabe se algo mudou, rode `/atualizar`.

---

## Criação de skills

Quando o usuário pedir pra criar uma nova skill:

1. Verificar se existe template relevante em `templates/skills/`
2. Perguntar: "Essa skill é específica pra esse projeto ou vai ser útil em qualquer projeto?"
   - Específica → `.claude/skills/nome-da-skill/SKILL.md`
   - Global → `~/.claude/skills/nome-da-skill/SKILL.md`
3. Ler `_contexto/empresa.md` e `_contexto/preferencias.md` pra calibrar o conteúdo
4. Se precisar de arquivos de apoio, criar dentro da pasta da skill
5. Seguir o fluxo da skill-creator nativa do Claude Code

---

## Arquitetura do sistema

**Contexto** — `_contexto/`: empresa.md, preferencias.md, estrategia.md

**Identidade visual** — `marca/design-guide.md`. Logos em `marca/`. Fonte Agatho em `marca/Agatho (Fonte Raiz)/`. Paleta: Verde Petróleo `#1E3D34`, Branco Gelo `#F5F5F5`, Dourado Suave `#CBA135`, Cinza Grafite `#2C2C2C`.

**Skills** — `.claude/commands/` (padrão do kit), `.claude/skills/` (criadas pelo usuário).

**Segredos** — sempre em `.env` (nunca hardcoded).

**Auto-sync** — hook Stop em `.claude/settings.json` faz commit + push automático ao final de cada sessão.
