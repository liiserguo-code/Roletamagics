# Configuração do Webhook Stripe

Este documento explica como configurar o webhook do Stripe para processar pagamentos automaticamente.

## O que é um Webhook?

Um webhook é uma URL que o Stripe chama automaticamente quando eventos importantes acontecem (como quando um pagamento é confirmado). Isso permite que o sistema credite o saldo do usuário automaticamente após o pagamento.

## Como Configurar

### 1. Acesse o Dashboard do Stripe

Vá para: https://dashboard.stripe.com/webhooks

### 2. Crie um Novo Webhook

Clique em "Add endpoint" e configure:

- **URL do Endpoint**: `https://seu-dominio.vercel.app/api/webhooks/stripe`
- **Descrição**: "Casino Roulette Deposits"
- **Versão da API**: Use a versão mais recente

### 3. Selecione os Eventos

Marque os seguintes eventos para escutar:

- `checkout.session.completed` - Quando o checkout é finalizado com sucesso
- `payment_intent.succeeded` - Quando o pagamento é processado
- `payment_intent.payment_failed` - Quando o pagamento falha

### 4. Obtenha o Signing Secret

Após criar o webhook, você verá um "Signing secret" (começa com `whsec_...`).

Copie este valor e adicione como variável de ambiente:

```
STRIPE_WEBHOOK_SECRET=whsec_seu_secret_aqui
```

### 5. Teste o Webhook

Use o Stripe CLI para testar localmente:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Ou use a aba "Send test webhook" no dashboard para enviar eventos de teste.

## Como Funciona

Quando um pagamento é confirmado:

1. O Stripe envia um evento para `/api/webhooks/stripe`
2. O webhook verifica a assinatura usando `STRIPE_WEBHOOK_SECRET`
3. Processa o evento e extrai os metadados do depósito
4. Credita o valor total (depósito + bônus) no saldo do usuário
5. Registra a transação no log

## Eventos Processados

### `checkout.session.completed`

Disparado quando o usuário completa o checkout. Contém:

- `metadata.depositAmount` - Valor depositado
- `metadata.bonusPercent` - Porcentagem de bônus
- `metadata.totalAmount` - Valor total a creditar

### `payment_intent.succeeded`

Confirma que o pagamento foi processado com sucesso.

### `payment_intent.payment_failed`

Notifica sobre falha no pagamento.

## Segurança

O webhook verifica automaticamente:

- Assinatura do Stripe usando `stripe-signature` header
- Validade do evento
- Origem do webhook

Se a verificação falhar, retorna erro 400.

## Logs

Todos os eventos são logados com o prefixo `[v0]` para facilitar debug:

```javascript
console.log('[v0] Deposit completed:', {
  sessionId,
  depositAmount,
  bonusPercent,
  totalAmount,
  paymentStatus,
})
```

## Ambiente de Teste

No modo de teste do Stripe, você pode usar cartões de teste:

- **Sucesso**: `4242 4242 4242 4242`
- **Falha**: `4000 0000 0000 0002`

Use qualquer data futura e CVC válido (ex: 123).

## Próximos Passos

Após configurar o webhook:

1. Integre com um banco de dados para persistir transações
2. Implemente sistema de notificações por email
3. Adicione logs estruturados para auditoria
4. Configure monitoramento de falhas de webhook
