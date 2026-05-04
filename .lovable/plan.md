# Plano: Profissionalizar checkout Mercado Pago

## 1. Liberar todos os métodos de pagamento
Em `supabase/functions/create-checkout/index.ts`, adicionar à preference:
```ts
payment_methods: {
  excluded_payment_types: [],
  excluded_payment_methods: [],
  installments: 12,
}
```
E ajustar `back_urls.success` para `/obrigado?order=<id>`.

## 2. Webhook do Mercado Pago
Criar nova edge function pública `supabase/functions/mp-webhook/index.ts` (`verify_jwt = false`):
- Recebe POST do MP com `{ type: "payment", data: { id } }`
- Busca pagamento: `GET https://api.mercadopago.com/v1/payments/{id}` com Bearer token
- Lê `external_reference` (= order.id) e `status` (`approved`/`pending`/`rejected`/`in_process`)
- Atualiza `orders.status` + novos campos `mp_payment_id`, `paid_at` via service role
- Responde 200 sempre (MP exige)

Migration: adicionar colunas em `orders`:
- `mp_payment_id text`
- `paid_at timestamptz`
- índice em `mp_preference_id`

URL do webhook a configurar no painel MP:
`https://anyuhgqjmydlauqaukrp.supabase.co/functions/v1/mp-webhook`

Adicionar `notification_url` na preference apontando para essa URL.

## 3. Página de sucesso `/obrigado`
Criar `src/pages/ThankYou.tsx` e rota em `src/App.tsx`:
- Lê `?order=<id>&status=...` da query
- Busca pedido no banco (RLS pública de SELECT por id ou edge function leve)
- Mostra: número do pedido, status do pagamento (com badge), resumo (produto, frete, total, endereço), próximos passos, CTA WhatsApp e voltar à home
- Polling a cada 4s nos primeiros 60s para refletir confirmação do webhook (PIX)

Para evitar expor todos os pedidos: criar edge function `get-order` que recebe `id` e retorna apenas dados não-sensíveis, ou policy RLS de SELECT por id (sem listar). Vou usar **edge function** `get-order` (mais seguro).

## 4. Painel admin de pedidos
- Tabela `user_roles` + enum `app_role` + função `has_role` (padrão seguro)
- Habilitar auth (email/senha) e criar página `/auth` (login/signup)
- RLS em `orders`: admins podem SELECT/UPDATE; ninguém mais
- Página `/admin/pedidos` (`src/pages/AdminOrders.tsx`):
  - Lista pedidos com filtro por status (pending, approved, rejected, shipped)
  - Detalhe expandível com endereço completo, frete, total
  - Botão para marcar como "enviado" + campo de código de rastreio (nova coluna `tracking_code text`)
- Link no Navbar visível só para admins

Primeiro admin: após signup, rodar insert manual atribuindo role 'admin'.

## Arquivos afetados
- `supabase/functions/create-checkout/index.ts` (editar)
- `supabase/functions/mp-webhook/index.ts` (novo)
- `supabase/functions/get-order/index.ts` (novo)
- `supabase/config.toml` (adicionar mp-webhook e get-order com verify_jwt=false)
- `supabase/migrations/*` (colunas orders + user_roles + RLS)
- `src/pages/ThankYou.tsx` (novo)
- `src/pages/AdminOrders.tsx` (novo)
- `src/pages/Auth.tsx` (novo)
- `src/App.tsx` (rotas)
- `src/components/landing/Navbar.tsx` (link admin condicional)

## Confirmações antes de implementar
- Token MP atual já é de produção (`APP_USR-...`)? Se for sandbox (`TEST-...`), webhook funciona igual mas pagamentos são fictícios.
- OK criar sistema de auth (email+senha, sem Google) só para o admin?
