'use client'

import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'

interface UploadZoneProps {
  onImageSelected: (file: File, previewUrl: string) => void
  isProcessing: boolean
}

export default function UploadZone({ onImageSelected, isProcessing }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
        alert('Please upload a JPG, PNG or WEBP image.')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be under 10MB.')
        return
      }
      const url = URL.createObjectURL(file)
      onImageSelected(file, url)
    },
    [onImageSelected]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <motion.label
      className={`relative flex flex-col items-center justify-center w-full min-h-[260px] rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300
        ${isDragging ? 'border-blue-400 bg-blue-50 shadow-lg shadow-blue-100' : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50'}
        ${isProcessing ? 'pointer-events-none opacity-60' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <input
        type="file"
        className="sr-only"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        disabled={isProcessing}
      />

      <motion.div
        className="flex flex-col items-center gap-4 p-8 text-center"
        animate={{ scale: isDragging ? 1.05 : 1 }}
      >
        {/* Upload icon */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300
          ${isDragging ? 'bg-blue-100' : 'bg-slate-100'}`}>
          <svg className={`w-8 h-8 transition-colors duration-300 ${isDragging ? 'text-blue-500' : 'text-slate-400'}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>

        <div>
          <p className="text-lg font-semibold text-slate-700">
            {isDragging ? 'Drop your photo here' : 'Upload your photo'}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Drag & drop or <span className="text-blue-600 font-medium">click to browse</span>
          </p>
          <p className="mt-2 text-xs text-slate-400">JPG, PNG, WEBP · Max 10MB</p>
        </div>
      </motion.div>

      {/* Glow border effect when dragging */}
      {isDragging && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-blue-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.label>
  )
}
