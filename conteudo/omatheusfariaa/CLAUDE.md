# @omatheusfariaa — Conteúdo Pessoal

## O que é
Documentação e acompanhamento de performance dos posts publicados no perfil pessoal do Matheus (@omatheusfariaa) no Instagram e TikTok.

## Tipo
Conteúdo

## Escopo
- Registrar cada post publicado: conceito, legenda usada e métricas
- Extrair aprendizados ao longo do tempo (o que performa, qual formato, qual tema)
- Futuramente: automatizar coleta de métricas via Instagram Graph API

## Público-alvo do canal
Dono de negócio que anuncia ou pensa em anunciar. Não gestor de tráfego.

## Fórmula de conteúdo
Caso famoso/evento que o público conhece → revela o mecanismo de marketing que quase ninguém percebeu → conecta com a realidade do dono de negócio. Posiciona Matheus como "o cara que enxerga o que os outros não veem".

## Estrutura de pastas
- `publicados/` — um arquivo .md por post (conceito + legenda + métricas + aprendizado)

## Template de post
Ver `publicados/_template.md`

## Métricas prioritárias
Salvamentos > Compartilhamentos > Alcance > Curtidas

## Pipeline de conteúdo

O arquivo central de rastreamento é `pipeline.md` — mostra tudo que existe com status:
💡 Ideia → 🔨 Em produção → ✅ Pronto → 📤 Publicado

**Skills do sistema:**
- `/planejar-semana` — ritual semanal: revisa pipeline + planeja próximo conteúdo
- `/registrar-conteudo` — atualização rápida: registrar criação, publicação, métricas ou nova ideia
- `/carrossel` — ao terminar, já oferece mover para Pronto no pipeline

**Fluxo normal:**
1. Toda semana: `/planejar-semana` → revisa pendências + define tema da semana
2. Ao criar: `/carrossel` ou `/roteiro-post` → ao finalizar, registrar no pipeline
3. Ao publicar: `/registrar-conteudo` → mover para Publicado + registrar data
4. Após 7 dias: `/registrar-conteudo` → adicionar métricas (aceita print de tela)

## Regras
- Atualizar métricas após 7 dias da publicação
- Se vier print de métricas, preencher o arquivo do post correspondente e extrair aprendizado
- Quando tiver 5+ posts documentados, rodar análise comparativa e registrar padrões em `aprendizados.md`
- Toda vez que um conteúdo mudar de status, atualizar `pipeline.md`
- Quando um aprendizado revelar padrão estrutural (ex: slide 3, tipo de gancho, formato), identificar qual skill precisa ser atualizada e atualizar na hora

## Aprendizados permanentes (regras derivadas de dados reais)

| Data | Insight | Skill atualizada |
|------|---------|-----------------|
| jun/2026 | Slide 3 é o ponto de virada: quem passa tende a terminar, quem sai, sai antes. Meta: 3.5+ slides vistos em carrossel de 9. O slide 3 precisa aprofundar a curiosidade, não resolver a tensão. | `/carrossel` — veto condition + teste de qualidade + estrutura slide 3 |
