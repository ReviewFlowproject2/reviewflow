# ReviewFlow MVP — 落地安装指南

## 一、前置准备（今晚2小时）

### 1. 注册账号

| 服务 | 用途 | 链接 |
|------|------|------|
| Namecheap | 买域名（如 `reviewflow.co`） | https://namecheap.com |
| Vercel | 部署+Cron | https://vercel.com |
| Supabase | 数据库+Auth | https://supabase.com |
| Twilio | 发短信 | https://twilio.com/try-twilio |
| Resend | 发邮件 | https://resend.com |
| Paddle | 收款 | https://paddle.com |

### 2. 买域名
- 在Namecheap买 `.com` 或 `.co` 域名（约$10/年）
- 后续在Vercel绑定域名

---

## 二、本地初始化（命令行执行）

```bash
# 1. 创建Next.js项目（选Tailwind + App Router + src dir = No）
npx create-next-app@latest reviewflow
# 选项：TypeScript Yes, ESLint Yes, Tailwind Yes, src dir No, App Router Yes

cd reviewflow

# 2. 安装依赖
npm install @supabase/supabase-js @supabase/ssr twilio resend
npm install -D @types/node

# 3. 创建目录结构
mkdir -p app/api/auth/register
mkdir -p app/api/send-sms
mkdir -p app/api/cron/daily-sms
mkdir -p app/api/cron/check-reviews
mkdir -p app/api/webhooks/twilio
mkdir -p app/api/patients/import
mkdir -p app/dashboard
mkdir -p app/patients/import
mkdir -p app/login
mkdir -p app/register
mkdir -p lib
```

---

## 三、配置文件

### 1. `.env.local`（项目根目录）

从 `env.local.example` 复制，填入你的真实密钥：

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1713XXXXXXX

RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com

PADDLE_API_KEY=...
PADDLE_WEBHOOK_SECRET=...

APP_URL=http://localhost:3000
CRON_SECRET=your-random-secret-string-here
```

> **CRON_SECRET**: 随便生成一个长字符串，用于保护Cron接口不被外部调用。

---

## 四、Supabase 配置

### 1. 创建项目
- 登录Supabase → New Project → 选US East (N. Virginia) 或 US West (Oregon)
- 等1-2分钟数据库初始化完成

### 2. 执行SQL
- 进入项目 → SQL Editor → New query
- 把 `schema.sql` 的内容全部粘贴进去 → Run
- 确认5张表已创建：businesses, patients, reviews, competitors, sms_logs

### 3. 获取密钥
- Project Settings → API → 复制 `URL` 和 `anon/public` key 到 `.env.local`
- Project Settings → API → 复制 `service_role` key（⚠️ 保密！）到 `.env.local`

---

## 五、Twilio 配置

### 1. 注册并获取试用金
- 注册Twilio（需手机号验证）
- 免费试用送 $15.5 额度，够发约3000条短信

### 2. 买美国号码
- Console → Phone Numbers → Buy a number
- 选 **Local** 号码，区号选 **713**（Houston）
- 费用：$1.15/月
- 把号码填入 `.env.local` 的 `TWILIO_PHONE_NUMBER`

### 3. A2P 10DLC 注册（必须！否则短信进不了美国）
- Twilio Console → Regulatory Compliance → A2P Brand Registration
- 选 **Starter Brand**（免费，适合低量测试）
- 填写：姓名、邮箱、地址（用真实信息）
- 提交后等审核（通常即时通过，最长24小时）

### 4. 获取API密钥
- Console首页复制 `ACCOUNT SID` 和 `AUTH TOKEN` 到 `.env.local`

---

## 六、Resend 配置

### 1. 注册
- https://resend.com → Sign up
- 免费额度：100封/天

### 2. 获取API Key
- API Keys → Create API Key → 复制到 `.env.local`

### 3. 验证发件域名（部署后做）
- Domains → Add domain → 输入你的域名
- 按提示在Namecheap添加DNS记录（DKIM等）
- 等几分钟验证通过

---

## 七、文件放置地图

把下载的代码文件放到对应位置：

```
reviewflow/
├── .env.local                          ← 手动创建
├── next.config.js                      ← next.config.js
├── tsconfig.json                       ← tsconfig.json
├── tailwind.config.ts                  ← tailwind.config.ts
├── vercel.json                         ← vercel.json
├── middleware.ts                       ← middleware.ts
├── lib/
│   └── supabase.ts                     ← lib_supabase.ts
├── app/
│   ├── globals.css                     ← globals.css
│   ├── layout.tsx                      ← layout.tsx
│   ├── page.tsx                        ← page.tsx (Landing)
│   ├── login/
│   │   └── page.tsx                    ← login_page.tsx
│   ├── register/
│   │   └── page.tsx                    ← register_page.tsx
│   ├── dashboard/
│   │   └── page.tsx                    ← dashboard_page.tsx
│   ├── patients/
│   │   └── import/
│   │       └── page.tsx                ← patients_import_page.tsx
│   └── api/
│       ├── auth/
│       │   └── register/
│       │       └── route.ts            ← api_auth_register_route.ts
│       ├── send-sms/
│       │   └── route.ts                ← api_send-sms_route.ts
│       ├── cron/
│       │   ├── daily-sms/
│       │   │   └── route.ts            ← api_cron_daily-sms_route.ts
│       │   └── check-reviews/
│       │       └── route.ts            ← api_cron_check-reviews_route.ts
│       ├── webhooks/
│       │   └── twilio/
│       │       └── route.ts            ← api_webhooks_twilio_route.ts
│       └── patients/
│           └── import/
│               └── route.ts            ← api_patients_import_route.ts
```

> 注意：下载的文件名带下划线，放到项目里时要改成正确的路径和文件名。

---

## 八、本地运行测试

```bash
npm run dev
```

打开 http://localhost:3000

### 测试流程：
1. 注册账号 → 填诊所信息
2. 登录 → 进入Dashboard
3. Import Patients → 粘贴CSV测试数据：
   ```
   name,phone,visit_date
   Test Patient,+86138xxxx,2026-05-18
   ```
4. 调用API手动发短信（测试Twilio）：
   ```bash
   curl -X POST http://localhost:3000/api/send-sms \
     -H "Content-Type: application/json" \
     -d '{"patientId":"YOUR_PATIENT_UUID","businessId":"YOUR_BUSINESS_UUID"}'
   ```

---

## 九、部署到Vercel

```bash
# 1. 推送到GitHub（先创建仓库）
git init
git add .
git commit -m "mvp init"
git remote add origin https://github.com/YOURNAME/reviewflow.git
git push -u origin main

# 2. Vercel导入项目
# 登录 vercel.com → Add New Project → 选GitHub仓库
# 环境变量：把 .env.local 的内容全部填到Vercel Environment Variables
# 部署！
```

### Cron配置
- Vercel项目 → Settings → Cron Jobs
- 或者 `vercel.json` 已包含配置，自动识别

---

## 十、今晚Checklist

- [ ] Namecheap买域名
- [ ] 注册Vercel、Supabase、Twilio、Resend
- [ ] 本地 `npx create-next-app` 初始化项目
- [ ] 安装依赖 `npm install ...`
- [ ] Supabase执行schema.sql
- [ ] Twilio买713区号号码 + A2P注册
- [ ] 所有代码文件放到正确位置
- [ ] `.env.local` 填好所有密钥
- [ ] `npm run dev` 跑起来
- [ ] 注册一个测试账号，看Dashboard
- [ ] 导入一个测试患者，手动触发SMS
- [ ] 收到短信 = 成功！

---

## 十一、常见问题

**Q: Twilio试用金用完怎么办？**
A: 充值$20（约¥144），够发4000条。或者换Toll-Free号码（审核更松）。

**Q: 短信发到中国手机号？**
A: Twilio可以发国际短信，但中国手机号可能被拦截。MVP阶段用美国号测试。

**Q: Paddle怎么接？**
A: Week 2再搞。MVP阶段先跑通试用流程，收费手动开。

**Q: Google Reviews怎么自动抓？**
A: MVP阶段先手动录入差评（模拟）。Week 3接Google Places API自动抓。

**Q: 需要服务器吗？**
A: 不需要。Vercel Serverless + Supabase 全托管，零服务器运维。
