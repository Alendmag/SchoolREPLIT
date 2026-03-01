import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Progress } from '../components/ui/progress';
import { Building, Users, BookOpen, Calendar, Check, ChevronRight, ChevronLeft, Loader2, School } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  { id: 'school', icon: Building, title_ar: 'معلومات المدرسة', title_en: 'School Info' },
  { id: 'academic', icon: BookOpen, title_ar: 'الإعدادات الأكاديمية', title_en: 'Academic Settings' },
  { id: 'grades', icon: Users, title_ar: 'الصفوف الدراسية', title_en: 'Grade Levels' },
  { id: 'complete', icon: Check, title_ar: 'اكتمال الإعداد', title_en: 'Setup Complete' }
];

export default function OnboardingPage() {
  const { api, user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    school_name_ar: '', school_name: '', email: '', phone: '', address_ar: '',
    academic_system: 'semester', grading_system: 'percentage', currency: 'LYD',
    grades: [{ name_ar: 'الصف الأول', name: 'Grade 1' }, { name_ar: 'الصف الثاني', name: 'Grade 2' }, { name_ar: 'الصف الثالث', name: 'Grade 3' }]
  });

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = async () => {
    if (currentStep === STEPS.length - 2) {
      setLoading(true);
      try {
        await api.post('/onboarding/complete', { ...data, school_id: user.school_id });
        toast.success(language === 'ar' ? 'تم إعداد المدرسة بنجاح!' : 'School setup completed!');
        setCurrentStep(currentStep + 1);
      } catch (error) {
        toast.error(language === 'ar' ? 'حدث خطأ' : 'Error occurred');
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => setCurrentStep(Math.max(0, currentStep - 1));

  const addGrade = () => setData({ ...data, grades: [...data.grades, { name_ar: '', name: '' }] });
  const removeGrade = (i) => setData({ ...data, grades: data.grades.filter((_, idx) => idx !== i) });
  const updateGrade = (i, field, value) => {
    const newGrades = [...data.grades];
    newGrades[i][field] = value;
    setData({ ...data, grades: newGrades });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 p-4 md:p-8" data-testid="onboarding-page">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <School className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">{language === 'ar' ? 'إعداد المدرسة' : 'School Setup'}</h1>
          <p className="text-muted-foreground mt-2">{language === 'ar' ? 'أكمل الخطوات التالية لإعداد مدرستك' : 'Complete the following steps'}</p>
        </div>

        <div className="flex items-center justify-between mb-6">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <step.icon className="w-5 h-5" />
              </div>
              {i < STEPS.length - 1 && <div className={`w-12 md:w-24 h-1 mx-2 ${i < currentStep ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>
        <Progress value={progress} className="mb-6" />

        <Card>
          <CardHeader>
            <CardTitle>{language === 'ar' ? STEPS[currentStep].title_ar : STEPS[currentStep].title_en}</CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>{language === 'ar' ? 'اسم المدرسة بالعربية' : 'Arabic Name'}</Label><Input value={data.school_name_ar} onChange={(e) => setData({ ...data, school_name_ar: e.target.value })} /></div>
                  <div><Label>{language === 'ar' ? 'اسم المدرسة بالإنجليزية' : 'English Name'}</Label><Input value={data.school_name} onChange={(e) => setData({ ...data, school_name: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label><Input type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} /></div>
                  <div><Label>{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</Label><Input value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} /></div>
                </div>
                <div><Label>{language === 'ar' ? 'العنوان' : 'Address'}</Label><Textarea value={data.address_ar} onChange={(e) => setData({ ...data, address_ar: e.target.value })} /></div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div><Label>{language === 'ar' ? 'النظام الدراسي' : 'Academic System'}</Label>
                    <Select value={data.academic_system} onValueChange={(v) => setData({ ...data, academic_system: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semester">{language === 'ar' ? 'فصلين' : 'Semester'}</SelectItem>
                        <SelectItem value="trimester">{language === 'ar' ? 'ثلاثة فصول' : 'Trimester'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>{language === 'ar' ? 'نظام الدرجات' : 'Grading'}</Label>
                    <Select value={data.grading_system} onValueChange={(v) => setData({ ...data, grading_system: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">{language === 'ar' ? 'نسبة مئوية' : 'Percentage'}</SelectItem>
                        <SelectItem value="gpa">GPA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>{language === 'ar' ? 'العملة' : 'Currency'}</Label>
                    <Select value={data.currency} onValueChange={(v) => setData({ ...data, currency: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LYD">LYD</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                {data.grades.map((grade, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input placeholder={language === 'ar' ? 'الاسم بالعربية' : 'Arabic'} value={grade.name_ar} onChange={(e) => updateGrade(i, 'name_ar', e.target.value)} />
                    <Input placeholder={language === 'ar' ? 'الاسم بالإنجليزية' : 'English'} value={grade.name} onChange={(e) => updateGrade(i, 'name', e.target.value)} />
                    <Button variant="ghost" size="icon" onClick={() => removeGrade(i)}>×</Button>
                  </div>
                ))}
                <Button variant="outline" onClick={addGrade}>{language === 'ar' ? '+ إضافة صف' : '+ Add Grade'}</Button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">{language === 'ar' ? 'تم الإعداد بنجاح!' : 'Setup Complete!'}</h2>
                <p className="text-muted-foreground mb-4">{language === 'ar' ? 'مدرستك جاهزة للاستخدام' : 'Your school is ready'}</p>
                <Button onClick={() => navigate('/dashboard')}>{language === 'ar' ? 'الذهاب للوحة التحكم' : 'Go to Dashboard'}</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {currentStep < 3 && (
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}><ChevronRight className="w-4 h-4 me-2 rtl:rotate-180" />{language === 'ar' ? 'السابق' : 'Back'}</Button>
            <Button onClick={handleNext} disabled={loading}>{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{language === 'ar' ? 'التالي' : 'Next'}<ChevronLeft className="w-4 h-4 ms-2 rtl:rotate-180" /></>}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
