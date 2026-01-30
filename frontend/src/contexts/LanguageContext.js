import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Arabic translations
const ar = {
  // Common
  app_name: 'نظام إدارة المدارس',
  loading: 'جاري التحميل...',
  save: 'حفظ',
  cancel: 'إلغاء',
  delete: 'حذف',
  edit: 'تعديل',
  add: 'إضافة',
  search: 'بحث',
  filter: 'تصفية',
  export: 'تصدير',
  print: 'طباعة',
  actions: 'إجراءات',
  status: 'الحالة',
  active: 'نشط',
  inactive: 'غير نشط',
  pending: 'معلق',
  yes: 'نعم',
  no: 'لا',
  confirm: 'تأكيد',
  back: 'رجوع',
  next: 'التالي',
  previous: 'السابق',
  view_all: 'عرض الكل',
  no_data: 'لا توجد بيانات',
  success: 'تمت العملية بنجاح',
  error: 'حدث خطأ',
  
  // Auth
  login: 'تسجيل الدخول',
  logout: 'تسجيل الخروج',
  register: 'إنشاء حساب',
  email: 'البريد الإلكتروني',
  password: 'كلمة المرور',
  confirm_password: 'تأكيد كلمة المرور',
  forgot_password: 'نسيت كلمة المرور؟',
  login_with_google: 'تسجيل الدخول عبر Google',
  welcome_back: 'مرحباً بعودتك',
  enter_credentials: 'أدخل بياناتك للوصول إلى حسابك',
  
  // Navigation
  dashboard: 'لوحة التحكم',
  students: 'الطلاب',
  teachers: 'المعلمون',
  parents: 'أولياء الأمور',
  classes: 'الفصول',
  grades: 'الصفوف',
  subjects: 'المواد',
  exams: 'الاختبارات',
  attendance: 'الحضور',
  finance: 'المالية',
  invoices: 'الفواتير',
  payments: 'المدفوعات',
  reports: 'التقارير',
  settings: 'الإعدادات',
  notifications: 'الإشعارات',
  messages: 'الرسائل',
  calendar: 'التقويم',
  licenses: 'التراخيص',
  schools: 'المدارس',
  support: 'الدعم الفني',
  ai_assistant: 'المساعد الذكي',
  
  // Dashboard
  total_students: 'إجمالي الطلاب',
  total_teachers: 'إجمالي المعلمين',
  total_schools: 'إجمالي المدارس',
  total_revenue: 'إجمالي الإيرادات',
  active_licenses: 'التراخيص النشطة',
  expiring_licenses: 'تراخيص تنتهي قريباً',
  attendance_today: 'حضور اليوم',
  present: 'حاضر',
  absent: 'غائب',
  late: 'متأخر',
  excused: 'معذور',
  recent_activity: 'النشاط الأخير',
  quick_actions: 'إجراءات سريعة',
  
  // Students
  student_name: 'اسم الطالب',
  student_id: 'رقم الطالب',
  date_of_birth: 'تاريخ الميلاد',
  gender: 'الجنس',
  male: 'ذكر',
  female: 'أنثى',
  national_id: 'رقم الهوية',
  enrollment_date: 'تاريخ التسجيل',
  parent_name: 'اسم ولي الأمر',
  add_student: 'إضافة طالب',
  edit_student: 'تعديل بيانات الطالب',
  student_details: 'تفاصيل الطالب',
  academic_history: 'السجل الأكاديمي',
  
  // Teachers
  teacher_name: 'اسم المعلم',
  specialization: 'التخصص',
  qualification: 'المؤهل',
  hire_date: 'تاريخ التعيين',
  assigned_subjects: 'المواد المسندة',
  assigned_classes: 'الفصول المسندة',
  add_teacher: 'إضافة معلم',
  
  // Academic
  grade_name: 'اسم الصف',
  grade_level: 'المستوى',
  section: 'الشعبة',
  subject_name: 'اسم المادة',
  subject_code: 'رمز المادة',
  credits: 'الساعات المعتمدة',
  exam_name: 'اسم الاختبار',
  exam_type: 'نوع الاختبار',
  exam_date: 'تاريخ الاختبار',
  max_score: 'الدرجة الكاملة',
  quiz: 'اختبار قصير',
  midterm: 'اختبار نصفي',
  final: 'اختبار نهائي',
  assignment: 'واجب',
  
  // Finance
  invoice_number: 'رقم الفاتورة',
  amount: 'المبلغ',
  due_date: 'تاريخ الاستحقاق',
  paid: 'مدفوع',
  unpaid: 'غير مدفوع',
  overdue: 'متأخر',
  payment_method: 'طريقة الدفع',
  cash: 'نقدي',
  transfer: 'تحويل',
  card: 'بطاقة',
  receipt_number: 'رقم الإيصال',
  total_invoiced: 'إجمالي الفواتير',
  total_collected: 'إجمالي المحصل',
  total_pending: 'إجمالي المستحق',
  create_invoice: 'إنشاء فاتورة',
  record_payment: 'تسجيل دفعة',
  
  // Licenses
  license_key: 'مفتاح الترخيص',
  license_type: 'نوع الترخيص',
  monthly: 'شهري',
  yearly: 'سنوي',
  lifetime: 'مدى الحياة',
  activated_at: 'تاريخ التفعيل',
  expires_at: 'تاريخ الانتهاء',
  grace_period: 'فترة السماح',
  activate: 'تفعيل',
  suspend: 'تعليق',
  renew: 'تجديد',
  
  // Schools
  school_name: 'اسم المدرسة',
  school_email: 'البريد الإلكتروني للمدرسة',
  school_phone: 'هاتف المدرسة',
  school_address: 'عنوان المدرسة',
  academic_system: 'النظام الأكاديمي',
  semester: 'فصلي',
  trimester: 'ثلاثي',
  quarter: 'ربعي',
  add_school: 'إضافة مدرسة',
  
  // Notifications
  notification_title: 'عنوان الإشعار',
  notification_message: 'نص الإشعار',
  send_notification: 'إرسال إشعار',
  mark_as_read: 'تحديد كمقروء',
  unread: 'غير مقروء',
  all_notifications: 'جميع الإشعارات',
  
  // Settings
  profile_settings: 'إعدادات الملف الشخصي',
  school_settings: 'إعدادات المدرسة',
  system_settings: 'إعدادات النظام',
  language: 'اللغة',
  arabic: 'العربية',
  english: 'English',
  theme: 'المظهر',
  light: 'فاتح',
  dark: 'داكن',
  
  // Errors
  login_failed: 'فشل تسجيل الدخول',
  invalid_credentials: 'بيانات الدخول غير صحيحة',
  session_expired: 'انتهت الجلسة',
  permission_denied: 'غير مصرح',
  not_found: 'غير موجود',
  server_error: 'خطأ في الخادم',
  license_expired: 'الترخيص منتهي',
  license_suspended: 'الترخيص معلق',
  
  // Landing page
  hero_title: 'نظام إدارة المدارس المتكامل',
  hero_subtitle: 'حلول ذكية لإدارة مدرستك بكفاءة عالية',
  get_started: 'ابدأ الآن',
  learn_more: 'اعرف المزيد',
  features: 'المميزات',
  pricing: 'الأسعار',
  contact: 'تواصل معنا',
  
  // Features
  feature_students: 'إدارة شاملة للطلاب',
  feature_students_desc: 'تسجيل وتتبع بيانات الطلاب والحضور والأداء الأكاديمي',
  feature_teachers: 'إدارة المعلمين',
  feature_teachers_desc: 'إدارة ملفات المعلمين والجداول والمهام',
  feature_finance: 'النظام المالي',
  feature_finance_desc: 'فواتير ومدفوعات وتقارير مالية متكاملة',
  feature_reports: 'تقارير متقدمة',
  feature_reports_desc: 'تقارير أكاديمية ومالية وإدارية قابلة للتصدير',
  feature_communication: 'التواصل الفعال',
  feature_communication_desc: 'رسائل وإشعارات لأولياء الأمور والمعلمين',
  feature_security: 'أمان عالي',
  feature_security_desc: 'حماية البيانات وصلاحيات متعددة المستويات',
};

// English translations
const en = {
  // Common
  app_name: 'School Management System',
  loading: 'Loading...',
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  edit: 'Edit',
  add: 'Add',
  search: 'Search',
  filter: 'Filter',
  export: 'Export',
  print: 'Print',
  actions: 'Actions',
  status: 'Status',
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  yes: 'Yes',
  no: 'No',
  confirm: 'Confirm',
  back: 'Back',
  next: 'Next',
  previous: 'Previous',
  view_all: 'View All',
  no_data: 'No data available',
  success: 'Operation successful',
  error: 'An error occurred',
  
  // Auth
  login: 'Login',
  logout: 'Logout',
  register: 'Register',
  email: 'Email',
  password: 'Password',
  confirm_password: 'Confirm Password',
  forgot_password: 'Forgot Password?',
  login_with_google: 'Login with Google',
  welcome_back: 'Welcome Back',
  enter_credentials: 'Enter your credentials to access your account',
  
  // Navigation
  dashboard: 'Dashboard',
  students: 'Students',
  teachers: 'Teachers',
  parents: 'Parents',
  classes: 'Classes',
  grades: 'Grades',
  subjects: 'Subjects',
  exams: 'Exams',
  attendance: 'Attendance',
  finance: 'Finance',
  invoices: 'Invoices',
  payments: 'Payments',
  reports: 'Reports',
  settings: 'Settings',
  notifications: 'Notifications',
  messages: 'Messages',
  calendar: 'Calendar',
  licenses: 'Licenses',
  schools: 'Schools',
  support: 'Support',
  ai_assistant: 'AI Assistant',
  
  // Dashboard
  total_students: 'Total Students',
  total_teachers: 'Total Teachers',
  total_schools: 'Total Schools',
  total_revenue: 'Total Revenue',
  active_licenses: 'Active Licenses',
  expiring_licenses: 'Expiring Soon',
  attendance_today: "Today's Attendance",
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  excused: 'Excused',
  recent_activity: 'Recent Activity',
  quick_actions: 'Quick Actions',
  
  // ... rest of English translations
  student_name: 'Student Name',
  add_student: 'Add Student',
  teacher_name: 'Teacher Name',
  add_teacher: 'Add Teacher',
  license_key: 'License Key',
  school_name: 'School Name',
  add_school: 'Add School',
  
  // Landing
  hero_title: 'Complete School Management System',
  hero_subtitle: 'Smart solutions for efficient school management',
  get_started: 'Get Started',
  learn_more: 'Learn More',
  features: 'Features',
  pricing: 'Pricing',
  contact: 'Contact Us',
};

const translations = { ar, en };

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'ar';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    return translations[language][key] || translations['ar'][key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t,
    isRTL: language === 'ar',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
