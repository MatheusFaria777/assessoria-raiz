# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Assessoria Raiz — Claude Code OS

## O que é esse workspace
Workspace operacional da Assessoria Raiz — assessoria de tráfego pago (Meta Ads e Google Ads) com foco em clientes do setor automotivo. Usado no dia a dia pra produzir entregáveis pro cliente, automatizar processos e criar conteúdo.

**Estrutura de pastas:**
- `Clientes/` — uma pasta por cliente com briefing, onboard e apresentação de estratégia
  - `motocar-veiculos/` — loja de carros (revenda), cliente desde nov/2025
  - `podium-racing/` — loja de revenda de motos (não mecânica)
  - `robert-eddlei/` — tatuador, estúdio solo. Meta Ads + Google Meu Negócio + direção de Instagram. Problema: qualificação do público
  - `mediari-cobrancas/` — empresa de cobrança extrajudicial (condomínios e imobiliárias), SP. Meta Ads. Transcrições de reuniões em `Transcrições/`
  - `assessoria-raiz/` — tráfego próprio da Raiz tratado como cliente interno (briefing, contexto histórico, aprendizados de campanha)
  - `boye-motors/` — loja de carros (revenda). Transcrições de reuniões em `Transcrições/`
  - `efatah-veiculos/` — loja de carros (revenda). Cliente desde mai/2026. Transcrições de reuniões em `Transcrições/`
  - `casa-valerio/` — restaurante. Meta Ads + produção de conteúdo visual (vídeos e reels). Cliente desde out/2025.
  - `estetica-thiara/` — clínica de estética solo, Caxias do Sul/RS. Cliente desde mai/2026. Foco em HiPro e Laser (alto ticket).
  - `cz-contabilize/` — escritório de contabilidade, Caxias do Sul/RS. Cliente desde mar/2026. Google Ads.
  - `rt-motors/` — R/T Motors, cliente ativo.
  - `mk-beauty/` — salão de beleza, cliente ativo.
  - `cipriani-veiculos/` — loja de carros (revenda). Compra no Pix, avaliação em 15 min, aceita financiado, faz consignação.
  - `jetor-veiculos/` — loja de carros (revenda). Responsáveis: João e Ivo. Cliente desde jun/2026. Reunião estratégica 11/06/2026.
  - `autocerto-multimarcas/` — loja de carros (revenda multimarcas), Encantado/RS. Cliente desde jun/2026. Primeiro ano de loja física.
  - `re-imports/` — revenda de iPhones usados/seminovos. Ticket médio: ~R$4.700. Cliente desde jun/2026.
  - `mj-sondagem/` — empresa de sondagem de solo. Atua no PR e SC. Cliente desde jun/2026.
  - `monego-eletromec/` — operação solo do Cristian Mônego. Manutenção de máquinas industriais (plasma CNC, laser, dobradeiras), laudos de inspeção. Caxias do Sul/RS. Cliente desde jun/2026.
  - `vargas-veiculos/` — loja de carros (revenda). Responsável: Leandro Vargas. Cliente desde jun/2026. Estoque ~40 carros, meta sair de 15 para 25 vendas/mês.
  - `listas/` — listas de clientes (não é pasta de cliente — drop zone para arquivos de lista)
  - `_modelo-cliente/` — template base para novos clientes
- `conteudo/` — carrosséis, roteiros, scripts de vídeo e newsletter
  - `conteudo/roteiros/` — roteiros de vídeo curto (Reels/TikTok) gerados pelo `/roteiro-post`
  - `conteudo/planejamento/newsletter/` — planejamento da newsletter: ideias de formato, referências (Sobral, Ratos de IA, GreatPages) e opções de nome
  - `conteudo/planejamento/ideias/` — ideias de conteúdo salvas para virar carrossel ou roteiro
  - `conteudo/referencias/` — referência de estilo narrativo e imagens de referência (carrosséis, reels)
  - `conteudo/omatheusfariaa/` — perfil pessoal do Matheus (@omatheusfariaa): posts publicados, métricas e aprendizados. Ver `conteudo/omatheusfariaa/CLAUDE.md`
- `Sistema-raiz/` — Sistema Raiz v3 (FastAPI + React) — plataforma interna operacional com 21 clientes
- `_contexto/` — contexto do negócio e preferências (`empresa.md`, `preferencias.md`, `estrategia.md`, `servicos.md`)
- `marca/` — logos, fonte Agatho e guia de design
- `conteudo/referencias/referencia-mentora.md` — referência de estilo narrativo (estrutura, tom, padrões de título) para carrosséis e roteiros
- `projetos/pack-raiz/` — ideia de produto (nome provisório): sistema automatizado de criação de criativos para concessionárias (discutir escopo antes de implementar)
- `projetos/comunidade-leitura/` — projeto pessoal do Matheus: comunidade de leitura e livros (TikTok + YouTube + comunidade paga). Em fase de ideação desde jun/2026. Não é da Raiz — é da marca pessoal do Matheus.
- `paginas/` — páginas HTML estáticas publicadas no Cloudflare Pages (ex: política de privacidade)
- `dados/` — drop zone temporária. Após analisar qualquer arquivo, limpar a pasta. Se o arquivo tiver valor permanente (referência, estilo, contexto), mover para o local adequado antes de apagar. Nunca deixar acumulando.
- `pessoal/` — Sistema de Performance pessoal do Matheus. Contexto completamente diferente do trabalho — ver seção abaixo.
- `comunicacao/` — base de conhecimento de oratória e comunicação (livro "Como Falar Bem e Ficar Rico" + aplicações por tipo de reunião). Skills: `/analisar-reuniao` (feedback pós-reunião) e `/falar-bem` (preparo pré-fala)
- `templates/skills/` — templates de skills prontos pra personalizar com /mapear
- `templates/ferramentas/catalogo.md` — APIs e ferramentas disponíveis pra usar em skills
- `memory/` — memória persistente entre sessões (arquivos .md com contexto acumulado, lidos automaticamente pelo Claude)

## Sobre o negócio
Assessoria Raiz é uma assessoria de tráfego pago fundada por Matheus (operacional/estratégico) e Lucas (sócio, comercial). A maior parte dos clientes são concessionárias e lojas de carro. Equipe: Matheus, Lucas, namorada do Matheus (criadora de conteúdo — vídeos e carrosséis) e um video maker adicional provisório.

## O que mais fazemos aqui
- Relatórios mensais e planilhamento de dados de campanhas
- Estrutura e upload de campanhas (Meta Ads e Google Ads)
- Upload de criativos de carros via Sistema Raiz (automação de anúncios de concessionárias)
- Onboarding de novos clientes — skill `/onboarding` lê transcrições do Fathom, gera roteiro + slides PPTX e cria pasta no Drive automaticamente
- Diagnóstico de perfil do Instagram (HTML)
- Reuniões de alinhamento mensal (humanização de dados pro cliente)
- Produção de conteúdo orgânico (carrosséis, roteiros, scripts de vídeo)

## Clientes e contexto
Clientes externos, principalmente concessionárias e lojas de carro. Fluxo de entrada: Lucas faz triagem + reunião comercial → cliente assina → Lucas grava as calls no Fathom → Claude lê os transcritos e gera o onboarding automaticamente via `/onboarding` → Matheus faz onboarding e apresentação de estratégia → 3 dias úteis pra subir campanhas.

## Tom de voz
Direto, prático e que transmita confiança. Estilo narrativo — parece pessoa falando, não texto de IA. Tom informal no dia a dia, mais sério quando o output vai pro cliente. Sem travessões. Sem construções contrastivas típicas de IA.

## Ferramentas conectadas
- Meta Ads — skill `/meta-ads-ratos` com SDK oficial (`facebook-business`), token em `.claude/skills/meta-ads-ratos/.env`
- Google Ads — skill `/google-ads-ratos` com SDK oficial (`google-ads-api`), token em `.claude/skills/google-ads-ratos/.env`

## Skills instaladas
- `/meta-ads-ratos` — gestão completa de Meta Ads via SDK (campanhas, insights, targeting, criativos)
- `/onboarding` — lê transcrições do Fathom, gera roteiro + slides e cria pasta no Drive
- `/alinhamento-mensal` — gera apresentação mensal de alinhamento para o cliente em HTML
- `/analisar-reuniao` — analisa transcrição de reunião por vícios verbais, prolixidade, sinalização e teste do elevador
- `/carrossel` — cria carrosséis completos para Instagram e TikTok
- `/pesquisar-tema` — pesquisa temas e ângulos para conteúdo
- `/roteiro-post` — transforma ideia, texto ou link em roteiro de post/vídeo/newsletter
- `/diagnostico-instagram` — gera diagnóstico visual do Instagram do cliente em HTML (bio, métricas, destaques, conteúdo), com checklist por nicho (automotivo, estética) e identidade visual adaptada ao cliente
- `/google-ads-ratos` — gestão completa de Google Ads via SDK oficial (campanhas, keywords, quality score, GAQL)
- `/falar-bem` — prepara uma fala, áudio ou roteiro antes de comunicar, aplicando os princípios de `comunicacao/`
- `/planejar-semana` — planejamento semanal de tarefas e prioridades
- `/preparar-gravacao` — prepara roteiro e checklist antes de uma gravação
- `/registrar-conteudo` — registra conteúdo produzido (post, vídeo) com métricas e aprendizados
- `/canvas-design` — criação e edição de designs no Canva via MCP
- `/frontend-design` — apoio em desenvolvimento e estilo de interfaces frontend
- Google Ads
- ClickUp (gestão de tasks)
- Obsidian (anotações pessoais — cursos, livros, conteúdos)
- Canva — MCP instalado (`@canva/canva-mcp-server`, com instabilidade de conexão)
- Google Drive — MCP conectado via claude.ai
- Google Calendar — MCP conectado via claude.ai
- Gmail — MCP conectado via claude.ai
- context7 — MCP instalado (`@upstash/context7-mcp`), busca documentação atualizada de libs (FastAPI, React, Tailwind, etc)
- Fathom — não instalado ainda
- Cloudflare Pages — API token em `.env` (raiz do projeto). Dois projetos: `assessoria-raiz` (páginas da Raiz) e `omatheusfariaa` (link na bio + dashboard do @omatheusfariaa em `paginas/links.html` e `paginas/dashboard.html`). Deploy via `npx wrangler pages deploy /tmp/deploy-links --project-name omatheusfariaa --branch main`
- Hevy — API via `pessoal/.env` → `HEVY_API_KEY` (tracking de treinos + atualização de rotinas)
- Sistema Raiz v3 (FastAPI + React, porta 8001 local + Railway online: https://sistema-raiz-production.up.railway.app)

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

## Organização de pasta por cliente

Toda pasta em `Clientes/[cliente]/` segue esta estrutura:

```
Clientes/[cliente]/
  briefing.md          — dados do cliente (nicho, acesso, público)
  contexto.md          — histórico, situação atual, aprendizados
  onboarding.md        — roteiro de onboarding ou perguntas feitas
  feedback.md          — o que o cliente falou, objeções, pontos levantados
  Transcricoes/        — transcrições de reuniões brutas
    onboarding.md
    estrategica.md
    comercial.md
  Entregaveis/         — tudo que é gerado e enviado ao cliente
    diagnostico-instagram.html
    estrategia.html
    alinhamento-[mes].html
    (outros outputs gerados por skills)
```

**Regra:** qualquer output gerado por uma skill (HTML, relatório, apresentação) vai para `Entregaveis/`. Transcrições brutas do Fathom vão para `Transcricoes/`. Arquivos de contexto e briefing ficam na raiz da pasta do cliente.

O template base fica em `Clientes/_modelo-cliente/`.

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

Ao terminar uma tarefa que mudou algo relevante no projeto (novo cliente, nova skill, mudança de foco, novo processo, ferramenta instalada, estrutura de pastas alterada), perguntar:

> "Isso mudou algo no teu contexto. Quer que eu atualize os arquivos de memória?"

Se sim, identificar o que precisa atualizar:

- **Novo cliente, serviço, ferramenta, equipe** → `_contexto/empresa.md`
- **Mudança de prioridade ou foco** → `_contexto/estrategia.md`
- **Correção de tom ou estilo** → `_contexto/preferencias.md`
- **Nova pasta, regra de organização, skill criada** → `CLAUDE.md`
- **Mudança visual (cores, fontes, logo)** → `marca/design-guide.md`

Mostrar o que vai mudar antes de salvar. Não reformatar o arquivo inteiro, só adicionar ou editar a linha relevante.

Quando NÃO perguntar: tarefas pontuais, perguntas simples, mudanças já salvas pelo bloco "Aprender com correções".

Dica: se não sabe se algo mudou, rode /atualizar pra uma varredura completa.

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

## Sistema de Performance Pessoal (pessoal/)

A pasta `pessoal/` é um contexto completamente separado do trabalho. Quando o usuário estiver trabalhando nessa área, o contexto muda — não mistura com empresa, clientes ou tráfego pago.

**Estrutura:**
- `pessoal/_contexto/personas.md` — instruções completas de Raiz (nutrição), Forja (treino) e Breno (finanças)
- `pessoal/_contexto/perfil.md` — dados físicos, rotina, objetivos e contexto pessoal
- `pessoal/_contexto/treino.md` — protocolo atual de treino, exercícios, cargas e regras de progressão
- `pessoal/_contexto/nutricao.md` — plano alimentar, macros, protocolos especiais
- `pessoal/_contexto/financas.md` — protocolo do Breno, metas, histórico financeiro
- `pessoal/historico/cargas.md` — progressão histórica de cargas (atualizada toda sexta)
- `pessoal/historico/peso.md` — curva de peso semanal
- `pessoal/historico/medidas.md` — medidas corporais a cada ~6 semanas
- `pessoal/painel-semana.md` — log da semana corrente (alimentado durante a semana, lido na revisão de sexta)
- `pessoal/revisoes/` — revisões semanais salvas
- `pessoal/minimalismo/` — base de conhecimento do livro "Minimalismo Digital" (Cal Newport). Princípios organizados, configuração digital atual e brechas identificadas.

**Skills disponíveis:**
- `/raiz` — ativa a Raiz (nutricionista)
- `/forja` — ativa o Forja (personal trainer)
- `/breno` — ativa o Breno (conselheiro financeiro)
- `/revisao-semanal` — revisão integrada de sexta (Raiz + Forja + Hevy)
- `/status` — visão geral rápida dos três sistemas (treino, nutrição, finanças)
- `/log` — registra peso, treino ou alimentação no painel da semana

**Regra de salvamento:** tudo salva localmente em `pessoal/`. Não usa mais Obsidian para este sistema.

---

## Arquitetura do sistema

**Contexto** — `_contexto/`: empresa.md, preferencias.md, estrategia.md

**Identidade visual** — `marca/design-guide.md`. Logos em `marca/`. Fonte Agatho em `marca/Agatho (Fonte Raiz)/`. Paleta: Verde Petróleo `#1E3D34`, Branco Gelo `#F5F5F5`, Dourado Suave `#CBA135`, Cinza Grafite `#2C2C2C`.

**Skills** — `.claude/commands/` (padrão do kit), `.claude/skills/` (criadas pelo usuário).

**Segredos** — sempre em `.env` (nunca hardcoded).

**Auto-sync** — hook Stop em `.claude/settings.json` faz commit + push automático ao final de cada sessão.
