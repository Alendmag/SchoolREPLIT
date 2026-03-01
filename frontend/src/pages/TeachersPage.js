import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Checkbox } from '../components/ui/checkbox';
import { GraduationCap, Plus, Search, Edit, Trash2, Loader2, BookOpen, Users, Phone, Mail, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function TeachersPage() {
  const { api, user } = useAuth();
  const { t, language } = useLanguage();
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', name_ar: '', email: '', phone: '', specialization: '', qualification: '', hire_date: '', password: '',
    subject_ids: [], section_ids: [], grade_ids: []
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [teachersRes, subjectsRes, sectionsRes, gradesRes] = await Promise.all([
        api.get('/teachers/'),
        api.get('/academic/subjects/'),
        api.get('/sections/'),
        api.get('/academic/grades/')
      ]);
      setTeachers(teachersRes.data || []);
      setSubjects(subjectsRes.data || []);
      setSections(sectionsRes.data || []);
      setGrades(gradesRes.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/teachers/', { ...formData, school_id: user.school_id });
      toast.success(language === 'ar' ? 'تم إضافة المعلم بنجاح' : 'Teacher added successfully');
      setDialogOpen(false);
      fetchData();
      resetForm();
    } catch (error) {
      const errMsg = error.response?.data?.detail;
      toast.error(typeof errMsg === 'string' ? errMsg : (language === 'ar' ? 'حدث خطأ' : 'Error'));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', name_ar: '', email: '', phone: '', specialization: '', qualification: '', hire_date: '', password: '', subject_ids: [], section_ids: [], grade_ids: [] });
  };

  const handleDelete = async (teacherId) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure?')) return;
    try {
      await api.delete(`/teachers/${teacherId}`);
      toast.success(language === 'ar' ? 'تم الحذف' : 'Deleted');
      fetchData();
    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ' : 'Error');
    }
  };

  const toggleArrayItem = (arr, item) => arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];

  const filteredTeachers = teachers.filter(t => 
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.name_ar?.includes(searchTerm) ||
    t.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 animate-fade-in" data-testid="teachers-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">{t('teachers')}</h1>
          <p className="text-muted-foreground mt-1">{language === 'ar' ? `إدارة المعلمين (${teachers.length} معلم)` : `Manage teachers (${teachers.length})`}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-teacher-btn"><Plus className="w-4 h-4 me-2" />{t('add_teacher')}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('add_teacher')}</DialogTitle>
              <DialogDescription>{language === 'ar' ? 'أدخل بيانات المعلم الجديد' : 'Enter new teacher information'}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6 py-4">
                {/* Basic Info */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><GraduationCap className="w-4 h-4" />{language === 'ar' ? 'البيانات الأساسية' : 'Basic Info'}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'}</Label>
                      <Input value={formData.name_ar} onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الاسم بالإنجليزية' : 'English Name'}</Label>
                      <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('email')}</Label>
                      <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</Label>
                      <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('specialization')}</Label>
                      <Input value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} placeholder={language === 'ar' ? 'الرياضيات' : 'Mathematics'} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('password')}</Label>
                      <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength={6} />
                    </div>
                  </div>
                </div>

                {/* Subjects Assignment */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4" />{language === 'ar' ? 'المواد الدراسية' : 'Subjects'}</h3>
                  <div className="grid grid-cols-3 gap-2 p-3 bg-muted/50 rounded-lg max-h-32 overflow-y-auto">
                    {subjects.length > 0 ? subjects.map((subject) => (
                      <div key={subject.subject_id} className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Checkbox 
                          id={`subject-${subject.subject_id}`}
                          checked={formData.subject_ids.includes(subject.subject_id)}
                          onCheckedChange={() => setFormData({ ...formData, subject_ids: toggleArrayItem(formData.subject_ids, subject.subject_id) })}
                        />
                        <label htmlFor={`subject-${subject.subject_id}`} className="text-sm cursor-pointer">{subject.name_ar || subject.name}</label>
                      </div>
                    )) : <p className="text-muted-foreground text-sm col-span-3">{language === 'ar' ? 'لا توجد مواد' : 'No subjects'}</p>}
                  </div>
                </div>

                {/* Grades Assignment */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><GraduationCap className="w-4 h-4" />{language === 'ar' ? 'الصفوف' : 'Grades'}</h3>
                  <div className="grid grid-cols-3 gap-2 p-3 bg-muted/50 rounded-lg max-h-32 overflow-y-auto">
                    {grades.length > 0 ? grades.map((grade) => (
                      <div key={grade.grade_id} className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Checkbox 
                          id={`grade-${grade.grade_id}`}
                          checked={formData.grade_ids.includes(grade.grade_id)}
                          onCheckedChange={() => setFormData({ ...formData, grade_ids: toggleArrayItem(formData.grade_ids, grade.grade_id) })}
                        />
                        <label htmlFor={`grade-${grade.grade_id}`} className="text-sm cursor-pointer">{grade.name_ar || grade.name}</label>
                      </div>
                    )) : <p className="text-muted-foreground text-sm col-span-3">{language === 'ar' ? 'لا توجد صفوف' : 'No grades'}</p>}
                  </div>
                </div>

                {/* Sections Assignment */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><Users className="w-4 h-4" />{language === 'ar' ? 'الشُعب' : 'Sections'}</h3>
                  <div className="grid grid-cols-3 gap-2 p-3 bg-muted/50 rounded-lg max-h-32 overflow-y-auto">
                    {sections.length > 0 ? sections.map((section) => (
                      <div key={section.section_id} className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Checkbox 
                          id={`section-${section.section_id}`}
                          checked={formData.section_ids.includes(section.section_id)}
                          onCheckedChange={() => setFormData({ ...formData, section_ids: toggleArrayItem(formData.section_ids, section.section_id) })}
                        />
                        <label htmlFor={`section-${section.section_id}`} className="text-sm cursor-pointer">{section.name_ar || section.name}</label>
                      </div>
                    )) : <p className="text-muted-foreground text-sm col-span-3">{language === 'ar' ? 'لا توجد شعب' : 'No sections'}</p>}
                  </div>
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><GraduationCap className="w-6 h-6 text-primary" /></div><div><p className="text-2xl font-bold">{teachers.length}</p><p className="text-sm text-muted-foreground">{language === 'ar' ? 'إجمالي المعلمين' : 'Total Teachers'}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center"><GraduationCap className="w-6 h-6 text-green-500" /></div><div><p className="text-2xl font-bold">{teachers.filter(t => t.status === 'active').length}</p><p className="text-sm text-muted-foreground">{language === 'ar' ? 'نشط' : 'Active'}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center"><BookOpen className="w-6 h-6 text-blue-500" /></div><div><p className="text-2xl font-bold">{subjects.length}</p><p className="text-sm text-muted-foreground">{language === 'ar' ? 'المواد' : 'Subjects'}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center"><Users className="w-6 h-6 text-amber-500" /></div><div><p className="text-2xl font-bold">{sections.length}</p><p className="text-sm text-muted-foreground">{language === 'ar' ? 'الشُعب' : 'Sections'}</p></div></div></CardContent></Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={language === 'ar' ? 'بحث...' : 'Search...'} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="ps-10" />
          </div>
        </CardContent>
      </Card>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.length > 0 ? filteredTeachers.map((teacher) => (
          <Card key={teacher.teacher_id} className="group hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-xl font-bold text-primary">
                    {(teacher.name_ar || teacher.name || '?').charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{teacher.name_ar || teacher.name}</h3>
                    <p className="text-sm text-muted-foreground">{teacher.specialization || (language === 'ar' ? 'غير محدد' : 'Not specified')}</p>
                    <Badge variant={teacher.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                      {teacher.status === 'active' ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Edit className="w-4 h-4 me-2" />{language === 'ar' ? 'تعديل' : 'Edit'}</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(teacher.teacher_id)}><Trash2 className="w-4 h-4 me-2" />{language === 'ar' ? 'حذف' : 'Delete'}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                {teacher.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4" />{teacher.email}</div>}
                {teacher.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4" />{teacher.phone}</div>}
              </div>
              {teacher.subject_ids?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {teacher.subject_ids.slice(0, 3).map((sid) => {
                    const subj = subjects.find(s => s.subject_id === sid);
                    return subj ? <Badge key={sid} variant="outline" className="text-xs">{subj.name_ar || subj.name}</Badge> : null;
                  })}
                  {teacher.subject_ids.length > 3 && <Badge variant="outline" className="text-xs">+{teacher.subject_ids.length - 3}</Badge>}
                </div>
              )}
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-3 text-center py-12 text-muted-foreground">
            <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{language === 'ar' ? 'لا يوجد معلمون' : 'No teachers found'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
