# Contexto da Empresa — Assessoria Raiz

**Nome:** Matheus Faria
**Negócio:** Assessoria Raiz
**O que faz:** Assessoria de tráfego pago (Meta Ads e Google Ads), com foco em clientes do setor automotivo (concessionárias e lojas de carro). Também produz conteúdo orgânico e está desenvolvendo ferramentas internas de automação.
**Perfil:** agencia
**Atende clientes:** sim — externos, principalmente do setor automotivo
**Equipe:**
- Matheus — operacional e estratégico (esse workspace)
- Lucas — sócio, cuida do comercial
- Namorada do Matheus — criadora de conteúdo (vídeos, edição, carrosséis para clientes)
- Video maker adicional — provisório, atende um cliente específico

**Ferramentas:**
- Meta Ads (gestão de campanhas e upload de criativos)
- Google Ads (gestão de campanhas)
- ClickUp (tasks e organização do dia a dia)
- Canva (apresentações — sendo substituído por HTML)
- Sistema Raiz v3 (plataforma web interna em FastAPI + React, porta 8001 local + deploy Railway online: https://sistema.assessoriaraiz.com.br)
  - Relatórios Meta e Google Ads automáticos às 10h
  - Sync Google Sheets automático ao marcar enviado
  - Uploader de criativos de carros via Instagram URL com geração de copy por IA (`ai_copy.py`)
  - 21 clientes no banco (19 ativos), banco PostgreSQL no Railway
  - Sistema de formulários: NPS (`/feedback?c=slug`) e Google Meu Negócio (`/gmb?c=slug`)
  - Deploy: `cd sistema-raiz && railway up` (Railway CLI, conta assessoriaraizz@gmail.com)
- Obsidian (anotações pessoais — cursos, livros, conteúdos que quer consumir)
- Google Drive MCP conectado via claude.ai
- Google Calendar MCP conectado via claude.ai
- Gmail MCP conectado via claude.ai
- context7 MCP instalado (`@upstash/context7-mcp`) — busca documentação atualizada de libs durante desenvolvimento
- Fathom — não instalado ainda (mencionado em empresa.md por engano — pendente configuração)
- Canva MCP instalado (`@canva/canva-mcp-server`, com instabilidade de conexão)
- Cloudflare Pages — deploy de páginas estáticas (política de privacidade, futuramente migração de páginas pagas). API token em `.env` na raiz do projeto.

**Principais entregas:**
- Relatórios mensais de campanha (humanização dos dados pro cliente)
- Planilhamento de dados de campanhas no Google Sheets
- Estrutura e upload de campanhas (Meta + Google Ads)
- Upload de criativos de carros (concessionárias) — fluxo automatizado via Sistema Raiz
- Onboarding de novos clientes (documento + apresentação de estratégia em HTML)
- Diagnóstico de perfil do Instagram (em HTML)
- Carrosséis e roteiros de conteúdo orgânico

## Clientes ativos (mai/2026)

Foco principal: setor automotivo (~5-6 clientes de loja de carro/moto). Demais clientes são de outros nichos.

- **Motocar Veículos** — loja de carros (revenda), desde nov/2025
- **Podium Racing** — loja de revenda de motos
- **Robert Eddlei Ink** (@eddleink) — tatuador, estúdio solo, São Paulo. Meta Ads + Google Meu Negócio + direção de Instagram. Problema ativo: qualificação do público
- **Mediari Cobranças** — empresa de cobrança extrajudicial (condomínios/imobiliárias)
- **Boye Motors** — loja de carros (revenda), Campinas/SP (Americana + região). Cliente desde dez/2025. Meta Ads campanha mensagem. Conta act_1216712125709162.
- **Efatah Veículos** — loja de carros (revenda). Cliente desde mai/2026. Transcrições de reuniões em `Transcrições/`
- **Estética Thiara** — clínica de estética solo (Caxias do Sul/RS). Cliente desde mai/2026. Foco em HiPro e Laser (alto ticket). Pasta: `Clientes/estetica-thiara/`
- **Casa Valério** — restaurante. Meta Ads + produção de conteúdo visual (vídeos e reels). Cliente desde out/2025. Pasta: `Clientes/casa-valerio/`
- **CZ Contabilize** — escritório de contabilidade, Caxias do Sul/RS. Cliente desde mar/2026. Google Ads. Pasta: `Clientes/cz-contabilize/`
- **RT Motors** (R/T Motors) — loja de carros (revenda), cliente ativo. Pasta: `Clientes/rt-motors/`
- **MK Beauty** — salão de beleza, cliente ativo. Pasta: `Clientes/mk-beauty/`
- **Cipriani Veículos** — loja de carros (revenda). Compra no Pix, avaliação em 15 min, aceita financiado, faz consignação. Pasta: `Clientes/cipriani-veiculos/`
- **Jetor Veículos** — loja de carros (revenda). Responsáveis: João e Ivo. Cliente desde jun/2026. Reunião estratégica 11/06/2026. Pasta: `Clientes/jetor-veiculos/`
- **AutoCerto Multimarcas** — loja de carros (revenda multimarcas), Encantado/RS. Cliente desde jun/2026. Primeiro ano de loja física. Pasta: `Clientes/autocerto-multimarcas/`
- **RE Imports** — revenda de iPhones usados/seminovos. Ticket médio: ~R$4.700. Cliente desde jun/2026. Pasta: `Clientes/re-imports/`
- **MJ Sondagem** — empresa de sondagem de solo, PR e SC. Cliente desde jun/2026. Pasta: `Clientes/mj-sondagem/`
- **Mônego Eletromec** — operação solo do Cristian Mônego. Manutenção de máquinas industriais (plasma CNC, laser, dobradeiras de chapas), laudos de inspeção. Caxias do Sul/RS. Cliente desde jun/2026. Pasta: `Clientes/monego-eletromec/`
- **Vargas Veículos** — loja de carros (revenda). Responsável: Leandro Vargas. Cliente desde jun/2026. Estoque ~40 carros, média 15 vendas/mês, meta 25. Pasta: `Clientes/vargas-veiculos/`
- **Only Fit** — marmitaria fit, Boa Vista/RR. Assinou contrato mas ainda não deu start.
- Demais clientes no Sistema Raiz v3 (21 total, 19 ativos)

## Fluxo de entrada de cliente

1. Lucas faz reunião de triagem + reunião comercial
2. Cliente assina contrato
3. Lucas cria briefing via transcrição (Faton)
4. Matheus cria documento de onboard (alinha expectativas + perguntas estratégicas)
5. Reunião de onboarding com cliente
6. Matheus cria apresentação de estratégia (HTML)
7. Apresentação pro cliente
8. 3 dias úteis pra subir campanhas + aquecimento da conta

## Estrutura de pasta por cliente no Google Drive

Ao entrar um novo cliente, criar pasta `[Nome Empresa]` no Drive com as seguintes subpastas:

1. Comprovantes
2. Contrato
3. Depósito de Criativos
4. Gravação de Reuniões
5. Lista de Clientes
6. Notas Fiscais
7. Onboarding
8. Plano de Ação
9. Banco de Referências
10. Planilha do cliente (cópia da planilha base da Raiz, renomeada com o nome do cliente)

Esse processo é automatizado pela skill `/onboarding`.

## Tráfego próprio da Raiz

A Assessoria Raiz gerencia o próprio tráfego pago como cliente interno. Pasta: `Clientes/assessoria-raiz/`. Conta Meta Ads: `act_1278967806049217`. Histórico: ~3-4 meses rodando, zero fechamentos até mai/2026. Destinos testados: Landing Page → Respondi (bom CTR, form lento) → Formulário Instantâneo (atual). Skill `/meta-ads-ratos` usada pra gestão e análise.

## Contexto adicional

- Sistema Raiz v3: plataforma web (FastAPI + React) com dashboard diário, relatórios automáticos Meta/Google, sync Google Sheets, uploader de anúncios com IA, Google OAuth one-click, 18 clientes. Login implementado (JWT, Matheus + Lucas). Deploy Railway online: https://sistema-raiz-production.up.railway.app
- Workflow de conteúdo: pesquisa de temas → ângulos → script → carrossel/vídeo/descrição. Matheus testou workflow similar no OpenSquad (a migrar)
- Newsletter: em planejamento ativo — pasta `conteudo/newsletter/` criada com ideias, referências (Sobral, Ratos de IA, GreatPages) e opções de nome
- Plataforma de formulários própria: em desenvolvimento (satisfação, contrato)
- Reunião de alinhamento mensal: Matheus humaniza dados da campanha + fala sugerida por slide (hoje manual no Canva — quer automatizar)
- Onboarding base: feito com analogias e metáforas, usando referências do dia a dia pra explicar o projeto. Tem versão para concessionárias. Quando o cliente é de outro nicho (ex: estética), as perguntas precisam ser adaptadas mantendo a lógica — processo hoje manual que Matheus quer automatizar.
