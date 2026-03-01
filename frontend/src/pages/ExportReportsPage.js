import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { FileText, Download, Loader2, Calendar, BarChart3, Users, DollarSign, UserCheck, FileSpreadsheet, Printer } from 'lucide-react';
import { toast } from 'sonner';

export default function ExportReportsPage() {
  const { api, user } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('students');
  const [format, setFormat] = useState('pdf');
  const [filters, setFilters] = useState({ start_date: '', end_date: '', grade_id: '' });
  const [previewData, setPreviewData] = useState(null);

  const reportTypes = [
    { id: 'students', icon: Users, label_ar: 'تقرير الطلاب', label_en: 'Students Report' },
    { id: 'attendance', icon: UserCheck, label_ar: 'تقرير الحضور', label_en: 'Attendance Report' },
    { id: 'grades', icon: BarChart3, label_ar: 'تقرير الدرجات', label_en: 'Grades Report' },
    { id: 'finance', icon: DollarSign, label_ar: 'التقرير المالي', label_en: 'Finance Report' },
  ];

  const generatePreview = async () => {
    setLoading(true);
    try {
      const response = await api.post(`/reports/${reportType}/preview`, { ...filters, school_id: user.school_id });
      setPreviewData(response.data);
      toast.success(language === 'ar' ? 'تم إنشاء المعاينة' : 'Preview generated');
    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ' : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (exportFormat) => {
    setLoading(true);
    try {
      const response = await api.post(`/reports/${reportType}/export`, { ...filters, format: exportFormat, school_id: user.school_id }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report.${exportFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(language === 'ar' ? 'تم تصدير التقرير' : 'Report exported');
    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ في التصدير' : 'Export error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="export-reports-page">
      <div>
        <h1 className="font-heading text-3xl font-bold">{language === 'ar' ? 'تصدير التقارير' : 'Export Reports'}</h1>
        <p className="text-muted-foreground mt-1">{language === 'ar' ? 'تصدير بصيغة PDF أو Excel' : 'Export as PDF or Excel'}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {reportTypes.map((type) => (
          <Card key={type.id} className={`cursor-pointer transition-all ${reportType === type.id ? 'ring-2 ring-primary' : 'hover:border-primary'}`} onClick={() => setReportType(type.id)}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${reportType === type.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <type.icon className="w-5 h-5" />
              </div>
              <span className="font-medium text-sm">{language === 'ar' ? type.label_ar : type.label_en}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>{language === 'ar' ? 'خيارات التقرير' : 'Report Options'}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div><Label>{language === 'ar' ? 'من تاريخ' : 'From'}</Label><Input type="date" value={filters.start_date} onChange={(e) => setFilters({ ...filters, start_date: e.target.value })} /></div>
            <div><Label>{language === 'ar' ? 'إلى تاريخ' : 'To'}</Label><Input type="date" value={filters.end_date} onChange={(e) => setFilters({ ...filters, end_date: e.target.value })} /></div>
            <div><Label>{language === 'ar' ? 'الصيغة' : 'Format'}</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf"><FileText className="w-4 h-4 inline me-2" />PDF</SelectItem>
                  <SelectItem value="xlsx"><FileSpreadsheet className="w-4 h-4 inline me-2" />Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={generatePreview} disabled={loading} className="flex-1">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{language === 'ar' ? 'معاينة' : 'Preview'}</>}</Button>
              <Button onClick={() => exportReport(format)} disabled={loading} variant="default"><Download className="w-4 h-4 me-1" />{language === 'ar' ? 'تصدير' : 'Export'}</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {previewData && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{language === 'ar' ? 'معاينة التقرير' : 'Report Preview'}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="w-4 h-4 me-1" />{language === 'ar' ? 'طباعة' : 'Print'}</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {Object.entries(previewData.summary || {}).slice(0, 4).map(([key, value]) => (
                <div key={key} className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
                  <p className="text-sm text-muted-foreground">{key.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </div>
            <Table>
              <TableHeader>
                <TableRow>{previewData.columns?.map((col, i) => <TableHead key={i}>{col}</TableHead>)}</TableRow>
              </TableHeader>
              <TableBody>
                {previewData.rows?.slice(0, 10).map((row, i) => (
                  <TableRow key={i}>{row.map((cell, j) => <TableCell key={j}>{cell}</TableCell>)}</TableRow>
                ))}
              </TableBody>
            </Table>
            {previewData.rows?.length > 10 && <p className="text-center text-muted-foreground mt-4">{language === 'ar' ? `... و ${previewData.rows.length - 10} صفوف أخرى` : `... and ${previewData.rows.length - 10} more rows`}</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
