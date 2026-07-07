# Foco Atual — Assessoria Raiz

## Fase
Sistema Raiz v3 operacional — foco agora em finalizar o deploy e estabilização. Produção de conteúdo em execução ativa: dois carrosséis publicados (Bombril mai/2026, Coca vs Pepsi mai/2026). Fórmula validada: case de marca famosa → revela o mecanismo → conecta com o dono de negócio.

## Prioridade principal

1. **Evoluir Sistema Raiz v3** — deploy Railway feito e online. Próximo: implementar relatório mensal (elimina trabalho manual no Canva)
2. **Conteúdo orgânico** — skills de carrossel, pesquisar-tema e roteiro-post aprimoradas com aprendizados do OpenSquad: 5 ângulos com drivers emocionais, seleção de período e confiança na pesquisa, estrutura de reel com Visual/Script/Text Overlay, tons de voz documentados.
   - Conteúdo vai para o perfil pessoal do Matheus (não da Raiz). Público-alvo: dono de negócio que anuncia ou pensa em anunciar.
   - Fórmula: algo que o público já viu/conhece (caso de marca famosa, evento viral) → revela o mecanismo de marketing que quase ninguém percebeu → conecta com algo que o dono de negócio vive. Posiciona Matheus como "o cara que enxerga o que os outros não veem".
   - Evitar conteúdo técnico de plataforma (algoritmo, imposto, segmentação) — funciona só entre gestores, não abre porta com potencial cliente.

## O que está pronto no Sistema Raiz v3
- Dashboard diário (relatórios do dia + pendentes + copiar + marcar enviado)
- Relatórios automáticos Meta Ads às 10h com melhores criativos
- Sync Google Sheets automático ao marcar enviado (janela rolante 7 dias)
- Uploader de anúncios com rate limit backoff automático + fila processa próximo automaticamente
- Token Meta 60 dias com renovação automática às 9h
- Google Ads integrado (Pesquisa, Display, YouTube, Performance Max)
- 21 clientes no banco (19 ativos)
- **Sistema de formulários** (aba "Formulários 📝"):
  - NPS/Feedback: `/feedback?c={slug}` — 6 seções, insights Claude Haiku, dashboard com métricas globais
  - Google Meu Negócio: `/gmb?c={slug}` — 5 seções, cria pasta automática no Drive, link na tela final
  - Dashboard com abas NPS / GMN, botão excluir respostas, "📁 Pasta no Drive" por cliente
- **Configurações → Google Ads:** botão "Atualizar credenciais" (fix de `invalid_grant` sem código)
- **Dados migrados** do SQLite local para PostgreSQL no Railway

## Próximos passos do Sistema Raiz v3
1. **Relatório mensal** — não implementado, elimina trabalho manual no Canva
2. **Alerta de token no header** — badge vermelho quando < 7 dias
3. **ClickUp integração** — fechar tasks de NPS automaticamente quando cliente responde
4. **Domínio próprio** — sistema.assessoriaraiz.com.br (já configurado no Railway)

**Login:** Matheus (matheus@assessoriaraiz.com.br / raiz2026) e Lucas
**Deploy Railway:** `cd sistema-raiz && railway up`
**URL produção:** https://sistema.assessoriaraiz.com.br
**Projeto Railway:** appealing-consideration (assessoriaraizz@gmail.com)

## O que pode esperar
- WhatsApp via Z-API (~R$100/mês — discutir quando pronto para deploy)
- Pack Raiz (produto futuro de templates automáticos para concessionárias)
- Newsletter (planejamento iniciado — estrutura, referências e nome sendo definidos)
- YouTube
- **Migrar páginas pagas (Facebook Pages) pro Cloudflare Pages** — objetivo é cancelar a assinatura e manter tudo de graça no Cloudflare. Fluxo: pegar HTMLs das páginas existentes → subir no Cloudflare Pages → conectar domínio próprio → cancelar serviço pago.

## Contexto com prazo
Sem datas fixas definidas no momento.

---
*Atualize esse arquivo quando suas prioridades mudarem.*
