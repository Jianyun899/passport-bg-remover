// 套餐配置
export const PLANS = {
  FREE: {
    name: 'Free',
    credits: 0,
    price: 0,
    description: 'Sign up and get 3 free credits',
  },
  PACK_S: {
    name: 'Starter Pack',
    credits: 20,
    price: 0.99,
    description: '20 credits, one-time purchase',
    highlight: false,
  },
  PACK_M: {
    name: 'Value Pack',
    credits: 60,
    price: 1.99,
    description: '60 credits, one-time purchase',
    highlight: true,
    badge: 'Best Value',
  },
  SUB_BASIC: {
    name: 'Basic Monthly',
    credits: 50,
    price: 2.9,
    description: '50 credits/month, renews monthly',
    highlight: false,
  },
  SUB_PRO: {
    name: 'Pro Monthly',
    credits: 200,
    price: 5.9,
    description: '200 credits/month, renews monthly',
    highlight: false,
  },
} as const

export type PlanKey = keyof typeof PLANS
