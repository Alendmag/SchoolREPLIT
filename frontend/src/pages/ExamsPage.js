import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { FileText, Plus, Edit, Trash2, Loader2, Search, Calendar, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function ExamsPage() {
  const { api, user } = useAuth();
  const { t, language } = useLanguage();
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', name_ar: '', exam_type: 'midterm', subject_id: '', grade_id: '', max_score: 100, date: '', duration_minutes: 60
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [examsRes, subjectsRes, gradesRes] = await Promise.all([
        api.get('/academic/exams/'),
        api.get('/academic/subjects/'),
        api.get('/academic/grades/')
      ]);
      setExams(examsRes.data);
      setSubjects(subjectsRes.data);
      setGrades(gradesRes.data);
    } catch (error) {
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/academic/exams/', { ...formData, school_id: user.school_id });
      toast.success(language === 'ar' ? 'تم إضافة الاختبار بنجاح' : 'Exam added successfully');
      setDialogOpen(false);
      fetchData();
      setFormData({ name: '', name_ar: '', exam_type: 'midterm', subject_id: '', grade_id: '', max_score: 100, date: '', duration_minutes: 60 });
    } catch (error) {
      toast.error(error.response?.data?.detail || t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  const getExamTypeBadge = (type) => {
    const types = {
      quiz: { label: language === 'ar' ? 'اختبار قصير' : 'Quiz', variant: 'outline' },
      midterm: { label: language === 'ar' ? 'منتصف الفصل' : 'Midterm', variant: 'default' },
      final: { label: language === 'ar' ? 'نهائي' : 'Final', variant: 'destructive' },
      assignment: { label: language === 'ar' ? 'واجب' : 'Assignment', variant: 'secondary' }
    };
    return types[type] || types.midterm;
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="exams-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">{t('exams')}</h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ar' ? `إدارة الاختبارات (${exams.length} اختبار)` : `Manage exams (${exams.length} exams)`}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-exam-btn"><Plus className="w-4 h-4 me-2" />{t('add_exam')}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{t('add_exam')}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'}</Label>
                    <Input value={formData.name_ar} onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })} required data-testid="exam-name-ar" />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الاسم بالإنجليزية' : 'English Name'}</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required data-testid="exam-name" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'نوع الاختبار' : 'Exam Type'}</Label>
                    <Select value={formData.exam_type} onValueChange={(v) => setFormData({ ...formData, exam_type: v })}>
                      <SelectTrigger data-testid="exam-type-select"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quiz">{language === 'ar' ? 'اختبار قصير' : 'Quiz'}</SelectItem>
                        <SelectItem value="midterm">{language === 'ar' ? 'منتصف الفصل' : 'Midterm'}</SelectItem>
                        <SelectItem value="final">{language === 'ar' ? 'نهائي' : 'Final'}</SelectItem>
                        <SelectItem value="assignment">{language === 'ar' ? 'واجب' : 'Assignment'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'المادة' : 'Subject'}</Label>
                    <Select value={formData.subject_id} onValueChange={(v) => setFormData({ ...formData, subject_id: v })}>
                      <SelectTrigger data-testid="exam-subject-select"><SelectValue placeholder={language === 'ar' ? 'اختر المادة' : 'Select'} /></SelectTrigger>
                      <SelectContent>
                        {subjects.map(s => <SelectItem key={s.subject_id} value={s.subject_id}>{s.name_ar || s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الصف' : 'Grade'}</Label>
                    <Select value={formData.grade_id} onValueChange={(v) => setFormData({ ...formData, grade_id: v })}>
                      <SelectTrigger data-testid="exam-grade-select"><SelectValue placeholder={language === 'ar' ? 'اختر الصف' : 'Select'} /></SelectTrigger>
                      <SelectContent>
                        {grades.map(g => <SelectItem key={g.grade_id} value={g.grade_id}>{g.name_ar || g.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'التاريخ' : 'Date'}</Label>
                    <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required data-testid="exam-date" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الدرجة القصوى' : 'Max Score'}</Label>
                    <Input type="number" min={1} value={formData.max_score} onChange={(e) => setFormData({ ...formData, max_score: parseFloat(e.target.value) })} data-testid="exam-max-score" />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'المدة (دقيقة)' : 'Duration (min)'}</Label>
                    <Input type="number" min={1} value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })} data-testid="exam-duration" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t('cancel')}</Button>
                <Button type="submit" disabled={submitting} data-testid="submit-exam-btn">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('save')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><FileText className="w-5 h-5 text-primary" /></div><div><p className="text-2xl font-bold">{exams.length}</p><p className="text-sm text-muted-foreground">{language === 'ar' ? 'إجمالي الاختبارات' : 'Total Exams'}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><Calendar className="w-5 h-5 text-amber-500" /></div><div><p className="text-2xl font-bold">{exams.filter(e => e.exam_type === 'midterm').length}</p><p className="text-sm text-muted-foreground">{language === 'ar' ? 'منتصف الفصل' : 'Midterms'}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center"><FileText className="w-5 h-5 text-destructive" /></div><div><p className="text-2xl font-bold">{exams.filter(e => e.exam_type === 'final').length}</p><p className="text-sm text-muted-foreground">{language === 'ar' ? 'نهائية' : 'Finals'}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><Clock className="w-5 h-5 text-blue-500" /></div><div><p className="text-2xl font-bold">{exams.filter(e => e.exam_type === 'quiz').length}</p><p className="text-sm text-muted-foreground">{language === 'ar' ? 'اختبارات قصيرة' : 'Quizzes'}</p></div></div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'ar' ? 'الاختبار' : 'Exam'}</TableHead>
                <TableHead>{language === 'ar' ? 'النوع' : 'Type'}</TableHead>
                <TableHead>{language === 'ar' ? 'المادة' : 'Subject'}</TableHead>
                <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                <TableHead>{language === 'ar' ? 'الدرجة' : 'Score'}</TableHead>
                <TableHead className="text-end">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.length > 0 ? exams.map((exam) => {
                const subject = subjects.find(s => s.subject_id === exam.subject_id);
                const typeBadge = getExamTypeBadge(exam.exam_type);
                return (
                  <TableRow key={exam.exam_id} data-testid={`exam-row-${exam.exam_id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><FileText className="w-5 h-5 text-primary" /></div>
                        <div><p className="font-medium">{exam.name_ar || exam.name}</p><p className="text-sm text-muted-foreground">{exam.duration_minutes} {language === 'ar' ? 'دقيقة' : 'min'}</p></div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={typeBadge.variant}>{typeBadge.label}</Badge></TableCell>
                    <TableCell>{subject?.name_ar || subject?.name || '-'}</TableCell>
                    <TableCell>{exam.date}</TableCell>
                    <TableCell>{exam.max_score}</TableCell>
                    <TableCell className="text-end">
                      <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t('no_data')}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
