# CLAUDE.md — Workspace de Clientes

Workspace focado em clientes da Assessoria Raiz. Cada subpasta aqui é um cliente.

**Raiz do projeto:** `../` (ccos-ratos)
**Contexto da empresa:** `../_contexto/empresa.md`
**Preferências de escrita:** `../_contexto/preferencias.md`
**Foco atual:** `../_contexto/estrategia.md`
**Identidade visual:** `../marca/design-guide.md`

## Contexto do negócio

No início de toda conversa, ler:
1. `../_contexto/empresa.md`
2. `../_contexto/preferencias.md`
3. `../_contexto/estrategia.md`

Usar como base pra qualquer resposta. Não confirmar a leitura — só usar o contexto naturalmente.

## Estrutura de cada pasta de cliente

```
[cliente]/
  briefing.md          — dados do cliente (nicho, acesso, público)
  contexto.md          — histórico, situação atual, aprendizados
  onboarding.md        — roteiro de onboarding ou perguntas feitas
  feedback.md          — o que o cliente falou, objeções, pontos levantados
  Transcricoes/        — transcrições de reuniões brutas (onboarding, estrategica, comercial)
  Entregaveis/         — tudo que é gerado e enviado ao cliente (HTMLs, relatórios)
```

**Regra:** outputs gerados por skills (HTML, relatório, apresentação) vão sempre para `[cliente]/Entregaveis/`. Transcrições brutas vão para `[cliente]/Transcricoes/`.

## Skills disponíveis nesse workspace

- `/diagnostico-instagram [cliente]` — diagnóstico visual do Instagram em HTML
- `/lp-cliente [cliente]` — cria landing page de conversão (HTML, pixel de tracking, identidade do cliente)
- `/onboarding [cliente]` — lê transcrições e gera roteiro + slides de onboarding
- `/alinhamento-mensal [cliente]` — apresentação mensal de alinhamento em HTML
- `/meta-ads-ratos` — gestão de campanhas Meta Ads via SDK
- `/google-ads-ratos` — gestão de campanhas Google Ads via SDK
- `/falar-bem` — prepara fala antes de reunião ou áudio pro cliente
- `/analisar-reuniao` — analisa transcrição de reunião (vícios, prolixidade, clareza)

## Comandos disponíveis

- `/atualizar` — atualiza arquivos de contexto desatualizados
- `/novo-projeto` — cria pasta de novo cliente com estrutura padrão

## Tom de voz

Direto e que transmita confiança. Estilo narrativo — parece pessoa falando, não texto de IA. Tom informal no dia a dia, mais sério quando o output vai pro cliente. Sem travessões. Sem construções contrastivas típicas de IA.

Para qualquer tarefa visual (HTML, slide, apresentação), consultar `../marca/design-guide.md`.
