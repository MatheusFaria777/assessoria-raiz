# Contexto — MJ Sondagem

**Segmento:** serviço técnico (sondagem de solo)
**Plataforma:** Google Ads
**Cobertura geográfica:** Paraná e Santa Catarina (foco em Joinville e Blumenau)

## Histórico de métricas

| Mês | Leads | Investimento | CPA | Observação |
|-----|-------|--------------|-----|------------|
| | | | | |

## Estrutura de campanhas (jul/2026)

### Campanha SC — [RAIZ] [MJ] [SEARCH] [FRASE] Santa Catarina
- ID: 23370853172
- Cobre SC como um todo, **exceto Joinville e Blumenau** (excluídos em jul/2026)
- Budget: R$16,40/dia
- Ad groups: Sondagem de Solo (ativo), Sondagem SPT (pausado)

### Campanha Joinville + Blumenau — [RAIZ] [MJ] [SEARCH] [FRASE] Joinville + Blumenau
- ID: 23979094210
- Budget: R$500/mês (~R$16,70/dia)
- Criada em jul/2026 para dar foco e orçamento dedicado às duas cidades com mais retorno
- **Ad Group Sondagem Joinville** (ID: 197179889425)
- **Ad Group Sondagem Blumenau** (ID: 198032203139)
- Cada ad group tem keywords específicas da cidade + keywords genéricas de alto desempenho
- Anúncios (RSA) com títulos que mencionam explicitamente a cidade

## Decisões de campanha

- Joinville e Blumenau separados em campanha própria por serem as cidades com maior retorno
- Campanha SC mantida para o restante do estado, sem sobreposição de geo
- Keywords genéricas de melhor desempenho adicionadas nos dois ad groups de cidade (além das específicas por cidade)
- "sondagem sc", "sondagem em santa catarina" e similares ficam apenas na campanha SC
- Grupo "Sondagem SPT" pausado — revisar se vale reativar

## Melhores keywords históricas (base jul/2026)

| Keyword | Conv | CPA |
|---|---|---|
| "sondagem de solo" | 27 | R$30 |
| "sondagem joinville" | 24 | R$16 |
| "sondagem sc" | 17 | R$20 |
| "estudo de solo" | 10 | R$21 |
| "sondagem de solo florianopolis" | 10 | R$16 |
| "sondagem de solo preço" | 5 | R$11 |
| "analise de solo preço" | 2 | R$8 |

## Observações específicas

- Policy violation resolvida: description com `{LOCATION(City):Sua Cidade}` — trocar fallback para letras minúsculas (`sua cidade`)
- Script create.py corrigido: campo `contains_eu_political_advertising` obrigatório na API v24
