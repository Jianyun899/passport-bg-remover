'use client'

import Link from 'next/link'
import { useSession, signIn } from 'next-auth/react'
import dynamic from 'next/dynamic'

// 动态加载 PayPal 按钮（避免 SSR 问题）
const PayPalButton = dynamic(() => import('@/components/PayPalButton'), { ssr: false })

const plans = [
  {
    key: 'FREE',
    name: 'Free',
    price: '$0',
    priceNum: 0,
    period: '',
    credits: '3 credits',
    creditNote: 'one-time on signup',
    features: ['3 free credits on sign up', 'Full resolution download', 'All background colors', 'All size presets'],
    cta: 'Get Started Free',
    ctaHref: '/',
    highlight: false,
  },
  {
    key: 'PACK_S',
    name: 'Starter Pack',
    price: '$0.99',
    priceNum: 0.99,
    period: 'one-time',
    credits: '20 credits',
    creditNote: 'never expire',
    features: ['20 processing credits', 'Full resolution download', 'All background colors', 'All size presets', 'Processing history'],
    cta: 'Buy Starter Pack',
    ctaHref: '/api/checkout?plan=PACK_S',
    highlight: false,
  },
  {
    key: 'PACK_M',
    name: 'Value Pack',
    price: '$1.99',
    priceNum: 1.99,
    period: 'one-time',
    credits: '60 credits',
    creditNote: 'best value · never expire',
    features: ['60 processing credits', 'Full resolution download', 'All background colors', 'All size presets', 'Processing history', '3× more credits vs Starter'],
    cta: 'Buy Value Pack',
    ctaHref: '/api/checkout?plan=PACK_M',
    highlight: true,
    badge: '🔥 Best Value',
  },
  {
    key: 'SUB_BASIC',
    name: 'Basic',
    price: '$2.9',
    priceNum: 2.9,
    period: '/month',
    credits: '50 credits',
    creditNote: 'refreshed monthly',
    features: ['50 credits/month', 'Full resolution download', 'All background colors', 'All size presets', 'Processing history', 'Cancel anytime'],
    cta: 'Subscribe Basic',
    ctaHref: '/api/checkout?plan=SUB_BASIC',
    highlight: false,
  },
  {
    key: 'SUB_PRO',
    name: 'Pro',
    price: '$5.9',
    priceNum: 5.9,
    period: '/month',
    credits: '200 credits',
    creditNote: 'refreshed monthly',
    features: ['200 credits/month', 'Full resolution download', 'All background colors', 'All size presets', 'Processing history', 'Priority processing', 'Cancel anytime'],
    cta: 'Subscribe Pro',
    ctaHref: '/api/checkout?plan=SUB_PRO',
    highlight: false,
  },
]

const faqs = [
  {
    q: 'Is it really free to start?',
    a: 'Yes! Sign up with your Google account and get 3 free credits instantly — no credit card required.',
  },
  {
    q: 'Do credits expire?',
    a: 'One-time pack credits never expire. Monthly subscription credits refresh at the start of each billing cycle.',
  },
  {
    q: 'What photo formats are supported?',
    a: 'JPG, PNG, and WebP up to 10MB per image.',
  },
  {
    q: 'Are my photos stored on your servers?',
    a: 'No. Photos are processed immediately and deleted right after. We only keep a log of when you processed a photo (no image data).',
  },
  {
    q: 'Which passport photo standards do you support?',
    a: 'US (2×2in), UK, EU Schengen, China, and 20+ country presets — plus custom size input.',
  },
  {
    q: 'Can I cancel my subscription?',
    a: 'Yes, cancel anytime from your dashboard. No questions asked, no cancellation fees.',
  },
  {
    q: 'When will PayPal payment be available?',
    a: 'PayPal support is coming very soon. We\'ll notify you by email when it\'s ready.',
  },
]

export default function PricingPage() {
  const { data: session } = useSession()
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-slate-800">📸 Passport Photo BG Remover</Link>
          <Link href="/" className="text-sm text-blue-600 hover:underline">← Back to App</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">Simple, Transparent Pricing</h1>
          <p className="text-slate-500 text-lg">Start free. Pay only when you need more. No subscriptions forced.</p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-20">
          {plans.map(plan => (
            <div
              key={plan.key}
              className={`relative rounded-2xl p-6 flex flex-col border transition-shadow ${
                plan.highlight
                  ? 'bg-blue-600 text-white border-blue-500 shadow-xl shadow-blue-200 scale-105'
                  : 'bg-white text-slate-800 border-slate-100 shadow-sm hover:shadow-md'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full whitespace-nowrap">
                  {plan.badge}
                </span>
              )}
              <div className="mb-4">
                <h3 className={`font-bold text-lg mb-1 ${plan.highlight ? 'text-white' : 'text-slate-800'}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold">{plan.price}</span>
                  <span className={`text-sm ${plan.highlight ? 'text-blue-200' : 'text-slate-400'}`}>{plan.period}</span>
                </div>
                <p className={`text-sm mt-1 font-medium ${plan.highlight ? 'text-blue-100' : 'text-blue-600'}`}>
                  {plan.credits}
                  <span className={`font-normal ml-1 ${plan.highlight ? 'text-blue-200' : 'text-slate-400'}`}>
                    · {plan.creditNote}
                  </span>
                </p>
              </div>

              <ul className="space-y-2 flex-1 mb-6">
                {plan.features.map(f => (
                  <li key={f} className={`text-sm flex items-start gap-2 ${plan.highlight ? 'text-blue-50' : 'text-slate-600'}`}>
                    <span className="mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {plan.key === 'FREE' ? (
                <Link
                  href="/"
                  className={`block text-center py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                    plan.highlight
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              ) : (
                <PayPalButton planKey={plan.key} price={plan.priceNum} />
              )}
            </div>
          ))}
        </div>

        {/* Comparison note */}
        <p className="text-center text-slate-400 text-sm mb-20">
          💡 Professional photo studios charge $10–30 per passport photo. We charge as little as $0.033/photo.
        </p>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map(faq => (
              <div key={faq.q} className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-2">{faq.q}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 mt-20 py-8 text-center text-slate-400 text-sm">
        © 2025 Passport Photo BG Remover · <Link href="/" className="hover:text-blue-500">Home</Link>
      </footer>
    </div>
  )
}
