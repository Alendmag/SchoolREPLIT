# مراجعة أمنية مختصرة

## Auth token في localStorage

الحالة الحالية: الواجهة تخزن JWT في `localStorage` وتضيفه إلى `Authorization: Bearer`، بينما backend ينشئ أيضًا `session_token` كـ httpOnly cookie عند تسجيل الدخول.

تقييم المخاطر:
- الخطر: متوسط إلى عالٍ إذا وُجد XSS، لأن `localStorage` قابل للقراءة من JavaScript.
- لا يوجد تأكيد على ثغرة XSS قابلة للاستغلال ضمن هذا الفحص.
- لذلك لم يتم تغيير آلية المصادقة الآن لتجنب regression قبل التسليم.

مسار الهجرة المقترح للإنتاج:
1. الاعتماد على httpOnly secure cookies فقط للجلسة.
2. تعديل AuthContext ليستخدم `withCredentials: true` ولا يخزن JWT في `localStorage`.
3. إضافة refresh endpoint أو تمديد آلية `session_token` الحالية.
4. ضبط CORS على origin محدد مع `allow_credentials=True`.
5. اختبار login/logout/auth/me وGoogle callback قبل النشر.

## LanguageContext findings

نتيجة الفحص: التحذيرات على `password`, `confirm_password`, `forgot_password` في `LanguageContext.js` هي false positives؛ هذه مفاتيح ترجمة ونصوص واجهة وليست أسرارًا أو API keys.

## Hardcoded secrets

تم نقل بيانات اختبار الدخول في `backend/tests/test_school_management.py` إلى environment variables:
- `SMS_TEST_SUPER_ADMIN_EMAIL`
- `SMS_TEST_SUPER_ADMIN_PASSWORD`
- `SMS_TEST_SCHOOL_ADMIN_EMAIL`
- `SMS_TEST_SCHOOL_ADMIN_PASSWORD`

كما تمت إزالة fallback الافتراضي لـ `JWT_SECRET` من backend ليستخدم `os.environ['JWT_SECRET']` ويفشل سريعًا عند غيابه.
