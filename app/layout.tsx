import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Passport Photo Background Remover - Free, Instant & ICAO Compliant',
  description:
    'Remove background from passport photos instantly. Free online tool — supports white, red, blue backgrounds. No registration required. Photos deleted immediately.',
  keywords:
    'passport photo background remover, id photo background changer, remove background from passport photo, visa photo background remover',
  openGraph: {
    title: 'Passport Photo Background Remover',
    description: 'Free online passport photo background remover. Instant, ICAO compliant, no sign-up needed.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
