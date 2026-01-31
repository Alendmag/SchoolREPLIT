import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { FileText, Users, DollarSign, UserCheck, Download, Loader2, BarChart3, PieChart, TrendingUp, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsPage() {
  const { api, user } = useAuth();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('attendance');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({ start_date: '', end_date: '', grade_id: '', student_id: '' });

  const generateReport = async (reportType) => {
    setLoading(true);
    try {
      const response = await api.post(`/reports/${reportType}`, { ...filters, school_id: user.school_id });
      setReportData(response.data);
      toast.success(language === 'ar' ? 'تم إنشاء التقرير بنجاح' : 'Report generated successfully');
    } catch (error) {
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!reportData) return;
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportData.report_type}_report.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(language === 'ar' ? 'تم تصدير التقرير' : 'Report exported');
  };

  const reportTypes = [
    { id: 'attendance', icon: UserCheck, label: language === 'ar' ? 'تقرير الحضور' : 'Attendance Report', color: 'text-success' },
    { id: 'grades', icon: BarChart3, label: language === 'ar' ? 'تقرير الدرجات' : 'Grades Report', color: 'text-blue-500' },
    { id: 'finance', icon: DollarSign, label: language === 'ar' ? 'التقرير المالي' : 'Finance Report', color: 'text-amber-500' },
    { id: 'students', icon: Users, label: language === 'ar' ? 'تقرير الطلاب' : 'Students Report', color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6 animate-fade-in" data-testid="reports-page">
      <div>
        <h1 className="font-heading text-3xl font-bold">{t('reports')}</h1>
        <p className="text-muted-foreground mt-1">
          {language === 'ar' ? 'إنشاء وتصدير التقارير المختلفة' : 'Generate and export various reports'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {reportTypes.map((type) => (
          <Card key={type.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => setActiveTab(type.id)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center`}>
                  <type.icon className={`w-5 h-5 ${type.color}`} />
                </div>
                <p className="font-medium text-sm">{type.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{language === 'ar' ? 'فلاتر التقرير' : 'Report Filters'}</CardTitle>
          <CardDescription>{language === 'ar' ? 'حدد نطاق التقرير' : 'Define report scope'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'من تاريخ' : 'From Date'}</Label>
              <Input type="date" value={filters.start_date} onChange={(e) => setFilters({ ...filters, start_date: e.target.value })} data-testid="report-start-date" />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'إلى تاريخ' : 'To Date'}</Label>
              <Input type="date" value={filters.end_date} onChange={(e) => setFilters({ ...filters, end_date: e.target.value })} data-testid="report-end-date" />
            </div>
            <div className="col-span-2 flex items-end gap-2">
              <Button onClick={() => generateReport(activeTab)} disabled={loading} className="flex-1" data-testid="generate-report-btn">
                {loading ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : <FileText className="w-4 h-4 me-2" />}
                {language === 'ar' ? 'إنشاء التقرير' : 'Generate Report'}
              </Button>
              <Button variant="outline" onClick={exportReport} disabled={!reportData} data-testid="export-report-btn">
                <Download className="w-4 h-4 me-2" />
                {language === 'ar' ? 'تصدير' : 'Export'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <Card>
          <CardHeader>
            <CardTitle>{reportData.title_ar || reportData.title}</CardTitle>
            <CardDescription>{language === 'ar' ? 'تم الإنشاء في' : 'Generated at'}: {new Date(reportData.generated_at).toLocaleString(language === 'ar' ? 'ar-LY' : 'en-US')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {Object.entries(reportData.summary || {}).slice(0, 4).map(([key, value]) => (
                <div key={key} className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{key.replace(/_/g, ' ')}</p>
                  <p className="text-2xl font-bold mt-1">{typeof value === 'number' ? value.toLocaleString() : JSON.stringify(value)}</p>
                </div>
              ))}
            </div>
            <div className="border rounded-lg p-4 max-h-96 overflow-auto">
              <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(reportData.data?.slice?.(0, 10) || reportData.data, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
