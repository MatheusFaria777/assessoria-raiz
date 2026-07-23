# Plano de Refatoração — Sistema Raiz v3

Prioridade ordenada por risco/impacto. Cada commit deve deixar o sistema funcionando.

---

## 🔴 CRÍTICO — Bugs que quebram em produção

### 1. `feedback_insights.py` escreve no filesystem local
**Problema:** Escreve em `Clientes/[slug]/feedback.md` — caminho relativo ao servidor. No Railway (container efêmero), esse caminho não existe e a escrita falha silenciosamente. Os dados de feedback somem.

**Fix:** Salvar feedback no banco (tabela `GlobalSetting` ou nova tabela `FeedbackEntry`) em vez de arquivo.

**Commits:**
- Criar modelo/tabela `FeedbackEntry` no banco
- Reescrever `feedback_insights.py` para usar o banco
- Remover lógica de escrita em filesystem

---

## 🔴 CRÍTICO — Performance

### 2. `budget-alerts` dispara 20+ chamadas Meta API em todo mount do Dashboard
**Problema:** `GET /api/dashboard/budget-alerts` faz uma chamada ao Meta para cada cliente ativo toda vez que o Dashboard abre. Com 21 clientes, são 20+ requests síncronos bloqueantes.

**Fix:** Cache no backend com TTL de 1 hora (simples dict em memória ou Redis se disponível). Retornar resultado cacheado nas chamadas seguintes.

**Commits:**
- Adicionar cache em memória no endpoint `budget-alerts` (TTL 60 min)
- Adicionar header `Cache-Control` na resposta para o frontend não re-disparar

---

## 🟡 ALTO — Comportamento incorreto

### 3. Dashboard ignora cache do localStorage da Cadência
**Problema:** `Dashboard.jsx` chama `/api/cadencia/segunda` (ou `/quarta`) diretamente sem verificar o cache de 4h que `Cadencia.jsx` já mantém no localStorage.

**Fix:** Extrair a lógica de cache do localStorage em um hook `useCadenciaCache(day)` compartilhado entre Dashboard e Cadencia.

**Commits:**
- Criar `src/hooks/useCadenciaCache.js`
- Substituir fetch direto no Dashboard pelo hook
- Remover lógica duplicada do Cadencia.jsx

### 4. Sem estado global — cada página re-busca todos os dados na navegação
**Problema:** Navegação via `useState('page')` sem React Router. Cada troca de aba refaz todos os `useEffect` de fetch. Dados de clientes, campanhas e cadência são rebuscados a cada clique.

**Fix:** Contexto React simples com cache de dados por chave + timestamp. Não precisa de Redux/Zustand — um `AppContext` com `useReducer` resolve.

**Commits:**
- Criar `src/context/AppContext.jsx` com cache por rota
- Migrar `clients` para usar o contexto (começar pelo mais usado)
- Migrar `cadencia` para usar o contexto

---

## 🔵 MÉDIO — Código duplicado

### 5. `getDayInfo()` duplicada em Dashboard.jsx e Cadencia.jsx
**Problema:** Função com lógica ligeiramente diferente nas duas coisas. Fonte de bugs futuros.

**Fix:** Extrair para `src/utils/getDayInfo.js` e importar nos dois lugares.

**Commits:**
- Criar `src/utils/getDayInfo.js` (versão unificada)
- Substituir as duas definições pela importação

### 6. `CadenciaCard` duplicado entre Dashboard.jsx e Cadencia.jsx
**Problema:** Componente quase idêntico definido duas vezes.

**Fix:** Extrair para `src/components/CadenciaCard.jsx`.

**Commits:**
- Criar `src/components/CadenciaCard.jsx`
- Substituir as duas definições pela importação

---

## 🔵 MÉDIO — Código morto (remover com segurança)

### 7. Dependência `openai` não usada
**Problema:** `openai==1.51.0` em `requirements.txt`, nunca importada em nenhum arquivo.

**Fix:** Remover do `requirements.txt`. Verificar se algum arquivo importa antes de remover.

### 8. Scripts de migração one-time ainda no repo
**Problema:** `migrate_sqlite_to_postgres.py`, `migrate_to_supabase.py` — já executados, não servem mais.

**Fix:** Deletar os arquivos. Registrar no commit message que foram executados e não são mais necessários.

### 9. Tabela `report_schedules` definida mas nunca usada
**Problema:** Modelo SQLAlchemy existe, tabela é criada, mas nenhuma rota ou serviço a usa.

**Fix:** Remover o modelo e deixar a tabela orfã no banco (ou dropar via migration). Verificar se tem FK antes de remover.

### 10. Página Reports + scheduler de geração automática
**Problema:** Scheduler roda diariamente gerando relatórios que vão para `pending_review` — fila que ninguém revisa. A página Reports no frontend existe mas não é usada.

**Fix:** Desativar o job do scheduler. Avaliar se a página Reports pode ser removida do frontend.

### 11. 3 instâncias Postgres órfãs no Railway
**Problema:** Bancos criados em deploys anteriores (testes, migração) ainda ativos e cobrando.

**Fix:** Acessar Railway → identificar qual banco está em uso (via `DATABASE_URL` da variável de ambiente) → deletar os outros dois.

---

## ⚪ BAIXO — Qualidade de código

### 12. Todo CSS é `style={{}}` inline
**Problema:** Sem classes, sem Tailwind. Dificulta manutenção e theming.

**Abordagem:** Migrar gradualmente por componente — não fazer tudo de uma vez. Começar pelos componentes mais usados/duplicados que já vão ser tocados nos commits acima.

---

## Ordem de execução recomendada

```
1. Fix feedback_insights.py (bug silencioso em produção)
2. Cache no budget-alerts (impacto imediato de performance)
3. Hook useCadenciaCache (elimina re-fetch desnecessário)
4. Remover código morto (openai, migrations, report_schedules)
5. Extrair getDayInfo + CadenciaCard (antes de tocar nos arquivos pai)
6. AppContext com cache global
7. Deletar instâncias Postgres órfãs no Railway
8. CSS (migrar por componente, sem pressa)
```

---

## Fora do escopo (por enquanto)
- React Router (navegação por URL) — mudança grande, deixar para depois do AppContext estabilizar
- SSR / Next.js — não faz sentido pra tool interno
- Testes automatizados — sem cobertura hoje; adicionar junto com os novos módulos criados

---

*Criado em 23/07/2026 — baseado na análise da sessão de refatoração do Sistema Raiz v3.*
