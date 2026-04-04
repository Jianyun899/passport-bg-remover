'use client'

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  planKey: string
  price: number
  onSuccess?: (credits: number) => void
}

const PAYPAL_CLIENT_ID = 'Ad-hVdtq_IVAiYVJUkQJdYEcHqgZWl-CoWlFerbRYRScKhbeqWvu-HlXqoOnIgvJLL0QNVj7jGHs-cff'

export default function PayPalButton({ planKey, price, onSuccess }: Props) {
  const router = useRouter()
  const [message, setMessage] = useState('')

  return (
    <PayPalScriptProvider
      options={{
        clientId: PAYPAL_CLIENT_ID,
        currency: 'USD',
        intent: 'capture',
        components: 'buttons',
      }}
    >
      <PayPalButtons
        style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' }}
        createOrder={async () => {
          setMessage('')
          const res = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'create', planKey }),
          })
          const data = await res.json()
          if (!data.id) {
            setMessage('❌ Failed to create order. Please try again.')
            throw new Error('Failed to create order')
          }
          return data.id
        }}
        onApprove={async (data) => {
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
        }}
        onError={(err) => {
          console.error('PayPal Error:', err)
          setMessage('❌ Payment failed. Please try again.')
        }}
        onCancel={() => setMessage('Payment cancelled.')}
      />
      {message && (
        <p className="text-center text-sm mt-2 text-slate-600">{message}</p>
      )}
    </PayPalScriptProvider>
  )
}
