import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Calendar, Clock, Plus, Loader2, BookOpen, Users, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

const DAYS = [
  { en: 'Sunday', ar: 'الأحد' },
  { en: 'Monday', ar: 'الإثنين' },
  { en: 'Tuesday', ar: 'الثلاثاء' },
  { en: 'Wednesday', ar: 'الأربعاء' },
  { en: 'Thursday', ar: 'الخميس' },
];

const PERIODS = [
  { number: 1, start: '07:30', end: '08:15' },
  { number: 2, start: '08:20', end: '09:05' },
  { number: 3, start: '09:10', end: '09:55' },
  { number: 4, start: '10:10', end: '10:55' },
  { number: 5, start: '11:00', end: '11:45' },
  { number: 6, start: '11:50', end: '12:35' },
  { number: 7, start: '12:40', end: '13:25' },
  { number: 8, start: '13:30', end: '14:15' },
  { number: 9, start: '14:20', end: '15:05' },
];

export default function SchedulePage() {
  const { api, user } = useAuth();
  const { language } = useLanguage();
  const [schedule, setSchedule] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ day: 0, period_number: 1, subject_id: '', teacher_id: '', room_id: '' });
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => { fetchInitialData(); }, []);
  useEffect(() => { if (selectedSection) fetchSchedule(); }, [selectedSection]);

  const fetchInitialData = async () => {
    try {
      const [sectionsRes, subjectsRes, teachersRes, roomsRes] = await Promise.all([
        api.get('/sections/'),
        api.get('/academic/subjects/'),
        api.get('/teachers/'),
        api.get('/rooms/').catch(() => ({ data: [] }))
      ]);
      setSections(sectionsRes.data || []);
      setSubjects(subjectsRes.data || []);
      setTeachers(teachersRes.data || []);
      setRooms(roomsRes.data || []);
      if (sectionsRes.data?.length > 0) setSelectedSection(sectionsRes.data[0].section_id);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedule = async () => {
    try {
      const response = await api.get(`/schedule/section/${selectedSection}`);
      setSchedule(response.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  // Get teachers for selected subject
  const getTeachersForSubject = useCallback((subjectId) => {
    if (!subjectId) return teachers;
    return teachers.filter(t => t.subject_ids?.includes(subjectId) || !t.subject_ids?.length);
  }, [teachers]);

  const handleAddPeriod = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const period = PERIODS[formData.period_number - 1];
      await api.post('/schedule/periods', {
        ...formData,
        section_id: selectedSection,
        school_id: user.school_id,
        start_time: period?.start,
        end_time: period?.end
      });
      toast.success(language === 'ar' ? 'تم إضافة الحصة' : 'Period added');
      setDialogOpen(false);
      fetchSchedule();
      setFormData({ day: 0, period_number: 1, subject_id: '', teacher_id: '', room_id: '' });
    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ' : 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePeriod = async (periodId) => {
    if (!window.confirm(language === 'ar' ? 'حذف الحصة؟' : 'Delete period?')) return;
    try {
      await api.delete(`/schedule/periods/${periodId}`);
      toast.success(language === 'ar' ? 'تم الحذف' : 'Deleted');
      fetchSchedule();
    } catch (error) {
      toast.error(language === 'ar' ? 'خطأ' : 'Error');
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e, period) => {
    setDraggedItem(period);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, day, periodNumber) => {
    e.preventDefault();
    if (!draggedItem) return;
    
    try {
      // Update the dragged item's position
      await api.put(`/schedule/periods/${draggedItem.period_id}`, {
        ...draggedItem,
        day: day,
        period_number: periodNumber,
        start_time: PERIODS[periodNumber - 1]?.start,
        end_time: PERIODS[periodNumber - 1]?.end
      });
      toast.success(language === 'ar' ? 'تم نقل الحصة' : 'Period moved');
      fetchSchedule();
    } catch (error) {
      toast.error(language === 'ar' ? 'خطأ في النقل' : 'Move error');
    }
    setDraggedItem(null);
  };

  const getPeriodData = (day, periodNumber) => {
    return schedule.find(p => p.day === day && p.period_number === periodNumber);
  };

  const openAddDialog = (day, periodNumber) => {
    setFormData({ day, period_number: periodNumber, subject_id: '', teacher_id: '', room_id: '' });
    setDialogOpen(true);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 animate-fade-in" data-testid="schedule-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">{language === 'ar' ? 'جدول الحصص' : 'Schedule'}</h1>
          <p className="text-muted-foreground mt-1">{language === 'ar' ? 'اسحب وأفلت لتنظيم الجدول' : 'Drag and drop to organize'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger className="w-48"><SelectValue placeholder={language === 'ar' ? 'اختر الشعبة' : 'Select Section'} /></SelectTrigger>
            <SelectContent>{sections.map(s => <SelectItem key={s.section_id} value={s.section_id}>{s.name_ar || s.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-start bg-muted/50 w-24">{language === 'ar' ? 'الحصة' : 'Period'}</th>
                {DAYS.map((day, i) => (
                  <th key={i} className="p-3 text-center bg-muted/50 min-w-[140px]">{language === 'ar' ? day.ar : day.en}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((period) => (
                <tr key={period.number} className="border-b hover:bg-muted/20">
                  <td className="p-2 bg-muted/30 text-center">
                    <div className="font-medium text-sm">{period.number}</div>
                    <div className="text-xs text-muted-foreground">{period.start}</div>
                    <div className="text-xs text-muted-foreground">{period.end}</div>
                  </td>
                  {DAYS.map((_, dayIndex) => {
                    const periodData = getPeriodData(dayIndex, period.number);
                    const subject = subjects.find(s => s.subject_id === periodData?.subject_id);
                    const teacher = teachers.find(t => t.teacher_id === periodData?.teacher_id);
                    const room = rooms.find(r => r.room_id === periodData?.room_id);
                    
                    return (
                      <td 
                        key={dayIndex} 
                        className="p-1"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, dayIndex, period.number)}
                      >
                        {periodData ? (
                          <div 
                            draggable
                            onDragStart={(e) => handleDragStart(e, periodData)}
                            className="p-2 rounded-lg bg-primary/10 border border-primary/20 cursor-grab active:cursor-grabbing group relative"
                          >
                            <div className="absolute top-1 start-1 opacity-0 group-hover:opacity-100"><GripVertical className="w-3 h-3 text-muted-foreground" /></div>
                            <p className="font-medium text-sm text-center">{subject?.name_ar || subject?.name || periodData.subject_name || '-'}</p>
                            <p className="text-xs text-muted-foreground text-center mt-1">{teacher?.name_ar || teacher?.name || periodData.teacher_name || ''}</p>
                            {(room || periodData.room) && <Badge variant="outline" className="mt-1 text-xs w-full justify-center">{room?.name_ar || room?.name || periodData.room}</Badge>}
                            <button onClick={() => handleDeletePeriod(periodData.period_id)} className="absolute top-1 end-1 opacity-0 group-hover:opacity-100 text-destructive"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        ) : (
                          <div 
                            onClick={() => openAddDialog(dayIndex, period.number)}
                            className="p-4 rounded-lg border-2 border-dashed border-muted-foreground/20 text-center text-muted-foreground text-sm cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                          >
                            <Plus className="w-4 h-4 mx-auto" />
                          </div>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{language === 'ar' ? 'إضافة حصة' : 'Add Period'}</DialogTitle></DialogHeader>
          <form onSubmit={handleAddPeriod}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'اليوم' : 'Day'}</Label>
                  <Select value={formData.day.toString()} onValueChange={(v) => setFormData({ ...formData, day: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DAYS.map((d, i) => <SelectItem key={i} value={i.toString()}>{language === 'ar' ? d.ar : d.en}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الحصة' : 'Period'}</Label>
                  <Select value={formData.period_number.toString()} onValueChange={(v) => setFormData({ ...formData, period_number: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PERIODS.map(p => <SelectItem key={p.number} value={p.number.toString()}>{p.number} ({p.start}-{p.end})</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'المادة' : 'Subject'}</Label>
                <Select value={formData.subject_id} onValueChange={(v) => setFormData({ ...formData, subject_id: v, teacher_id: '' })}>
                  <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'اختر المادة' : 'Select'} /></SelectTrigger>
                  <SelectContent>{subjects.map(s => <SelectItem key={s.subject_id} value={s.subject_id}>{s.name_ar || s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'المعلم' : 'Teacher'}</Label>
                <Select value={formData.teacher_id} onValueChange={(v) => setFormData({ ...formData, teacher_id: v })}>
                  <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'اختر المعلم' : 'Select'} /></SelectTrigger>
                  <SelectContent>
                    {getTeachersForSubject(formData.subject_id).map(t => (
                      <SelectItem key={t.teacher_id} value={t.teacher_id}>{t.name_ar || t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'القاعة' : 'Room'}</Label>
                <Select value={formData.room_id} onValueChange={(v) => setFormData({ ...formData, room_id: v })}>
                  <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'اختر القاعة' : 'Select'} /></SelectTrigger>
                  <SelectContent>
                    {rooms.length > 0 ? rooms.map(r => (
                      <SelectItem key={r.room_id} value={r.room_id}>{r.name_ar || r.name} ({r.capacity})</SelectItem>
                    )) : <SelectItem value="default">{language === 'ar' ? 'قاعة افتراضية' : 'Default Room'}</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
              <Button type="submit" disabled={submitting}>{submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (language === 'ar' ? 'حفظ' : 'Save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
