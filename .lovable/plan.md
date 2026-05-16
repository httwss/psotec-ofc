## Plano

### 1. Banner promocional acima da Navbar
- Copiar `WhatsApp_Image_2026-05-15_at_8.41.41_PM.jpeg` para `src/assets/promo-banner.jpg`.
- Criar `src/components/landing/PromoBanner.tsx` — faixa full-width clicável (Link para `/checkout`), responsiva (cover, max-h em desktop, sem corte do conteúdo principal em mobile via `object-cover`/`object-position`).
- Renderizar em `src/pages/Index.tsx` como **primeiro** filho, antes de `<Navbar />`.

### 2. Preço unitário R$ 169 → R$ 119,97
- `src/components/landing/Hero.tsx`: `PRODUCT_PRICE = 119.97`.
- `src/pages/Checkout.tsx`: `PRODUCT.price = 119.97`.
- Atualizar o texto de parcelamento:
  - 1–2 un: "Em até 12x no cartão" (valor da parcela calculado em cima do total com juros do MP — não prometer "sem juros").
  - 3+ un: destacar "**12x de R$ 29,99 sem juros**" (3 × 119,97 ≈ 359,88 ≈ 12 × 29,99). Isso aparece no Hero (badge), no FinalCTA, e no resumo do Checkout quando `quantity >= 3`.
- Atualizar `index.html` (OG/desc) se o preço aparece em meta.

### 3. Frete real via Melhor Envio (Sandbox=não, Produção)
Substituir `calcShipping()` mockado por chamada à edge function.

**Secret necessário:** `MELHOR_ENVIO_TOKEN` (token de produção do Melhor Envio — pedirei via add_secret).

**Nova edge function** `supabase/functions/calc-shipping/index.ts`:
- POST `{ cep_destino: string }`.
- Valida CEP com Zod, normaliza só dígitos.
- Constantes do produto (origem + dimensões):
  - CEP origem: `79830-080`
  - peso: `0.12` kg (por unidade) — multiplica por `quantity` recebido
  - altura: `12`, largura: `7`, comprimento: `4.5` cm
  - Aceita `quantity` no body (1–99) para escalar peso.
- Chama `POST https://www.melhorenvio.com.br/api/v2/me/shipment/calculate`:
  - Headers: `Authorization: Bearer ${MELHOR_ENVIO_TOKEN}`, `Accept: application/json`, `Content-Type: application/json`, `User-Agent: Psotec (contato@psotec)`.
  - Body: `{ from: { postal_code }, to: { postal_code }, products: [{ id: "1", width, height, length, weight, insurance_value: total, quantity }] }`.
- Filtra retornos com `error` e mapeia para `{ id, name, company, days, price }` (usa Correios PAC/SEDEX se presentes, senão todas as opções de transportadora).
- CORS + validação + tratamento de erro (retorna mensagem amigável se token inválido).

**Frontend (`Checkout.tsx`):**
- Trocar `calcShipping(uf)` pelo `supabase.functions.invoke("calc-shipping", { body: { cep_destino, quantity } })` dentro do `useEffect` do CEP.
- Mostrar loader enquanto calcula, error toast se falhar.
- Recalcular quando `quantity` mudar (adicionar `quantity` às deps).
- Manter regra de frete grátis para 3+ unidades (zera o preço da opção escolhida, mas usa o nome real da transportadora).
- UI já existente das opções continua funcionando (id/name/days/price).

### 4. Verificação
- Build automático.
- Testar edge function com `curl_edge_functions` usando CEP real.
- Conferir banner no preview (1067px).

### Detalhes técnicos
- Token Melhor Envio criado em https://melhorenvio.com.br/painel/gerenciar/tokens (escopo: `shipping-calculate`).
- Endpoint público de cálculo não exige OAuth completo, só Bearer token.
- Se a API exigir scope adicional, retornaremos erro claro pedindo regeração do token.

### Pendente do usuário
Após aprovação do plano, vou pedir o secret `MELHOR_ENVIO_TOKEN`.
