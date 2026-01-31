import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Activity, User, Clock, Filter, Loader2, Search, FileText, Edit, Trash2, Eye, LogIn, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function ActivityLogPage() {
  const { api, user } = useAuth();
  const { t, language } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ entity_type: 'all', user_id: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchLogs(); }, [filters]);

  const fetchLogs = async () => {
    try {
      let query = '';
      if (filters.entity_type !== 'all') query += `entity_type=${filters.entity_type}&`;
      if (filters.user_id) query += `user_id=${filters.user_id}&`;
      const response = await api.get(`/activity/?${query}`);
      setLogs(response.data);
    } catch (error) {
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      created: <FileText className="w-4 h-4 text-success" />,
      updated: <Edit className="w-4 h-4 text-blue-500" />,
      deleted: <Trash2 className="w-4 h-4 text-destructive" />,
      viewed: <Eye className="w-4 h-4 text-muted-foreground" />,
      login: <LogIn className="w-4 h-4 text-success" />,
      logout: <LogOut className="w-4 h-4 text-amber-500" />,
    };
    return icons[action] || <Activity className="w-4 h-4" />;
  };

  const getActionLabel = (action) => {
    const labels = {
      created: { ar: 'إنشاء', en: 'Created' },
      updated: { ar: 'تحديث', en: 'Updated' },
      deleted: { ar: 'حذف', en: 'Deleted' },
      viewed: { ar: 'عرض', en: 'Viewed' },
      login: { ar: 'دخول', en: 'Login' },
      logout: { ar: 'خروج', en: 'Logout' },
    };
    return labels[action]?.[language] || action;
  };

  const getEntityLabel = (entity) => {
    const labels = {
      student: { ar: 'طالب', en: 'Student' },
      teacher: { ar: 'معلم', en: 'Teacher' },
      grade: { ar: 'صف', en: 'Grade' },
      section: { ar: 'شعبة', en: 'Section' },
      subject: { ar: 'مادة', en: 'Subject' },
      exam: { ar: 'اختبار', en: 'Exam' },
      invoice: { ar: 'فاتورة', en: 'Invoice' },
      settings: { ar: 'إعدادات', en: 'Settings' },
    };
    return labels[entity]?.[language] || entity;
  };

  const filteredLogs = logs.filter(log =>
    log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entity_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="activity-log-page">
      <div>
        <h1 className="font-heading text-3xl font-bold">{language === 'ar' ? 'سجل النشاط' : 'Activity Log'}</h1>
        <p className="text-muted-foreground mt-1">{language === 'ar' ? 'تتبع جميع الأنشطة في النظام' : 'Track all system activities'}</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder={language === 'ar' ? 'بحث...' : 'Search...'} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="ps-10" data-testid="search-logs" />
            </div>
            <Select value={filters.entity_type} onValueChange={(v) => setFilters({ ...filters, entity_type: v })}>
              <SelectTrigger className="w-48" data-testid="entity-filter">
                <Filter className="w-4 h-4 me-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ar' ? 'الكل' : 'All'}</SelectItem>
                <SelectItem value="student">{language === 'ar' ? 'الطلاب' : 'Students'}</SelectItem>
                <SelectItem value="teacher">{language === 'ar' ? 'المعلمين' : 'Teachers'}</SelectItem>
                <SelectItem value="grade">{language === 'ar' ? 'الصفوف' : 'Grades'}</SelectItem>
                <SelectItem value="section">{language === 'ar' ? 'الشعب' : 'Sections'}</SelectItem>
                <SelectItem value="settings">{language === 'ar' ? 'الإعدادات' : 'Settings'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'ar' ? 'المستخدم' : 'User'}</TableHead>
                <TableHead>{language === 'ar' ? 'الإجراء' : 'Action'}</TableHead>
                <TableHead>{language === 'ar' ? 'النوع' : 'Entity'}</TableHead>
                <TableHead>{language === 'ar' ? 'المعرف' : 'ID'}</TableHead>
                <TableHead>{language === 'ar' ? 'الوقت' : 'Time'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                <TableRow key={log.log_id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">{log.user_name || log.user_id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action)}
                      <Badge variant="outline">{getActionLabel(log.action)}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>{getEntityLabel(log.entity_type)}</TableCell>
                  <TableCell><code className="text-xs bg-muted px-1 py-0.5 rounded">{log.entity_id || '-'}</code></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span className="text-sm">{new Date(log.created_at).toLocaleString(language === 'ar' ? 'ar-LY' : 'en-US')}</span>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{t('no_data')}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
