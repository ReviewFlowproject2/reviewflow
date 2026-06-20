-- ============================================================
-- ReviewFlow MVP - Supabase Schema
-- 垂直：Dental Offices | 城市：Houston
-- 执行：在Supabase SQL Editor中按顺序执行
-- ============================================================

-- 1. businesses: 诊所主表
CREATE TABLE IF NOT EXISTS businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Houston',
  state TEXT NOT NULL DEFAULT 'TX',
  google_place_id TEXT,
  google_review_url TEXT,
  owner_email TEXT NOT NULL UNIQUE,
  owner_phone TEXT,
  owner_name TEXT,
  paddle_customer_id TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'trial', -- trial / active / cancelled
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '15 days'),
  current_rating NUMERIC(2,1),
  review_count INTEGER DEFAULT 0,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. patients: 患者名单（CSV导入）
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL, -- E.164格式: +1713XXXXXXX
  visit_date DATE NOT NULL,
  sms_sent BOOLEAN DEFAULT FALSE,
  sms_sent_at TIMESTAMPTZ,
  sms_delivered BOOLEAN DEFAULT FALSE,
  review_clicked BOOLEAN DEFAULT FALSE,
  review_clicked_at TIMESTAMPTZ,
  review_left BOOLEAN DEFAULT FALSE,
  review_left_at TIMESTAMPTZ,
  UNIQUE(business_id, phone)
);

-- 3. reviews: 抓取的Google Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  review_date DATE,
  is_negative BOOLEAN GENERATED ALWAYS AS (rating <= 3) STORED,
  alerted BOOLEAN DEFAULT FALSE,
  alerted_at TIMESTAMPTZ,
  google_review_id TEXT UNIQUE,
  source TEXT DEFAULT 'google' -- 预留：未来支持Yelp
);

-- 4. competitors: 竞争对手监控
CREATE TABLE IF NOT EXISTS competitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  google_place_id TEXT,
  current_rating NUMERIC(2,1),
  review_count INTEGER DEFAULT 0,
  distance_miles NUMERIC(3,1),
  last_checked_at TIMESTAMPTZ
);

-- 5. sms_logs: 短信发送日志（审计+排重）
CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  twilio_sid TEXT,
  status TEXT, -- queued / sent / delivered / failed
  error_message TEXT,
  body TEXT
);

-- ============================================================
-- RLS (Row Level Security) - 必须开启
-- ============================================================
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;

-- Policy: 用户只能看到自己的business
CREATE POLICY "own_business" ON businesses
  FOR ALL USING (auth.uid() = user_id);

-- Policy: 用户只能看到自己business下的patients
CREATE POLICY "own_patients" ON patients
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- Policy: 用户只能看到自己business下的reviews
CREATE POLICY "own_reviews" ON reviews
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- Policy: 用户只能看到自己business下的competitors
CREATE POLICY "own_competitors" ON competitors
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- Policy: 用户只能看到自己business下的sms_logs
CREATE POLICY "own_sms_logs" ON sms_logs
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- ============================================================
-- 索引（加速查询）
-- ============================================================
CREATE INDEX idx_patients_business ON patients(business_id);
CREATE INDEX idx_patients_sms_sent ON patients(sms_sent) WHERE sms_sent = FALSE;
CREATE INDEX idx_reviews_business_alerted ON reviews(business_id, alerted) WHERE alerted = FALSE;
CREATE INDEX idx_reviews_negative ON reviews(business_id, is_negative) WHERE is_negative = TRUE;

-- ============================================================
-- 触发器：自动更新 updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 6. audit_leads: Free Audit 落地页线索
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  clinic_name TEXT NOT NULL,
  google_place_id TEXT,
  email TEXT NOT NULL,
  name TEXT,
  report_sent BOOLEAN DEFAULT FALSE,
  report_sent_at TIMESTAMPTZ,
  source TEXT DEFAULT 'free-audit'
);

CREATE INDEX idx_audit_leads_email ON audit_leads(email);
CREATE INDEX idx_audit_leads_created ON audit_leads(created_at DESC);
