import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PLANS } from '@/lib/plans'
import { createOneTimeOrder, captureOrder } from '@/lib/paypal'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { action, planKey, orderId } = await req.json()

  // ── 创建订单 ──────────────────────────────────────────────
  if (action === 'create') {
    const plan = PLANS[planKey as keyof typeof PLANS]
    if (!plan || plan.price === 0) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // 创建 PayPal 订单
    const order = await createOneTimeOrder(planKey, plan.price, user.id)
    if (!order.id) {
      return NextResponse.json({ error: 'Failed to create PayPal order' }, { status: 500 })
    }

    // 预先写入 DB（PENDING 状态）
    await prisma.order.create({
      data: {
        userId: user.id,
        plan: planKey as any,
        credits: plan.credits,
        amount: plan.price,
        status: 'PENDING',
        paypalOrderId: order.id,
      },
    })

    return NextResponse.json({ id: order.id })
  }

  // ── 捕获订单（前端支付完成后调用）────────────────────────
  if (action === 'capture') {
    const capture = await captureOrder(orderId)
    
    if (capture.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    // 查找对应的 DB 订单
    const dbOrder = await prisma.order.findFirst({
      where: { paypalOrderId: orderId, userId: user.id, status: 'PENDING' },
    })

    if (dbOrder) {
      const plan = PLANS[dbOrder.plan as keyof typeof PLANS]
      await prisma.$transaction([
        prisma.order.update({
          where: { id: dbOrder.id },
          data: { status: 'COMPLETED' },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: { credits: { increment: plan?.credits ?? 0 } },
        }),
      ])
    }

    return NextResponse.json({ status: 'COMPLETED', credits: PLANS[dbOrder?.plan as keyof typeof PLANS]?.credits })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
