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
  GraduationCap, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Download,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

export default function TeachersPage() {
  const { api, user } = useAuth();
  const { t, language } = useLanguage();
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    email: '',
    phone: '',
    specialization: '',
    qualification: '',
    hire_date: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teachersRes, subjectsRes] = await Promise.all([
        api.get('/teachers/'),
        api.get('/academic/subjects/')
      ]);
      setTeachers(teachersRes.data);
      setSubjects(subjectsRes.data);
    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/teachers/', {
        ...formData,
        school_id: user.school_id,
      });
      toast.success(language === 'ar' ? 'تم إضافة المعلم بنجاح' : 'Teacher added successfully');
      setDialogOpen(false);
      fetchData();
      setFormData({
        name: '',
        name_ar: '',
        email: '',
        phone: '',
        specialization: '',
        qualification: '',
        hire_date: '',
        password: '',
      });
    } catch (error) {
      console.error('Add teacher error:', error);
      toast.error(error.response?.data?.detail || t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (teacherId) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المعلم؟' : 'Are you sure you want to delete this teacher?')) {
      return;
    }

    try {
      await api.delete(`/teachers/${teacherId}`);
      toast.success(language === 'ar' ? 'تم حذف المعلم بنجاح' : 'Teacher deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Delete teacher error:', error);
      toast.error(t('error'));
    }
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = 
      teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.name_ar?.includes(searchTerm) ||
      teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || teacher.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const variants = {
      active: { variant: 'default', label: language === 'ar' ? 'نشط' : 'Active' },
      inactive: { variant: 'secondary', label: language === 'ar' ? 'غير نشط' : 'Inactive' },
      on_leave: { variant: 'outline', label: language === 'ar' ? 'في إجازة' : 'On Leave' },
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
    <div className="space-y-6 animate-fade-in" data-testid="teachers-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">{t('teachers')}</h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ar' 
              ? `إدارة بيانات المعلمين (${teachers.length} معلم)`
              : `Manage teacher records (${teachers.length} teachers)`}
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-teacher-btn">
              <Plus className="w-4 h-4 me-2" />
              {t('add_teacher')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('add_teacher')}</DialogTitle>
              <DialogDescription>
                {language === 'ar' ? 'أدخل بيانات المعلم الجديد' : 'Enter new teacher information'}
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
                    data-testid="teacher-name-ar-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">{language === 'ar' ? 'الاسم بالإنجليزية' : 'English Name'}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="teacher-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    data-testid="teacher-email-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    data-testid="teacher-phone-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">{t('specialization')}</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder={language === 'ar' ? 'مثال: الرياضيات' : 'e.g., Mathematics'}
                    data-testid="teacher-specialization-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qualification">{t('qualification')}</Label>
                  <Input
                    id="qualification"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder={language === 'ar' ? 'مثال: ماجستير' : 'e.g., Master\'s Degree'}
                    data-testid="teacher-qualification-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hire_date">{t('hire_date')}</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                    data-testid="teacher-hire-date-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t('password')}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                    data-testid="teacher-password-input"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={submitting} data-testid="submit-teacher-btn">
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
                placeholder={language === 'ar' ? 'بحث عن معلم...' : 'Search teachers...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ps-10"
                data-testid="search-teachers-input"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48" data-testid="filter-status-select">
                <Filter className="w-4 h-4 me-2" />
                <SelectValue placeholder={t('filter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ar' ? 'جميع الحالات' : 'All Status'}</SelectItem>
                <SelectItem value="active">{language === 'ar' ? 'نشط' : 'Active'}</SelectItem>
                <SelectItem value="inactive">{language === 'ar' ? 'غير نشط' : 'Inactive'}</SelectItem>
                <SelectItem value="on_leave">{language === 'ar' ? 'في إجازة' : 'On Leave'}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" data-testid="export-teachers-btn">
              <Download className="w-4 h-4 me-2" />
              {t('export')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Teachers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('teacher_name')}</TableHead>
                <TableHead>{t('email')}</TableHead>
                <TableHead>{t('specialization')}</TableHead>
                <TableHead>{t('qualification')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead className="text-end">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => {
                  const statusBadge = getStatusBadge(teacher.status);
                  
                  return (
                    <TableRow key={teacher.teacher_id} data-testid={`teacher-row-${teacher.teacher_id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{teacher.name_ar || teacher.name}</p>
                            <p className="text-sm text-muted-foreground">{teacher.teacher_id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{teacher.email || '-'}</TableCell>
                      <TableCell>{teacher.specialization || '-'}</TableCell>
                      <TableCell>{teacher.qualification || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      </TableCell>
                      <TableCell className="text-end">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" title={language === 'ar' ? 'عرض الجدول' : 'View Schedule'}>
                            <Calendar className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title={language === 'ar' ? 'المواد' : 'Subjects'}>
                            <BookOpen className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" data-testid={`view-teacher-${teacher.teacher_id}`}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" data-testid={`edit-teacher-${teacher.teacher_id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => handleDelete(teacher.teacher_id)}
                            data-testid={`delete-teacher-${teacher.teacher_id}`}
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
