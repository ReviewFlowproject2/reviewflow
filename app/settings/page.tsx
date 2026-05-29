'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getBrowserClient } from '@/lib/supabase'
import { Star, ArrowLeft, Loader2, Save, Check } from 'lucide-react'

export default function Settings() {
  const router = useRouter()
  const [business, setBusiness] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    google_review_link: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const supabase = getBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      const { data: biz } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      setBusiness(biz)
      if (biz) {
        setForm({
          name: biz.name || '',
          phone: biz.phone || '',
          google_review_link: biz.google_review_link || '',
        })
      }
      setLoading(false)
    } catch (err) {
      console.error('Settings load error:', err)
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    
    try {
      const supabase = getBrowserClient()
      const { error } = await supabase
        .from('businesses')
        .update({
          name: form.name,
          phone: form.phone,
          google_review_link: form.google_review_link,
          updated_at: new Date().toISOString(),
        })
        .eq('id', business.id)

      if (error) throw error
      
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Save error:', err)
    }
    
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-soft flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-soft">
      {/* Header */}
      <header className="bg-white border-b border-brand-soft sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-brand-muted hover:text-brand-dark transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">返回仪表盘</span>
            </Link>
            
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-white fill-current" />
              </div>
              <span className="font-outfit font-bold text-brand-dark">ReviewFlow</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl p-8 shadow-card">
          <div className="mb-8">
            <h1 className="font-outfit font-bold text-2xl text-brand-dark mb-2">诊所设置</h1>
            <p className="text-brand-muted">管理您的诊所信息和 Google 评论链接</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">诊所名称</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-brand-soft rounded-xl px-4 py-3 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                placeholder="阳光口腔诊所"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">联系电话</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-brand-soft rounded-xl px-4 py-3 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                placeholder="138-0000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">
                Google 评论链接
                <span className="text-brand-muted font-normal ml-2">（患者点击后可直接留评）</span>
              </label>
              <input
                type="url"
                value={form.google_review_link}
                onChange={(e) => setForm({ ...form, google_review_link: e.target.value })}
                className="w-full border border-brand-soft rounded-xl px-4 py-3 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                placeholder="https://g.page/r/..."
              />
              <p className="text-xs text-brand-muted mt-2">
                提示：在 Google 商家资料中找到"获取更多评价"，复制链接
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-brand-blue text-white py-3.5 rounded-xl font-semibold transition-all duration-200 hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    保存中...
                  </>
                ) : saved ? (
                  <>
                    <Check className="w-5 h-5" />
                    已保存
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    保存设置
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Subscription Info */}
        {business && (
          <div className="bg-white rounded-3xl p-8 shadow-card mt-6">
            <h2 className="font-outfit font-semibold text-lg text-brand-dark mb-4">订阅信息</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-brand-muted">当前计划</span>
                <span className="font-medium text-brand-dark">
                  {business.subscription_status === 'trial' ? '免费试用' : '专业版'}
                </span>
              </div>
              {business.subscription_status === 'trial' && business.trial_ends_at && (
                <div className="flex justify-between items-center">
                  <span className="text-brand-muted">试用期至</span>
                  <span className="font-medium text-brand-blue">
                    {new Date(business.trial_ends_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
