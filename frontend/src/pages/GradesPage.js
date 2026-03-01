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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { Layers, Plus, Edit, Trash2, Loader2, Search, Users, GraduationCap, BookOpen, Clock, MoreVertical, Building } from 'lucide-react';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';

const SUBJECT_ICONS = ['📐', '📖', '🔬', '🧪', '🌍', '💻', '🎨', '⚽', '🎵', '📊'];

export default function GradesPage() {
  const { api, user } = useAuth();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('levels');
  const [loading, setLoading] = useState(true);
  const [levels, setLevels] = useState([]);
  const [grades, setGrades] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    try {
      const [levelsRes, gradesRes, sectionsRes, subjectsRes] = await Promise.all([
        api.get('/levels/').catch(() => ({ data: [] })),
        api.get('/academic/grades/').catch(() => ({ data: [] })),
        api.get('/sections/').catch(() => ({ data: [] })),
        api.get('/academic/subjects/').catch(() => ({ data: [] }))
      ]);
      setLevels(levelsRes.data || []);
      setGrades(gradesRes.data || []);
      setSections(sectionsRes.data || []);
      setSubjects(subjectsRes.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (type, data = null) => {
    setDialogType(type);
    if (data) {
      setFormData(data);
    } else {
      setFormData(type === 'subject' ? { name: '', name_ar: '', code: '', credits: 1, icon: '📐' } : { name: '', name_ar: '', description: '' });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoints = { level: '/levels/', grade: '/academic/grades/', section: '/sections/', subject: '/academic/subjects/' };
      await api.post(endpoints[dialogType], { ...formData, school_id: user.school_id });
      toast.success(language === 'ar' ? 'تم الإضافة بنجاح' : 'Added successfully');
      setDialogOpen(false);
      setFormData({});
      fetchAllData();
    } catch (error) {
      const errMsg = error.response?.data?.detail;
      toast.error(typeof errMsg === 'string' ? errMsg : (language === 'ar' ? 'حدث خطأ' : 'Error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure?')) return;
    try {
      const endpoints = { level: `/levels/${id}`, grade: `/academic/grades/${id}`, section: `/sections/${id}`, subject: `/academic/subjects/${id}` };
      await api.delete(endpoints[type]);
      toast.success(language === 'ar' ? 'تم الحذف' : 'Deleted');
      fetchAllData();
    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ' : 'Error');
    }
  };

  const filterData = (data) => data.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name_ar?.includes(searchTerm) ||
    item.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const stats = [
    { label: language === 'ar' ? 'المراحل' : 'Levels', value: levels.length, icon: Building, color: 'bg-blue-500' },
    { label: language === 'ar' ? 'الصفوف' : 'Grades', value: grades.length, icon: Layers, color: 'bg-emerald-500' },
    { label: language === 'ar' ? 'الشُعب' : 'Sections', value: sections.length, icon: Users, color: 'bg-amber-500' },
    { label: language === 'ar' ? 'المواد' : 'Subjects', value: subjects.length, icon: BookOpen, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6 animate-fade-in" data-testid="grades-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">{language === 'ar' ? 'الفصول والمواد' : 'Classes & Subjects'}</h1>
          <p className="text-muted-foreground mt-1">{language === 'ar' ? 'إدارة المراحل والصفوف والشعب والمواد الدراسية' : 'Manage levels, grades, sections and subjects'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openDialog(activeTab === 'levels' ? 'level' : activeTab === 'grades' ? 'grade' : activeTab === 'sections' ? 'section' : 'subject')}>
            <Plus className="w-4 h-4 me-2" />
            {language === 'ar' ? 'إضافة جديد' : 'Add New'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="cursor-pointer hover:border-primary transition-colors" onClick={() => setActiveTab(['levels', 'grades', 'sections', 'subjects'][i])}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center text-white`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder={language === 'ar' ? 'بحث...' : 'Search...'} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="ps-10" />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="levels"><Building className="w-4 h-4 me-2" />{language === 'ar' ? 'المراحل' : 'Levels'}</TabsTrigger>
          <TabsTrigger value="grades"><Layers className="w-4 h-4 me-2" />{language === 'ar' ? 'الصفوف' : 'Grades'}</TabsTrigger>
          <TabsTrigger value="sections"><Users className="w-4 h-4 me-2" />{language === 'ar' ? 'الشُعب' : 'Sections'}</TabsTrigger>
          <TabsTrigger value="subjects"><BookOpen className="w-4 h-4 me-2" />{language === 'ar' ? 'المواد' : 'Subjects'}</TabsTrigger>
        </TabsList>

        {/* Levels Tab */}
        <TabsContent value="levels" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterData(levels).length > 0 ? filterData(levels).map((level) => (
              <Card key={level.level_id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Building className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{level.name_ar || level.name}</h3>
                        <p className="text-sm text-muted-foreground">{level.name}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Edit className="w-4 h-4 me-2" />{language === 'ar' ? 'تعديل' : 'Edit'}</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete('level', level.level_id)}><Trash2 className="w-4 h-4 me-2" />{language === 'ar' ? 'حذف' : 'Delete'}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Layers className="w-4 h-4" /> {grades.filter(g => g.level_id === level.level_id).length} {language === 'ar' ? 'صف' : 'grades'}</span>
                  </div>
                </CardContent>
              </Card>
            )) : <p className="text-muted-foreground col-span-3 text-center py-8">{language === 'ar' ? 'لا توجد مراحل' : 'No levels'}</p>}
          </div>
        </TabsContent>

        {/* Grades Tab */}
        <TabsContent value="grades" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterData(grades).length > 0 ? filterData(grades).map((grade) => (
              <Card key={grade.grade_id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <Layers className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{grade.name_ar || grade.name}</h3>
                        <p className="text-sm text-muted-foreground">{grade.name}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Edit className="w-4 h-4 me-2" />{language === 'ar' ? 'تعديل' : 'Edit'}</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete('grade', grade.grade_id)}><Trash2 className="w-4 h-4 me-2" />{language === 'ar' ? 'حذف' : 'Delete'}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {sections.filter(s => s.grade_id === grade.grade_id).length} {language === 'ar' ? 'شعبة' : 'sections'}</span>
                  </div>
                </CardContent>
              </Card>
            )) : <p className="text-muted-foreground col-span-3 text-center py-8">{language === 'ar' ? 'لا توجد صفوف' : 'No grades'}</p>}
          </div>
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterData(sections).length > 0 ? filterData(sections).map((section) => {
              const grade = grades.find(g => g.grade_id === section.grade_id);
              return (
                <Card key={section.section_id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                          <Users className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{section.name_ar || section.name}</h3>
                          <p className="text-sm text-muted-foreground">{grade?.name_ar || grade?.name || ''}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Edit className="w-4 h-4 me-2" />{language === 'ar' ? 'تعديل' : 'Edit'}</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete('section', section.section_id)}><Trash2 className="w-4 h-4 me-2" />{language === 'ar' ? 'حذف' : 'Delete'}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><GraduationCap className="w-4 h-4" /> {section.capacity || 30} {language === 'ar' ? 'طالب' : 'students'}</span>
                      {section.teacher_name && <span className="flex items-center gap-1">{language === 'ar' ? 'رائد الفصل:' : 'Leader:'} {section.teacher_name}</span>}
                    </div>
                  </CardContent>
                </Card>
              );
            }) : <p className="text-muted-foreground col-span-3 text-center py-8">{language === 'ar' ? 'لا توجد شعب' : 'No sections'}</p>}
          </div>
        </TabsContent>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filterData(subjects).length > 0 ? filterData(subjects).map((subject) => (
              <Card key={subject.subject_id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-2xl">
                        {subject.icon || '📐'}
                      </div>
                      <div>
                        <h3 className="font-semibold">{subject.name_ar || subject.name}</h3>
                        <Badge variant="outline" className="mt-1">{subject.code || 'N/A'}</Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Edit className="w-4 h-4 me-2" />{language === 'ar' ? 'تعديل المادة' : 'Edit'}</DropdownMenuItem>
                        <DropdownMenuItem><Users className="w-4 h-4 me-2" />{language === 'ar' ? 'تعيين معلمين' : 'Assign Teachers'}</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete('subject', subject.subject_id)}><Trash2 className="w-4 h-4 me-2" />{language === 'ar' ? 'أرشفة' : 'Archive'}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {subject.teacher_count || 0} {language === 'ar' ? 'معلم' : 'teachers'}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {subject.credits || 0} {language === 'ar' ? 'حصة/أسبوع' : 'hrs/week'}</span>
                  </div>
                </CardContent>
              </Card>
            )) : <p className="text-muted-foreground col-span-4 text-center py-8">{language === 'ar' ? 'لا توجد مواد' : 'No subjects'}</p>}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'level' && (language === 'ar' ? 'إضافة مرحلة' : 'Add Level')}
              {dialogType === 'grade' && (language === 'ar' ? 'إضافة صف' : 'Add Grade')}
              {dialogType === 'section' && (language === 'ar' ? 'إضافة شعبة' : 'Add Section')}
              {dialogType === 'subject' && (language === 'ar' ? 'إضافة مادة' : 'Add Subject')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'}</Label>
                  <Input value={formData.name_ar || ''} onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الاسم بالإنجليزية' : 'English Name'}</Label>
                  <Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
              </div>
              {dialogType === 'subject' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الرمز' : 'Code'}</Label>
                      <Input value={formData.code || ''} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="MATH-101" />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الحصص/أسبوع' : 'Hours/Week'}</Label>
                      <Input type="number" min={1} value={formData.credits || 1} onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الأيقونة' : 'Icon'}</Label>
                    <div className="flex gap-2 flex-wrap">
                      {SUBJECT_ICONS.map((icon) => (
                        <button key={icon} type="button" onClick={() => setFormData({ ...formData, icon })} className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center border-2 ${formData.icon === icon ? 'border-primary bg-primary/10' : 'border-muted'}`}>{icon}</button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {dialogType === 'grade' && (
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'المرحلة' : 'Level'}</Label>
                  <Select value={formData.level_id || ''} onValueChange={(v) => setFormData({ ...formData, level_id: v })}>
                    <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'اختر المرحلة' : 'Select Level'} /></SelectTrigger>
                    <SelectContent>{levels.map(l => <SelectItem key={l.level_id} value={l.level_id}>{l.name_ar || l.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              {dialogType === 'section' && (
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الصف' : 'Grade'}</Label>
                  <Select value={formData.grade_id || ''} onValueChange={(v) => setFormData({ ...formData, grade_id: v })}>
                    <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'اختر الصف' : 'Select Grade'} /></SelectTrigger>
                    <SelectContent>{grades.map(g => <SelectItem key={g.grade_id} value={g.grade_id}>{g.name_ar || g.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
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
