import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Settings, School, Palette, Globe, Bell, Shield, Save, Loader2, Building, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { api, user } = useAuth();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    school_name: '', school_name_ar: '', email: '', phone: '', address: '', address_ar: '',
    primary_color: '#047857', secondary_color: '#475569', academic_system: 'semester',
    grading_system: 'percentage', attendance_system: 'daily', currency: 'LYD', timezone: 'Africa/Tripoli'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings/');
      if (response.data) {
        setSettings({
          school_name: response.data.name || '',
          school_name_ar: response.data.name_ar || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          address: response.data.address || '',
          address_ar: response.data.address_ar || '',
          primary_color: response.data.primary_color || '#047857',
          secondary_color: response.data.secondary_color || '#475569',
          academic_system: response.data.academic_system || 'semester',
          grading_system: response.data.grading_system || 'percentage',
          attendance_system: response.data.attendance_system || 'daily',
          currency: response.data.currency || 'LYD',
          timezone: response.data.timezone || 'Africa/Tripoli'
        });
      }
    } catch (error) {
      console.error('Fetch settings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings/', {
        name: settings.school_name,
        name_ar: settings.school_name_ar,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
        address_ar: settings.address_ar,
        primary_color: settings.primary_color,
        secondary_color: settings.secondary_color,
        academic_system: settings.academic_system,
        grading_system: settings.grading_system,
        attendance_system: settings.attendance_system,
        currency: settings.currency,
        timezone: settings.timezone
      });
      toast.success(language === 'ar' ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
    } catch (error) {
      toast.error(t('error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="settings-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">{t('settings')}</h1>
          <p className="text-muted-foreground mt-1">{language === 'ar' ? 'إدارة إعدادات المدرسة' : 'Manage school settings'}</p>
        </div>
        <Button onClick={handleSave} disabled={saving} data-testid="save-settings-btn">
          {saving ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : <Save className="w-4 h-4 me-2" />}
          {t('save')}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general"><Building className="w-4 h-4 me-2" />{language === 'ar' ? 'عام' : 'General'}</TabsTrigger>
          <TabsTrigger value="academic"><School className="w-4 h-4 me-2" />{language === 'ar' ? 'أكاديمي' : 'Academic'}</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="w-4 h-4 me-2" />{language === 'ar' ? 'المظهر' : 'Appearance'}</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'معلومات المدرسة' : 'School Information'}</CardTitle>
              <CardDescription>{language === 'ar' ? 'المعلومات الأساسية للمدرسة' : 'Basic school information'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'اسم المدرسة بالعربية' : 'School Name (Arabic)'}</Label>
                  <Input value={settings.school_name_ar} onChange={(e) => setSettings({ ...settings, school_name_ar: e.target.value })} data-testid="school-name-ar" />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'اسم المدرسة بالإنجليزية' : 'School Name (English)'}</Label>
                  <Input value={settings.school_name} onChange={(e) => setSettings({ ...settings, school_name: e.target.value })} data-testid="school-name" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label><Mail className="w-4 h-4 inline me-2" />{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
                  <Input type="email" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} data-testid="school-email" />
                </div>
                <div className="space-y-2">
                  <Label><Phone className="w-4 h-4 inline me-2" />{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</Label>
                  <Input value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} data-testid="school-phone" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label><MapPin className="w-4 h-4 inline me-2" />{language === 'ar' ? 'العنوان بالعربية' : 'Address (Arabic)'}</Label>
                  <Textarea value={settings.address_ar} onChange={(e) => setSettings({ ...settings, address_ar: e.target.value })} data-testid="school-address-ar" />
                </div>
                <div className="space-y-2">
                  <Label><MapPin className="w-4 h-4 inline me-2" />{language === 'ar' ? 'العنوان بالإنجليزية' : 'Address (English)'}</Label>
                  <Textarea value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} data-testid="school-address" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'الإعدادات الأكاديمية' : 'Academic Settings'}</CardTitle>
              <CardDescription>{language === 'ar' ? 'تخصيص النظام الأكاديمي' : 'Customize academic system'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'النظام الدراسي' : 'Academic System'}</Label>
                  <Select value={settings.academic_system} onValueChange={(v) => setSettings({ ...settings, academic_system: v })}>
                    <SelectTrigger data-testid="academic-system"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semester">{language === 'ar' ? 'فصلين' : 'Semester'}</SelectItem>
                      <SelectItem value="trimester">{language === 'ar' ? 'ثلاثة فصول' : 'Trimester'}</SelectItem>
                      <SelectItem value="quarter">{language === 'ar' ? 'أربعة فصول' : 'Quarter'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'نظام الدرجات' : 'Grading System'}</Label>
                  <Select value={settings.grading_system} onValueChange={(v) => setSettings({ ...settings, grading_system: v })}>
                    <SelectTrigger data-testid="grading-system"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">{language === 'ar' ? 'نسبة مئوية' : 'Percentage'}</SelectItem>
                      <SelectItem value="gpa">{language === 'ar' ? 'معدل تراكمي' : 'GPA'}</SelectItem>
                      <SelectItem value="letter">{language === 'ar' ? 'حرفي' : 'Letter Grade'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'نظام الحضور' : 'Attendance System'}</Label>
                  <Select value={settings.attendance_system} onValueChange={(v) => setSettings({ ...settings, attendance_system: v })}>
                    <SelectTrigger data-testid="attendance-system"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">{language === 'ar' ? 'يومي' : 'Daily'}</SelectItem>
                      <SelectItem value="per_subject">{language === 'ar' ? 'لكل مادة' : 'Per Subject'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'العملة' : 'Currency'}</Label>
                  <Select value={settings.currency} onValueChange={(v) => setSettings({ ...settings, currency: v })}>
                    <SelectTrigger data-testid="currency"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LYD">{language === 'ar' ? 'دينار ليبي (LYD)' : 'Libyan Dinar (LYD)'}</SelectItem>
                      <SelectItem value="USD">{language === 'ar' ? 'دولار أمريكي (USD)' : 'US Dollar (USD)'}</SelectItem>
                      <SelectItem value="EUR">{language === 'ar' ? 'يورو (EUR)' : 'Euro (EUR)'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'المنطقة الزمنية' : 'Timezone'}</Label>
                  <Select value={settings.timezone} onValueChange={(v) => setSettings({ ...settings, timezone: v })}>
                    <SelectTrigger data-testid="timezone"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Tripoli">{language === 'ar' ? 'طرابلس' : 'Tripoli'}</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'إعدادات المظهر' : 'Appearance Settings'}</CardTitle>
              <CardDescription>{language === 'ar' ? 'تخصيص ألوان وشكل النظام' : 'Customize system colors and look'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'اللون الأساسي' : 'Primary Color'}</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={settings.primary_color} onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })} className="w-16 h-10 p-1" data-testid="primary-color" />
                    <Input value={settings.primary_color} onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })} className="flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'اللون الثانوي' : 'Secondary Color'}</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={settings.secondary_color} onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })} className="w-16 h-10 p-1" data-testid="secondary-color" />
                    <Input value={settings.secondary_color} onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })} className="flex-1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
