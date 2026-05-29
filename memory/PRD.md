# نظام إدارة المدارس - PRD

## الهدف الأصلي
بناء نظام إدارة مدارس تجاري للمدارس الخاصة في ليبيا، كتطبيق SaaS متعدد المدارس، يدعم العربية RTL كواجهة أساسية، مع صلاحيات متعددة لإدارة المدرسة والعمليات الأكاديمية والإدارية والمالية.

## المستخدمون الأساسيون
- Super Admin لإدارة المنصة والمدارس والتراخيص.
- School Admin / School Manager لإدارة بيانات المدرسة.
- Teacher لإدارة الحصص والطلاب والواجبات عند التوسع.
- Accountant لإدارة المالية.
- Student / Parent للاطلاع على البيانات عند التوسع.

## المعمارية
- Frontend: React + TailwindCSS + Shadcn UI.
- Backend: FastAPI.
- Database: MongoDB عبر Motor.
- Auth: JWT + RBAC.
- API prefix: جميع المسارات تعمل تحت `/api`.
- Multi-tenant: البيانات مرتبطة بـ `school_id`.

## الميزات المكتملة

### النظام الأساسي
- [x] المصادقة JWT.
- [x] أدوار المستخدمين RBAC.
- [x] دعم العربية RTL والإنجليزية.
- [x] الوضع الفاتح/الداكن.

### الصفحات الرئيسية
- [x] لوحة التحكم.
- [x] الطلاب CRUD + بحث.
- [x] المعلمون CRUD + تعيين المواد والشعب.
- [x] الفصول والمواد: المراحل، الصفوف، الشعب، المواد، القاعات.
- [x] الاختبارات.
- [x] الحضور.
- [x] جدول الحصص: 9 حصص + سحب وإفلات + اختيار القاعة.
- [x] تبويب أوقات الحصص داخل صفحة الجدول.
- [x] المالية.
- [x] الرسائل.
- [x] الإشعارات.
- [x] التقارير + التصدير.
- [x] الإعدادات.
- [x] سجل النشاط.
- [x] معالج الإعداد الأولي.

## آخر تحديثات مكتملة

### 2025-12 - إصلاحات نهائية قبل التسليم
- إصلاح خطأ إضافة المادة عبر إزالة `_id` الناتج من MongoDB قبل الإرجاع في `create_subject`.
- إصلاح خطأ إضافة الحصة في الجدول عبر إزالة `_id` وعدم إرجاع datetime خام.
- دعم `room_id` عند إنشاء حصة وربطه باسم القاعة عند توفره.
- إضافة API لأوقات الحصص:
  - `GET /api/schedule/period-times`
  - `PUT /api/schedule/period-times`
- إضافة تبويب **أوقات الحصص** في صفحة الجدول لتعديل بداية ونهاية الحصص التسع.
- تحديث الجدول ليقرأ أوقات الحصص المحفوظة بدل القيم الثابتة فقط.
- إنشاء README عربي شامل.
- إنشاء دليل استخدام وتطوير في `/app/docs/USAGE_DEV_GUIDE.md`.
- تحديث بيانات الاختبار في `/app/memory/test_credentials.md`.
- تنفيذ Health Check واختبار API نهائي وإثبات ظهور تبويب أوقات الحصص في الواجهة.

### 2025-12 - إصلاحات Code Review منخفضة المخاطر
- إزالة fallback الافتراضي لـ `JWT_SECRET` من backend، وأصبح الإعداد يفشل سريعًا إذا غاب المتغير.
- نقل بيانات اختبار الدخول في `backend/tests/test_school_management.py` إلى environment variables.
- التحقق من تحذيرات `LanguageContext.js`: النتائج false positives لأنها مفاتيح/نصوص ترجمة وليست أسرارًا أو API keys.
- توثيق مخاطر `localStorage` ومسار الهجرة إلى httpOnly cookies في `/app/docs/SECURITY_REVIEW.md` دون إعادة تصميم Auth الآن.
- إصلاح React hook dependency issues منخفضة المخاطر في AuthCallback/Students/Teachers/Schedule/Messages.
- التحقق من مواضع Python `is`: المواضع الحالية كانت مقارنات صحيحة مع `None`، ولا توجد مقارنة literal خاطئة مؤكدة في النطاق المفحوص.
- إزالة import غير مستخدم `status` من FastAPI في `server.py`.

### 2025-12 - تدوير JWT_SECRET قبل الإنتاج
- توليد JWT_SECRET قوي cryptographically secure بطول 86 حرفًا باستخدام `secrets.token_urlsafe(64)`.
- تخزين السر في `/app/backend/.env` فقط ضمن متغير البيئة `JWT_SECRET`.
- التحقق من عدم وجود hardcoded fallback secret في الكود.
- إعادة تشغيل backend بعد التدوير.
- تنفيذ smoke tests بعد التدوير:
  - `/api/health`: 200.
  - Login: ناجح.
  - Token generation: يحتوي `sub`, `role`, `exp`.
  - Protected endpoint `/api/auth/me`: 200.
- Deployment health readiness: لا توجد blockers؛ توجد warnings تحسين DB/CORS مؤجلة.

## بيانات الاختبار
- Super Admin: `admin@schoolsms.ly` / `Admin@123`
- School Admin: `school_admin@test.ly` / `Admin@123`

## نتائج الاختبار الأحدث
- تقرير الاختبار: `/app/test_reports/iteration_4.json`.
- Backend: 21/21 pytest passed.
- Frontend: تسجيل الدخول وصفحات Schedule/Students/Teachers/Messages/Subjects تعمل بدون console errors.
- Health check بعد تدوير JWT_SECRET: 200.
- Production readiness score الحالي: 8.7/10.

## Prioritized Backlog

### P0
- لا توجد عناصر P0 مفتوحة بعد تدوير JWT_SECRET، بشرط حفظ secret production خارج Git عند النشر.

### P1
- الهجرة من تخزين JWT في `localStorage` إلى httpOnly secure cookies بالكامل.
- تضييق CORS production origin بدل wildcard عند تنفيذ هجرة cookies.
- مراجعة أذونات `school_id` على بعض endpoints.
- تحسين projections لبعض dashboard/finance queries كما أشار deployment health check.
- إضافة regression tests ثابتة لـ Subjects وSchedule Periods وPeriod Times.

### P2
- تطبيقات موبايل Android/iOS.
- لوحات تحكم قابلة للتخصيص بالسحب والإفلات.
- فصل `routes_extended.py` إلى ملفات routes أصغر عند توفر رصيد كافٍ.

## ملاحظات تشغيل
- استخدم زر **Save to Github** في Emergent للمزامنة مع GitHub.
- يجب عدم رفع `.env` إلى GitHub.
- لا تغيّر المنافذ أو أسماء متغيرات البيئة المحمية.
- يجب استبعاد `_id` من أي response قادم من MongoDB.
