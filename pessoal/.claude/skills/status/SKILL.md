---
name: status
description: Visão geral rápida do Sistema de Performance. Mostra snapshot de treino, nutrição e finanças em uma resposta. Use para abrir a semana ou checar onde as coisas estão sem precisar chamar cada especialista separado.
---

Leia todos estes arquivos:
1. `_contexto/perfil.md`
2. `_contexto/treino.md`
3. `_contexto/nutricao.md`
4. `_contexto/financas.md`
5. `historico/peso.md`
6. `historico/cargas.md` — última entrada apenas
7. `historico/medidas.md` — verificar data da próxima avaliação

Monte um painel resumido no seguinte formato. Seja direto — sem introdução, sem "aqui está o seu painel":

---

**SISTEMA DE PERFORMANCE — [data de hoje]**

**TREINO**
- Peso: [última média]kg → meta 70kg (falta [X]kg)
- Tendência: [subindo / estável / caindo] — [observação de 1 linha]
- Última semana: [X/X treinos] — [highlight de carga ou observação relevante]
- Próximo treino: [qual Upper ou Lower, com base no rodízio]

**NUTRIÇÃO**
- Status do plano: [aderência estimada / observação da Raiz]
- Ponto de atenção: [o que está escapando ou precisa de ajuste]

**FINANÇAS**
- Pro labore: R$ [valor] | Economia meta: R$ [valor]/mês
- Reserva de emergência: [X]% completa (falta ~R$ [valor])
- Observação do Breno: [1 linha sobre o momento financeiro]

**PENDÊNCIAS**
- [Lista curta das pendências ativas de treino e nutrição — máximo 3 itens]

---

## Alerta de medidas corporais

Após montar o painel, leia `historico/medidas.md` e calcule quantos dias faltam para a próxima avaliação prevista.

**Se faltam 14 dias ou menos (ou a data já passou):**

Adicione ao painel:

> ⚠️ **MEDIDAS CORPORAIS**
> Última avaliação: [data]. Próxima prevista: [data] — [X dias / ATRASADA].
> Quer que eu agende na sua agenda? Me fala o dia e horário.

Se o usuário confirmar o dia e horário:
1. Use `mcp__claude_ai_Google_Calendar__create_event` com:
   - Título: "Avaliação de Medidas Corporais"
   - Data e horário informados pelo usuário
   - Duração: 30 minutos
   - Descrição: "Medir: cintura, peito, bíceps, antebraço, abdômen, quadril, coxa, panturrilha. Em jejum, manhã."
2. Confirme: "Agendado para [dia] às [hora]."
3. Atualize `historico/medidas.md`: mude a linha "Próxima avaliação prevista" para a data confirmada.
