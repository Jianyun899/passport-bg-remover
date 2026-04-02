'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface DownloadButtonProps {
  processedImageUrl: string
  bgColor: string
  sizeWidth: number
  sizeHeight: number
}

export default function DownloadButton({
  processedImageUrl,
  bgColor,
  sizeWidth,
  sizeHeight,
}: DownloadButtonProps) {
  const [downloaded, setDownloaded] = useState(false)

  const handleDownload = async () => {
    // Use canvas to composite: background color + processed image
    const canvas = document.createElement('canvas')
    const img = new Image()
    img.crossOrigin = 'anonymous'

    await new Promise<void>((resolve) => {
      img.onload = () => resolve()
      img.src = processedImageUrl
    })

    const w = sizeWidth || img.naturalWidth
    const h = sizeHeight || img.naturalHeight
    canvas.width = w
    canvas.height = h

    const ctx = canvas.getContext('2d')!

    if (bgColor !== 'transparent') {
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, w, h)
    }

    // Draw image centered
    const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight)
    const dx = (w - img.naturalWidth * scale) / 2
    const dy = (h - img.naturalHeight * scale) / 2
    ctx.drawImage(img, dx, dy, img.naturalWidth * scale, img.naturalHeight * scale)

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'passport-photo.png'
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')

    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 2500)
  }

  return (
    <motion.button
      onClick={handleDownload}
      className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-300
        ${downloaded
          ? 'bg-green-500 text-white'
          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300'
        }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
    >
      {downloaded ? (
        <>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Downloaded!
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PNG
        </>
      )}
    </motion.button>
  )
}
