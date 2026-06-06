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
- [x] المعلمون CRUD + تعيين المواد/الصفوف/الشعب من بيانات APIs عبر dropdown multi-select.
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
- `TeachersPage.js` أصبح يرسل `subject_ids`, `grade_ids`, `section_ids` من بيانات APIs.
- `TeacherBase` و`TeacherResponse` و`create_teacher` أصبحت تحفظ وتعيد علاقات المعلم.
- Testing Agent iteration 5 أكد: UI create 7/7 ناجح، backend tests 30/30 ناجحة، ولا توجد console errors.

### 2025-12 - Phase A-D stability pass للـ workflows الحرجة
- أُضيف `MultiSelect` dropdown component في `/app/frontend/src/components/ui/multi-select.jsx`.
- أُضيفت أدوات آمنة لمعالجة أخطاء API في `/app/frontend/src/lib/form-utils.js` لمنع white screen عند تمرير array/object إلى toast.
- تم تحديث Teacher form:
  - Specialization أصبح Select dropdown.
  - Subjects من Subjects API عبر MultiSelect.
  - Grades من Grades API عبر MultiSelect.
  - Sections من Sections API عبر MultiSelect.
- تم تحديث Student/Exam/Grade/Schedule error handling ليعرض رسالة نصية آمنة بدل كائنات Pydantic الخام.
- تم إصلاح ترجمة زر `add_exam` حتى يظهر **إضافة اختبار** بدل key خام.
- تم فحص UI فعلي كامل بعد الإصلاحات لكل workflows المطلوبة:
  - Grade: create → success notification → يظهر في UI → refresh/reload ناجح → `level_id` محفوظ.
  - Subject: create → success notification → يظهر في UI → refresh/reload ناجح.
  - Teacher: create من dropdown/multiselect → success notification → يظهر في UI → subject badge يظهر → refresh/reload ناجح → `subject_ids/grade_ids/section_ids` محفوظة.
  - Student: create → success notification → يظهر في جدول الطلاب → refresh/reload ناجح → `grade_id/section_id` محفوظة.
  - Exam: create → success notification → يظهر في جدول الاختبارات → refresh/reload ناجح → `subject_id/grade_id` محفوظة.
  - Schedule: create period → success notification → تظهر الحصة في الجدول → refresh/reload ناجح → الفترة محفوظة في backend.
- نتائج الفحص اليدوي Playwright: لا white screen، لا console runtime errors، لا failed network requests؛ POSTs كلها 200 باستثناء 307 redirects غير كاسرة للـ grade/subject قبل 200.
- Testing Agent iteration 6: backend creation chain 11/11 passed، ولا critical issues.

## بيانات الاختبار
- Super Admin: `admin@schoolsms.ly` / `Admin@123`
- School Admin: `school_admin@test.ly` / `Admin@123`

## نتائج الاختبار الأحدث
- تقرير الاختبار الكامل السابق: `/app/test_reports/iteration_5.json`.
- تقرير الاختبار الأحدث: `/app/test_reports/iteration_6.json`.
- فحص UI الحقيقي الأحدث: Grade/Subject/Teacher/Student/Exam/Schedule كلها نجحت create → refresh → reload.
- Frontend build: نجح مع warnings قديمة غير كاسرة.
- لا توجد 422/500 أو React white screen في workflows المطلوبة بعد الإصلاح.

## Root Causes المغلقة
- Grades: الواجهة كانت ترسل `level_id` بينما backend كان يتطلب `level` رقميًا؛ تم دعم الحقلين.
- Students/Exams white screen risk: بعض catch blocks كانت تمرر `error.response.data.detail` مباشرة إلى toast، وقد يكون array/object؛ تم تحويله لنص آمن عبر `getApiErrorMessage`.
- Teachers: علاقات المواد/الصفوف/الشعب لم تكن تجربة dropdown/multiselect مناسبة ولم تكن محفوظة سابقًا بشكل موثوق؛ تم استبدالها بمكوّن MultiSelect وربطها بالـ backend.
- Exam UI: مفتاح `add_exam` كان غير مترجم؛ تم إضافة الترجمة.
- Schedule: تمت إعادة التحقق من حفظ الفترة وعرضها بعد reload؛ لا يوجد فشل حالي.

## Prioritized Backlog

### P0
- لا يوجد P0 مفتوح لهذه workflows بعد iteration 6، لكن النشر يبقى محظورًا حتى موافقة المستخدم الصريحة.

### P1
- إضافة DialogDescription لكل DialogContent لإزالة تحذيرات Radix a11y.
- إضافة data-testid أكثر دقة لحقول SchedulePage.
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
