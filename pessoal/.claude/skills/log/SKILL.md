---
name: log
description: Adiciona uma entrada ao painel da semana. Use durante a semana para registrar peso, treino, alimentação ou qualquer anotação. Formato livre — digita o que quiser e vai pro painel.
---

Leia `painel-semana.md` para ver o estado atual.

O usuário mandou uma entrada pra registrar. Adicione ao arquivo `painel-semana.md` no seguinte formato:

```
**[Dia da semana] [DD/MM]**
- [entrada do usuário]
```

Se já existe uma entrada para o dia de hoje, adicione um novo item na lista desse dia (não cria outro cabeçalho).

Regras:
- Não interprete, não analise, não dê feedback — só registra
- Se a entrada for peso (ex: "64.8", "peso 64.8"), também adicione uma linha em `historico/peso.md` com o formato: `| [DD/MM] | [valor]kg | — |`
- Após salvar, confirme em uma linha: "Anotado."

Nada mais. Sem análise, sem sugestão, sem conversa — isso é pra ser rápido.
