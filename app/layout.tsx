import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ReviewFlow — 牙科诊所 Google 评论自动化工具',
  description: '自动收集患者五星好评，实时监控差评预警。专为牙科诊所打造的口碑增长引擎。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Inter:wght@400;500;600;700;800&family=Lato:wght@400;700&family=Montserrat:wght@400;600;700&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
