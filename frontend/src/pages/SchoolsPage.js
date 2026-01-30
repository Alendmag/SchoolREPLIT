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
  Building2, 
  Plus, 
  Search,
  Eye,
  Loader2,
  Key,
  Users,
  GraduationCap,
  Edit,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function SchoolsPage() {
  const { api } = useAuth();
  const { t, language } = useLanguage();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    email: '',
    phone: '',
    address: '',
    address_ar: '',
    academic_system: 'semester',
    admin_name: '',
    admin_email: '',
    admin_password: '',
  });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await api.get('/schools/');
      setSchools(response.data);
    } catch (error) {
      console.error('Fetch schools error:', error);
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/schools', formData);
      toast.success(language === 'ar' ? 'تم إضافة المدرسة بنجاح' : 'School added successfully');
      setDialogOpen(false);
      fetchSchools();
      setFormData({
        name: '',
        name_ar: '',
        email: '',
        phone: '',
        address: '',
        address_ar: '',
        academic_system: 'semester',
        admin_name: '',
        admin_email: '',
        admin_password: '',
      });
    } catch (error) {
      console.error('Add school error:', error);
      toast.error(error.response?.data?.detail || t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: { variant: 'default', label: t('active') },
      pending: { variant: 'outline', label: t('pending') },
      suspended: { variant: 'destructive', label: language === 'ar' ? 'معلق' : 'Suspended' },
      expired: { variant: 'secondary', label: language === 'ar' ? 'منتهي' : 'Expired' },
    };
    return variants[status] || variants.pending;
  };

  const filteredSchools = schools.filter(school => 
    school.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.name_ar?.includes(searchTerm) ||
    school.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="schools-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">{t('schools')}</h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ar' 
              ? `إدارة المدارس المسجلة (${schools.length} مدرسة)`
              : `Manage registered schools (${schools.length} schools)`}
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-school-btn">
              <Plus className="w-4 h-4 me-2" />
              {t('add_school')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('add_school')}</DialogTitle>
              <DialogDescription>
                {language === 'ar' ? 'أدخل بيانات المدرسة الجديدة' : 'Enter new school information'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'اسم المدرسة بالعربية' : 'School Name (Arabic)'}</Label>
                  <Input
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    required
                    data-testid="school-name-ar-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'اسم المدرسة بالإنجليزية' : 'School Name (English)'}</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="school-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('email')}</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    data-testid="school-email-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    data-testid="school-phone-input"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>{language === 'ar' ? 'العنوان بالعربية' : 'Address (Arabic)'}</Label>
                  <Input
                    value={formData.address_ar}
                    onChange={(e) => setFormData({ ...formData, address_ar: e.target.value })}
                    data-testid="school-address-ar-input"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>{language === 'ar' ? 'العنوان بالإنجليزية' : 'Address (English)'}</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    data-testid="school-address-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('academic_system')}</Label>
                  <Select
                    value={formData.academic_system}
                    onValueChange={(value) => setFormData({ ...formData, academic_system: value })}
                  >
                    <SelectTrigger data-testid="school-system-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semester">{t('semester')}</SelectItem>
                      <SelectItem value="trimester">{t('trimester')}</SelectItem>
                      <SelectItem value="quarter">{t('quarter')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2 pt-4 border-t">
                  <p className="font-medium mb-4">{language === 'ar' ? 'بيانات مدير المدرسة' : 'School Admin Details'}</p>
                </div>

                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'اسم المدير' : 'Admin Name'}</Label>
                  <Input
                    value={formData.admin_name}
                    onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                    required
                    data-testid="admin-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'بريد المدير' : 'Admin Email'}</Label>
                  <Input
                    type="email"
                    value={formData.admin_email}
                    onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                    required
                    data-testid="admin-email-input"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>{language === 'ar' ? 'كلمة مرور المدير' : 'Admin Password'}</Label>
                  <Input
                    type="password"
                    value={formData.admin_password}
                    onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                    required
                    minLength={6}
                    data-testid="admin-password-input"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={submitting} data-testid="submit-school-btn">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('save')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={language === 'ar' ? 'بحث عن مدرسة...' : 'Search schools...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ps-10"
              data-testid="search-schools-input"
            />
          </div>
        </CardContent>
      </Card>

      {/* Schools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchools.length > 0 ? (
          filteredSchools.map((school) => {
            const statusBadge = getStatusBadge(school.license_status);
            
            return (
              <Card key={school.school_id} className="hover:shadow-lg transition-shadow" data-testid={`school-card-${school.school_id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{school.name_ar || school.name}</CardTitle>
                        <CardDescription>{school.email}</CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem data-testid={`view-school-${school.school_id}`}>
                          <Eye className="w-4 h-4 me-2" />
                          {t('view_all')}
                        </DropdownMenuItem>
                        <DropdownMenuItem data-testid={`edit-school-${school.school_id}`}>
                          <Edit className="w-4 h-4 me-2" />
                          {t('edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem data-testid={`manage-license-${school.school_id}`}>
                          <Key className="w-4 h-4 me-2" />
                          {t('licenses')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t('status')}</span>
                      <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t('students')}</span>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{school.student_count || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t('teachers')}</span>
                      <div className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{school.teacher_count || 0}</span>
                      </div>
                    </div>
                    {school.license_expires_at && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t('expires_at')}</span>
                        <span className="text-sm">{new Date(school.license_expires_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            {t('no_data')}
          </div>
        )}
      </div>
    </div>
  );
}
