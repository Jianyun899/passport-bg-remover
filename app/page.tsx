'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link'
import UploadZone from '@/components/UploadZone'
import BeforeAfterSlider from '@/components/BeforeAfterSlider'
import BgColorPicker from '@/components/BgColorPicker'
import SizePresetSelector, { SIZE_PRESETS, type SizePreset } from '@/components/SizePresetSelector'
import DownloadButton from '@/components/DownloadButton'
import TrustBadges from '@/components/TrustBadges'
import HowItWorks from '@/components/HowItWorks'
import AuthButton from '@/components/AuthButton'

export default function Home() {
  const { data: session, status } = useSession()
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [originalUrl, setOriginalUrl] = useState<string>('')
  const [processedUrl, setProcessedUrl] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [sizePreset, setSizePreset] = useState<SizePreset>(SIZE_PRESETS[0])
  const [credits, setCredits] = useState<number | null>(null)
  const [showNoCredits, setShowNoCredits] = useState(false)

  // 获取用户额度
  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/user')
        .then(r => r.json())
        .then(data => setCredits(data.credits ?? 0))
    }
  }, [session])

  const handleImageSelected = async (file: File, previewUrl: string) => {
    // 未登录拦截
    if (!session) {
      setError('Please sign in to process images.')
      return
    }
    // 额度不足拦截
    if (credits !== null && credits <= 0) {
      setShowNoCredits(true)
      return
    }

    setOriginalFile(file)
    setOriginalUrl(previewUrl)
    setProcessedUrl('')
    setError('')
    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('bgColor', bgColor)
      formData.append('sizePreset', sizePreset.label)

      const response = await fetch('/api/remove-bg', {
        method: 'POST',
        body: formData,
      })

      if (response.status === 401) {
        setError('Please sign in to use this service.')
        return
      }
      if (response.status === 402) {
        setShowNoCredits(true)
        return
      }
      if (!response.ok) throw new Error('Failed to process image')

      // 更新剩余额度
      const remaining = response.headers.get('X-Credits-Remaining')
      if (remaining !== null) setCredits(parseInt(remaining))

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setProcessedUrl(url)
    } catch (err) {
      setError('Failed to remove background. Please try again.')
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl)
    if (processedUrl) URL.revokeObjectURL(processedUrl)
    setOriginalFile(null)
    setOriginalUrl('')
    setProcessedUrl('')
    setError('')
    setBgColor('#FFFFFF')
    setSizePreset(SIZE_PRESETS[0])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">📸 Passport Photo BG Remover</h1>
          <div className="flex items-center gap-4">
            {session && credits !== null && (
              <Link href="/dashboard" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">
                💳 {credits} credit{credits !== 1 ? 's' : ''}
              </Link>
            )}
            <a
              href="https://github.com/Jianyun899/passport-bg-remover"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
            >
              GitHub
            </a>
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* No Credits Modal */}
        <AnimatePresence>
          {showNoCredits && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowNoCredits(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">💳</div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Out of Credits</h3>
                  <p className="text-slate-500">You've used all your credits. Get more to continue removing backgrounds.</p>
                </div>
                <div className="space-y-3">
                  <Link
                    href="/pricing"
                    className="block w-full py-3 bg-blue-600 text-white text-center rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                  >
                    View Pricing Plans →
                  </Link>
                  <button
                    onClick={() => setShowNoCredits(false)}
                    className="block w-full py-3 text-slate-500 text-center hover:text-slate-700 transition-colors"
                  >
                    Maybe later
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Hero Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Passport Photo Background Remover
          </h2>
          <p className="text-lg text-slate-600 mb-2">
            Free · Instant · ICAO Compliant
          </p>
          <p className="text-sm text-slate-500">
            Remove background from passport photos and change to white, red, or blue
          </p>
          {!session && status !== 'loading' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 inline-flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-6 py-3"
            >
              <span className="text-sm text-blue-700">🎁 Sign in with Google and get <strong>3 free credits</strong></span>
              <button
                onClick={() => signIn('google')}
                className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Sign in free
              </button>
            </motion.div>
          )}
          {session && credits !== null && credits <= 1 && credits > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 inline-flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-6 py-3"
            >
              <span className="text-sm text-amber-700">⚠️ Only <strong>{credits} credit</strong> left</span>
              <Link
                href="/pricing"
                className="px-4 py-1.5 bg-amber-500 text-white text-sm rounded-lg font-medium hover:bg-amber-600 transition-colors"
              >
                Get more
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Main Tool */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 mb-12">
          {!processedUrl ? (
            <UploadZone onImageSelected={handleImageSelected} isProcessing={isProcessing} />
          ) : (
            <div className="space-y-6">
              <BeforeAfterSlider
                originalUrl={originalUrl}
                processedUrl={processedUrl}
                bgColor={bgColor}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <BgColorPicker value={bgColor} onChange={setBgColor} />
                <SizePresetSelector value={sizePreset} onChange={setSizePreset} />
              </div>

              <DownloadButton
                processedImageUrl={processedUrl}
                bgColor={bgColor}
                sizeWidth={sizePreset.width}
                sizeHeight={sizePreset.height}
              />

              <button
                onClick={handleReset}
                className="w-full py-3 text-slate-600 hover:text-slate-800 font-medium transition-colors"
              >
                ← Upload Another Photo
              </button>
            </div>
          )}

          {isProcessing && (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-slate-600">Removing background...</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Trust Badges */}
        <TrustBadges />

        {/* How It Works */}
        <HowItWorks />

        {/* Use Cases */}
        <section className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Perfect For</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['🛂 Passport', '✈️ Visa', '🚗 Driver License', '🎓 Student ID'].map((item) => (
              <div key={item} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <p className="text-lg font-medium text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </section>
        {/* Pricing CTA */}
        <section className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-10 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Need more credits?</h2>
          <p className="text-blue-100 mb-6">Start from just $0.99 for 20 credits. No subscription required.</p>
          <Link
            href="/pricing"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
          >
            View Pricing →
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-20 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-slate-500 space-x-4">
          <span>© 2025 Passport Photo BG Remover</span>
          <Link href="/pricing" className="hover:text-blue-500">Pricing</Link>
          <Link href="/dashboard" className="hover:text-blue-500">Dashboard</Link>
        </div>
      </footer>
    </div>
  )
}
