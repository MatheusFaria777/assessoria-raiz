# Sistema Raiz v3 — Plano de Reconstrução

Sistema interno da Assessoria Raiz para gestão de relatórios, sincronização de planilhas e upload de anúncios.

---

## Stack

| Camada | Tecnologia | Status |
|---|---|---|
| Backend | FastAPI (Python) | ✅ Rodando |
| Frontend | React + Vite + Tailwind | ✅ Rodando |
| Banco | SQLite (local) → PostgreSQL (Railway) | ✅ Migrado |
| Tokens | Criptografia Fernet | ✅ Implementado |
| Hosting | Railway | ✅ Online — sistema.assessoriaraiz.com.br |

---

## Status das funcionalidades

### ✅ Concluído

| Funcionalidade | Detalhes |
|---|---|
| Gestão de clientes | 18 clientes migrados, Meta + Google no mesmo cliente |
| Grupos de campanha | Por plataforma (Meta/Google), preview de matching em tempo real |
| Relatórios Meta Ads | Semanal + mensal, melhores criativos, histórico |
| Relatórios Google Ads | Por canal (Pesquisa, Display, YouTube, Performance Max) |
| Google Sheets sync | Meta e Google, semanal e mensal |
| Sync automático ao marcar "Enviado" | Planilha sincroniza junto |
| Agendamento automático 10h | Por dia da semana por cliente |
| Janela rolante 7 dias | until=ontem, since=ontem-6 (correto para planilha) |
| Uploader de anúncios | Instagram URL → IA copy → Meta Ads |
| Rate limit com backoff | 2min → 5min → 10min automático |
| Token Meta 60 dias | Com renovação automática às 9h |
| Google Ads credentials | Salvas e criptografadas |
| Lista de anúncios ativos | Botão "📋 Ativos" por cliente |
| Dashboard (tela inicial) | Relatórios do dia + pendentes + gerar + copiar + enviado |
| Notificação de anúncio | Botão "Copiar notificação" no Uploader |
| Múltiplos adsets por cliente | Configurável por cliente |
| Melhores criativos no relatório | Top 3 com link do Instagram |

### ✅ Também concluído

| Funcionalidade | Detalhes |
|---|---|
| Login (usuário + senha) | JWT, Matheus (admin) + Lucas (operacional) |
| Deploy Railway | Dockerfile + PostgreSQL + variáveis configuradas |
| Google OAuth token refresh | Botão "Autenticar com Google" — renova refresh token em 1 clique |
| Fila global de upload | Múltiplos clientes na fila ao mesmo tempo |
| Relatório de anúncios ativos | Sem numeração, deduplicado por nome, inclui IN_PROCESS |

### ✅ Concluído na sessão 2026-06-01

| Funcionalidade | Detalhes |
|---|---|
| Saldos Meta Ads no dashboard | Grid sempre visível, usa `funding_source_details` (saldo real PIX/prepago) |
| Saudação dinâmica | Bom dia/tarde/noite + nome do usuário logado |
| Google Ads REST | Reescrito sem gRPC — usa API v20 via requests |
| Clientes sem N+1 | selectinload em campaign_groups e adsets |
| Instagram Uploader | Reescrito com API mobile (`/api/v1/media/{pk}/info/`) + sessionid |
| Mediari fix | meta_account_id = 1758945342145133 corrigido no banco |
| Casa Valerio fix | active = TRUE corrigido no banco |

### ✅ Concluído na sessão 2026-06-11

| Funcionalidade | Detalhes |
|---|---|
| Uploader — polling adaptativo | `useEffect` na montagem inicia poller recursivo: 4s quando há itens ativos (processing/pending), 20s quando fila está limpa. Sem F5 manual. |
| Uploader — badge Rate Limit | Itens em backoff de rate limit mostram badge laranja "Retry automático" com estimativa de tempo extraída da mensagem do backend |
| Uploader — criação do zero | Aviso de "anúncio modelo" removido — sistema já criava do zero. Novo aviso verifica Page ID (campo obrigatório real) |

### ✅ Concluído na sessão 2026-06-05

| Funcionalidade | Detalhes |
|---|---|
| Formulários públicos mobile (iOS fix) | GmbForm + FeedbackPublic reescritos — sem animações CSS, `fontSize: 16` em inputs, sem `isMobile` JS, sem `position: sticky` |
| Entry points separados no Vite | `gmb.html` + `feedback.html` como entrada separada — bundle GMB: 21 kB gzip, NPS: 24 kB gzip |
| Rotas `/gmb` e `/nps` no FastAPI | `main.py` serve HTMLs corretos por rota em vez de sempre `index.html` |
| Painel lateral — layout CSS puro | Classes `.pub-layout`, `.pub-panel`, `.pub-mobile-logo` via media query 900px — sem JS |
| Duplicate ads Motocar pausados | AD120 e AD121 (BYD Dolphin duplicados) pausados via Meta Graph API |

### ⏳ Pendente — ordenado por prioridade

| # | Funcionalidade | Por que importa |
|---|---|---|
| 1 | **Testar Instagram Uploader** | Deploy do refactor estava em andamento — confirmar que funciona |
| 2 | **Testar Google Ads (MJ + Rubinho)** | v20 deployado mas não confirmado pelo usuário |
| 3 | **Favicon + logo no sidebar** | PNG bloqueado pelo gitignore |
| 4 | **Alerta de token no header** | Badge quando token Meta vence em <7 dias |
| 5 | **Relatório mensal** | Não urgente |
| 6 | **Sync mensal da planilha (VISÃO GERAL)** | Aba mensal do Google Sheets |
| 7 | **Resumo de IA no relatório** | Parágrafo de análise semanal gerado por IA |
| 8 | **WhatsApp via Z-API** | Envio direto no grupo (~R$100/mês — discutir) |

---

## Próximos passos imediatos

### 1. Login simples (antes do deploy)
- Tela de login com usuário + senha
- Sessão com token JWT (expiração em 8h)
- Usuários: Matheus (admin) + Lucas (operacional)
- Admin pode criar/editar usuários; operacional usa normalmente

### 2. Deploy Railway
- Projeto: `appealing-consideration`
- Serviço: `sistema-raiz`
- Banco: PostgreSQL Railway
- Variáveis configuradas: `DATABASE_URL`, `SECRET_KEY`, `FERNET_KEY`, `ENVIRONMENT`
- CLI: `railway up --service sistema-raiz` para redeploy

### 3. Pós-deploy
- Rodar `migrate_sqlite_to_postgres.py` com `DATABASE_URL` do Railway pra copiar os dados
- Configurar domínio próprio via Cloudflare (opcional)
- Google OAuth callback URL atualizar no Google Cloud Console para URL do Railway

---

## Ideias futuras (discutir antes de implementar)

### WhatsApp como entrada do Uploader
Mandar link do Instagram no grupo → sistema detecta + processa automaticamente.
Requer: Z-API configurado.

### Notificação automática ao subir anúncio
Sistema envia mensagem no grupo do cliente quando o anúncio sobe.
Status: botão "Copiar notificação" já existe — versão automática entra com WhatsApp.

### Pack Raiz (nome provisório)
Sistema automatizado de criação de criativos para concessionárias. Cliente envia foto + dados do veículo → sistema monta o criativo e envia de volta.
Potencial de produto vendável. Ver `projetos/pack-raiz/CLAUDE.md`.

### Dashboard de performance
Visão consolidada de todos os clientes com métricas principais em um só lugar.
