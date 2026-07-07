---
name: frontend-design
description: >
  Gera interfaces web (HTML/CSS) com design distintivo e pronto para produção.
  Evita estética genérica de IA. Processo estruturado: brainstorm → plano aprovado → execução.
  Ideal para link na bio, landing pages, páginas de apresentação, qualquer output web.
  Gatilhos: "cria a página", "faz o link na bio", "monta a landing", "/frontend-design".
---

# /frontend-design — Interfaces Web com Design Distintivo

## Princípio central

Abordagem de líder de design de estúdio pequeno conhecido por dar a cada cliente identidade visual impossível de confundir. Nunca genérico. Nunca parecer gerado por IA.

**Três clichês que nunca usar:**
1. Fundo creme com acentos ocre
2. Fundo escuro com verde ácido / neon
3. Layout estilo jornal com grid rígido

---

## Passo 1 — Carregar o brand

Perguntar para qual marca é a página:
- **@omatheusfariaa / comunidade-leitura** → ler `projetos/comunidade-leitura/brand.md`
- **Assessoria Raiz** → ler `marca/design-guide.md`
- **Cliente externo** → pedir briefing visual

---

## Passo 2 — Brainstorm estruturado

Definir antes de codificar:

| Decisão | Opções a considerar |
|---------|-------------------|
| **Paleta** | 3-4 valores hex do brand. Qual é o dominante, qual é o acento? |
| **Tipografia** | Fonte principal + fonte de destaque. Google Fonts preferido. |
| **Layout** | Vertical scroll? Single screen? Cards? |
| **Elemento único** | O que essa página tem que nenhuma outra tem? |
| **Animação** | Sutil (fade-in, hover) ou nenhuma? |

Apresentar as decisões ao usuário antes de codificar. Ajustar se necessário.

---

## Passo 3 — Executar

Criar o HTML completo em um único arquivo (CSS inline ou `<style>`):

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[título]</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <!-- fontes escolhidas no brainstorm -->
</head>
<body>
  <!-- composição única -->
</body>
</html>
```

**Checklist de execução:**
- [ ] Mobile-first (a maioria acessa pelo celular)
- [ ] Nenhum elemento quebrando em telas pequenas (320px mínimo)
- [ ] Hover states nos botões/links
- [ ] Contraste de texto: mínimo 4.5:1 (acessibilidade)
- [ ] Sem dependências externas além de Google Fonts

---

## Passo 4 — Publicar (se for Cloudflare Pages)

Se o output for para o projeto `assessoria-raiz` no Cloudflare Pages:

1. Salvar em `paginas/[nome-da-pagina].html`
2. Confirmar com o usuário antes de fazer deploy
3. Deploy via API do Cloudflare (token em `.env` na raiz do projeto)

---

## Regras

- Nunca codificar sem o brainstorm aprovado
- Design mobile-first obrigatório (link na bio é 100% mobile)
- Paleta sempre do brand — nunca inventar cores
- O "elemento único" é obrigatório — uma página sem diferencial não sai daqui
- Se o output for link na bio: priorizar velocidade de carregamento (sem imagens pesadas, sem JS desnecessário)
