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
  Key, 
  Plus, 
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';

export default function LicensesPage() {
  const { api } = useAuth();
  const { t, language } = useLanguage();
  const [licenses, setLicenses] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    school_id: '',
    license_type: 'monthly',
    max_students: '500',
    max_teachers: '50',
    duration_days: '30',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [licensesRes, schoolsRes] = await Promise.all([
        api.get('/licenses'),
        api.get('/schools'),
      ]);
      setLicenses(licensesRes.data);
      setSchools(schoolsRes.data);
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
      await api.post('/licenses', {
        school_id: formData.school_id,
        license_type: formData.license_type,
        max_students: parseInt(formData.max_students),
        max_teachers: parseInt(formData.max_teachers),
        duration_days: parseInt(formData.duration_days),
        features: [],
      });
      toast.success(language === 'ar' ? 'تم إنشاء الترخيص بنجاح' : 'License created successfully');
      setDialogOpen(false);
      fetchData();
      setFormData({
        school_id: '',
        license_type: 'monthly',
        max_students: '500',
        max_teachers: '50',
        duration_days: '30',
      });
    } catch (error) {
      console.error('Create license error:', error);
      toast.error(error.response?.data?.detail || t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivate = async (licenseId) => {
    try {
      await api.post(`/licenses/${licenseId}/activate`, null, {
        params: { duration_days: 30 }
      });
      toast.success(language === 'ar' ? 'تم تفعيل الترخيص' : 'License activated');
      fetchData();
    } catch (error) {
      toast.error(t('error'));
    }
  };

  const handleSuspend = async (licenseId) => {
    try {
      await api.post(`/licenses/${licenseId}/suspend`);
      toast.success(language === 'ar' ? 'تم تعليق الترخيص' : 'License suspended');
      fetchData();
    } catch (error) {
      toast.error(t('error'));
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(language === 'ar' ? 'تم النسخ' : 'Copied');
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: { variant: 'default', label: t('active'), icon: CheckCircle, color: 'text-success' },
      pending: { variant: 'outline', label: t('pending'), icon: Clock, color: 'text-muted-foreground' },
      expired: { variant: 'secondary', label: language === 'ar' ? 'منتهي' : 'Expired', icon: XCircle, color: 'text-muted-foreground' },
      suspended: { variant: 'destructive', label: language === 'ar' ? 'معلق' : 'Suspended', icon: AlertTriangle, color: 'text-destructive' },
      grace_period: { variant: 'outline', label: t('grace_period'), icon: Clock, color: 'text-amber-500' },
    };
    return variants[status] || variants.pending;
  };

  const getTypeBadge = (type) => {
    const variants = {
      monthly: { label: t('monthly'), color: 'bg-blue-500/10 text-blue-500' },
      yearly: { label: t('yearly'), color: 'bg-purple-500/10 text-purple-500' },
      lifetime: { label: t('lifetime'), color: 'bg-amber-500/10 text-amber-500' },
    };
    return variants[type] || variants.monthly;
  };

  const filteredLicenses = licenses.filter(license => {
    const school = schools.find(s => s.school_id === license.school_id);
    return (
      license.license_key?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school?.name_ar?.includes(searchTerm)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="licenses-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">{t('licenses')}</h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ar' 
              ? `إدارة تراخيص المدارس (${licenses.length} ترخيص)`
              : `Manage school licenses (${licenses.length} licenses)`}
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-license-btn">
              <Plus className="w-4 h-4 me-2" />
              {language === 'ar' ? 'إنشاء ترخيص' : 'Create License'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{language === 'ar' ? 'إنشاء ترخيص جديد' : 'Create New License'}</DialogTitle>
              <DialogDescription>
                {language === 'ar' ? 'حدد المدرسة ونوع الترخيص' : 'Select school and license type'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{t('school_name')}</Label>
                  <Select
                    value={formData.school_id}
                    onValueChange={(value) => setFormData({ ...formData, school_id: value })}
                  >
                    <SelectTrigger data-testid="license-school-select">
                      <SelectValue placeholder={language === 'ar' ? 'اختر مدرسة' : 'Select school'} />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map((school) => (
                        <SelectItem key={school.school_id} value={school.school_id}>
                          {school.name_ar || school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('license_type')}</Label>
                  <Select
                    value={formData.license_type}
                    onValueChange={(value) => setFormData({ ...formData, license_type: value })}
                  >
                    <SelectTrigger data-testid="license-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">{t('monthly')}</SelectItem>
                      <SelectItem value="yearly">{t('yearly')}</SelectItem>
                      <SelectItem value="lifetime">{t('lifetime')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الحد الأقصى للطلاب' : 'Max Students'}</Label>
                    <Input
                      type="number"
                      value={formData.max_students}
                      onChange={(e) => setFormData({ ...formData, max_students: e.target.value })}
                      data-testid="license-max-students-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الحد الأقصى للمعلمين' : 'Max Teachers'}</Label>
                    <Input
                      type="number"
                      value={formData.max_teachers}
                      onChange={(e) => setFormData({ ...formData, max_teachers: e.target.value })}
                      data-testid="license-max-teachers-input"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'مدة الترخيص (أيام)' : 'Duration (days)'}</Label>
                  <Input
                    type="number"
                    value={formData.duration_days}
                    onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                    data-testid="license-duration-input"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={submitting} data-testid="submit-license-btn">
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
              placeholder={language === 'ar' ? 'بحث عن ترخيص...' : 'Search licenses...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ps-10"
              data-testid="search-licenses-input"
            />
          </div>
        </CardContent>
      </Card>

      {/* Licenses Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('license_key')}</TableHead>
                <TableHead>{t('school_name')}</TableHead>
                <TableHead>{t('license_type')}</TableHead>
                <TableHead>{language === 'ar' ? 'الحدود' : 'Limits'}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead>{t('expires_at')}</TableHead>
                <TableHead className="text-end">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLicenses.length > 0 ? (
                filteredLicenses.map((license) => {
                  const school = schools.find(s => s.school_id === license.school_id);
                  const statusBadge = getStatusBadge(license.status);
                  const typeBadge = getTypeBadge(license.license_type);
                  
                  return (
                    <TableRow key={license.license_id} data-testid={`license-row-${license.license_id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {license.license_key}
                          </code>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(license.license_key)}
                            data-testid={`copy-license-${license.license_id}`}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Key className="w-4 h-4 text-muted-foreground" />
                          <span>{school?.name_ar || school?.name || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${typeBadge.color}`}>
                          {typeBadge.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{license.max_students} {language === 'ar' ? 'طالب' : 'students'}</p>
                          <p className="text-muted-foreground">{license.max_teachers} {language === 'ar' ? 'معلم' : 'teachers'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadge.variant} className="gap-1">
                          <statusBadge.icon className={`w-3 h-3 ${statusBadge.color}`} />
                          {statusBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {license.expires_at 
                          ? new Date(license.expires_at).toLocaleDateString() 
                          : (license.license_type === 'lifetime' ? (language === 'ar' ? 'غير محدود' : 'Unlimited') : '-')}
                      </TableCell>
                      <TableCell className="text-end">
                        <div className="flex items-center justify-end gap-2">
                          {license.status === 'pending' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleActivate(license.license_id)}
                              data-testid={`activate-license-${license.license_id}`}
                            >
                              <Play className="w-4 h-4 me-1" />
                              {t('activate')}
                            </Button>
                          )}
                          {license.status === 'active' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-destructive"
                              onClick={() => handleSuspend(license.license_id)}
                              data-testid={`suspend-license-${license.license_id}`}
                            >
                              <Pause className="w-4 h-4 me-1" />
                              {t('suspend')}
                            </Button>
                          )}
                          {(license.status === 'expired' || license.status === 'suspended') && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleActivate(license.license_id)}
                              data-testid={`renew-license-${license.license_id}`}
                            >
                              <RefreshCw className="w-4 h-4 me-1" />
                              {t('renew')}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
