# Contexto — R/T Motors

**Segmento:** Revenda de veículos usados (Caxias do Sul/RS)
**Início do projeto:** setembro/2025
**Meses de projeto:** ~6 (set/25 a mar/26 e seguindo)
**Tom do cliente:** Descontraído, boa relação com o time. Direto nas reuniões. Aceita sugestões bem.

## Histórico de métricas (tráfego pago — Meta Ads)

| Mês | Faturamento (tráfego) | Leads | Vendas (tráfego) | Investimento | ROAS | Conv% | CAC |
|-----|----------------------|-------|-----------------|--------------|------|-------|-----|
| Out/25 (set 23–out 31) | R$168.100 | 262 | 3 | R$1.958 | 85x | 1,15% | R$650 |
| Nov/25 | R$210.000+ | — | 3 | R$1.700 | ~118x | ~1,9% | R$591 |
| Dez/25 | R$200.000 | ~130 | 4 | ~R$2.000 | ~104x | ~2% | ~R$480 |
| Jan/26 | R$427.000 | ~230 | 5 | ~R$1.785 | 250x | 2,17% | R$340 |
| Fev/26 | R$323.000 | < Jan | > Dez | — | — | — | — |

> **Referência de meses completos do cliente (total da loja):** média era ~9 carros/mês antes do projeto. Após início: meses de 19 carros (recorde), seguidos de mais recordes em jan/26.

## Fases do projeto

- **Mês 1-2 (out-nov/25):** Aquecimento, CAC validado em ~R$600. Agência marcou projeto como "sustentável" (bolinha verde no grupo). Removeu Paraná do targeting por baixa conversão.
- **Mês 3 (dez/25):** Estabilização. 4 vendas, bom mês.
- **Mês 4 (jan/26):** Explosão de resultado. Recorde de tudo: leads, faturamento, ROI, menor CAC. Campanha muito mais eficiente com menos investimento.
- **Mês 5 (fev/26):** Fevereiro (mês naturalmente fraco) foi o melhor da história da loja.
- **Mês 6 (mar/26):** Foco em ajustes operacionais: filtrar leads não qualificados, processo comercial, gestão de estoque no ads.

## Google Meu Negócio

- Score antes: 60/100 | Posição: 12ª
- Score depois (2 meses): 95/100 | Posição: 10ª
- Crescimento de ligações (set→out): +233%
- Crescimento de orientações: +38,7%
- Gargalo identificado: pouquíssimas avaliações (só 4 vs concorrentes com 66-250). Ação combinada: QR Code no balcão + mensagem para compradores antigos.

## Targeting geográfico

- RS: principal, melhor conversão
- SC: removido em mai/26 (cliente relatou que leads de SC não convertiam — distância física era obstáculo. Dados mostravam CPL de SC até mais barato que RS, mas sem conversão em venda)
- PR: removido em nov/25 (leads chegavam mas não convertiam — distância era obstáculo)

## Estrutura de campanhas (mai/2026)

**Campanha principal:** [IG] Venda Carros
**Investimento total:** ~R$46/dia

| Conjunto | Budget | Público |
|----------|--------|---------|
| Variados | R$30/dia | Homens 35-55, RS, AND logic (ver abaixo) |
| Duas rodas e mar | R$10/dia | Homens 35-55, RS, interesses moto/náutica, somente IG |
| Remarketing | R$6/dia | Engajou IG 365d + assistiu vídeo 50% + seguidores |

**Targeting Variados (mai/2026 — AND logic):**
- Grupo 1: Engaged Shoppers
- Grupo 2 (AND): iCarros, Sites de vendas de veículos, Concessionária (varejista), Financiamento, Crossover (automóvel), Propriedade de imóveis, Proprietários de pequenas empresas

**Mensagem padrão por anúncio:** configurada com preço de cada carro no formato "Vi o [MODELO] [ANO] por R$[PREÇO] no anúncio de vocês. Ainda está disponível?"

## Diagnóstico mai/2026

**Feedback do Reinaldo:**
- Leads chegam mas a maioria só pede preço, sem avançar na negociação
- Muitas mensagens de SC — não convertiam em venda (distância)
- Carros na Serra (site regional, ~R$187/mês) gerando mais retorno percebido que o Meta

**Métricas (últimos 30 dias, mai/2026):**
- Conta: R$1.606 gasto, 232 conversas iniciadas, CPL R$6,92, frequência 2,61
- Variados RS: R$617, 97 conexões, CPL R$6,37, freq 2,42, CTR 3,01%
- Variados SC: R$273, 44 conexões, CPL R$6,21, freq 1,89, CTR 2,78%
- Variados últimos 7d: CPL R$5,56, freq 1,77, CTR 3,16% (saudável)
- Consignação: R$228, 6 conexões, CPL R$38 — conjunto pausado/descontinuado

## Alterações feitas em mai/2026

- SC removido do targeting de Variados e Duas rodas e mar (ficou só RS)
- Variados: lógica OR virou AND — Engaged Shoppers AND interesses automotivos/financeiros
- Duas rodas e mar: posicionamento restrito a somente Instagram
- Mensagem padrão atualizada com preço em todos os anúncios ativos do Variados e Duas rodas e mar
- Card CTA de remarketing criado (1080x1080) em `Entregaveis/cta-carrossel-remarketing.html/.png`
- Carrossel de remarketing (9 carros + card CTA) montado pelo cliente direto no Ads Manager

## Alterações feitas em jun/2026

**Campanha Consignação — 03/jun:**
- Reativada campanha `[ENGAJAMENTO] [MENSAGEM] [CBO]` com dois criativos ativos no conjunto `[IG] [H/M] [35-60] - Caxias 50km + Interesses`
  - AD001 (criativo validado, testado anteriormente): rodando
  - AD006 (criativo novo): R$34 gastos, 1-2 leads, CPL ~R$17 — performando melhor que o histórico do AD001 (CPL anterior R$43)
- Interesses atualizados no ad set ativo: saiu "Automóveis (veículos)" e AND Engaged Shoppers, entrou "iCarros" (ID: 6004484839610), manteve "Sites de vendas de veículos"
  - Lógica virou OR simples entre os dois interesses — sem AND com behavior
  - Audiência resultante: 140-170k (tamanho saudável para campanha local com R$8/dia)
- Budget da consignação: R$6 → R$8/dia
- Budget Variados: R$30 → R$28/dia (para compensar aumento na consignação sem elevar total)

**Performance 27/mai a 03/jun (referência):**
| Conjunto | Gasto | Conversas | CPL |
|----------|-------|-----------|-----|
| Variados | R$214,81 | 15 | R$14,32 |
| Duas rodas | R$80,67 | 12 | R$6,72 |
| Remarketing | R$44,30 | 3 | R$14,77 |
| Consignação | R$46,56 | 1 | R$46,56 |

## Ações pendentes (jun/2026)

- [ ] Monitorar consignação por 7-10 dias após alteração de interesses — verificar se CPL melhora com iCarros + OR logic
- [ ] Avaliar ativar Advantage+ Audience como segundo ad set na consignação (teste paralelo ao ad set manual)
- [ ] Criativos com preço visível na primeira imagem do carrossel — Reinaldo vai produzir
- [ ] Lista de clientes compradores — ainda não enviada pelo Reinaldo
- [ ] Subir vídeo de zero km como criativo adicional no conjunto Variados

## Próximos testes planejados

### Campanha de formulário (Leads) — mai/2026
R/T Motors é o primeiro cliente da Raiz a testar campanha de formulário instantâneo.
**Motivo:** Campanha de mensagem não está convertendo bem (problema generalizado, confirmado por mentores do Subido Pro). Campanha de formulário tem apresentado resultados melhores no mercado.
**Status:** A ser estruturado. Ainda rodando campanha de mensagem atual enquanto define a nova estrutura.

## Analogias e metáforas que funcionaram

- "Tráfego é como ensinar uma criança a andar" — usada no onboarding, boa recepção
- "Score do Google é como score de banco" — entenderam imediatamente
- "Bolinha verde no grupo" como símbolo de projeto sustentável — criou expectativa e satisfação quando atingido

## Observações específicas

- Cliente: Reinaldo. Tom descontraído, boa relação, direto nas reuniões
- Cliente muito satisfeito desde o primeiro mês. Em out/25 já disse que "foi mais do que eu esperava"
- Boa abertura para sugestões e testes (aceita mudanças de targeting, criativos, etc.)
- Não tem processo comercial formalizado — pedem ajuda para estruturar o fluxo de atendimento
- Carros na Serra é canal complementar (captura intenção ativa), não concorrente do Meta (cria demanda)
- Estoque variado: carros de R$30k a R$227k — ticket médio muito variável
