import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Calendar, Clock, Plus, Loader2, BookOpen, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

const DAYS = [
  { en: 'Sunday', ar: 'الأحد' },
  { en: 'Monday', ar: 'الإثنين' },
  { en: 'Tuesday', ar: 'الثلاثاء' },
  { en: 'Wednesday', ar: 'الأربعاء' },
  { en: 'Thursday', ar: 'الخميس' },
];

const PERIODS = [
  { number: 1, start: '08:00', end: '08:45' },
  { number: 2, start: '08:50', end: '09:35' },
  { number: 3, start: '09:40', end: '10:25' },
  { number: 4, start: '10:40', end: '11:25' },
  { number: 5, start: '11:30', end: '12:15' },
  { number: 6, start: '12:20', end: '13:05' },
];

export default function SchedulePage() {
  const { api, user } = useAuth();
  const { t, language, isRTL } = useLanguage();
  const [schedule, setSchedule] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ day: 0, period_number: 1, subject_id: '', teacher_id: '', room: '' });

  useEffect(() => { fetchInitialData(); }, []);
  useEffect(() => { if (selectedSection) fetchSchedule(); }, [selectedSection]);

  const fetchInitialData = async () => {
    try {
      const [sectionsRes, subjectsRes, teachersRes] = await Promise.all([
        api.get('/sections/'),
        api.get('/academic/subjects/'),
        api.get('/teachers/')
      ]);
      setSections(sectionsRes.data);
      setSubjects(subjectsRes.data);
      setTeachers(teachersRes.data);
      if (sectionsRes.data.length > 0) {
        setSelectedSection(sectionsRes.data[0].section_id);
      }
    } catch (error) {
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedule = async () => {
    try {
      const response = await api.get(`/schedule/section/${selectedSection}`);
      setSchedule(response.data);
    } catch (error) {
      console.error('Fetch schedule error:', error);
    }
  };

  const handleAddPeriod = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/schedule/periods', {
        ...formData,
        section_id: selectedSection,
        school_id: user.school_id,
        start_time: PERIODS[formData.period_number - 1]?.start,
        end_time: PERIODS[formData.period_number - 1]?.end
      });
      toast.success(language === 'ar' ? 'تم إضافة الحصة بنجاح' : 'Period added successfully');
      setDialogOpen(false);
      fetchSchedule();
    } catch (error) {
      toast.error(t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  const getPeriodData = (day, periodNumber) => {
    return schedule.find(p => p.day === day && p.period_number === periodNumber);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="schedule-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">{language === 'ar' ? 'جدول الحصص' : 'Schedule'}</h1>
          <p className="text-muted-foreground mt-1">{language === 'ar' ? 'إدارة الجدول الدراسي' : 'Manage class schedules'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger className="w-48" data-testid="section-select">
              <SelectValue placeholder={language === 'ar' ? 'اختر الشعبة' : 'Select Section'} />
            </SelectTrigger>
            <SelectContent>
              {sections.map(s => <SelectItem key={s.section_id} value={s.section_id}>{s.name_ar || s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="add-period-btn"><Plus className="w-4 h-4 me-2" />{language === 'ar' ? 'إضافة حصة' : 'Add Period'}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{language === 'ar' ? 'إضافة حصة' : 'Add Period'}</DialogTitle></DialogHeader>
              <form onSubmit={handleAddPeriod}>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'اليوم' : 'Day'}</Label>
                      <Select value={formData.day.toString()} onValueChange={(v) => setFormData({ ...formData, day: parseInt(v) })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {DAYS.map((d, i) => <SelectItem key={i} value={i.toString()}>{language === 'ar' ? d.ar : d.en}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الحصة' : 'Period'}</Label>
                      <Select value={formData.period_number.toString()} onValueChange={(v) => setFormData({ ...formData, period_number: parseInt(v) })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PERIODS.map(p => <SelectItem key={p.number} value={p.number.toString()}>{language === 'ar' ? `الحصة ${p.number}` : `Period ${p.number}`}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'المادة' : 'Subject'}</Label>
                    <Select value={formData.subject_id} onValueChange={(v) => setFormData({ ...formData, subject_id: v })}>
                      <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'اختر المادة' : 'Select'} /></SelectTrigger>
                      <SelectContent>
                        {subjects.map(s => <SelectItem key={s.subject_id} value={s.subject_id}>{s.name_ar || s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'المعلم' : 'Teacher'}</Label>
                    <Select value={formData.teacher_id} onValueChange={(v) => setFormData({ ...formData, teacher_id: v })}>
                      <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'اختر المعلم' : 'Select'} /></SelectTrigger>
                      <SelectContent>
                        {teachers.map(t => <SelectItem key={t.teacher_id} value={t.teacher_id}>{t.name_ar || t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'القاعة' : 'Room'}</Label>
                    <Input value={formData.room} onChange={(e) => setFormData({ ...formData, room: e.target.value })} placeholder="A101" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t('cancel')}</Button>
                  <Button type="submit" disabled={submitting}>{submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('save')}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-start bg-muted/50 min-w-[100px]">{language === 'ar' ? 'الحصة' : 'Period'}</th>
                {DAYS.map((day, i) => (
                  <th key={i} className="p-3 text-center bg-muted/50 min-w-[150px]">{language === 'ar' ? day.ar : day.en}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((period) => (
                <tr key={period.number} className="border-b">
                  <td className="p-3 bg-muted/30">
                    <div className="font-medium">{language === 'ar' ? `الحصة ${period.number}` : `Period ${period.number}`}</div>
                    <div className="text-xs text-muted-foreground">{period.start} - {period.end}</div>
                  </td>
                  {DAYS.map((_, dayIndex) => {
                    const periodData = getPeriodData(dayIndex, period.number);
                    return (
                      <td key={dayIndex} className="p-2">
                        {periodData ? (
                          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                            <p className="font-medium text-sm">{periodData.subject_name_ar || periodData.subject_name || '-'}</p>
                            <p className="text-xs text-muted-foreground">{periodData.teacher_name_ar || periodData.teacher_name || ''}</p>
                            {periodData.room && <Badge variant="outline" className="mt-1 text-xs">{periodData.room}</Badge>}
                          </div>
                        ) : (
                          <div className="p-2 rounded-lg bg-muted/30 border border-dashed border-muted-foreground/20 text-center text-muted-foreground text-sm">-</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
