import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { 
  Layers, 
  Plus, 
  Edit,
  Trash2,
  Loader2,
  Users,
  BookOpen,
  School,
  FolderTree,
} from 'lucide-react';
import { toast } from 'sonner';

export default function GradesPage() {
  const { api, user } = useAuth();
  const { t, language } = useLanguage();
  const [levels, setLevels] = useState([]);
  const [grades, setGrades] = useState([]);
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('levels');
  
  // Dialogs
  const [levelDialogOpen, setLevelDialogOpen] = useState(false);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [levelForm, setLevelForm] = useState({ name: '', name_ar: '', order: 1, description: '' });
  const [gradeForm, setGradeForm] = useState({ name: '', name_ar: '', level: 1, level_id: '', description: '' });
  const [sectionForm, setSectionForm] = useState({ name: '', name_ar: '', grade_id: '', capacity: 30, homeroom_teacher_id: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [levelsRes, gradesRes, sectionsRes, teachersRes] = await Promise.all([
        api.get('/levels/').catch(() => ({ data: [] })),
        api.get('/academic/grades/'),
        api.get('/sections/').catch(() => ({ data: [] })),
        api.get('/teachers/')
      ]);
      setLevels(levelsRes.data);
      setGrades(gradesRes.data);
      setSections(sectionsRes.data);
      setTeachers(teachersRes.data);
    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  // Level handlers
  const handleCreateLevel = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/levels/', { ...levelForm, school_id: user.school_id });
      toast.success(language === 'ar' ? 'تم إنشاء المرحلة بنجاح' : 'Level created successfully');
      setLevelDialogOpen(false);
      setLevelForm({ name: '', name_ar: '', order: 1, description: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  // Grade handlers
  const handleCreateGrade = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/academic/grades/', { ...gradeForm, school_id: user.school_id });
      toast.success(language === 'ar' ? 'تم إنشاء الصف بنجاح' : 'Grade created successfully');
      setGradeDialogOpen(false);
      setGradeForm({ name: '', name_ar: '', level: 1, level_id: '', description: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  // Section handlers
  const handleCreateSection = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/sections/', { ...sectionForm, school_id: user.school_id });
      toast.success(language === 'ar' ? 'تم إنشاء الشعبة بنجاح' : 'Section created successfully');
      setSectionDialogOpen(false);
      setSectionForm({ name: '', name_ar: '', grade_id: '', capacity: 30, homeroom_teacher_id: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGrade = async (gradeId) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا الصف؟' : 'Are you sure?')) return;
    try {
      await api.delete(`/academic/grades/${gradeId}`);
      toast.success(language === 'ar' ? 'تم الحذف بنجاح' : 'Deleted successfully');
      fetchData();
    } catch (error) {
      toast.error(t('error'));
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الشعبة؟' : 'Are you sure?')) return;
    try {
      await api.delete(`/sections/${sectionId}`);
      toast.success(language === 'ar' ? 'تم الحذف بنجاح' : 'Deleted successfully');
      fetchData();
    } catch (error) {
      toast.error(t('error'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="grades-page">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold">{language === 'ar' ? 'الهيكل الأكاديمي' : 'Academic Structure'}</h1>
        <p className="text-muted-foreground mt-1">
          {language === 'ar' 
            ? 'إدارة المراحل والصفوف والشُعب الدراسية'
            : 'Manage academic levels, grades, and sections'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{language === 'ar' ? 'المراحل' : 'Levels'}</p>
                <p className="text-2xl font-bold mt-1">{levels.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FolderTree className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الصفوف' : 'Grades'}</p>
                <p className="text-2xl font-bold mt-1">{grades.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Layers className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الشُعب' : 'Sections'}</p>
                <p className="text-2xl font-bold mt-1">{sections.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <School className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="levels" data-testid="levels-tab">
            {language === 'ar' ? 'المراحل الدراسية' : 'Academic Levels'}
          </TabsTrigger>
          <TabsTrigger value="grades" data-testid="grades-tab">
            {language === 'ar' ? 'الصفوف' : 'Grades'}
          </TabsTrigger>
          <TabsTrigger value="sections" data-testid="sections-tab">
            {language === 'ar' ? 'الشُعب' : 'Sections'}
          </TabsTrigger>
        </TabsList>

        {/* Levels Tab */}
        <TabsContent value="levels">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{language === 'ar' ? 'المراحل الدراسية' : 'Academic Levels'}</CardTitle>
                <CardDescription>
                  {language === 'ar' ? 'ابتدائي، إعدادي، ثانوي' : 'Primary, Middle, High School'}
                </CardDescription>
              </div>
              <Dialog open={levelDialogOpen} onOpenChange={setLevelDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" data-testid="add-level-btn">
                    <Plus className="w-4 h-4 me-2" />
                    {language === 'ar' ? 'إضافة مرحلة' : 'Add Level'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{language === 'ar' ? 'إضافة مرحلة جديدة' : 'Add New Level'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateLevel}>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'}</Label>
                        <Input
                          value={levelForm.name_ar}
                          onChange={(e) => setLevelForm({ ...levelForm, name_ar: e.target.value })}
                          placeholder={language === 'ar' ? 'المرحلة الابتدائية' : 'Primary Stage'}
                          required
                          data-testid="level-name-ar-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'الاسم بالإنجليزية' : 'English Name'}</Label>
                        <Input
                          value={levelForm.name}
                          onChange={(e) => setLevelForm({ ...levelForm, name: e.target.value })}
                          placeholder="Primary"
                          required
                          data-testid="level-name-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'الترتيب' : 'Order'}</Label>
                        <Input
                          type="number"
                          value={levelForm.order}
                          onChange={(e) => setLevelForm({ ...levelForm, order: parseInt(e.target.value) })}
                          min={1}
                          data-testid="level-order-input"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setLevelDialogOpen(false)}>
                        {t('cancel')}
                      </Button>
                      <Button type="submit" disabled={submitting} data-testid="submit-level-btn">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('save')}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'ar' ? 'المرحلة' : 'Level'}</TableHead>
                    <TableHead>{language === 'ar' ? 'الترتيب' : 'Order'}</TableHead>
                    <TableHead>{language === 'ar' ? 'عدد الصفوف' : 'Grades Count'}</TableHead>
                    <TableHead className="text-end">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {levels.length > 0 ? levels.map((level) => (
                    <TableRow key={level.level_id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FolderTree className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{level.name_ar || level.name}</p>
                            <p className="text-sm text-muted-foreground">{level.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{level.order}</TableCell>
                      <TableCell>{level.grade_count || 0}</TableCell>
                      <TableCell className="text-end">
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        {t('no_data')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grades Tab */}
        <TabsContent value="grades">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{language === 'ar' ? 'الصفوف الدراسية' : 'Grades'}</CardTitle>
                <CardDescription>
                  {language === 'ar' ? 'الصف الأول، الثاني، الثالث...' : 'First, Second, Third...'}
                </CardDescription>
              </div>
              <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" data-testid="add-grade-btn">
                    <Plus className="w-4 h-4 me-2" />
                    {language === 'ar' ? 'إضافة صف' : 'Add Grade'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{language === 'ar' ? 'إضافة صف جديد' : 'Add New Grade'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateGrade}>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'}</Label>
                        <Input
                          value={gradeForm.name_ar}
                          onChange={(e) => setGradeForm({ ...gradeForm, name_ar: e.target.value })}
                          placeholder={language === 'ar' ? 'الصف الأول' : 'First Grade'}
                          required
                          data-testid="grade-name-ar-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'الاسم بالإنجليزية' : 'English Name'}</Label>
                        <Input
                          value={gradeForm.name}
                          onChange={(e) => setGradeForm({ ...gradeForm, name: e.target.value })}
                          placeholder="Grade 1"
                          required
                          data-testid="grade-name-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'المستوى' : 'Level'}</Label>
                        <Input
                          type="number"
                          value={gradeForm.level}
                          onChange={(e) => setGradeForm({ ...gradeForm, level: parseInt(e.target.value) })}
                          min={1}
                          data-testid="grade-level-input"
                        />
                      </div>
                      {levels.length > 0 && (
                        <div className="space-y-2">
                          <Label>{language === 'ar' ? 'المرحلة' : 'Academic Level'}</Label>
                          <Select
                            value={gradeForm.level_id}
                            onValueChange={(value) => setGradeForm({ ...gradeForm, level_id: value })}
                          >
                            <SelectTrigger data-testid="grade-level-id-select">
                              <SelectValue placeholder={language === 'ar' ? 'اختر المرحلة' : 'Select Level'} />
                            </SelectTrigger>
                            <SelectContent>
                              {levels.map((level) => (
                                <SelectItem key={level.level_id} value={level.level_id}>
                                  {level.name_ar || level.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setGradeDialogOpen(false)}>
                        {t('cancel')}
                      </Button>
                      <Button type="submit" disabled={submitting} data-testid="submit-grade-btn">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('save')}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'ar' ? 'الصف' : 'Grade'}</TableHead>
                    <TableHead>{language === 'ar' ? 'المستوى' : 'Level'}</TableHead>
                    <TableHead>{language === 'ar' ? 'عدد الطلاب' : 'Students'}</TableHead>
                    <TableHead>{language === 'ar' ? 'عدد الشُعب' : 'Sections'}</TableHead>
                    <TableHead className="text-end">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.length > 0 ? grades.map((grade) => (
                    <TableRow key={grade.grade_id} data-testid={`grade-row-${grade.grade_id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Layers className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium">{grade.name_ar || grade.name}</p>
                            <p className="text-sm text-muted-foreground">{grade.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{grade.level}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          <Users className="w-3 h-3 me-1" />
                          {grade.student_count || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>{grade.section_count || 0}</TableCell>
                      <TableCell className="text-end">
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive"
                          onClick={() => handleDeleteGrade(grade.grade_id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {t('no_data')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{language === 'ar' ? 'الشُعب الدراسية' : 'Sections'}</CardTitle>
                <CardDescription>
                  {language === 'ar' ? 'شعبة أ، ب، ج...' : 'Section A, B, C...'}
                </CardDescription>
              </div>
              <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" data-testid="add-section-btn">
                    <Plus className="w-4 h-4 me-2" />
                    {language === 'ar' ? 'إضافة شعبة' : 'Add Section'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{language === 'ar' ? 'إضافة شعبة جديدة' : 'Add New Section'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateSection}>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'}</Label>
                        <Input
                          value={sectionForm.name_ar}
                          onChange={(e) => setSectionForm({ ...sectionForm, name_ar: e.target.value })}
                          placeholder={language === 'ar' ? 'شعبة أ' : 'Section A'}
                          required
                          data-testid="section-name-ar-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'الاسم بالإنجليزية' : 'English Name'}</Label>
                        <Input
                          value={sectionForm.name}
                          onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                          placeholder="A"
                          required
                          data-testid="section-name-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'الصف' : 'Grade'}</Label>
                        <Select
                          value={sectionForm.grade_id}
                          onValueChange={(value) => setSectionForm({ ...sectionForm, grade_id: value })}
                        >
                          <SelectTrigger data-testid="section-grade-select">
                            <SelectValue placeholder={language === 'ar' ? 'اختر الصف' : 'Select Grade'} />
                          </SelectTrigger>
                          <SelectContent>
                            {grades.map((grade) => (
                              <SelectItem key={grade.grade_id} value={grade.grade_id}>
                                {grade.name_ar || grade.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'السعة' : 'Capacity'}</Label>
                        <Input
                          type="number"
                          value={sectionForm.capacity}
                          onChange={(e) => setSectionForm({ ...sectionForm, capacity: parseInt(e.target.value) })}
                          min={1}
                          data-testid="section-capacity-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'مشرف الشعبة' : 'Homeroom Teacher'}</Label>
                        <Select
                          value={sectionForm.homeroom_teacher_id}
                          onValueChange={(value) => setSectionForm({ ...sectionForm, homeroom_teacher_id: value })}
                        >
                          <SelectTrigger data-testid="section-teacher-select">
                            <SelectValue placeholder={language === 'ar' ? 'اختر المعلم' : 'Select Teacher'} />
                          </SelectTrigger>
                          <SelectContent>
                            {teachers.map((teacher) => (
                              <SelectItem key={teacher.teacher_id} value={teacher.teacher_id}>
                                {teacher.name_ar || teacher.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setSectionDialogOpen(false)}>
                        {t('cancel')}
                      </Button>
                      <Button type="submit" disabled={submitting} data-testid="submit-section-btn">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('save')}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'ar' ? 'الشعبة' : 'Section'}</TableHead>
                    <TableHead>{language === 'ar' ? 'الصف' : 'Grade'}</TableHead>
                    <TableHead>{language === 'ar' ? 'السعة' : 'Capacity'}</TableHead>
                    <TableHead>{language === 'ar' ? 'عدد الطلاب' : 'Students'}</TableHead>
                    <TableHead className="text-end">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.length > 0 ? sections.map((section) => {
                    const grade = grades.find(g => g.grade_id === section.grade_id);
                    return (
                      <TableRow key={section.section_id} data-testid={`section-row-${section.section_id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                              <School className="w-5 h-5 text-purple-500" />
                            </div>
                            <div>
                              <p className="font-medium">{section.name_ar || section.name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{grade?.name_ar || grade?.name || '-'}</TableCell>
                        <TableCell>{section.capacity}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            <Users className="w-3 h-3 me-1" />
                            {section.student_count || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-end">
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => handleDeleteSection(section.section_id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {t('no_data')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
