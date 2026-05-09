import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Project Partner — Your AI Project Supervisor',
  description: 'From topic discovery to defense prep. Your AI-powered final year project guide.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    title: 'Project Partner',
    description: 'AI-powered final year project guide',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full font-sans antialiased" style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
