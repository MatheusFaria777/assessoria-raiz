# Histórico de Otimizações — CZ Contabilize

---

## 26/mai/2026

### Estrutura de campanhas (referência)

- **Campanha 1** — Contabilidade Geral (busca ampla, menor prioridade de budget)
- **Campanha 2** — Troca & Lucro Real (foco de qualidade — separada manualmente da Camp. 1 pra forçar investimento no público certo)

### Negativações adicionadas (ambas as campanhas)

Concorrentes e marcas locais:
- Contabilidade Comin, Caleffi, Rorato e outros escritórios da região

Termos irrelevantes para o público-alvo:
- MEI, Simples Nacional, grátis, gratuito, emprego, estágio, concurso, curso

Termos informacionais:
- o que é, oque é, oq é, como funciona, diferença entre, apuração, lalur

### Novos keywords — AG Lucro Real (Campanha 2)

Via API:
- `planejamento tributário empresarial` [Frase]
- `contador tributário empresarial` [Frase]
- `regime tributário empresas` [Frase]
- `contabilidade empresas médias` [Frase]
- `contador especializado lucro real` [Frase]

Adicionados manualmente (do Planejador de Keywords):
- `planejamento tributário` [Frase]
- `contabilidade tributária` [Frase]
- `tributação lucro real` [Frase]
- `empresa lucro presumido` [Frase]

### Novos keywords — AG Troca de Contador (Campanha 2)

Via API:
- `migrar contabilidade` [Frase]
- `trocar escritório contábil` [Frase]
- `novo contador empresa` [Frase]
- `mudar contabilidade empresa` [Frase]

### Limpeza de conta

- Removido AG duplicado "Contabilidade Geral" da Campanha 2 (ID: 195990598305) — surgiu por duplicação manual da campanha, estava pausado e sem gasto.

### Pendências (decidido, ainda não executado)

Negativar termos informacionais de alto volume que o planejador de keywords sugere mas não têm intenção comercial:
- `o que é`, `oque é`, `oq é`, `lalur`, `apuração`, `como funciona`, `diferença entre`, `tributação` (sozinho), `cursos`, `concurso`

---

## 02/jun/2026

### Análise de termos de busca (últimos 30 dias)

**Achado principal:** maioria dos cliques na Campanha 1 são buscas por nomes de concorrentes (ex: "exata contabilidade", "alternativa contabilidade porto alegre", "altacon nova hartz"). Pessoa que busca nome de escritório específico não vai contratar a CZ. Esse era o principal dreno de qualidade.

**Campanha 2 — Lucro Real:** keywords com volume real são poucas. `contador tributário` [Frase] foi a melhor keyword: 5 cliques, 2 conversões, CPL R$45. `contabilidade lucro real` teve 79 impressões mas CTR de 7,6% e 0 conversões. Termos informacionais (`simulador lucro real`, `planilha irpj e csll`) capturando tráfego errado.

**Campanha 2 — Troca de Contador:** zero impressões em 30 dias nas keywords existentes. Volume de busca genuinamente baixo no RS para esse ângulo.

### Renovação de token OAuth

Refresh token do Google Ads API estava expirado. Renovado via `setup.py oauth`. API voltou a funcionar normalmente.

### Negativações adicionadas — Campanha 1 (Contabilidade Geral, ID: 23805234219)

Concorrentes com gasto registrado e ainda não negativados:
- `mei` [Ampla] — exclui qualquer busca com MEI
- `exata contabilidade` [Frase]
- `alternativa contabilidade` [Frase]
- `altacon` [Ampla]
- `auditec` [Ampla]
- `tesche` [Ampla]
- `noronha` [Ampla]
- `contabilidade online para mei` [Frase]

### Negativações adicionadas — Campanha 2 (Troca & Lucro Real, ID: 23866650151)

Termos informacionais confirmados nos search terms:
- `mei` [Ampla]
- `simulador` [Ampla]
- `planilha` [Ampla]
- `calcular` [Ampla]
- `excel` [Ampla]
- `base de calculo` [Frase]

### Keywords novas ativadas — AG Lucro Real (ID: 195990598465)

Ângulo de dor/descoberta — ainda não testados:
- `pagar menos imposto empresa` [Frase]
- `reduzir imposto empresa` [Frase]
- `contratar escritorio de contabilidade` [Frase]
- `como trocar de escritorio contabil` [Frase]

### Keywords novas ativadas — AG Troca de Contador (ID: 195990598505)

Broad match para descoberta de termos reais de pesquisa:
- `trocar contador` [Ampla]
- `mudar contador` [Ampla]
- `escritorio contabilidade` [Ampla]

Objetivo: descobrir o que as pessoas realmente buscam. Monitorar search terms em 15 dias e negativar o que for irrelevante.

### Análise de copy — czcontabilize.com.br

Site criado do zero pela Raiz. Copy bem estruturada (dor → solução → diferencial → prova social → CTA baixo compromisso). Principal gap identificado: nenhuma filtragem visível por porte de empresa. A dor "pagando imposto a mais" é universal — MEI e pequenas empresas leem e clicam também.

**Ajuste sugerido:** trocar subtítulo do hero para incluir qualificação explícita de público ("para empresas com faturamento acima de R$1M").

### Discussão estratégica — próximos passos

**Expansão Brasil no Google:** depende de a CZ atender clientes remotamente. Se sim, pode aumentar volume nas keywords de lucro real. Se RS-only, não vale — aumenta custo e piora qualidade.

**Meta Ads:** recomendado como próximo canal. Pixel já instalado.
- **Imediato:** retargeting para visitantes do site (audiência já existe, custo baixo, alto intent)
- **Seguinte:** cold audience com ângulo de dor (sócios/diretores de empresa no RS)
- **Depois:** lookalike baseado na base de 280 clientes atuais

**LinkedIn Ads:** interesse de longo prazo da Gláucia — canal ideal para o ICP (tamanho de empresa + cargo), custo maior mas melhor qualidade. Retomar quando tiver budget pra testar.

---

## 07/jul/2026

### Reunião de alinhamento (02/jul/2026) — decisões relevantes

**Leads de junho:** 24 marcados pelo pixel, ~10 chegaram de fato à Raquel. Qualidade baixa — maioria com CNPJ em problema que outros contadores não atendem. Única exceção: advogada de Porto Alegre (veio por e-mail, fechou para trabalho pontual).

**Feedback de leads — processo definido:**
- Raquel (recepcionista) adicionada ao grupo de WhatsApp do tráfego pago
- Vai classificar cada contato: "cliente potencial" ou "não potencial" direto no grupo
- Gláucia vai verificar com o fornecedor da central se dá pra rotear automaticamente a mensagem padrão do site direto pra Raquel (bypassar o menu)

**Expansão para o Brasil:** DESCARTADA. Gláucia avaliou como complexo — tributação varia por estado e município, CZ não tem estrutura pra atender remotamente em escala.

**Meta Ads:** Denise (outra agência) faz apenas impulsionamentos por enquanto, sem campanha de aquisição. Lucas propôs integração Google + Meta (ecossistema). Gláucia receptiva. Grupo conjunto com Denise existe mas inativo.

**10 anos da CZ (set/2026):** evento planejado. Campanha de aniversário no Meta — coordenar com Denise.

**Novo ângulo estratégico (sugestão da Gláucia + Sandra):** explorar reforma tributária e transição do Simples Nacional como keywords principais.

---

### Otimizações de campanha — 07/jul/2026

**Orçamento:** Campaign 1 pausada. Budget redirecionado para Campaign 2.

**Target CPA:** adiado. Conta com ~15 conversões/mês após pausa da Camp. 1 — abaixo do mínimo de 30-50 que o Google precisa para Smart Bidding funcionar. Revisar em 30-45 dias.

### Headlines removidos — AG Lucro Real (Camp. 2)

- "Reduza Carga Tributária" — duplicata do headline pinado
- "Atende Indústrias em RS" — restringe ICP desnecessariamente
- "Indústria de Médio Porte" — idem

### Headlines adicionados — AG Lucro Real (Camp. 2)

- `Estudo Tributário Gratuito` — match direto com nova keyword, CTA claro
- `Está Pagando Imposto a Mais?` — dor principal confirmada pela Gláucia
- `Presumido ou Lucro Real?` — captura ângulo de comparativo tributário

### Headlines removidos — AG Troca de Contador (Camp. 2)

- "Atendimento Rápido" — genérico
- "Contabilidade Que Funciona" — genérico
- "Indústrias e Médio Porte" — restringe ICP

### Headlines adicionados — AG Troca de Contador (Camp. 2)

- `Passou do Limite do Simples?` — captura momento de desenquadramento
- `Deixando o Simples Nacional?` — variação, Google testa os dois
- `Especialistas em Lucro Real` — sinaliza expertise pra quem está em transição

### Descriptions atualizadas (ambos os AGs)

Substituído "indústrias" por "empresas" em 3 descriptions que restringiam o ICP.

### Novas keywords — AG Lucro Real (todas amplas, exceto reforma)

- `estudo tributário` [Ampla]
- `comparativo tributário` [Ampla]
- `presumido ou lucro real` [Ampla]
- `como saber se devo ser lucro real` [Ampla]
- `vantagens do lucro real` [Ampla]
- `benefícios lucro real` [Ampla]
- `créditos de impostos empresa` [Ampla]
- `risco tributário empresa` [Ampla]
- `"reforma tributária empresa"` [Frase] — em frase pois o termo geral tem volume informacional alto demais

### Novas keywords — AG Troca de Contador (todas amplas)

- `limite simples nacional` [Ampla]
- `saí do simples nacional` [Ampla]
- `não posso mais ser simples nacional` [Ampla]
- `faturamento acima do simples nacional` [Ampla]
- `deixar o simples nacional` [Ampla]

### Site czcontabilize.com.br

Headline do hero já estava alinhada com a dor confirmada pela Gláucia. Mantida como está.

**Pendências identificadas (não executadas hoje):**
- CTA do hero: trocar "Quero saber mais" por algo alinhado ao estudo tributário ("Fazer meu estudo tributário grátis" ou similar) — melhora Quality Score das keywords novas
- Adicionar menção ao Simples Nacional na seção "Trocar de Contabilidade" para capturar tráfego das novas keywords do AG Troca
