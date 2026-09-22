# تقرير التحليل الشامل والاستقصاء المعماري لمشروع (نظام إشارات الفوركس والتداول الآلي - Masruq Enterprise)

تم فحص وقراءة جميع ملفات المشروع وهيكليته البرمجية بدقة بالغة. إليك الملخص المعماري والتقني المتكامل:

---

## 1. حزمة التقنيات المستخدمة (Tech Stack)

### **الواجهة الأمامية (Frontend):**
- **React 19** (`react@^19.0.1`, `react-dom@^19.0.1`): أحدث إصدار مع React Hooks.
- **TypeScript 5.8** (`typescript@~5.8.2`): دعم الأنواع الصارمة في كامل المشروع.
- **Tailwind CSS v4** (`tailwindcss@^4.1.14` و `@tailwindcss/vite@^4.1.14`): أحدث محرك للتصميم السريع مع دعم `@import "tailwindcss"`.
- **Lucide React** (`lucide-react@^0.546.0`): حزمة الأيقونات الرئيسية لكافة شاشات المستخدم ولوحة التحكم.
- **Motion (Framer Motion)** (`motion@^12.23.24`): المؤثرات الحركية والانتقالات.
- **Recharts** (`recharts@^3.10.1`): المخططات البيانية التفاعلية للتحليلات ومنحنى الرصيد (Equity Curve) ومعدلات الفوز.
- **Vite 6** (`vite@^6.2.3`): محرك البناء والتطوير السريع، مع إعداد **Multi-Page App (MPA)** لنقطتي دخول منفصلتين (`index.html` و `admin.html`).

### **الخلفية ومحرك المعالجة (Backend & Engine):**
- **Node.js & Express 4** (`express@^4.21.2`): خادم الويب وواجهة الـ API Gateway.
- **TSX** (`tsx@^4.21.0`): تشغيل ملفات TypeScript مباشرة في بيئة التطوير والاختبارات (`server.ts`, `tests/run.ts`).
- **Esbuild** (`esbuild@^0.25.0`): تجميع وتوليد كود الخادم الموحد `dist/server.cjs` في بيئة الإنتاج.
- **Google GenAI SDK** (`@google/genai@^2.4.0`): للتكامل مع نماذج الذكاء الاصطناعي (Gemini).
- **Web Audio API**: لتشغيل نغمات تنبيهات الصفقات اللحظية (الصفقات الجديدة، ضرب الأهداف TP1/2/3، ووقف الخسارة SL).
- **Server-Sent Events (SSE)**: للبث المباشر للأخبار العاجلة (`/api/breaking-news/stream`).

### **إدارة العمليات والإنتاج (DevOps & Infrastructure):**
- **PM2 Ecosystem** (`ecosystem.config.js`): إدارة 3 خدمات منفصلة في بيئة الإنتاج (Cluster API Gateway, Trading Engine 24/7, BullMQ Notification Worker).
- **Docker Compose** (`docker-compose.yml`): يشمل 3 خدمات (`app-frontend`, `redis:7-alpine`, `nginx:alpine` مع شهادات SSL LetsEncrypt).
- **Nginx Reverse Proxy**: توجيه النطاقات الفرعية المنفصلة (`app.domain.com`, `admin.domain.com`, `api.domain.com`, `engine.domain.com`, `notifications.domain.com`).

---

## 2. المعمارية الحالية للنظام (System Architecture)

يعتمد النظام معمارية **Decoupled Multi-Domain Architecture** فائقة العزل والأمان:

```
                                    DNS / Internet
                                          │
        ┌─────────────────────────────────┴─────────────────────────────────┐
        │                                                                   │
        ▼                                                                   ▼
 rec.masruq.com (أو App)                                           admin.masruq.com (أو Admin)
 [تطبيق المستخدم React SPA]                                       [بوابة الإدارة والأمان Admin Portal]
        │                                                                   │
        └─────────────────────────────────┬─────────────────────────────────┘
                                          │
                                          ▼
                                   api.masruq.com
                          [Express Central API Gateway]
                         (Port: 3000 | Auth | RBAC | SSE)
                                          │
        ┌─────────────────────────────────┼─────────────────────────────────┐
        │                                 │                                 │
        ▼                                 ▼                                 ▼
 engine.masruq.com                Firestore / Data Storage         notifications.masruq.com
(Autonomous Engine 24/7)       (JSON Data / Encrypted Backups)    (BullMQ Redis Worker Service)
[TwelveData / MT5 / Binance]
```

### **1. التوجيه الذكي في `server.ts`:**
- يتحقق الخادم عبر `isAdminRequest()` مما إذا كان الطلب واردًا من النطاق الفرعي `admin.*` أو المسار `/admin*`.
- في بيئة التطوير (Dev)، يقوم الخادم بتحويل وتقديم `admin.html` (المتصل بـ `src/admin-main.tsx` و `AdminApp.tsx`) أو `index.html` (المتصل بـ `src/main.tsx` و `UserApp.tsx`).
- في بيئة الإنتاج (Production)، يتم تقديم الملفات المحزومة الثابتة من مجلد `dist/`.

---

## 3. الميزات المطبقة بالفعل في الكود (Implemented Features)

### **أ. واجهة المستخدم العامة (`src/UserApp.tsx` & Components):**
1. **عرض البطاقات الإعلانية الملونة للإشارات (`SignalBannerCard.tsx`)**:
   - تصميم بصري متطابق مع بطاقات توصيات الفوركس الاحترافية (تدرج أخضر لشراء BUY وتدرج أحمر لبيع SELL).
   - عرض أسعار الدخول (Entry)، الأهداف (TP1, TP2, TP3)، ووقف الخسارة (Stop Loss)، ونسبة المخاطرة، وحالة الصفقة وشارات النجاح.
   - دعم وضعين للعرض: **Banner Mode** (بطاقات تفصيلية) و **Modern Mode** (بطاقات مدمجة).
2. **شريط الفلاتر والبحث الحي (`FilterBar.tsx` & `Navbar.tsx`)**:
   - تصفية فورية حسب نوع الإشارة (BUY/SELL)، زوج العملات، الحالة (نشطة، محققة، ملغاة، مؤرشفة)، الاتجاه (صاعد/هابط/جانبي)، والبحث النصي.
   - تبويبات التنقل: الإشارات النشطة، الأرشيف، الإحصائيات المتقدمة، والمفضلة.
3. **تنبيهات الأسعار اللحظية (`PriceAlertModal.tsx`)**:
   - إنشاء وإدارة تنبيهات وصول الأسعار (Above / Below) مع محاكاة إطلاق التنبيه الصوتي.
4. **شريط الأخبار العاجلة التفاعلي (`BreakingNewsBannerCard.tsx`)**:
   - استقبال الأخبار العاجلة فوراً عبر تقنية SSE مع تخصيص الألوان، الأولوية (🔴 عاجل / 🟠 مهم / 🔵 عادي)، زر التثبيت، والتشغيل الصوتي للتنبيه.
5. **لوحة الإحصائيات الشاملة للمستخدم (`AnalyticsView.tsx`)**:
   - حساب إجمالي النقاط المحققة (Total Pips)، نسبة النجاح الإجمالية (Win Rate %)، وتوزيع الصفقات حسب الأزواج والاستراتيجيات عبر Recharts.
6. **سجل التحديثات الحية ومشاركة الإشارات (`ShareModal.tsx`, `QuickUpdateModal.tsx`)**:
   - مشاركة البطاقة كصورة أو نص منسق على تليجرام/واتساب، وتتبع أحداث لقطات الشاشة (Screenshots).

### **ب. لوحة التحكم الإدارية الاحترافية (`src/AdminApp.tsx` & `src/components/admin/`):**
تتضمن **28 مكوناً إدارياً متكاملاً**:
1. **بوابة الأمان والمصادقة (`AdminAuthGate.tsx`, `AdminLoginModal.tsx`)**:
   - التحقق الثنائي (2FA TOTP عبر Google Authenticator)، جلسات HttpOnly آمنة، وسجل محاولات الدخول (Audit Log).
2. **مدير الاستراتيجيات المتقدم (`AdminStrategiesManager.tsx`)**:
   - دعم وتفعيل/تعطيل استراتيجيات متعددة (Camarilla Pivot ATR, RSI+MACD Breakout, EMA 20/50 Cross, ICT Smart Money, SMC, Fibonacci Retracement).
   - تعديل المعاملات الرياضية والفنية لكل استراتيجية وتطبيقها فورياً على المحرك.
3. **محرر أكواد Pine Script V5 التفاعلي (`AdminPineScriptCodeEditor.tsx`)**:
   - محرر أكواد لتحرير وتعديل قواعد المستويات ومطابقة إشارات TradingView Webhook، مع نظام إدارة الإصدارات (Version Control & Rollback).
   - قواطع الدائرة التلقائية (Circuit Breaker) لإيقاف الاستراتيجية آلياً عند هبوط نسبة الفوز أو تتالي الخسائر.
4. **التوصيات الذكية الآلية (`AdminAutoRecommendations.tsx`)**:
   - فحص مستويات Camarilla و ATR واقتراح إشارات ذكية جاهزة للبث بنقرة واحدة.
5. **مركز الأخبار العاجلة الإداري (`AdminBreakingNews.tsx`)**:
   - إنشاء، جدولة، أرشفة، وتعديل الأخبار العاجلة مع استهداف فئات المستخدمين (All, Free, Silver, Gold, VIP) وربطها بالخلفية عبر SSE.
6. **البنية التحتية والمراقبة الحية (`AdminEnterpriseInfrastructure.tsx`, `AdminLiveMonitoring.tsx`, `AdminHealthDashboard.tsx`)**:
   - مراقبة استهلاك الذاكرة والمعالج، اتصال Redis، عمق طابور BullMQ، مقاييس Prometheus، ومحاكاة اختبارات الضغط (Load Testing).
7. **إدارة المستخدمين والأجهزة وسجل العمليات (`AdminUserManagement.tsx`, `UserDetailModal.tsx`, `AdminAuditLogs.tsx`, `AdminScreenshotAnalytics.tsx`)**:
   - حظر/إلغاء حظر المستخدمين، ترقية باقات الاشتراك (VIP)، إنهاء الجلسات عن بُعد، وتتبع لقطات الشاشة لحماية المحتوى الحصري.
8. **محرك التداول الافتراضي والاختبار التاريخي (`PaperTradingEngine.ts`, `BacktestEngine.ts`)**:
   - تتبع تحركات التكات الحية، إغلاق الصفقات تلقائياً عند TP1/2/3، وتحريك وقف الخسارة إلى نقطة الدخول (Breakeven Trailing SL).
   - محاكاة الصفقات التاريخية لحساب Win Rate, Profit Factor, Max Drawdown.

---

## 4. الخدمات وواجهات البرمجة المستخدمة (APIs & Services)

1. **Market Data Feed Providers:**
   - **TwelveData API**: مزود أسعار الفوركس والأسهم والسلع عبر REST / WebSocket.
   - **MetaTrader 5 Bridge (MT5)**: جسر ربط مع حسابات الوساطة لتنفيذ واستقبال بيانات التكات.
   - **Binance Futures API / WebSocket**: لأسعار وبيانات العملات الرقمية (Crypto).
   - **TradingView Webhooks Gateway (`/api/webhook/tradingview`)**: استقبال إشارات تنبيهات مؤشرات واستراتيجيات TradingView ومعالجتها تلقائياً.
2. **Prometheus Metrics API (`/api/metrics`)**: تصدير مقاييس الأداء القياسية للربط مع Grafana.
3. **Breaking News Real-time SSE (`/api/breaking-news/stream`)**: تغذية حية لعملاء الويب وتطبيقات الجوال.
4. **Admin Security & Health APIs (`/api/health`, `/api/admin/login`, `/api/admin/verify-2fa`, `/api/admin/audit-logs`)**.

---

## 5. حالة الملفات والبيانات والاختبارات

- **`data/`**: يحتوي على `breaking_news.json` و `breaking_news_audit.json` لتخزين الأخبار وسجلات تدقيقها.
- **`tests/run.ts`**: يحتوي على طقم اختبارات لوغاريتمات الاستراتيجيات، محرك فلتر الجودة (Quality Filter Score)، ومنع تكرار الإشارات (Idempotency Key Deduplication) بنجاح 6/6 (100%).
- **`dist/`**: يحتوي على البناء الكامل للتطبيقين (`index.html`, `admin.html`, وملفات JS/CSS).

---

## 6. ما الذي يحتاج إلى إضافة أو تعديل بناءً على المتطلبات القادمة

1. **الربط مع قواعد بيانات سحابية حية (مثل Cloud Firestore أو PostgreSQL)** لاستبدال التخزين المحلي المؤقت (Local Storage / Mock In-Memory Stores) بحيث تتزامن الإشارات والمستخدمين لحظياً بين السيرفر وجميع الأجهزة المتصلة.
2. **تفعيل مفاتيح API الحقيقية** لمزودي البيانات (TwelveData / Binance / MT5 Bridge) عبر متغيرات البيئة `.env`.
3. **تفعيل بروتوكول Push Notifications الحقيقي (مثل Firebase Cloud Messaging أو Web Push API)** لإرسال إشعارات فورية لهواتف المستخدمين حتى عندما يكون التطبيق مغلقاً.
4. **توسيع أتمتة الـ Webhooks** وتوثيق مفاتيح التشفير لربط منصات خارجية إضافية مباشرة.

جاهز الآن لتنفيذ أي خطوة تطويرية أو تعديل ترغب به!