# Google Ads — Mônego Eletromec
**Gerado em:** 01/07/2026  
**Status:** Pronto para subir (aguardando conta Google Ads + LP publicada)

---

## Estrutura da Campanha

**Campanha:** Mônego Eletromec — Pesquisa  
**Tipo:** Rede de Pesquisa (Search Only)  
**Orçamento:** R$17/dia (~R$500/mês)  
**Rotação de anúncios:** Otimizar (deixar Google decidir)  
**Idioma:** Português  
**Localização:** ver seção abaixo

### Segmentação geográfica
- Caxias do Sul (raio de 80 km)
- Porto Alegre e região metropolitana
- Passo Fundo, Santa Maria (ajuste de lance -20%)
- Litoral SC: Joinville, Blumenau, Tubarão (ajuste de lance -10%)

### Estrutura de grupos
**1 grupo de anúncios** — todos os serviços juntos (volume baixo não justifica separação)

**Nome do grupo:** Manutenção Industrial — Todos os Serviços

---

## Palavras-chave

### Correspondência de frase ("palavra-chave")

```
"manutenção de máquinas industriais"
"manutenção de equipamentos industriais"
"assistência técnica industrial"
"manutenção corretiva industrial"
"manutenção preventiva industrial"
"manutenção de máquinas cnc"
"técnico de máquinas industriais"
"manutenção chiller industrial"
"manutenção laser"
"manutenção dobradeira"
"manutenção plasma"
"reparo de máquinas industriais"
"manutenção mecânica industrial"
```

### Correspondência exata ([palavra-chave])

```
[manutenção laser industrial]
[manutenção dobradeira industrial]
[manutenção plasma cnc]
[laudo máquina usada]
[manutenção chiller industrial]
[assistência técnica laser industrial]
[assistência técnica dobradeira]
[manutenção de máquinas industriais caxias do sul]
```

### Palavras-chave negativas (adicionar na campanha inteira)

```
epilação
estética
depilação
papel
origami
impressora
dental
cirurgia
emprego
vaga
salário
salario
currículo
curriculo
curso
treinamento
apostila
concurso
grátis
gratuito
o que é
como funciona
como fazer
pdf
cozinha
forno
liquidificador
fritadeira
doméstico
domestico
residencial
preço
tabela de preços
quanto custa
barato
```

---

## Estratégia de Lance

**Fase 1 — Mês 1 e 2 (sem histórico de conversão):**
- **CPC manual** com teto de R$7 por clique
- Alternativa: Maximizar cliques com lance máximo de R$7

**Fase 2 — Após 30 conversões rastreadas (cliques no WhatsApp):**
- Mudar para **Maximizar Conversões** ou **CPA desejado**

**Conversão a configurar:** clique no botão WhatsApp da LP (via GTM + Google Ads tag)

---

## Anúncio Responsivo de Pesquisa (RSA)

> Inserir todos os títulos e descrições abaixo no Google Ads. O sistema testa automaticamente as melhores combinações.

### Títulos (até 30 caracteres cada)

```
{KeyWord:Manutenção Industrial}
Manutenção em {LOCATION(City):Caxias do Sul}
20+ Anos de Especialista
Garantia de Conclusão
Atendemos 2º e 3º Turno
Resposta Garantida em até 8h
Laser, Dobradeira e Plasma CNC
Laudo de Máquina Usada
Chame no WhatsApp Agora
Atendemos RS e SC Inteiro
Especialista, Não Generalista
Manutenção de Máquinas CNC
Orçamento Rápido via WhatsApp
```

**Notas sobre os dois títulos dinâmicos:**
- `{KeyWord:Manutenção Industrial}` — puxa exatamente o que o usuário pesquisou. Se a keyword for longa demais, cai para "Manutenção Industrial".
- `Manutenção em {LOCATION(City):Caxias do Sul}` — mostra a cidade do usuário. Se não identificar, mostra "Caxias do Sul".

### Descrições (até 90 caracteres cada)

```
Paramos a máquina pelo menor tempo. Garantia de conclusão mesmo com prejuízo. Chame agora.
Especialista em laser, dobradeira e plasma CNC. Atendemos 2º e 3º turno em todo RS e SC.
SLA com resposta garantida. 20+ anos de experiência em manutenção industrial. WhatsApp.
Máquina parada é prejuízo imediato. Técnico especialista, não generalista. Orçamento rápido.
```

---

## Extensões

### Sitelinks (4 links extras abaixo do anúncio)

**Sitelink 1**
- Título: `Laudo de Máquina Usada`
- Linha 1: `Inspeção antes de comprar usada`
- Linha 2: `Corte térmico e dobradeira`
- URL: página da LP (mesma URL com âncora #servicos)

**Sitelink 2**
- Título: `Atendimento 2º e 3º Turno`
- Linha 1: `Manutenção urgente fora do horário`
- Linha 2: `Sem parar mais do que o necessário`
- URL: mesma LP

**Sitelink 3**
- Título: `Nossa Garantia`
- Linha 1: `Garantia de conclusão do serviço`
- Linha 2: `Mesmo com prejuízo, concluímos`
- URL: mesma LP

**Sitelink 4**
- Título: `Área de Atendimento`
- Linha 1: `Caxias do Sul, interior RS e SC`
- Linha 2: `Joinville a Tubarão. Consulte.`
- URL: mesma LP

---

### Extensões de frase de destaque (Callouts)

> Copiar e colar — sem links, aparecem como texto de destaque no anúncio.

```
Atendimento 2º e 3º Turno
Garantia de Conclusão
20+ Anos de Experiência
Resposta em até 8 Horas
Especialista em Laser
RS e SC Inteiro
Orçamento via WhatsApp
```

---

### Snippets estruturados

**Cabeçalho:** Serviços  
**Valores:**

```
Laser Industrial
Dobradeira de Chapas
Plasma CNC
Chiller Industrial
Laudo de Inspeção
Manutenção Preventiva
Manutenção Corretiva
```

---

## Checklist antes de subir

- [ ] Conta Google Ads criada
- [ ] LP publicada e funcionando no domínio final
- [ ] GTM configurado com evento de clique no botão WhatsApp
- [ ] Tag de conversão do Google Ads substituída na LP (AW-ID/label)
- [ ] Conta Google Ads linkada ao Google Analytics 4
- [ ] GMB linkado à conta Google Ads
- [ ] Substituir ID da tag na LP antes de publicar
