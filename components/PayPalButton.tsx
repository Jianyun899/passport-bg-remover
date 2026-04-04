'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

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
  const containerRef = useRef<HTMLDivElement>(null)
  const [message, setMessage] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // 防止重复加载
    if (document.getElementById('paypal-sdk')) {
      setLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.id = 'paypal-sdk'
    script.src = `https://www.sandbox.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture`
    script.onload = () => setLoaded(true)
    script.onerror = () => setMessage('❌ Failed to load PayPal SDK')
    document.body.appendChild(script)
  }, [])

  useEffect(() => {
    if (!loaded || !containerRef.current || !window.paypal) return

    // 清空容器防止重复渲染
    containerRef.current.innerHTML = ''

    window.paypal.Buttons({
      style: { layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' },

      createOrder: async () => {
        setMessage('')
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create', planKey }),
        })
        const data = await res.json()
        if (!data.id) throw new Error(data.error || 'Failed to create order')
        return data.id
      },

      onApprove: async (data: { orderID: string }) => {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'capture', orderId: data.orderID }),
        })
        const result = await res.json()
        if (result.status === 'COMPLETED') {
          setMessage(`✅ Payment successful! +${result.credits} credits added.`)
          onSuccess?.(result.credits)
          setTimeout(() => router.push('/dashboard'), 1500)
        } else {
          setMessage('⚠️ Payment verification failed. Please contact support.')
        }
      },

      onError: (err: any) => {
        console.error('PayPal Error:', err)
        setMessage('❌ Payment failed. Please try again.')
      },

      onCancel: () => setMessage('Payment cancelled.'),
    }).render(containerRef.current)
  }, [loaded, planKey])

  return (
    <div>
      <div ref={containerRef} />
      {message && (
        <p className="text-center text-sm mt-2 text-slate-600">{message}</p>
      )}
      {!loaded && (
        <p className="text-center text-sm text-slate-400 mt-2">Loading PayPal...</p>
      )}
    </div>
  )
}
