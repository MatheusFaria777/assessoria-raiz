# Reestruturação Digital — Sessão jun/2026

Registro completo da sessão de reorganização digital para retomar de onde parou após formatar o PC.

---

## Diagnóstico — o que estava errado

O problema não era falta de controle, era excesso de ferramentas sem arquitetura clara:

- **iPhone:** Screenzen + Screen Time + escala de cinza + DB App + limites por app = ninguém sabia o que fazia o quê. Brechas: senha do Screen Time decorada, YouTube Shorts sem bloqueio, conteúdo adulto liberável com senha conhecida.
- **PC:** Brave com 4-5 extensões (Stay Focused, Stay Free, Social Focus, outras), Chrome como segundo navegador para WhatsApp + Instagram de trabalho, sem papel claro definido para cada um.
- **Mac:** mesma brecha da senha do Screen Time.

**Padrão de cedência identificado:** fim do dia, quando termina as tarefas e sente que "merece descanso". A mente vai atrás de dopamina barata. Raramente acontece no meio do trabalho (isso melhorou com a faxina de 30 dias do livro).

**O que funciona:** DNS no PC — alto atrito para remover = não tenta. Esse foi o modelo de referência para tudo.

---

## Princípio que guia a nova arquitetura

Uma ferramenta por dispositivo. Janelas claras de uso. Bloqueio que não depende de decorar senha.

---

## iPhone — CONCLUÍDO

### One Sec (app principal de bloqueio)
- Apps adicionados: Instagram, TikTok, Facebook
- Atalhos iOS configurados nos três apps (obrigatório para funcionar)
- **Intervenção:** delay de 20 segundos (tempo certo — quebra o reflexo sem ser irritante a ponto de burlar)
- **Agenda de bloqueio (todos os dias):**
  - Bloqueado: 00:00 às 12:00
  - Aberto: 12:00 às 13:00 (janela almoço)
  - Bloqueado: 13:00 às 20:00
  - Aberto: 20:00 às 21:00 (janela noite)
  - Bloqueado: 21:00 às 23:59

### Screen Time (camada noturna + limites)
- Repouso (Downtime): 21h às 8h
- Limite de apps: categoria Redes Sociais → 30 min/dia
- Limites antigos deletados (TikTok, Clash Royale, Facebook que não funcionavam)
- Lista "Sempre Permitido": WhatsApp, Maps, Spotify, Câmera, ClickUp, PicPay, app de treino, Google Agenda
- **Senha:** 4 dígitos gerada no Bitwarden, anotada em papel físico em lugar com atrito (não na carteira, não no celular). Não memorizada.

### YouTube
- **Removido do celular.** Principal brecha dos Shorts. Usar só no PC.

### Screenzen
- **Desinstalado.** Screen Time + One Sec cobrem tudo sem duplicação.

### Escala de cinza
- Atalho de triplo clique no botão lateral configurado (Ajustes → Acessibilidade → Atalho de Acessibilidade → Filtros de Cor)
- Automação no app Atalhos: reativa automaticamente às 21h todo dia

---

## PC — PENDENTE (retomar após formatar)

### Extensões no Brave
- [ ] Instalar extensão do **One Sec** no Brave (baixar no site do One Sec)
- [ ] Instalar **nossa extensão customizada** no Brave:
  - Abrir `brave://extensions`
  - Ativar "Modo do desenvolvedor" (toggle canto superior direito)
  - Clicar "Carregar sem compactação"
  - Selecionar a pasta `pessoal/minimalismo/extensao-navegador/`
- [ ] **Remover todas as extensões antigas** que não funcionavam: Stay Focused, Stay Free, Social Focus, qualquer outra que duplicava função

### Chrome
- [ ] **Não instalar nenhuma extensão de bloqueio no Chrome**
- [ ] Chrome = ferramenta de trabalho puro. Abre com tarefa específica, fecha ao terminar.
- [ ] Instalar **WhatsApp Desktop** (app nativo Windows: whatsapp.com/download) — parar de usar Chrome para WhatsApp

### DNS
- [ ] Verificar se o DNS ainda está bloqueando (tentar acessar um site que deveria estar bloqueado)

### Mac — PENDENTE SEPARADO
- [ ] Instalar **NextDNS** (serviço gratuito até 300k consultas/mês) para bloquear conteúdo adulto sem depender de senha do dispositivo
  - Criar conta em nextdns.io
  - Instalar perfil de configuração no Mac
  - Senha do painel NextDNS: guardar só em papel físico

---

## Papel dos navegadores (definição final)

| Navegador | Uso | Extensões |
|-----------|-----|-----------|
| **Brave** | Pessoal + trabalho geral | One Sec + nossa extensão customizada |
| **Chrome** | Ferramenta de trabalho (Facebook clientes, Instagram clientes, creatives) | Nenhuma |

Regra do Chrome: abriu com tarefa específica, terminou, fechou.

---

## Extensão customizada — `pessoal/minimalismo/extensao-navegador/`

Desenvolvida nessa sessão. Faz o que o One Sec não faz: limpeza visual de feeds.

**O que faz:**
- **Facebook:** nunca bloqueia (necessário para trabalho). Esconde feed, Stories e botão de Reels via CSS.
- **Instagram:** bloqueia site inteiro fora das janelas (no Brave). Esconde feed de posts e botão de Reels sempre.
- **TikTok:** bloqueia site inteiro fora das janelas.
- **YouTube:** esconde Shorts da home e sidebar sempre. Bloqueia /shorts fora das janelas.
- **Gerenciador de anúncios** (business.facebook.com, adsmanager.facebook.com): nunca bloqueia.

**Janelas configuradas na extensão:** 12:30–13:00 e 20:15–20:45
(ligeiramente diferentes do One Sec que é 12:00–13:00 e 20:00–21:00 por limitação do app)

**Para instalar:** `brave://extensions` → Modo desenvolvedor → Carregar sem compactação → pasta `extensao-navegador/`

**Para atualizar após mudança de código:** `brave://extensions` → ícone de atualizar na extensão

---

## One Sec — informações de conta

- Teste gratuito de 1 semana ativo em jun/2026
- Plano anual: R$29/ano (vale)
- Tem extensão para navegador (instalar no Brave junto com a nossa)
- Plano vitalício existe: $99 USD (considerar se anual não bastar)

---

## Decisões descartadas e por quê

| O que foi descartado | Por quê |
|---------------------|---------|
| Screenzen como ferramenta principal | Screen Time nativo + One Sec cobrem tudo melhor |
| Opal | Assinatura sem opção vitalícia acessível |
| Senha com outra pessoa | Não tem pessoa de confiança disponível 24h para emergências |
| Uma extensão única de navegador | One Sec + nossa extensão têm papéis distintos, sem sobreposição |
| Chrome como navegador principal | Brave com extensões é melhor para uso pessoal controlado |
