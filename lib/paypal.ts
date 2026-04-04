const base = process.env.PAYPAL_MODE === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com'

async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
  ).toString('base64')
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: { Authorization: `Basic ${auth}` },
  })
  const data = await res.json()
  return data.access_token
}

// 一次性支付订单（积分包）
export async function createOneTimeOrder(
  planKey: string,
  price: number,
  userId: string
) {
  const token = await getAccessToken()
  const res = await fetch(`${base}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: { currency_code: 'USD', value: price.toFixed(2) },
          custom_id: `${userId}:${planKey}`, // 回调时用来识别用户和套餐
          description: `Passport BG Remover - ${planKey}`,
        },
      ],
    }),
  })
  return res.json()
}

// 捕获支付
export async function captureOrder(orderId: string) {
  const token = await getAccessToken()
  const res = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  return res.json()
}

// 创建订阅套餐（Billing Plan）
export async function createSubscriptionPlan(
  planKey: string,
  price: number,
  name: string,
  description: string
) {
  const token = await getAccessToken()

  // 先创建 Product
  const productRes = await fetch(`${base}/v1/catalogs/products`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: `Passport BG Remover - ${name}`,
      description,
      type: 'SERVICE',
      category: 'SOFTWARE',
    }),
  })
  const product = await productRes.json()

  // 再创建 Plan
  const planRes = await fetch(`${base}/v1/billing/plans`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_id: product.id,
      name: `${name} Monthly`,
      status: 'ACTIVE',
      billing_cycles: [
        {
          frequency: { interval_unit: 'MONTH', interval_count: 1 },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0, // 无限续费
          pricing_scheme: {
            fixed_price: { value: price.toFixed(2), currency_code: 'USD' },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: { value: '0', currency_code: 'USD' },
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3,
      },
    }),
  })
  return planRes.json()
}

// 验证 Webhook 签名
export async function verifyWebhookSignature(
  headers: Record<string, string>,
  body: string
): Promise<boolean> {
  const token = await getAccessToken()
  const res = await fetch(`${base}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: process.env.PAYPAL_WEBHOOK_ID,
      webhook_event: JSON.parse(body),
    }),
  })
  const data = await res.json()
  return data.verification_status === 'SUCCESS'
}
