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
import { Textarea } from '../components/ui/textarea';
import { BookOpen, Plus, Edit, Trash2, Loader2, Search, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function SubjectsPage() {
  const { api, user } = useAuth();
  const { t, language } = useLanguage();
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', name_ar: '', code: '', credits: 1, description: '', grade_ids: []
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [subjectsRes, gradesRes, teachersRes] = await Promise.all([
        api.get('/academic/subjects/'),
        api.get('/academic/grades/'),
        api.get('/teachers/')
      ]);
      setSubjects(subjectsRes.data);
      setGrades(gradesRes.data);
      setTeachers(teachersRes.data);
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
      await api.post('/academic/subjects/', { ...formData, school_id: user.school_id });
      toast.success(language === 'ar' ? 'تم إضافة المادة بنجاح' : 'Subject added successfully');
      setDialogOpen(false);
      fetchData();
      setFormData({ name: '', name_ar: '', code: '', credits: 1, description: '', grade_ids: [] });
    } catch (error) {
      toast.error(error.response?.data?.detail || t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (subjectId) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?')) return;
    try {
      await api.delete(`/academic/subjects/${subjectId}`);
      toast.success(language === 'ar' ? 'تم الحذف بنجاح' : 'Deleted successfully');
      fetchData();
    } catch (error) {
      toast.error(t('error'));
    }
  };

  const filteredSubjects = subjects.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.name_ar?.includes(searchTerm) ||
    s.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="subjects-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">{t('subjects')}</h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ar' ? `إدارة المواد الدراسية (${subjects.length} مادة)` : `Manage subjects (${subjects.length} subjects)`}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-subject-btn"><Plus className="w-4 h-4 me-2" />{t('add_subject')}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t('add_subject')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'}</Label>
                    <Input value={formData.name_ar} onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })} required data-testid="subject-name-ar" />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الاسم بالإنجليزية' : 'English Name'}</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required data-testid="subject-name" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الرمز' : 'Code'}</Label>
                    <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="MATH101" required data-testid="subject-code" />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الساعات' : 'Credits'}</Label>
                    <Input type="number" min={1} value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })} data-testid="subject-credits" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الوصف' : 'Description'}</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} data-testid="subject-description" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t('cancel')}</Button>
                <Button type="submit" disabled={submitting} data-testid="submit-subject-btn">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('save')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={language === 'ar' ? 'بحث...' : 'Search...'} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="ps-10 max-w-md" data-testid="search-subjects" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('subject_name')}</TableHead>
                <TableHead>{language === 'ar' ? 'الرمز' : 'Code'}</TableHead>
                <TableHead>{language === 'ar' ? 'الساعات' : 'Credits'}</TableHead>
                <TableHead className="text-end">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubjects.length > 0 ? filteredSubjects.map((subject) => (
                <TableRow key={subject.subject_id} data-testid={`subject-row-${subject.subject_id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{subject.name_ar || subject.name}</p>
                        <p className="text-sm text-muted-foreground">{subject.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{subject.code}</Badge></TableCell>
                  <TableCell>{subject.credits}</TableCell>
                  <TableCell className="text-end">
                    <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(subject.subject_id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">{t('no_data')}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
