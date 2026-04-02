'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import UploadZone from '@/components/UploadZone'
import BeforeAfterSlider from '@/components/BeforeAfterSlider'
import BgColorPicker from '@/components/BgColorPicker'
import SizePresetSelector, { SIZE_PRESETS, type SizePreset } from '@/components/SizePresetSelector'
import DownloadButton from '@/components/DownloadButton'
import TrustBadges from '@/components/TrustBadges'
import HowItWorks from '@/components/HowItWorks'

export default function Home() {
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [originalUrl, setOriginalUrl] = useState<string>('')
  const [processedUrl, setProcessedUrl] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [sizePreset, setSizePreset] = useState<SizePreset>(SIZE_PRESETS[0])

  const handleImageSelected = async (file: File, previewUrl: string) => {
    setOriginalFile(file)
    setOriginalUrl(previewUrl)
    setProcessedUrl('')
    setError('')
    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/remove-bg', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to process image')
      }

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
          <a
            href="https://github.com/Jianyun899/passport-bg-remover"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
          >
            GitHub
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
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
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-20 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-slate-500">
          <p>© 2026 Passport Photo BG Remover · Free online tool · No registration required</p>
        </div>
      </footer>
    </div>
  )
}
