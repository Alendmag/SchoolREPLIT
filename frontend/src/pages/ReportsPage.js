import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  FileText,
  Users,
  DollarSign,
  UserCheck,
  Download,
  Loader2,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { getApiErrorMessage } from '../lib/form-utils';

export default function ReportsPage() {
  const { api } = useAuth();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('attendance');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({ start_date: '', end_date: '', grade_id: '', student_id: '' });

  const isAr = language === 'ar';

  const generateReport = async (reportType) => {
    setLoading(true);
    try {
      const response = await api.post(`/reports/${reportType}`, { ...filters });
      setReportData({ ...response.data, report_type: reportType });
      toast.success(isAr ? 'تم إنشاء التقرير بنجاح' : 'Report generated successfully');
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('error')));
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = () => {
    if (!reportData?.data?.length) return;
    const rows = reportData.data;
    const cols = Object.keys(rows[0] || {});
    const csv = [cols.join(','), ...rows.map((r) => cols.map((c) => `"${(r[c] ?? '').toString().replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportData.report_type}_report_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(isAr ? 'تم تصدير التقرير' : 'Report exported');
  };

  const reportTypes = [
    { id: 'attendance', icon: UserCheck, label: isAr ? 'تقرير الحضور' : 'Attendance Report', color: 'text-success', bg: 'bg-success/10' },
    { id: 'grades', icon: BarChart3, label: isAr ? 'تقرير الدرجات' : 'Grades Report', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'finance', icon: DollarSign, label: isAr ? 'التقرير المالي' : 'Finance Report', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'students', icon: Users, label: isAr ? 'تقرير الطلاب' : 'Students Report', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-6 animate-fade-in" data-testid="reports-page">
      <div>
        <h1 className="font-heading text-3xl font-bold">{t('reports')}</h1>
        <p className="text-muted-foreground mt-1">
          {isAr ? 'تقارير حية مبنية على بيانات النظام الفعلية' : 'Live reports based on real system data'}
        </p>
      </div>

      {/* Type selector cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {reportTypes.map((type) => (
          <Card
            key={type.id}
            className={`cursor-pointer transition-all ${activeTab === type.id ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/40'}`}
            onClick={() => setActiveTab(type.id)}
            data-testid={`report-type-${type.id}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${type.bg} flex items-center justify-center`}>
                  <type.icon className={`w-5 h-5 ${type.color}`} />
                </div>
                <p className="font-medium text-sm">{type.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{isAr ? 'فلاتر التقرير' : 'Report Filters'}</CardTitle>
          <CardDescription>{isAr ? 'حدد نطاق التقرير' : 'Define report scope'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>{isAr ? 'من تاريخ' : 'From Date'}</Label>
              <Input type="date" value={filters.start_date} onChange={(e) => setFilters({ ...filters, start_date: e.target.value })} data-testid="report-start-date" />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? 'إلى تاريخ' : 'To Date'}</Label>
              <Input type="date" value={filters.end_date} onChange={(e) => setFilters({ ...filters, end_date: e.target.value })} data-testid="report-end-date" />
            </div>
            <div className="col-span-2 flex items-end gap-2">
              <Button onClick={() => generateReport(activeTab)} disabled={loading} className="flex-1" data-testid="generate-report-btn">
                {loading ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : <FileText className="w-4 h-4 me-2" />}
                {isAr ? 'إنشاء التقرير' : 'Generate Report'}
              </Button>
              <Button variant="outline" onClick={exportCsv} disabled={!reportData?.data?.length} data-testid="export-report-btn">
                <Download className="w-4 h-4 me-2" />
                {isAr ? 'تصدير CSV' : 'Export CSV'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rendered report */}
      {reportData && (
        <div className="space-y-6" data-testid="report-result">
          {/* Header + KPI summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                {reportData.title_ar || reportData.title || (isAr ? 'التقرير' : 'Report')}
              </CardTitle>
              <CardDescription>
                {isAr ? 'تم الإنشاء في' : 'Generated at'}: {reportData.generated_at ? new Date(reportData.generated_at).toLocaleString(isAr ? 'ar-LY' : 'en-US') : '-'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <KpiGrid summary={reportData.summary || {}} reportType={reportData.report_type} isAr={isAr} />
            </CardContent>
          </Card>

          {/* Detailed table */}
          <Card>
            <CardHeader>
              <CardTitle>{isAr ? 'التفاصيل' : 'Details'}</CardTitle>
              <CardDescription>
                {isAr
                  ? `عرض ${Math.min((reportData.data || []).length, 100)} من ${(reportData.data || []).length} سجل`
                  : `Showing ${Math.min((reportData.data || []).length, 100)} of ${(reportData.data || []).length} records`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <ReportTable data={reportData.data || []} type={reportData.report_type} isAr={isAr} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ============================================================
// KPI cards — labels are report-type-aware
// ============================================================
function KpiGrid({ summary, reportType, isAr }) {
  const entries = Object.entries(summary || {});
  if (!entries.length) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        {isAr ? 'لا توجد بيانات ملخصة' : 'No summary available'}
      </div>
    );
  }

  const labelMap = {
    // attendance
    total_records: { ar: 'إجمالي السجلات', en: 'Total Records' },
    present_count: { ar: 'حاضر', en: 'Present' },
    absent_count: { ar: 'غائب', en: 'Absent' },
    late_count: { ar: 'متأخر', en: 'Late' },
    excused_count: { ar: 'معذور', en: 'Excused' },
    attendance_rate: { ar: 'نسبة الحضور', en: 'Attendance Rate' },
    // grades
    total_exams: { ar: 'إجمالي الاختبارات', en: 'Total Exams' },
    average_score: { ar: 'متوسط الدرجات', en: 'Average Score' },
    highest_score: { ar: 'أعلى درجة', en: 'Highest' },
    lowest_score: { ar: 'أدنى درجة', en: 'Lowest' },
    // finance
    total_invoices: { ar: 'إجمالي الفواتير', en: 'Total Invoices' },
    total_amount: { ar: 'إجمالي المبلغ', en: 'Total Amount' },
    total_paid: { ar: 'المدفوع', en: 'Paid' },
    total_pending: { ar: 'المتبقي', en: 'Outstanding' },
    total_payments: { ar: 'عدد الدفعات', en: 'Payments Count' },
    // students
    total_students: { ar: 'إجمالي الطلاب', en: 'Total Students' },
    active_students: { ar: 'الطلاب النشطون', en: 'Active' },
    male_count: { ar: 'ذكور', en: 'Male' },
    female_count: { ar: 'إناث', en: 'Female' },
  };

  const format = (key, value) => {
    if (typeof value !== 'number') return String(value);
    if (key.endsWith('_rate')) return `${value}%`;
    if (key.startsWith('total_amount') || key === 'total_paid' || key === 'total_pending') {
      return `${value.toLocaleString()} ${isAr ? 'د.ل' : 'LYD'}`;
    }
    return value.toLocaleString();
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {entries.slice(0, 8).map(([key, value]) => (
        <div key={key} className="p-4 rounded-lg bg-muted/40 border" data-testid={`kpi-${key}`}>
          <div className="text-xs text-muted-foreground truncate">
            {labelMap[key]?.[isAr ? 'ar' : 'en'] || key.replace(/_/g, ' ')}
          </div>
          <div className="text-2xl font-bold mt-1">{format(key, value)}</div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Report-type-specific tables (real backend rows)
// ============================================================
function ReportTable({ data, type, isAr }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        {isAr ? 'لا توجد بيانات لهذا النطاق' : 'No data for this range'}
      </div>
    );
  }
  const rows = data.slice(0, 100);

  if (type === 'attendance') {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{isAr ? 'التاريخ' : 'Date'}</TableHead>
            <TableHead>{isAr ? 'الطالب' : 'Student'}</TableHead>
            <TableHead>{isAr ? 'الحالة' : 'Status'}</TableHead>
            <TableHead>{isAr ? 'ملاحظات' : 'Notes'}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={r.attendance_id || i}>
              <TableCell className="font-mono text-sm">{r.date}</TableCell>
              <TableCell>{r.student_name || r.student_id}</TableCell>
              <TableCell>
                <Badge variant={r.status === 'present' ? 'default' : r.status === 'absent' ? 'destructive' : 'secondary'}>
                  {r.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{r.notes || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (type === 'grades') {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{isAr ? 'الاختبار' : 'Exam'}</TableHead>
            <TableHead>{isAr ? 'المادة' : 'Subject'}</TableHead>
            <TableHead>{isAr ? 'التاريخ' : 'Date'}</TableHead>
            <TableHead className="text-end">{isAr ? 'الدرجة القصوى' : 'Max Score'}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={r.exam_id || i}>
              <TableCell className="font-medium">{r.name_ar || r.name}</TableCell>
              <TableCell>{r.subject_name || r.subject_id || '-'}</TableCell>
              <TableCell>{r.date}</TableCell>
              <TableCell className="text-end">{r.max_score}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (type === 'finance') {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{isAr ? 'رقم الفاتورة' : 'Invoice #'}</TableHead>
            <TableHead>{isAr ? 'الطالب' : 'Student'}</TableHead>
            <TableHead className="text-end">{isAr ? 'المبلغ' : 'Amount'}</TableHead>
            <TableHead className="text-end">{isAr ? 'المدفوع' : 'Paid'}</TableHead>
            <TableHead>{isAr ? 'الاستحقاق' : 'Due'}</TableHead>
            <TableHead>{isAr ? 'الحالة' : 'Status'}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={r.invoice_id || i}>
              <TableCell className="font-mono text-xs">{r.invoice_number}</TableCell>
              <TableCell>{r.student_name || r.student_id}</TableCell>
              <TableCell className="text-end">{r.amount}</TableCell>
              <TableCell className="text-end">{r.paid_amount || 0}</TableCell>
              <TableCell>{r.due_date}</TableCell>
              <TableCell>
                <Badge variant={r.status === 'paid' ? 'default' : r.status === 'overdue' ? 'destructive' : 'secondary'}>{r.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (type === 'students') {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{isAr ? 'الاسم' : 'Name'}</TableHead>
            <TableHead>{isAr ? 'الصف' : 'Grade'}</TableHead>
            <TableHead>{isAr ? 'الجنس' : 'Gender'}</TableHead>
            <TableHead>{isAr ? 'الحالة' : 'Status'}</TableHead>
            <TableHead>{isAr ? 'تاريخ التسجيل' : 'Enrollment'}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={r.student_id || i}>
              <TableCell className="font-medium">{r.name_ar || r.name}</TableCell>
              <TableCell>{r.grade_name || r.grade_id || '-'}</TableCell>
              <TableCell>{r.gender}</TableCell>
              <TableCell>
                <Badge variant={r.status === 'active' ? 'default' : 'secondary'}>{r.status}</Badge>
              </TableCell>
              <TableCell>{r.enrollment_date || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  // Fallback dynamic table
  const cols = Object.keys(rows[0] || {}).slice(0, 6);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {cols.map((c) => (
            <TableHead key={c}>{c.replace(/_/g, ' ')}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r, i) => (
          <TableRow key={i}>
            {cols.map((c) => (
              <TableCell key={c}>{String(r[c] ?? '-')}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
