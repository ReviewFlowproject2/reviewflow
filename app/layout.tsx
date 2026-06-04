import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ReviewFlow — Google Review Automation for Dental Offices',
  description: 'Automate patient review collection with QR codes and email follow-ups. Real-time negative review alerts for dental clinics.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
