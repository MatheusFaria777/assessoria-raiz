# CZ CONTABILIZE — PLANO GOOGLE ADS R$ 1.000/MÊS

**Versão:** 1.0 — Adaptada para budget enxuto

**Plataforma:** Google Search (100% do orçamento)

**Budget:** R$ 1.000/mês (~R$ 33/dia)

**Período mínimo de validação:** 60 dias (R$ 2.000 total para tirar conclusão)

**LP:** `https://czcontabilize.com.br/`

**CTA:** WhatsApp click-to-chat

**Geo:** Porto Alegre metro (raio 60km) — apenas

---

## 1. PREMISSA ESTRATÉGICA — POR QUE ENXUGAR TUDO

### A matemática que comanda este plano

CPC médio do nicho contábil B2B no RS: **R$ 6 a R$ 15** (Exact/Phrase de alta intenção).

Com R$ 33/dia, você compra entre **2 e 5 cliques/dia**. Em um mês: **60 a 150 cliques totais**.

Se a conversão clique → WhatsApp for de 8% (otimista), isso são **5 a 12 leads/mês**.
Se a conversão lead → cliente for de 20% (B2B saudável), são **1 a 2 clientes novos/mês**.

**Conclusão:** Não há margem para experimentação ampla. Cada R$ 1 precisa ir para a palavra com a maior probabilidade de virar cliente. Por isso este plano:

- **Corta 5 dos 9 ad groups originais** — sobram apenas os 4 de maior ROI esperado
- **Elimina Broad match** completamente — desperdiça budget até o algoritmo aprender (e R$ 1.000 não é suficiente para aprender)
- **Concentra 70% do budget em Exact match** — onde o intent é cirúrgico
- **Usa apenas Manual CPC com cap rígido** — Smart Bidding precisa de 30+ conversões/mês para funcionar, e você não vai ter isso no início

### Aviso direto ao cliente

Com R$ 1.000/mês, este investimento é **validação de canal**, não aquisição em escala. Em 60 dias você vai saber:

1. Se Google Ads converte para CZ Contabilize (sim/não baseado em CAC)
2. Quais palavras-chave geram lead qualificado vs. lixo
3. Qual ad group dobrar de orçamento quando houver budget novo

Se o objetivo for **escala real**, o budget mínimo recomendado é **R$ 3.000-5.000/mês**. Com R$ 1.000, estamos rodando uma campanha de descoberta + 1-2 clientes/mês para começar.

---

## 2. AD GROUPS QUE FICAM (4 de 9)

### Ranking de prioridade (decisão baseada em intent + CPC + LTV esperado)

| # | Ad Group | Por que entrou | Por que essa ordem |
|---|----------|----------------|---------------------|
| 1 | **AG 2.8 — Trocar de Contador** | Maior intent comercial. Quem busca "trocar de contabilidade" já está com dor ativa e decisão tomada. CR esperado: 2-3x média. | Prioridade absoluta. Lead aqui é quase venda. |
| 2 | **AG 2.7 — Contabilidade Geral RS** | Volume + intent local alto ("contabilidade porto alegre", "contador caxias"). CPC mediano. | Volume principal de leads. |
| 3 | **AG 2.1 — Lucro Real** | Ticket médio mais alto (indústrias = ICP perfeito). CPC mais caro mas LTV justifica. | Foco no ICP de maior valor. |
| 4 | **AG Brand — CZ Contabilize** | Defesa de marca. Custo baixíssimo, ROAS altíssimo, captura quem já te conhece. | Sempre ligado, budget mínimo. |

### Ad Groups CORTADOS e por quê

| Ad Group | Motivo do corte |
|----------|-----------------|
| AG 2.2 — Lucro Presumido | Sobreposição grande com AG 2.7 (Contabilidade Geral). Se sobrar budget, ativar mês 3. |
| AG 2.3 — Contabilidade Indústria | Coberto pelo AG 2.1 (Lucro Real) — indústria média já busca Lucro Real. Redundância com R$ 1k. |
| AG 2.4 — Folha de Pagamento | Serviço complementar, raramente é a porta de entrada. Funciona melhor como upsell pós-cliente. |
| AG 2.5 — Assessoria Fiscal Tributária | TOFU/MOFU em geral. Lead aqui é educacional, ciclo de venda longo. Não cabe em R$ 1k. |
| AG 2.6 — SPED / ECF / Obrigações | Volume de busca baixo + público técnico. Reativar quando budget >= R$ 3k. |

---

## 3. ESTRUTURA FINAL DE CAMPANHAS

```
CZ-Search-BR (Campaign — Search only)
  Budget: R$ 30/dia (~R$ 900/mês)
  ├── AG 2.8 — Trocar de Contador      → ~R$ 9/dia (30%)
  ├── AG 2.7 — Contabilidade Geral RS  → ~R$ 9/dia (30%)
  └── AG 2.1 — Lucro Real              → ~R$ 12/dia (40%)

CZ-Search-Brand (Campaign separada)
  Budget: R$ 3/dia (~R$ 100/mês)
  └── AG Brand — CZ Contabilize        → R$ 3/dia (100%)

TOTAL: R$ 33/dia · ~R$ 1.000/mês
```

**Por que separar Brand em campanha própria:** Brand sempre tem CTR e CR muito acima da média. Se misturar com prospecting, mascara o desempenho real e atrapalha decisão de scaling. Princípio do Golden Ratio (Kasim Aslam).

**Distribuição de budget detalhada:**

| Campanha / Ad Group | Budget diário | Budget mensal | % do total |
|---------------------|---------------|---------------|------------|
| CZ-Search-BR — AG 2.8 Trocar de Contador | R$ 9 | R$ 270 | 27% |
| CZ-Search-BR — AG 2.7 Contabilidade Geral RS | R$ 9 | R$ 270 | 27% |
| CZ-Search-BR — AG 2.1 Lucro Real | R$ 12 | R$ 360 | 36% |
| CZ-Search-Brand — AG Brand | R$ 3 | R$ 100 | 10% |
| **TOTAL** | **R$ 33** | **R$ 1.000** | **100%** |

> **Nota técnica:** Google Ads aloca budget por campaign, não por ad group. Para forçar a divisão entre 2.8 / 2.7 / 2.1 dentro da CZ-Search-BR, controle via **bid CPC máximo diferente por ad group** + monitoramento semanal de gasto por AG (ajuste manual quando um AG estiver consumindo > 45% do total).

---

## 4. KEYWORDS — APENAS AS QUE FICAM

Eliminei todas as Broad. Mantive Exact + Phrase de maior intenção.

### CSV pronto para Google Ads Editor

```csv
Campaign,Ad group,Keyword,Match type,Max CPC
CZ-Search-BR,AG 2.8 - Trocar de Contador,[trocar de contabilidade],Exact,15.00
CZ-Search-BR,AG 2.8 - Trocar de Contador,[trocar de contador],Exact,15.00
CZ-Search-BR,AG 2.8 - Trocar de Contador,[mudar de contabilidade],Exact,15.00
CZ-Search-BR,AG 2.8 - Trocar de Contador,[trocar contador empresa],Exact,15.00
CZ-Search-BR,AG 2.8 - Trocar de Contador,"trocar contabilidade",Phrase,12.00
CZ-Search-BR,AG 2.8 - Trocar de Contador,"mudar de contador",Phrase,12.00

[contabilidade porto alegre],Exact,14.00
[escritorio contabil porto alegre],Exact,14.00
[contador porto alegre],Exact,14.00
[contabilidade caxias do sul],Exact,12.00
[contador caxias do sul],Exact,12.00
[escritorio contabil rs],Exact,12.00
"contabilidade porto alegre",Phrase,11.00
"contador porto alegre",Phrase,11.00
"escritorio contabil porto alegre",Phrase,11.00

[contabilidade lucro real porto alegre],Exact,18.00
[contador lucro real rs],Exact,18.00
[escritorio contabil lucro real porto alegre],Exact,18.00
[contabilidade para lucro real],Exact,16.00
[contador especialista lucro real],Exact,16.00
"contabilidade lucro real",Phrase,14.00
"contador lucro real",Phrase,14.00
"contabilidade industria lucro real",Phrase,14.00

CZ-Search-Brand,AG Brand - CZ Contabilize,[cz contabilize],Exact,3.00
CZ-Search-Brand,AG Brand - CZ Contabilize,[contabilize porto alegre],Exact,3.00
CZ-Search-Brand,AG Brand - CZ Contabilize,[cz contabilidade],Exact,3.00
CZ-Search-Brand,AG Brand - CZ Contabilize,"cz contabilize",Phrase,3.00
CZ-Search-Brand,AG Brand - CZ Contabilize,"contabilize",Phrase,3.00
```

**Total: 28 keywords ativas** (vs. ~100 no plano original). Foco cirúrgico.

### Negative Keywords (campaign-level — aplicar nas DUAS campanhas)

```csv
Negative,Match type
[curso contabilidade],Exact
[concurso contador],Exact
[salario contador],Exact
[vagas contador],Exact
[faculdade contabilidade],Exact
"mei",Phrase
"simples nacional barato",Phrase
"gratis",Phrase
"download",Phrase
"planilha",Phrase
"como fazer",Phrase
"o que e",Phrase
"significa",Phrase
"tcc",Phrase
"trabalho academico",Phrase
estagio,Broad
emprego,Broad
vagas,Broad
salario,Broad
curso,Broad
youtube,Broad
```

> **Crítico:** Sem essas negatives, R$ 1.000 evapora em cliques de estudante e candidato a emprego. Aplicar **antes** de subir as campanhas.

---

## 5. ANÚNCIOS (RSA) — APENAS DOS 4 AD GROUPS ATIVOS

### AG 2.8 — TROCAR DE CONTADOR

**Final URL:** `https://czcontabilize.com.br/#depoimentos`
**Display Path:** `/trocar-contador` `/migrar-contabilidade`

**Headlines (15 — 2 PIN H1, 2 PIN H2):**

| # | Headline | PIN |
|---|----------|-----|
| 1 | Trocar de Contabilidade? | **PIN H1** |
| 2 | Migre Para a CZ Contabilize | **PIN H1** |
| 3 | Migração Sem Complicação | **PIN H2** |
| 4 | Diagnóstico Gratuito Hoje | **PIN H2** |
| 5 | Atendimento Que Responde | |
| 6 | 20+ Anos no Mercado RS | |
| 7 | Sócias Te Atendem Direto | |
| 8 | 280+ Empresas Confiam | |
| 9 | Sem Erros, Sem Multas | |
| 10 | Glaucia & Sandra — CRC/RS | |
| 11 | Cansou do Seu Contador? | |
| 12 | Contabilidade Que Funciona | |
| 13 | Indústrias e Médio Porte | |
| 14 | Migração em 7 Dias Úteis | |
| 15 | Fale Agora no WhatsApp | |

**Descriptions (4):**

1. Insatisfeito com seu contador? Migre para a CZ Contabilize sem dor de cabeça.
2. 20+ anos atendendo indústrias no RS. Sócias contadoras te atendem pessoalmente.
3. Migração assistida em 7 dias úteis. 280+ empresas já confiaram na nossa equipe.
4. Fale agora no WhatsApp e receba diagnóstico gratuito da sua contabilidade atual.

---

### AG 2.7 — CONTABILIDADE GERAL RS

**Final URL:** `https://czcontabilize.com.br/#inicio`
**Display Path:** `/contabilidade-rs` `/porto-alegre`

**Headlines (15):**

| # | Headline | PIN |
|---|----------|-----|
| 1 | Contabilidade Porto Alegre RS | **PIN H1** |
| 2 | Contador Caxias do Sul RS | **PIN H1** |
| 3 | Análise Tributária Gratuita | **PIN H2** |
| 4 | 20+ Anos no Rio Grande do Sul | **PIN H2** |
| 5 | 280+ Empresas Atendidas | |
| 6 | Indústrias e Médio Porte | |
| 7 | Lucro Real e Presumido | |
| 8 | Folha, SPED, ECF e Mais | |
| 9 | Glaucia & Sandra — CRC/RS | |
| 10 | Atendimento com as Sócias | |
| 11 | Escritório Contábil Sério | |
| 12 | Reduza Carga Tributária | |
| 13 | Diagnóstico Sem Compromisso | |
| 14 | Fale Agora no WhatsApp | |
| 15 | Migre Sua Contabilidade RS | |

**Descriptions (4):**

1. Contabilidade completa para indústrias e médio porte no RS. 20+ anos de mercado.
2. Lucro Real, Presumido, Folha, SPED, ECF. Sócias contadoras CRC/RS atendem você.
3. 280+ empresas atendidas em Porto Alegre, Caxias e região. Análise tributária gratuita.
4. Migre para a CZ Contabilize. Diagnóstico no WhatsApp em até 24h úteis. Fale conosco.

---

### AG 2.1 — LUCRO REAL

**Final URL:** `https://czcontabilize.com.br/#servicos`
**Display Path:** `/lucro-real` `/contadores-rs`

**Headlines (15):**

| # | Headline | PIN |
|---|----------|-----|
| 1 | Contabilidade Lucro Real RS | **PIN H1** |
| 2 | Especialistas em Lucro Real | **PIN H1** |
| 3 | Análise Tributária Gratuita | **PIN H2** |
| 4 | Reduza Sua Carga Tributária | **PIN H2** |
| 5 | 20+ Anos em Lucro Real | |
| 6 | Atende Indústrias no RS | |
| 7 | CRC/RS Sócias Contadoras | |
| 8 | 280+ Empresas Atendidas | |
| 9 | SPED, ECF e ECD em Dia | |
| 10 | Fale Agora no WhatsApp | |
| 11 | Contadoras com 20 Anos RS | |
| 12 | Indústria de Médio Porte | |
| 13 | Glaucia & Sandra — CRC/RS | |
| 14 | Planejamento Tributário PJ | |
| 15 | Solicite Diagnóstico Hoje | |

**Descriptions (4):**

1. Contabilidade especializada em Lucro Real para indústrias no RS. 20+ anos de experiência.
2. Análise tributária gratuita. Glaucia & Sandra, sócias CRC/RS. 280+ empresas atendidas.
3. Reduza impostos com planejamento tributário sob medida. Atendimento direto com as sócias.
4. Diagnóstico gratuito no WhatsApp. Contabilidade Lucro Real para médio porte. Fale conosco.

---

### AG BRAND — CZ CONTABILIZE

**Final URL:** `https://czcontabilize.com.br/#inicio`
**Display Path:** `/oficial` `/cz-contabilize`

**Headlines (15):**

| # | Headline | PIN |
|---|----------|-----|
| 1 | CZ Contabilize — Site Oficial | **PIN H1** |
| 2 | CZ Contabilize Porto Alegre | **PIN H1** |
| 3 | Fale Direto no WhatsApp | **PIN H2** |
| 4 | Site Oficial — RS | **PIN H2** |
| 5 | Glaucia & Sandra — CRC/RS | |
| 6 | 20+ Anos de Mercado | |
| 7 | 280+ Empresas Atendidas | |
| 8 | Lucro Real e Presumido | |
| 9 | Folha, SPED, ECF e Mais | |
| 10 | Contabilidade Para Indústria | |
| 11 | Atendimento com as Sócias | |
| 12 | Análise Tributária Grátis | |
| 13 | Porto Alegre e Caxias | |
| 14 | Diagnóstico Gratuito | |
| 15 | Solicite no WhatsApp Hoje | |

**Descriptions (4):**

1. Site oficial da CZ Contabilize. Contabilidade especializada no RS há mais de 20 anos.
2. Atendimento direto com as sócias Glaucia & Sandra. CRC/RS. 280+ empresas atendidas.
3. Lucro Real, Presumido, Folha, SPED. Indústrias e médio porte em Porto Alegre e Caxias.
4. Fale agora no WhatsApp e solicite sua análise tributária gratuita. Sem compromisso.

---

## 6. EXTENSÕES (account-level — aparecem em todas as campanhas)

### Sitelinks (6 ativos)

| # | Title | Description 1 | Description 2 | URL |
|---|-------|---------------|---------------|-----|
| 1 | Análise Tributária Grátis | Diagnóstico sem compromisso | Receba em até 24h úteis | `/#contato` |
| 2 | Nossas Contadoras | Glaucia & Sandra, CRC/RS | 20+ anos de experiência | `/#as-contadoras` |
| 3 | Lucro Real e Presumido | Especialistas em tributação | Indústria e médio porte | `/#servicos` |
| 4 | Indústrias Atendidas | Mais de 280 empresas no RS | Metalúrgica, têxtil, plástico | `/#diferenciais` |
| 5 | Depoimentos de Clientes | Veja quem já confia em nós | Cases reais de indústrias RS | `/#depoimentos` |
| 6 | Fale no WhatsApp | Atendimento direto com sócias | Resposta rápida em horário PJ | `/#contato` |

### Callouts (10)

```
20+ Anos no Mercado RS
280+ Empresas Atendidas
Sócias Contadoras CRC/RS
Análise Tributária Grátis
Atendimento Personalizado
Foco em Indústrias
Lucro Real e Presumido
Migração em 7 Dias Úteis
Diagnóstico no WhatsApp
Médio Porte Especialidade
```

### Structured Snippets

**Header: Serviços**
- Lucro Real
- Lucro Presumido
- Folha de Pagamento
- Assessoria Fiscal
- Planejamento Tributário
- SPED Fiscal
- ECF e ECD

**Header: Estilos**
- Atendimento com as Sócias
- 20+ Anos de Experiência
- CRC/RS Registro Ativo
- Foco em Médio Porte

### Call Extension
- Telefone fixo das sócias (cliente fornece)
- Schedule: Seg-Sex 08:00-18:00

### Location Extension
- Conectar Google Business Profile da CZ Contabilize (Porto Alegre)

---

## 7. CONFIGURAÇÕES DE CAMPANHA

| Setting | Valor |
|---------|-------|
| Campaign type | Search only — **DESATIVAR** Display Network e Search Partners |
| Bidding strategy | **Manual CPC** (Enhanced OFF nos primeiros 30 dias) |
| Budget diário | CZ-Search-BR: R$ 30 · CZ-Search-Brand: R$ 3 |
| Geo targeting | Porto Alegre + raio 60km (cobre Caxias do Sul, Canoas, Novo Hamburgo, São Leopoldo, Gravataí) |
| Geo mode | **Presence: People IN your targeted locations** (NUNCA "interest in") |
| Idioma | Português |
| Devices | Mobile + Desktop (sem tablet inicialmente) |
| Bid adjustment Mobile | -10% nos primeiros 14 dias |
| Schedule | Seg-Sex 08:00-19:00 · Sáb 09:00-12:00 · Dom OFF |
| Conversion goal | "Contato_Whatsapp" — **Primary** |
| Network | Search Network only |
| Audience | Observation (não Targeting): in-market "Business Services > Accounting" |

**Por que Manual CPC e não Smart Bidding:**
Smart Bidding (tCPA, Maximize Conversions) precisa de **mínimo 30 conversões nos últimos 30 dias** para funcionar. Com R$ 1.000/mês você vai ter 5-12 leads/mês — insuficiente. Manual CPC com bid cap rígido protege seu budget.

---

## 8. PLANO DE 90 DIAS — O QUE FAZER E QUANDO

### Mês 1 (R$ 1.000) — Validação

**Semana 1 (R$ 230):**
- Subir as 2 campanhas
- Monitorar diariamente: gasto, cliques, CTR
- Pausar keywords com CTR < 2% e CPC alto após 3 dias
- Adicionar negatives novas conforme aparecem termos ruins no Search Terms Report

**Semana 2 (R$ 230):**
- Análise de Search Terms (rodar 2x na semana)
- Adicionar negatives específicas
- Ajustar bids: subir +10% nas keywords que estão abaixo da posição 3, baixar -15% nas que estão em posição 1 com CPC alto

**Semana 3-4 (R$ 540):**
- Identificar o **AG vencedor** (maior CR clique → WhatsApp)
- Identificar a **keyword vencedora** dentro de cada AG

**Métrica de sucesso mês 1:**
- Mínimo 5 conversões "Contato_Whatsapp"
- Mínimo 1 lead qualificado (que vira cliente)
- CTR médio > 5% nas Exact

### Mês 2 (R$ 1.000) — Refinamento

- Pausar AG com pior performance se CR < 3%
- Realocar budget para o AG vencedor (até 50% do total)
- Testar variação de RSA (criar segundo anúncio com headlines novas para o AG vencedor)
- Começar a coletar Search Terms para criar Exact match dos termos que vieram via Phrase e converteram

**Métrica de sucesso mês 2:**
- 8-15 conversões totais
- CAC por lead qualificado < R$ 200 (R$ 1.000 / 5 leads qualificados)
- 2 clientes novos fechados

### Mês 3 (R$ 1.000) — Decisão

Com 60 dias de dados, decidir:

| Cenário | Decisão |
|---------|---------|
| CAC < R$ 800 e 2+ clientes/mês | Pedir aumento de budget para R$ 2.500/mês — escalar |
| CAC R$ 800-1.500, 1 cliente/mês | Manter R$ 1.000 e otimizar criativos por mais 60 dias |
| CAC > R$ 1.500 ou 0 clientes | Pausar Google Ads, repensar LP/oferta antes de gastar mais |

---

## 9. CHECKLIST PRÉ-LANÇAMENTO

Não subir as campanhas sem completar 100% disso:

- [ ] Conversão "Contato_Whatsapp" configurada via GTM (clique no botão WhatsApp dispara o evento)
- [ ] Google Tag instalada na LP (testar com Google Tag Assistant)
- [ ] Google Business Profile da CZ Contabilize criado/otimizado
- [ ] LP testada em mobile (>60% do tráfego virá daí)
- [ ] Política de Privacidade publicada em URL pública (LGPD + exigência Google Ads)
- [ ] Domínio final confirmado (`czcontabilize.com.br` ou outro) — atualizar Final URLs
- [ ] Lista de Negative Keywords aplicada nas duas campanhas
- [ ] WhatsApp Business com horário e resposta automática configurados
- [ ] Planilha/CRM para rastrear: lead recebido → qualificado (sim/não) → fechou (sim/não)
- [ ] Bid cap manual definido em cada keyword (CSV acima)

---

## 10. KPIs DE LEITURA SEMANAL

Olhar toda segunda-feira:

| Métrica | Onde olhar | Meta mês 1 | Meta mês 2-3 |
|---------|------------|------------|--------------|
| CTR Exact | Por keyword | > 5% | > 8% |
| CTR Phrase | Por keyword | > 3% | > 5% |
| CPC médio | Por AG | R$ 8-14 | R$ 6-12 |
| Conversões totais | Conta toda | 5+/mês | 10+/mês |
| CR (clique → WhatsApp) | Por AG | > 4% | > 7% |
| Search IS Brand | Brand campaign | > 90% | 100% |
| Search IS Non-brand | Search campaign | 15-25% | 25-40% |
| Quality Score médio | Por keyword | >= 6/10 | >= 8/10 |

---

## 11. AVISOS FINAIS

1. **Não terceirize a leitura dos dados.** Olhe Search Terms 2x/semana nas primeiras 4 semanas. É lá que mora 80% da otimização.

2. **WhatsApp precisa responder rápido.** Lead que chega 22h e só recebe resposta 14h do dia seguinte tem CR de fechamento despencando. Configurar autoresposta com expectativa de horário.

3. **R$ 1.000/mês não é budget de aquisição em escala — é budget de validação de canal.** Comunique isso ao cliente para evitar expectativa de "ter agenda lotada de leads".

4. **Não ative Display, Performance Max ou Discovery com R$ 1.000.** Esses canais precisam de R$ 3k+ para sair do modo de aprendizado.

5. **Brand campaign sempre ON, mesmo no mês 3.** O custo é mínimo (R$ 100/mês) e ela protege contra concorrentes que possam dar lance no termo "CZ Contabilize".

---

**Framework aplicado:** Golden Ratio (Kasim Aslam) adaptado para budget enxuto · Single Theme Ad Group · Match Type Segmentation (sem Broad) · Brand Isolation · Negative Keyword Hygiene rigorosa · Manual CPC com bid cap.

---

## Guia de Otimização — Quando for mexer nos RSAs

### 1. Onde olhar

Campanha > Anúncios > clicar no anúncio > "Ver detalhes do recurso"

O Google atribui um rótulo para cada headline e description:

| Rótulo | Significado | O que fazer |
|--------|-------------|-------------|
| Melhor | Alta contribuição para cliques | Manter, usar como referência |
| Bom | Contribuição média | Manter |
| Aprendendo | Dados insuficientes ainda | Aguardar |
| Baixo | Baixa contribuição | Substituir |

### 2. O que substituir

Quando aparecer "Baixo" numa headline, substitua por algo diferente em ângulo — não só troca de palavras:

- Se "20+ Anos no Mercado RS" está baixo → trocar por prova social diferente: "280+ Empresas Atendidas RS"
- Se "Análise Tributária Gratuita" está baixo → trocar por urgência: "Diagnóstico em 24h Úteis"

### 3. Nunca substituir tudo de uma vez

Trocar no máximo 2 headlines por vez. Senão você não sabe o que melhorou.

### 4. Ad Strength — ignorar em parte

O Google vai pedir para você adicionar mais variações para chegar em "Excelente". Ignore se isso significar adicionar headlines genéricas só para subir o score. Um anúncio "Bom" com mensagem focada bate um "Excelente" diluído.

### O que monitorar nas próximas 3 semanas (sem mexer)

- CTR por anúncio — se cair abaixo de 3% consistentemente, aí sim investigar
- Qual combinação o Google está escolhendo mais — via "detalhes do recurso", você vê quais headlines aparecem juntas com mais frequência
- Relação entre headline pinada e CTR — os PINs que você definiu estão aparecendo? Se o CTR estiver baixo, talvez o PIN esteja forçando uma combinação que não funciona

### PINs definidos no plano

- AG Trocar de Contador: H1 = "Trocar de Contabilidade?" / H2 = "Migração Sem Complicação"
- AG Contabilidade Geral: H1 = cidade / H2 = CTA de análise gratuita
