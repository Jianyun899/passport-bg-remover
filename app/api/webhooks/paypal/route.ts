import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PLANS } from '@/lib/plans'
import { verifyWebhookSignature } from '@/lib/paypal'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const headers: Record<string, string> = {
      'paypal-auth-algo': req.headers.get('paypal-auth-algo') ?? '',
      'paypal-cert-url': req.headers.get('paypal-cert-url') ?? '',
      'paypal-transmission-id': req.headers.get('paypal-transmission-id') ?? '',
      'paypal-transmission-sig': req.headers.get('paypal-transmission-sig') ?? '',
      'paypal-transmission-time': req.headers.get('paypal-transmission-time') ?? '',
    }

    // 验证签名（沙盒可注释掉，上线前必须开启）
    const valid = await verifyWebhookSignature(headers, rawBody)
    if (!valid) {
      console.warn('[PayPal Webhook] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const body = JSON.parse(rawBody)
    const eventType = body.event_type
    console.log('[PayPal Webhook]', eventType)

    // ── 一次性支付成功 ──────────────────────────────────────
    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const customId: string = body.resource?.purchase_units?.[0]?.custom_id ?? ''
      if (!customId) return NextResponse.json({ ok: true })

      const [userId, planKey] = customId.split(':')
      const plan = PLANS[planKey as keyof typeof PLANS]
      if (!plan) return NextResponse.json({ ok: true })

      const paypalOrderId = body.resource?.supplementary_data?.related_ids?.order_id

      await prisma.$transaction([
        ...(paypalOrderId ? [
          prisma.order.updateMany({
            where: { paypalOrderId, userId, status: 'PENDING' },
            data: { status: 'COMPLETED' },
          })
        ] : []),
        prisma.user.update({
          where: { id: userId },
          data: { credits: { increment: plan.credits } },
        }),
      ])

      console.log(`[PayPal] ✅ User ${userId} +${plan.credits} credits (${planKey})`)
    }

    // ── 订阅激活 ───────────────────────────────────────────
    if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED') {
      const customId: string = body.resource?.custom_id ?? ''
      if (!customId) return NextResponse.json({ ok: true })

      const [userId, planKey] = customId.split(':')
      const plan = PLANS[planKey as keyof typeof PLANS]
      if (!plan) return NextResponse.json({ ok: true })

      await prisma.user.update({
        where: { id: userId },
        data: {
          plan: planKey as any,
          credits: { increment: plan.credits },
        },
      })
      console.log(`[PayPal] ✅ Subscription activated for ${userId} (${planKey})`)
    }

    // ── 订阅月度续费扣款成功 ────────────────────────────────
    if (eventType === 'PAYMENT.SALE.COMPLETED') {
      const billingAgreementId = body.resource?.billing_agreement_id
      if (!billingAgreementId) return NextResponse.json({ ok: true })

      // 找到对应用户（通过 paypalOrderId 存的是 subscriptionId）
      const order = await prisma.order.findFirst({
        where: { paypalOrderId: billingAgreementId, status: 'COMPLETED' },
      })
      if (!order) return NextResponse.json({ ok: true })

      const plan = PLANS[order.plan as keyof typeof PLANS]
      await prisma.user.update({
        where: { id: order.userId },
        data: { credits: { increment: plan?.credits ?? 0 } },
      })
      console.log(`[PayPal] ✅ Subscription renewal for ${order.userId}`)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[PayPal Webhook Error]', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
