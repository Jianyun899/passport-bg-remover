'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'

const PAYPAL_CLIENT_ID = 'Ad-hVdtq_IVAiYVJUkQJdYEcHqgZWl-CoWlFerbRYRScKhbeqWvu-HlXqoOnIgvJLL0QNVj7jGHs-cff'

interface Props {
  planKey: string
  price: number
  onSuccess?: (credits: number) => void
}

declare global {
  interface Window {
    paypal: any
  }
}

export default function PayPalButton({ planKey, price, onSuccess }: Props) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const containerRef = useRef<HTMLDivElement>(null)
  const [message, setMessage] = useState('')
  const [sdkLoaded, setSdkLoaded] = useState(false)
  const [buttonsRendered, setButtonsRendered] = useState(false)

  // 加载 PayPal SDK
  useEffect(() => {
    const existingScript = document.getElementById('paypal-sdk')
    if (existingScript) {
      if (window.paypal) setSdkLoaded(true)
      else existingScript.addEventListener('load', () => setSdkLoaded(true))
      return
    }

    const script = document.createElement('script')
    script.id = 'paypal-sdk'
    script.src = `https://www.sandbox.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture&disable-funding=credit,card`
    script.onload = () => setSdkLoaded(true)
    script.onerror = () => setMessage('❌ Failed to load PayPal. Please refresh the page.')
    document.body.appendChild(script)
  }, [])

  // 渲染按钮
  useEffect(() => {
    if (!sdkLoaded || !containerRef.current || !window.paypal || buttonsRendered) return
    if (status !== 'authenticated') return

    setButtonsRendered(true)
    containerRef.current.innerHTML = ''

    window.paypal.Buttons({
      style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' },

      createOrder: async () => {
        setMessage('')
        try {
          const res = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'create', planKey }),
          })
          const data = await res.json()
          if (!res.ok || !data.id) {
            const errMsg = data.error || 'Failed to create order'
            setMessage(`❌ ${errMsg}`)
            throw new Error(errMsg)
          }
          return data.id
        } catch (err: any) {
          if (!err.message?.includes('Failed to create order')) {
            setMessage('❌ Network error. Please try again.')
          }
          throw err
        }
      },

      onApprove: async (data: { orderID: string }) => {
        setMessage('Processing payment...')
        try {
          const res = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'capture', orderId: data.orderID }),
          })
          const result = await res.json()
          if (result.status === 'COMPLETED') {
            setMessage(`✅ Payment successful! +${result.credits} credits added.`)
            onSuccess?.(result.credits)
            setTimeout(() => router.push('/dashboard'), 2000)
          } else {
            setMessage('⚠️ Payment verification failed. Please contact support.')
          }
        } catch {
          setMessage('❌ Error capturing payment. Please contact support.')
        }
      },

      onError: (err: any) => {
        console.error('PayPal Error:', err)
        // 不显示 PayPal 内部错误，已在 createOrder 里处理
      },

      onCancel: () => setMessage('Payment cancelled.'),
    }).render(containerRef.current)
  }, [sdkLoaded, status, planKey, buttonsRendered])

  // 未登录状态
  if (status === 'unauthenticated') {
    return (
      <button
        onClick={() => signIn('google')}
        className="w-full py-2.5 rounded-xl font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        Sign in to Purchase
      </button>
    )
  }

  return (
    <div>
      {!sdkLoaded && status === 'authenticated' && (
        <p className="text-center text-sm text-slate-400 py-2">Loading PayPal...</p>
      )}
      <div ref={containerRef} />
      {message && (
        <p className={`text-center text-sm mt-2 ${message.startsWith('✅') ? 'text-green-600' : message.startsWith('❌') ? 'text-red-500' : 'text-slate-500'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
