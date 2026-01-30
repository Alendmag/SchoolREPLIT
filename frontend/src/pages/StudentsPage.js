import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
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
  Users, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Loader2,
  UserPlus,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

export default function StudentsPage() {
  const { api, user } = useAuth();
  const { t, language } = useLanguage();
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: 'male',
    national_id: '',
    grade_id: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchGrades();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Fetch students error:', error);
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await api.get('/academic/grades');
      setGrades(response.data);
    } catch (error) {
      console.error('Fetch grades error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/students', {
        ...formData,
        school_id: user.school_id,
      });
      toast.success(language === 'ar' ? 'تم إضافة الطالب بنجاح' : 'Student added successfully');
      setDialogOpen(false);
      fetchStudents();
      setFormData({
        name: '',
        name_ar: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: 'male',
        national_id: '',
        grade_id: '',
        password: '',
      });
    } catch (error) {
      console.error('Add student error:', error);
      toast.error(error.response?.data?.detail || t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا الطالب؟' : 'Are you sure you want to delete this student?')) {
      return;
    }

    try {
      await api.delete(`/students/${studentId}`);
      toast.success(language === 'ar' ? 'تم حذف الطالب بنجاح' : 'Student deleted successfully');
      fetchStudents();
    } catch (error) {
      console.error('Delete student error:', error);
      toast.error(t('error'));
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.name_ar?.includes(searchTerm) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGrade = filterGrade === 'all' || student.grade_id === filterGrade;
    
    return matchesSearch && matchesGrade;
  });

  const getStatusBadge = (status) => {
    const variants = {
      active: { variant: 'default', label: language === 'ar' ? 'نشط' : 'Active' },
      inactive: { variant: 'secondary', label: language === 'ar' ? 'غير نشط' : 'Inactive' },
      graduated: { variant: 'outline', label: language === 'ar' ? 'متخرج' : 'Graduated' },
    };
    return variants[status] || variants.active;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="students-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">{t('students')}</h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ar' 
              ? `إدارة بيانات الطلاب (${students.length} طالب)`
              : `Manage student records (${students.length} students)`}
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-student-btn">
              <Plus className="w-4 h-4 me-2" />
              {t('add_student')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('add_student')}</DialogTitle>
              <DialogDescription>
                {language === 'ar' ? 'أدخل بيانات الطالب الجديد' : 'Enter new student information'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name_ar">{language === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'}</Label>
                  <Input
                    id="name_ar"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    required
                    data-testid="student-name-ar-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">{language === 'ar' ? 'الاسم بالإنجليزية' : 'English Name'}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="student-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    data-testid="student-email-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    data-testid="student-phone-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">{t('date_of_birth')}</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    data-testid="student-dob-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">{t('gender')}</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger data-testid="student-gender-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t('male')}</SelectItem>
                      <SelectItem value="female">{t('female')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="national_id">{t('national_id')}</Label>
                  <Input
                    id="national_id"
                    value={formData.national_id}
                    onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                    data-testid="student-national-id-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade_id">{t('grade_name')}</Label>
                  <Select
                    value={formData.grade_id}
                    onValueChange={(value) => setFormData({ ...formData, grade_id: value })}
                  >
                    <SelectTrigger data-testid="student-grade-select">
                      <SelectValue placeholder={language === 'ar' ? 'اختر الصف' : 'Select grade'} />
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
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="password">{t('password')} ({language === 'ar' ? 'اختياري' : 'optional'})</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={language === 'ar' ? 'لإنشاء حساب للطالب' : 'To create student account'}
                    data-testid="student-password-input"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={submitting} data-testid="submit-student-btn">
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 me-2 animate-spin" />
                      {t('loading')}
                    </>
                  ) : (
                    t('save')
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={language === 'ar' ? 'بحث عن طالب...' : 'Search students...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ps-10"
                data-testid="search-students-input"
              />
            </div>
            <Select value={filterGrade} onValueChange={setFilterGrade}>
              <SelectTrigger className="w-full sm:w-48" data-testid="filter-grade-select">
                <Filter className="w-4 h-4 me-2" />
                <SelectValue placeholder={t('filter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ar' ? 'جميع الصفوف' : 'All Grades'}</SelectItem>
                {grades.map((grade) => (
                  <SelectItem key={grade.grade_id} value={grade.grade_id}>
                    {grade.name_ar || grade.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" data-testid="export-students-btn">
              <Download className="w-4 h-4 me-2" />
              {t('export')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('student_name')}</TableHead>
                <TableHead>{t('email')}</TableHead>
                <TableHead>{t('grade_name')}</TableHead>
                <TableHead>{t('gender')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead className="text-end">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const grade = grades.find(g => g.grade_id === student.grade_id);
                  const statusBadge = getStatusBadge(student.status);
                  
                  return (
                    <TableRow key={student.student_id} data-testid={`student-row-${student.student_id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{student.name_ar || student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.student_id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{student.email || '-'}</TableCell>
                      <TableCell>{grade?.name_ar || grade?.name || '-'}</TableCell>
                      <TableCell>
                        {student.gender === 'male' ? t('male') : t('female')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      </TableCell>
                      <TableCell className="text-end">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" data-testid={`view-student-${student.student_id}`}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" data-testid={`edit-student-${student.student_id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => handleDelete(student.student_id)}
                            data-testid={`delete-student-${student.student_id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {t('no_data')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
