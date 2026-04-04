'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface UserData {
  id: string
  name: string
  email: string
  image: string
  plan: string
  credits: number
  createdAt: string
  records: Array<{
    id: string
    bgColor: string
    sizePreset: string
    createdAt: string
  }>
}

const PLAN_LABELS: Record<string, string> = {
  FREE: 'Free',
  PACK_S: 'Starter Pack',
  PACK_M: 'Value Pack',
  SUB_BASIC: 'Basic Monthly',
  SUB_PRO: 'Pro Monthly',
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/user')
        .then(r => r.json())
        .then(data => {
          setUserData(data)
          setLoading(false)
        })
    }
  }, [status])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!userData) return null

  const creditsPercent = Math.min((userData.credits / 3) * 100, 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-slate-800">📸 Passport Photo BG Remover</Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-sm text-slate-500 hover:text-red-500 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        {/* User Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-5">
          {userData.image && (
            <img src={userData.image} alt={userData.name} className="w-16 h-16 rounded-full border-2 border-slate-200" />
          )}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-800">{userData.name}</h2>
            <p className="text-slate-500 text-sm">{userData.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
              {PLAN_LABELS[userData.plan] || userData.plan}
            </span>
          </div>
          <Link
            href="/pricing"
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Upgrade ✨
          </Link>
        </div>

        {/* Credits */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800">Credits Remaining</h3>
            <span className="text-2xl font-bold text-blue-600">{userData.credits}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div
              className="bg-blue-500 h-2.5 rounded-full transition-all"
              style={{ width: `${creditsPercent}%` }}
            />
          </div>
          <p className="text-slate-400 text-sm mt-2">
            {userData.credits === 0
              ? '⚠️ No credits left — '
              : `${userData.credits} credit${userData.credits !== 1 ? 's' : ''} remaining — `}
            <Link href="/pricing" className="text-blue-500 hover:underline">
              Get more credits
            </Link>
          </p>
        </div>

        {/* History */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Processing History</h3>
          {userData.records.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p className="text-4xl mb-2">📷</p>
              <p>No photos processed yet.</p>
              <Link href="/" className="text-blue-500 hover:underline text-sm mt-1 inline-block">
                Start removing backgrounds →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {userData.records.map(record => (
                <div
                  key={record.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  {/* Background color swatch */}
                  <div
                    className="w-10 h-10 rounded-lg border border-slate-200 flex-shrink-0"
                    style={{ backgroundColor: record.bgColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700">{record.sizePreset}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(record.createdAt).toLocaleString()} · BG: {record.bgColor}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
