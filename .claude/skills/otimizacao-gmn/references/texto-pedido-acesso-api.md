# Texto pro formulário "Application for Basic API Access"

Formulário: support.google.com/business/contact/api_default
Preencher logado com `assessoriaraizz@gmail.com` (Proprietário da ficha da Assessoria Raiz).

## Descrição do caso de uso (colar no campo de use case)

**Português:**

A Assessoria Raiz é uma agência de marketing digital que gerencia o Google
Business Profile de aproximadamente 20 clientes, majoritariamente concessionárias
e lojas de veículos no Brasil. Hoje esse trabalho é feito manualmente por um
operador dentro do painel do Google Business Profile, um cliente de cada vez.

Precisamos de acesso à API pra automatizar três fluxos operacionais recorrentes,
todos já mapeados internamente e usando dados que a agência já coleta dos
clientes via formulário próprio:

1. **Business Information API** — editar dados da ficha (nome, categoria,
   descrição, horário de funcionamento, telefone, site, área de atendimento) e
   subir fotos/vídeos enviados pelos clientes, hoje inseridos manualmente.
2. **Local Posts** (Business Information API) — publicar postagens semanais
   (atualização, novidade ou oferta) geradas a partir do contexto de cada
   cliente, hoje feitas manualmente uma por uma.
3. **Reviews API** — ler e responder avaliações dos clientes usando templates
   já validados internamente por tipo de nota (positiva, neutra, negativa).
4. **Business Profile Performance API** — ler métricas de desempenho (buscas,
   visualizações no Maps, cliques) pra compor os relatórios mensais que já
   entregamos aos clientes.

Cada cliente autoriza o acesso à própria ficha concedendo papel de Gerente ou
Proprietário pra conta da agência, processo que já seguimos hoje manualmente.
A ficha usada pra essa solicitação (Assessoria Raiz) está verificada e ativa há
mais de 60 dias, com o site oficial da empresa vinculado.

**English (caso o formulário exija):**

Assessoria Raiz is a digital marketing agency managing the Google Business
Profile of approximately 20 clients, mostly used car dealerships in Brazil.
This work is currently done manually by one operator inside the Business
Profile dashboard, one client at a time.

We need API access to automate three recurring operational workflows, already
mapped internally, using data the agency already collects from clients through
our own intake form:

1. **Business Information API** — edit listing data (name, category,
   description, business hours, phone, website, service area) and upload
   photos/videos submitted by clients, currently entered manually.
2. **Local Posts** (Business Information API) — publish weekly posts (update,
   offer, or announcement) generated from each client's context, currently
   published manually one by one.
3. **Reviews API** — read and reply to client reviews using response templates
   already validated internally by rating tier (positive, neutral, negative).
4. **Business Profile Performance API** — read performance metrics (search
   impressions, map views, clicks) to feed the monthly reports we already
   deliver to clients.

Each client authorizes access to their own listing by granting Manager or
Owner role to the agency's account, a process we already follow manually
today. The listing used for this request (Assessoria Raiz) has been verified
and active for over 60 days, with the company's official website linked.

## Depois de enviar

- Guardar o protocolo/número de confirmação do pedido (se o formulário gerar um)
- A cota do projeto no Google Cloud sobe de 0 para 300 QPM quando aprovado —
  esse é o sinal de que foi aceito
- Se for recusado, o próximo passo é revisar `memory/project_gmn_automacao.md`
  e considerar promover `assessoriaraizz@gmail.com` a Proprietário principal
  da ficha da Raiz antes de tentar de novo
