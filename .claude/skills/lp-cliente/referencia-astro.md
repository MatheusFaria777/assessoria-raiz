# Referência — Astro pra sites de cliente com várias páginas

Análise feita a partir do vídeo da Ratos de IA (jul/2026) sobre migração de sites de
WordPress pra Astro. Guardado aqui pra decidir no futuro, não pra usar por padrão.

## Quando vale considerar Astro em vez de HTML puro (`/lp-cliente`)

Só quando o cliente precisar de **várias páginas que compartilham cabeçalho, rodapé,
pop-ups ou pixel de tracking**, e isso for crescer com o tempo. Exemplos reais:

- Site institucional com home + serviços + sobre + contato + blog técnico pra SEO
- Cliente que vai gerar múltiplas landing pages de campanhas diferentes ao longo do
  tempo, todas reaproveitando os mesmos componentes
- Cliente que quer conteúdo de blog recorrente (posts em Markdown, fácil pro Claude escrever)

**Não vale a pena** pra uma LP de página única (caso mais comum aqui na Raiz, ver
`/lp-cliente`). Framework robusto pra site simples e estático é esforço desperdiçado.

## O que o Astro resolve

WordPress e HTML puro (sem framework) têm o mesmo problema quando o site cresce:
cabeçalho, rodapé, pop-up e pixel de tracking ficam duplicados em cada página. Pra
mudar uma coisa, precisa alterar manualmente em todas as páginas.

Astro resolve com componentização (como os modelos do Elementor no WordPress): altera
um componente uma vez, reflete em todas as páginas que o usam. Também tem "content
collections" — coleções de conteúdo (como os posts de blog) viram arquivos Markdown
que o Claude escreve direto, sem precisar de banco de dados nem admin.

Vantagens medidas no vídeo: mais rápido que WordPress e Next.js em testes de
velocidade (PageSpeed), open source, hospedagem gratuita no Cloudflare Pages com
deploy automático via GitHub (mesmo fluxo que já usamos aqui).

Ambiente já tem Node.js (v24) e npm instalados, então não há bloqueio técnico pra
adotar quando fizer sentido.

## Link do framework

https://astro.build

## Prompt pronto pra colar no Claude Code (fonte: ratos.link/astroyt)

```
Quero que você me ajude a planejar e construir um site do zero usando o framework Astro. Antes de escrever qualquer código, monte um plano comigo.

O que eu quero do site:
- rápido, leve e fácil de manter (sem framework pesado se não for necessário)
- feito em Astro, com HTML/CSS simples e o conteúdo do blog em arquivos Markdown
- hospedagem gratuita (Cloudflare Pages) com deploy automático via GitHub
- tudo que se repete (cabeçalho, rodapé, pop-ups, scripts de tracking/pixel, template de post do blog) deve virar COMPONENTE reutilizável: eu altero num lugar só e reflete em todas as páginas
- boas práticas de SEO, AEO e GEO desde o começo: title e meta description por página, dados estruturados (JSON-LD), sitemap, robots liberando bots de IA, e conteúdo pensado pra ser citado por ChatGPT e pelo Google AI Overviews

Antes de começar, me faça as perguntas que precisar pra entender o projeto:
- qual o objetivo do site e quem é o público
- quantas e quais páginas
- identidade visual ou referências que eu curto
- se vai ter blog e quais conteúdos
- domínio e onde está hospedado hoje

Depois das minhas respostas, monte um plano passo a passo (estrutura de pastas, componentes e páginas) e só então comece a implementar, pedindo minha confirmação a cada etapa.
```

## Decisão registrada (14/07/2026)

Avaliado pro cliente Mônego Eletromec: optou-se por LP de página única em HTML puro
via `/lp-cliente`, não Astro, porque o site dele é uma única landing page de tráfego
pago, sem blog nem múltiplas páginas recorrentes previstas no curto prazo.
