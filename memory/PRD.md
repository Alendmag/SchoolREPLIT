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
- [x] الطلاب CRUD + بحث + اختيار الصف والشعبة.
- [x] المعلمون CRUD + تعيين المواد/الصفوف/الشعب من بيانات APIs.
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
- إضافة API لأوقات الحصص: `GET/PUT /api/schedule/period-times`.
- إضافة تبويب **أوقات الحصص** في صفحة الجدول.
- إنشاء README ودليل استخدام وتطوير.

### 2025-12 - إصلاحات Code Review منخفضة المخاطر
- إزالة fallback الافتراضي لـ `JWT_SECRET` من backend.
- نقل بيانات اختبار الدخول في `backend/tests/test_school_management.py` إلى environment variables.
- توثيق false positives في `LanguageContext.js` ومخاطر localStorage في `/app/docs/SECURITY_REVIEW.md`.
- إصلاح React hook dependency issues منخفضة المخاطر.

### 2025-12 - تدوير JWT_SECRET قبل الإنتاج
- توليد JWT_SECRET قوي وتخزينه في `/app/backend/.env` فقط.
- التحقق من عدم وجود hardcoded fallback secret في الكود.
- smoke tests بعد التدوير: health/login/token/auth-me كلها ناجحة.

### 2025-12 - Phase 1 + Phase 2: إصلاح إنشاء الكيانات من UI
- إصلاح سلسلة الإنشاء من الواجهة الفعلية: Level, Grade, Section, Subject, Room, Teacher, Student.
- `GradeBase` أصبح يدعم `level_id` مع `level` افتراضي لتطابق payload الواجهة.
- `GradesPage.js` أصبح يضيف `level` المشتق من المرحلة المختارة ويطبع numeric fields قبل الإرسال.
- `StudentsPage.js` أصبح يحول الحقول الاختيارية الفارغة إلى `null` بدل `""`، ويضيف dropdown للشعبة مرتبطًا بالصف.
- `TeachersPage.js` أصبح يرسل `subject_ids`, `grade_ids`, `section_ids` من checkboxes محملة من APIs.
- `TeacherBase` و`TeacherResponse` و`create_teacher` أصبحت تحفظ وتعيد علاقات المعلم.
- Testing Agent iteration 5 أكد: UI create 7/7 ناجح، backend tests 30/30 ناجحة، ولا توجد console errors.

### 2025-12 - Final focused real UI verification قبل النشر
- تم تنفيذ فحص UI فعلي إضافي ومحدد للـ workflows الأربعة المطلوبة فقط:
  - Create Grade: نجح من UI، ظهر في تبويب الصفوف، وتم حفظ `level_id`.
  - Create Subject: نجح من UI، وظهر في تبويب المواد.
  - Create Teacher: نجح من UI، ظهر في صفحة المعلمين، وظهرت مادة المعلم كـ badge، وتم حفظ `subject_ids`, `grade_ids`, `section_ids`.
  - Create Student: نجح من UI، ظهر في جدول الطلاب، وظهر الصف، وتم حفظ `grade_id`, `section_id`.
- HTTP statuses من الفحص:
  - Login: 200
  - Level prerequisite: 200
  - Grade: 307 ثم 200
  - Section prerequisite: 200
  - Subject: 307 ثم 200
  - Teacher: 200
  - Student: 200
- لا توجد POST failures غير redirect؛ لا توجد 422/500.
- النشر لا يزال متوقفًا حتى موافقة المستخدم الصريحة.

## بيانات الاختبار
- Super Admin: `admin@schoolsms.ly` / `Admin@123`
- School Admin: `school_admin@test.ly` / `Admin@123`

## نتائج الاختبار الأحدث
- تقرير الاختبار الكامل السابق: `/app/test_reports/iteration_5.json`.
- فحص UI النهائي المركز: Grade/Subject/Teacher/Student كلها نجحت من React UI الحقيقي.
- Backend: 30/30 pytest passed في iteration 5.
- لا توجد 422/500 في مسارات الإنشاء بعد الإصلاح.

## Root Causes المغلقة
- Grades: الواجهة كانت ترسل `level_id` بينما backend كان يتطلب `level` رقميًا؛ أدى إلى 422، ثم تم دعم الحقلين.
- Students: الواجهة كانت ترسل email اختياريًا كـ empty string، و`Optional[EmailStr]` يرفضه؛ تم تحويل الفراغ إلى `null`.
- Teachers: علاقات المواد/الصفوف/الشعب لم تكن محفوظة في backend؛ تم دعمها في schema والـ response والتخزين.
- Levels/Sections/Subjects/Rooms: تم التحقق من `school_id` وMongo serialization والـ response، وتعمل ضمن السلسلة من UI.

## Prioritized Backlog

### P0
- لا يوجد P0 مفتوح لإنشاء الكيانات بعد الفحص النهائي المركز.

### P1
- الهجرة من تخزين JWT في `localStorage` إلى httpOnly secure cookies بالكامل.
- تضييق CORS production origin بدل wildcard عند تنفيذ هجرة cookies.
- مراجعة أذونات `school_id` على بعض endpoints.
- تحسين projections لبعض dashboard/finance queries كما أشار deployment health check.
- إزالة 307 redirects الاختيارية بتوحيد trailing slashes في frontend/backend.

### P2
- تطبيقات موبايل Android/iOS.
- لوحات تحكم قابلة للتخصيص بالسحب والإفلات.
- فصل `routes_extended.py` و`GradesPage.js` إلى وحدات أصغر عند توفر رصيد كافٍ.

## ملاحظات تشغيل
- لا تستأنف النشر حتى يوافق المستخدم صراحة.
- استخدم زر **Save to Github** في Emergent عند طلب المستخدم.
- يجب عدم رفع `.env` إلى GitHub.
- يجب استبعاد `_id` من أي response قادم من MongoDB.
