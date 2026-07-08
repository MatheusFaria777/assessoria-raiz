# Contexto — Motocar Veículos

**Segmento:** loja de carros (revenda)
**Meses de projeto:** ~6 (desde novembro/2025)
**Tom do cliente:** direto e objetivo — não gosta de enrolação

## Histórico de métricas

Somente Meta Ads (objetivo: Mensagem). Google Ads ainda não rodando.

| Mês | Investimento | Leads | CPL | CTR | Vendas | Faturamento | ROAS | CAC | Ticket Médio |
|-----|-------------|-------|-----|-----|--------|-------------|------|-----|--------------|
| Nov/25 | R$ 1.307 | 137 | R$ 9,54 | 1,10% | 1 | R$ 35.000 | 26,8x | R$ 1.307 | R$ 35.000 |
| Dez/25 | R$ 1.496 | 135 | R$ 11,08 | 1,02% | 1 | R$ 79.000 | 52,8x | R$ 1.496 | R$ 79.000 |
| Jan/26 | R$ 1.546 | 211 | R$ 7,33 | 0,96% | 3 | R$ 285.000 | 184,4x | R$ 515 | R$ 95.000 |
| Fev/26 | R$ 1.411 | 208 | R$ 6,78 | 0,89% | 2 | R$ 107.000 | 75,8x | R$ 706 | R$ 53.500 |
| Mar/26 | R$ 1.599 | 186 | R$ 8,60 | 0,69% | 2 | R$ 114.900 | 71,9x | R$ 800 | R$ 57.450 |
| Abr/26 | R$ 1.591 | 115 | R$ 13,83 | 0,58% | 0 | — | 0x | — | — |

**Observações sobre o histórico:**
- Jan/26 foi o melhor mês: 3 vendas, R$285k, ROAS 184x
- Desde jan/26, leads e CTR vêm caindo consistentemente (211 → 115 leads, 0,96% → 0,58% CTR)
- Abr/26 foi o pior mês: 0 vendas, CPL no topo (R$13,83), CTR no fundo (0,58%)
- Ticket médio muito variável — depende do carro vendido (R$35k a R$95k)

## Fases do projeto

- **Mês 1-2 (nov-dez/25):** estruturação e aquecimento — 1 venda por mês, estabilizando campanha
- **Mês 3-5 (jan-mar/26):** melhor performance — pico em jan com 3 vendas, queda gradual em seguida
- **Mês 6 (abr/26):** queda crítica — 0 vendas, leads despencando, CTR no menor nível

## Estrutura de campanhas (mai/2026)

**Campanha ativa:** [ENGAJAMENTO] [MENSAGEM] [ABO] - Venda carros (WPP NOVO)
**Destino:** WhatsApp (não Instagram DM)
**Investimento total:** ~R$53/dia

| Conjunto | Budget | Advantage+ | Público |
|----------|--------|-----------|---------|
| Variados | R$32/dia | ON | Homens 25-55, Encantado 70km, Engaged Shoppers + Proprietários PME + Compras internet |
| ONIX/HB20/T-Cross | R$16/dia | ON | Homens e Mulheres 25-50, Encantado 70km, mesmos sinais |
| Remarketing | R$6/dia | OFF | Engajou 365D + Assistiu vídeo 50% 365D + Seguidores |

**Sinais Advantage+ (Conjuntos 1 e 2):**
- Clientes existentes: `[CLIENTES] Compradores Motocar` (30 contatos, mai/2026)
- Público engajado: engajamento 365D + vídeo 50% 365D + seguidores

**Ads pausados (mai/2026):**
- AD63 - 3 CARROS (cortado): pausado no conjunto ONIX — consumia todo o budget sem converter. HB20S e T-Cross ficaram ativos.
- AD66 - DOLPHIN MINI: pausado, budget realocado.
- AD106 / AD107 - FOCUS 2012: pausados — carro vendido (mai/2026).

**Criativos:**
- Padrão: carrossel por carro com preço + km + ano na imagem
- Aprimoramentos: todos OFF exceto profile_card
- Mensagem padrão WhatsApp: "Olá! Vi o [MODELO] por R$[PREÇO] no anúncio de vocês. Ainda disponível?"
- Remarketing: carrossel 9 carros (Mobi, HB20S, Ecosport, Spin, T-Cross, Corolla 2016, Cruze, Corolla Altis Híbrido, Golf) + card CTA

**Pendências:**
- [ ] Listas de clientes dos outros clientes de carro chegarem → montar megalista → criar Lookalike
- [ ] Criativo do carrossel de remarketing (9 imagens + card CTA gerado em `criativos/card-cta-remarketing.html`)
- [ ] Atualizar template de descrição no Sistema Raiz (novo formato aprovado)
- [ ] Atualizar mensagem padrão do WhatsApp no Sistema Raiz

## Diagnóstico mai/2026

**Problemas identificados:**
- Audience saturation — frequência chegou a 3,56x em abr, reach caindo com budget igual
- Criativo cansado — CTR caiu de 1,54% (mar) para 1,33% (abr)
- Todo targeting era só homens — aberto pra mulheres no Conjunto 2
- Budget fragmentado — muitos ad sets com R$6-12/dia, sem dados suficientes pra otimizar
- Problema de ficha não aprovada = qualificação insuficiente no funil (problema de mercado + criativo)

**Problema do cliente:** leads não aprovam ficha de financiamento. Tendência de mercado em abr/mai/26 — outros clientes de carro da Raiz também relatam o mesmo.

## Analogias e metáforas que funcionaram

- (registrar aqui após cada apresentação)

## Observações específicas

- Cliente com personalidade forte mas receptivo. Comunicar sempre de forma direta.
- Sem risco de cancelamento no momento (mai/2026)
- Não revelar estratégia de megalista de clientes — cada cliente sabe só da própria lista
