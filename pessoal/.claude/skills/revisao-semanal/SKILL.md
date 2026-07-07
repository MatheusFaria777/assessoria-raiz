---
name: revisao-semanal
description: Revisão semanal integrada do Sistema de Performance. Raiz e Forja analisam juntos os dados da semana, dão feedback e executam ajustes no protocolo. Rode toda sexta.
---

## Antes de começar

Leia todos estes arquivos:
1. `_contexto/personas.md` — Raiz e Forja completos
2. `_contexto/treino.md` — protocolo atual
3. `_contexto/nutricao.md` — plano atual
4. `_contexto/perfil.md` — perfil do Matheus
5. `historico/cargas.md` — progressão histórica
6. `historico/peso.md` — tendência de peso
7. `historico/medidas.md` — verificar data da próxima avaliação
8. `painel-semana.md` — **log da semana corrente (leia com atenção)**

## Passo 1 — Avaliar o painel

Verifique o que já está em `painel-semana.md`.

**Se o painel tem entradas suficientes** (peso de 2+ dias, pelo menos 1 comentário de treino ou nutrição): vá direto para o Passo 3 — análise. Não faça perguntas que o painel já responde.

**Se o painel está vazio ou tem pouco dado:** busque os dados do Hevy e pergunte só o que está faltando — não o questionário completo. Exemplo: se tem peso mas não tem info de alimentação, pergunte só sobre alimentação.

## Passo 2 — Buscar dados do Hevy (se necessário)

Use o MCP do Hevy para completar o que não está no painel:
```
get-workouts pageSize: 10
```

**Sempre re-buscar antes de analisar** — dados da sessão anterior ficam obsoletos se o usuário treinou depois.

Extraia para cada sessão: data, treino (Upper A/B ou Lower), cargas, reps e PSE.

> ⚠️ **Iterar TODOS os sets de cada exercício, não só o primeiro.** Exercícios com warmups (Leg Press, RDL) mudam de carga ao longo das séries — pegar só a S1 gera análise errada. Para cada exercício, separar warmups (identificar por carga progressiva no início) das séries de trabalho e reportar cada uma.

## Passo 2b — Completar dados faltantes (se necessário)

Pergunte só o que não está no painel. Se faltar tudo, pergunte em bloco:

> "Preenche o que não anotei durante a semana:
> - Alimentação: seguiu o plano? O que escapou?
> - Fim de semana: como foi?
> - Energia geral (1–10) e hidratação"

## Passo 3 — Análise [RAIZ + FORJA]

Com todos os dados em mãos, Raiz e Forja analisam juntos:

**[FORJA]** analisa:
- Sessões realizadas vs planejadas
- Progressão de carga: quem subiu, quem manteve, quem regrediu
- PSE médio e o que ele indica
- Qualidade técnica reportada
- Ajustes pra próxima semana (carga, volume, sequência)

**[RAIZ]** analisa:
- Média de peso da semana e tendência (comparar com `historico/peso.md`)
- Aderência ao plano (%)
- Comportamento alimentar (fim de semana, gatilhos)
- Energia e fome como indicadores
- Ajustes de plano se necessário

**[RAIZ + FORJA]** integram:
- O treino explica algo na nutrição? A nutrição explica algo no treino?
- Decisão conjunta se houver conflito

## Passo 4 — Executar mudanças

Sempre, independente de ter mudança ou não:
- Adicione nova linha em `historico/peso.md` com a média da semana
- Adicione nova entrada em `historico/cargas.md` com as cargas atuais
- Salve o resumo completo em `revisoes/YYYY-MM-DD.md`

Se houve mudança de protocolo:
- Atualize `_contexto/treino.md`
- Atualize `_contexto/nutricao.md`

Ao final, resets o painel para a próxima semana — sobrescreva `painel-semana.md` com:

```markdown
# Painel da Semana — [DD/MM] a [DD/MM]/2026

> Alimenta esse arquivo durante a semana. Qualquer coisa relevante entra aqui.
> Na sexta, `/revisao-semanal` lê tudo e a revisão vira conversa, não questionário.

---

<!-- Adicione entradas abaixo. Formato livre. -->
```

## Passo 5 — Alerta de medidas corporais

Após salvar tudo, verifique `historico/medidas.md`: quantos dias faltam para a próxima avaliação prevista?

**Se faltam 14 dias ou menos (ou a data já passou):**

> **[RAIZ + FORJA]** — "Ô, já tá chegando a hora de tirar as medidas. Última foi [data], próxima prevista [data]. Quer que a gente agende? Me fala o dia e hora."

Se o usuário confirmar:
1. Use `mcp__claude_ai_Google_Calendar__create_event` com:
   - Título: "Avaliação de Medidas Corporais"
   - Data e horário informados pelo usuário
   - Duração: 30 minutos
   - Descrição: "Medir: cintura, peito, bíceps, antebraço, abdômen, quadril, coxa, panturrilha. Em jejum, manhã."
2. Confirme: "Agendado para [dia] às [hora]."
3. Atualize a linha "Próxima avaliação prevista" em `historico/medidas.md` com a data confirmada.

## Formato do arquivo de revisão

```markdown
# Revisão Semanal — DD/MM/YYYY

## Peso
- Dias pesados: [dias]
- Média: [X]kg | Semana anterior: [X]kg | Variação: [+/-X]kg

## Treino
- Sessões: X/X realizadas
- [Lista de progressões, regressões e manutenções de carga]
- Observações técnicas relevantes

## Nutrição
- Aderência: ~X%
- Destaques positivos:
- Pontos de atenção:
- Fim de semana:

## Decisões
- [Lista de ajustes decididos]

## Próxima semana
- [Foco principal]
```

## Regra de tom

Raiz e Forja falam como sempre — sem papas na língua, direto, parceiros. Não suaviza feedback negativo nem exagera elogio positivo.
