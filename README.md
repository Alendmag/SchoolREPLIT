# نظام إدارة المدارس الليبي SMS

تطبيق SaaS متعدد المدارس لإدارة المدارس الخاصة في ليبيا، بواجهة عربية RTL، وصلاحيات متعددة، ولوحات إدارة للمدرسة والنظام.

## المكونات

- Backend: FastAPI + MongoDB Motor
- Frontend: React + TailwindCSS + Shadcn UI
- Auth: JWT مع أدوار Super Admin وSchool Admin وباقي أدوار المدرسة
- قاعدة البيانات: MongoDB عبر `backend/.env`

## التشغيل المحلي داخل بيئة Emergent

الخدمات تعمل تلقائيًا عبر Supervisor:

- Backend داخليًا على `0.0.0.0:8001`
- Frontend على `3000`
- كل طلبات API تمر عبر `/api`

لا تغيّر المنافذ. بعد تعديل الكود العادي يعتمد النظام على hot reload. أعد تشغيل الخدمة فقط عند تغيير `.env` أو تثبيت مكتبات.

## متغيرات البيئة المطلوبة

### backend/.env

- `MONGO_URL`
- `DB_NAME`
- `JWT_SECRET`

### frontend/.env

- `REACT_APP_BACKEND_URL`

## بيانات اختبار حالية

- Super Admin: `admin@schoolsms.ly` / `Admin@123`
- School Admin: `school_admin@test.ly` / `Admin@123`

## أهم الصفحات

- لوحة التحكم
- الطلاب
- المعلمون مع ربط المواد والشعب
- الفصول والمواد: المراحل، الصفوف، الشعب، المواد، القاعات
- جدول الحصص: 9 حصص، سحب وإفلات، اختيار القاعة، وتبويب أوقات الحصص
- الاختبارات
- الحضور
- المالية
- الرسائل والإشعارات
- التقارير والتصدير
- الإعدادات وسجل النشاط

## أهم API Endpoints

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/health`
- `GET/POST /api/academic/subjects`
- `GET/POST /api/sections/`
- `GET/POST /api/rooms/`
- `GET /api/schedule/section/{section_id}`
- `POST /api/schedule/periods`
- `GET/PUT /api/schedule/period-times`

## فحص سريع

```bash
API_URL=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)
curl -s "$API_URL/api/health"
```

تسجيل الدخول:

```bash
curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"school_admin@test.ly","password":"Admin@123"}'
```

## الحفظ على GitHub

استخدم زر **Save to Github** داخل Emergent لحفظ/مزامنة الكود. لا يلزم تنفيذ `git push` يدويًا من الطرفية.

## ملاحظات تطوير مهمة

- جميع مسارات backend يجب أن تكون تحت `/api`.
- لا تُرجع `_id` من MongoDB في responses.
- بعد `insert_one` يجب حذف `_id` من القاموس قبل إرجاعه.
- خزّن التواريخ بصيغة ISO string أو حوّلها عبر Pydantic عند الحاجة.
- لا تغيّر أسماء متغيرات البيئة المحمية.
