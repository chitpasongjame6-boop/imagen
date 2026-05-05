import type { Metadata, Viewport } from 'next'
import Providers from '@/components/shared/Providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'SimAgent',
  description: 'Sim and agent management system',
}

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
