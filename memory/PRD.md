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

### 2025-12
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

## بيانات الاختبار
- Super Admin: `admin@schoolsms.ly` / `Admin@123`
- School Admin: `school_admin@test.ly` / `Admin@123`

## API رئيسية
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/health`
- `GET/POST /api/academic/subjects`
- `GET/POST /api/sections/`
- `GET/POST /api/rooms/`
- `GET /api/schedule/section/{section_id}`
- `POST /api/schedule/periods`
- `PUT /api/schedule/periods/{period_id}`
- `DELETE /api/schedule/periods/{period_id}`
- `GET/PUT /api/schedule/period-times`

## Prioritized Backlog

### P0
- لا توجد عناصر P0 مفتوحة بعد إصلاح إضافة المواد والحصص وأوقات الحصص.

### P1
- مراجعة نهائية للأذونات على بعض endpoints التي تسمح بتمرير `school_id` من الطلب.
- إضافة اختبارات regression ثابتة لـ Subjects وSchedule Periods وPeriod Times.

### P2
- تطبيقات موبايل Android/iOS.
- لوحات تحكم قابلة للتخصيص بالسحب والإفلات.
- فصل `routes_extended.py` إلى ملفات routes أصغر عند توفر رصيد كافٍ.

## ملاحظات تشغيل
- استخدم زر **Save to Github** في Emergent للمزامنة مع GitHub.
- لا تغيّر المنافذ أو أسماء متغيرات البيئة المحمية.
- يجب استبعاد `_id` من أي response قادم من MongoDB.
