# Pack Raiz
*(nome provisório — pode mudar futuramente)*

## O que é hoje
Produto incluído junto com as propostas da Assessoria Raiz (não vendido separado ainda).
Site hospedado no Great Pages com templates prontos no Canva para os clientes montarem os criativos dos carros — o cliente pega o template, coloca a foto do veículo e as informações, e fica pronto para usar.

## Problema atual
O processo ainda é manual do lado do cliente: ele entra no Canva, edita o template, exporta. Dá trabalho e nem todos os clientes têm facilidade.

## Ideia de evolução — sistema automatizado
Criar uma plataforma onde:
1. O cliente sobe as fotos do veículo e preenche as informações (modelo, ano, preço, cor, etc.)
2. O sistema monta o template automaticamente com as informações
3. O sistema reenvia o criativo pronto pro cliente (WhatsApp, email, ou download direto)

O cliente não precisaria mexer no Canva — só envia as fotos e recebe o criativo pronto.

## Potencial de produto
- Hoje: incluído nas propostas como diferencial
- Futuro próximo: produto separado para vender para outras assessoras/concessionárias
- Ideia de landing page simples para vender o pack (templates + sistema de automação)
- Pode se tornar uma receita independente da assessoria

## Tecnologias possíveis para a automação
- **Geração do template:** Playwright (renderiza HTML com as infos do veículo em PNG) — já temos no sistema
- **Upload das fotos:** formulário web simples ou bot no WhatsApp
- **Entrega:** WhatsApp (Z-API), email, ou link de download
- **Identificação visual:** usar o design guide da Assessoria Raiz ou customizar por cliente

## Perguntas para discutir antes de implementar
- [ ] Quais informações o cliente precisaria preencher? (modelo, ano, preço, cor, km, opcionais)
- [ ] Como seria a entrega — WhatsApp, email, ou download?
- [ ] O template seria um padrão da Raiz ou cada concessionária teria o seu?
- [ ] Precificação: incluso na assessoria ou produto à parte?
- [ ] Landing page: onde hospedar, qual o preço do pack?

## Status
💡 Ideia — aguardando discussão para definir escopo e prioridade.
