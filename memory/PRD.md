# نظام إدارة المدارس (School Management System)
## وثيقة متطلبات المنتج (PRD)

---

## نظرة عامة
نظام إدارة مدارس متكامل (SaaS) متعدد المستأجرين للمدارس الخاصة في ليبيا. يدعم اللغة العربية (RTL) والإنجليزية مع الوضع الفاتح/الداكن.

## أدوار المستخدمين
| الدور | الوصف |
|-------|-------|
| Super Admin | مدير النظام - إدارة المدارس والتراخيص |
| School Admin | مدير المدرسة - إدارة كاملة للمدرسة |
| School Manager | مدير تنفيذي - صلاحيات إدارية |
| Accountant | المحاسب - إدارة المالية |
| Teacher | المعلم - الحضور والدرجات |
| Student | الطالب - عرض البيانات |
| Parent | ولي الأمر - متابعة الأبناء |

---

## الميزات المكتملة ✅

### 1. النظام الأساسي
- [x] المصادقة (JWT + RBAC)
- [x] دعم اللغة العربية (RTL) والإنجليزية
- [x] الوضع الفاتح والداكن
- [x] نظام الأدوار والصلاحيات

### 2. لوحة التحكم
- [x] إحصائيات عامة (الطلاب، المعلمين، الدخل)
- [x] مخطط الحضور (دائري)
- [x] قائمة الأنشطة الأخيرة
- [x] الأحداث القادمة

### 3. إدارة المستخدمين
- [x] صفحة الطلاب (CRUD)
- [x] صفحة المعلمين (CRUD)
- [x] بيانات كاملة مع البحث والفلترة

### 4. الشؤون الأكاديمية
- [x] إدارة الصفوف والشعب
- [x] إدارة المواد الدراسية
- [x] إدارة الاختبارات
- [x] سجل الحضور والغياب
- [x] جدول الحصص الأسبوعي

### 5. الشؤون المالية
- [x] إدارة الفواتير
- [x] المدفوعات
- [x] التقارير المالية

### 6. التواصل
- [x] نظام الرسائل الداخلية
- [x] صندوق الوارد والصادر

### 7. التقارير
- [x] تقارير الحضور
- [x] تقارير الدرجات
- [x] التقارير المالية
- [x] تقارير الطلاب

### 8. الإعدادات
- [x] معلومات المدرسة
- [x] الإعدادات الأكاديمية
- [x] إعدادات المظهر

### 9. Super Admin
- [x] إدارة المدارس
- [x] إدارة التراخيص
- [x] سجل النشاط

### 10. مساعد AI
- [x] مساعد ذكي للاستفسارات

---

## البنية التقنية

### Backend (FastAPI)
```
/app/backend/
├── server.py           # التطبيق الرئيسي + المصادقة
├── models.py           # نماذج البيانات
├── routes_extended.py  # APIs الموسعة
└── requirements.txt
```

### Frontend (React)
```
/app/frontend/src/
├── App.js              # الموجه الرئيسي
├── contexts/
│   ├── AuthContext.js
│   └── LanguageContext.js
├── components/
│   ├── DashboardLayout.js
│   ├── Header.js
│   └── Sidebar.js
└── pages/              # جميع الصفحات
```

### قاعدة البيانات (MongoDB)
- users, schools, licenses
- students, teachers, parents
- grades, sections, subjects
- exams, attendance, scores
- invoices, payments, messages
- activity_logs, settings

---

## APIs الرئيسية

| Endpoint | الوصف |
|----------|-------|
| `/api/auth/login` | تسجيل الدخول |
| `/api/dashboard-stats/` | إحصائيات لوحة التحكم |
| `/api/students/` | إدارة الطلاب |
| `/api/teachers/` | إدارة المعلمين |
| `/api/academic/subjects/` | المواد الدراسية |
| `/api/academic/exams/` | الاختبارات |
| `/api/attendance/` | الحضور والغياب |
| `/api/schedule/` | جدول الحصص |
| `/api/finance/` | الشؤون المالية |
| `/api/messages/` | الرسائل |
| `/api/reports/` | التقارير |
| `/api/settings/` | الإعدادات |
| `/api/schools/` | المدارس (Super Admin) |
| `/api/licenses/` | التراخيص |

---

## بيانات الاختبار

### Super Admin
- Email: `admin@schoolsms.ly`
- Password: `Admin@123`

### School Admin
- Email: `school_admin@test.ly`
- Password: `Admin@123`

---

## المهام القادمة (Backlog)

### P0 - أولوية عالية
- [ ] تصدير PDF/Excel للتقارير
- [ ] معالج الإعداد الأولي للمدارس الجديدة

### P1 - أولوية متوسطة
- [ ] جدول الحصص بالسحب والإفلات
- [ ] إشعارات SMS (Twilio)
- [ ] تسجيل الدخول بـ Google

### P2 - أولوية منخفضة
- [ ] لوحات تحكم قابلة للتخصيص
- [ ] التقارير التلقائية المجدولة
- [ ] تطبيقات الجوال (Android/iOS)

---

## سجل التحديثات

### 2026-03-01
- إنشاء صفحات: SubjectsPage, ExamsPage, ReportsPage, SettingsPage, SchedulePage, ActivityLogPage
- تحديث Sidebar بالروابط الجديدة
- إصلاح خطأ CORS
- إصلاح خطأ MongoDB ObjectId في endpoint الرسائل
- اختبارات ناجحة: Backend 100%, Frontend 100%

### 2026-02-28
- إنشاء MVP كامل
- صفحات: Dashboard, Students, Teachers, Grades, Attendance, Finance, Messages
- نظام المصادقة والأدوار
- دعم RTL والثيمات
