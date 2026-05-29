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
      <body className="antialiased">{children}</body>
    </html>
  )
}
