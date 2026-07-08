# Diagnóstico de Campanhas — Boye Motors
**Data:** 25/05/2026

---

## Campanha ativa

**[RAIZ] [ENGAJAMENTO] [MENSAGEM] [ABO] [F] - Venda carros**
- Objetivo: OUTCOME_ENGAGEMENT (Mensagens WhatsApp)
- Tipo: ABO (orçamento fixo por ad set)
- Conta: act_1216712125709162

### Ad sets ativos

| Ad Set | Budget/dia | Leads (30d) | CPL | Status |
|--------|-----------|------------|-----|--------|
| [IG] [HOMENS] [35-54] - Variados | R$24,22 | 67 | R$10,03 | ATIVO |
| [IG] [HOMENS] [35-55] - PAJERO | R$8,10 | 28 | R$10,90 | ATIVO |
| [IG] [HOMENS] [35-54] - Veículos baixo desempenho | R$12,16 | — | — | ATIVO (PROBLEMA) |

**Total diário: ~R$44,50 | Total mensal estimado: ~R$1.335**

### Ad sets pausados
Prisma, Renegade Sport, IX35, Versa, CRV, Argo, RAV4, Onix, Maior valor, Menor valor — todos com carros específicos ou públicos segmentados que foram testados e pausados.

---

## Diagnóstico

### O que está funcionando
- Targeting geográfico correto: Americana + 40km (Campinas), exclusão de estados que não convertem
- Perfil de público acertado: homens 35-54, IG, mobile, Engaged Shoppers
- Ad set Variados tem histórico e ainda entrega (CPL R$10,03)
- PAJERO com CPL razoável (R$10,90) para um carro de valor mais alto

### Problema central: ad set "Veículos baixo desempenho"
Criado a pedido do cliente para separar carros com menos performance.
**Efeito real:** forçou R$12,16/dia de orçamento fixo em criativos que a Meta já havia identificado como ruins. O algoritmo estava naturalmente depriorando esses criativos — ao criar um ad set separado, a Meta foi obrigada a gastar neles.

Antes (jan/26, 1 ad set): 287 leads, CPL R$5,11
Depois (fragmentado): 133 leads (abr), ~76 (mai parcial), CPL R$10-12+

### Outros problemas identificados
- **ABO em vez de CBO:** Budget fixo impede Meta de concentrar verba no melhor ad set
- **Advantage+ Audience desligado:** Impede o algoritmo de expandir além do público manual
- **Frequência alta:** "Variados" com frequência 2,18 e reach de 14.306 — audiência começando a saturar
- **Posicionamentos só IG + mobile:** Exclui Facebook, desktop e audiência network — potencial não explorado para compradores 35-54 que também usam Facebook

---

## Observações sobre o cliente
- Gustavo tende a dar pitacos técnicos — pediu pra separar por carro, CPL alto, raio menor, etc.
- A intervenção dele (separar "baixo desempenho") causou diretamente os 3 meses sem venda
- Preocupação legítima: quer mensagem chegando em TODOS os carros, não só nos que a Meta prioriza
- Comparação com amigos da mesma avenida que "recebem mensagem em todos os carros" — provável que invistam mais ou usem catálogo de produtos. Perguntar quanto investem antes de debater estratégia.
- Argumento mais forte com ele: dados concretos. Estrutura consolidada = vendas. Estrutura dele = 0 vendas em 3 meses. Ele mesmo pediu a mudança.
- Medindo a coisa errada: quer ver movimento (mensagem em todos os carros) em vez de resultado (venda). Quando questionado diretamente — "prefere mensagem em todos e não vender, ou mensagem em alguns e fechar?" — tende a recalibrar.
- Solução de longo prazo para a distribuição que ele quer: catálogo de produtos do Meta (mostra carro certo para pessoa certa, distribui por estoque). A implementar quando a conta estiver estável.

## Status da conversa (02/06/2026)

### Linha do tempo
- **25/05:** Diagnóstico enviado via áudio pelo Matheus
- **25/05:** Cliente respondeu com áudio: preocupação com distribuição de mensagens por carro. Quer mensagem chegando em todos os carros, não só nos que a Meta prioriza. Compara com amigos da mesma avenida.
- **01/06:** Gustavo revelou: o amigo investe R$5.000/mês e vende 45-50 carros. Argumento dele: dividindo o investimento por carro no estoque, o ratio seria parecido com o dele.
- **02/06:** Reunião de alinhamento com Gustavo e Leo. Decisões alinhadas (ver abaixo).

### Argumento do cliente (a ser rebatido)
Gustavo calculou: R$5.000 ÷ ~10 carros estoque Gustavo ≈ R$500/carro vs. R$5.000 ÷ 45 carros amigo ≈ R$111/carro. Concluiu que o investimento proporcional é similar, então a comparação é válida.

### Contra-argumento preparado (usar na próxima conversa)

**O cálculo correto:**
- Amigo: R$5.000 ÷ 30 dias = R$166,67/dia ÷ 45 carros = **R$3,70/carro/dia**
- Mínimo para criar um conjunto ativo no Meta: **R$6/dia**
- Conclusão: o amigo também não consegue rodar um conjunto por carro. O algoritmo também prioriza os melhores pra ele — só que com mais verba, chega em mais carros. Mas não em todos.

**Para Gustavo cobrir todos os carros com R$6/dia cada:**

| Estoque | Budget diário | Budget mensal |
|---------|--------------|---------------|
| 10 carros | R$60/dia | R$1.800/mês |
| 11 carros | R$66/dia | R$1.980/mês |
| 12 carros | R$72/dia | R$2.160/mês |

Hoje ele investe ~R$44,50/dia = ~R$1.335/mês. Para cobrir todos os carros: **+R$450 a R$650/mês a mais**.

**Script sugerido para Matheus:**
> "Fiz o cálculo do teu amigo: com R$5.000 e 45 carros, ele tem R$3,70 por carro por dia. O mínimo pra criar um conjunto ativo por carro no Meta é R$6/dia — então ele também não recebe mensagem em todos os carros. O algoritmo prioriza os melhores pra ele também, só que com mais verba chega em mais.
>
> Se a gente quiser garantir que cada carro do teu estoque tenha um conjunto ativo rodando, a conta é R$6/dia por carro — com 10 carros, dá R$1.800/mês. Hoje tu investe R$1.350. A diferença é R$450/mês. Quer seguir por esse caminho ou a gente consolida e deixa o algoritmo otimizar dentro do orçamento atual?"

---

## Decisões da reunião de 02/06/2026

Cliente (Gustavo) e Leo confirmaram preferência por **maior volume, qualificação manual**. Não querem formulário — preferem WhatsApp direto para ligar na hora que o lead chega.

Estratégia decidida:
1. **Abrir funil** — remover interesse/qualificação de audiência, deixar a Meta entregar para o público mais amplo
2. **Voltar estratégia anterior** — um único conjunto de anúncios com todos os carros, Meta decide onde investir (não forçar budget por carro)
3. **Foco em 2-3 carros específicos** — definir quais com Gustavo e fazer rodízio até sair do estoque
4. **Testar gancho de 1,7s** — ao invés de começar o vídeo mostrando o carro chegando, começar já falando o modelo de frente para a câmera
5. **Novos criativos** — revisar Swipe File para basear formatos validados

## Plano de ação (pós-reunião 02/06)

### Imediato
- [ ] Pausar ad set "Veículos baixo desempenho" (R$12,16/dia desperdiçados)
- [ ] Abrir funil — remover segmentações de interesse/qualificação de audiência
- [ ] Consolidar em estrutura mais simples (menos ad sets, Meta alocando livremente)

### Curto prazo (próximos 7 dias)
- [ ] Definir 2-3 carros de foco com Gustavo
- [ ] Novos criativos com gancho de 1,7s para esses carros
- [ ] Revisar Swipe File e basear novos anúncios em formatos validados

### Médio prazo
- [ ] Avaliar resultado com funil aberto após 2-3 semanas
- [ ] Se volume aumentar mas conversão seguir baixa, reabrir conversa sobre formulário com dados na mão
- [ ] Catálogo de produtos Meta (solução definitiva para distribuição por carro) — implementar quando conta estiver estável
