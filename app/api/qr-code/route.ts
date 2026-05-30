import { NextResponse } from 'next/server'
import QRCode from 'qrcode'

// 7种模板配色
const templates = {
  'classic-blue': { dark: '#0A2463', light: '#FFFFFF', accent: '#FDC500' },
  'mint-green': { dark: '#2E7D32', light: '#FFFFFF', accent: '#81C784' },
  'elegant-violet': { dark: '#4A148C', light: '#FFFFFF', accent: '#D4AF37' },
  'coral-orange': { dark: '#E64A19', light: '#FFFFFF', accent: '#FF8A65' },
  'professional-gray': { dark: '#37474F', light: '#FFFFFF', accent: '#90A4AE' },
  'forest-green': { dark: '#33691E', light: '#FAF5EF', accent: '#8D6E63' },
  'luxury-blue-gold': { dark: '#051C3A', light: '#FFFFFF', accent: '#D4AF37' },
}

export async function POST(req: Request) {
  try {
    const { url, template = 'classic-blue', size = 400 } = await req.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const colors = templates[template as keyof typeof templates] || templates['classic-blue']

    // 生成 QR Code
    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      width: size,
      margin: 2,
      color: {
        dark: colors.dark,
        light: colors.light,
      },
      errorCorrectionLevel: 'H', // 高纠错级别，支持logo覆盖
    })

    return NextResponse.json({
      qrCodeUrl: qrCodeDataUrl,
      template,
      colors,
    })
  } catch (err: any) {
    console.error('QR code generation error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
