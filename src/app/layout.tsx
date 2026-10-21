import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WESLEY SAMUVEL — Digital Engineering World',
  description:
    'A cinematic 3D portfolio. ECE engineer, full-stack developer and AI/ML enthusiast building intelligent systems where electronics, software and design meet.',
  keywords: ['Wesley Samuvel', 'ECE', 'portfolio', 'IoT', 'embedded systems', 'AI', 'full-stack developer'],
  authors: [{ name: 'Wesley Samuvel' }],
  openGraph: {
    title: "WESLEY SAMUVEL — Enter the Engineering World",
    description: 'Cinematic 3D portfolio — software, AI, electronics, IoT and design in one connected environment.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  )
}
