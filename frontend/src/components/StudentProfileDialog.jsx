import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  User,
  GraduationCap,
  CalendarCheck,
  Wallet,
  Users as UsersIcon,
  Phone,
  Mail,
  IdCard,
  Loader2,
} from 'lucide-react';

/**
 * Read-only Student 360 profile with 4 tabs:
 *  - overview: identity / guardian / class
 *  - academic: exams available for the student's grade
 *  - attendance: last 30 days + %
 *  - financial: invoices + payments + balance
 * All data comes from real backend endpoints scoped by school_id (JWT).
 */
export default function StudentProfileDialog({ open, onOpenChange, student }) {
  const { api } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [grade, setGrade] = useState(null);
  const [section, setSection] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [exams, setExams] = useState([]);

  const isAr = language === 'ar';

  const loadProfile = useCallback(async () => {
    if (!student?.student_id) return;
    setLoading(true);
    try {
      const [gradesRes, sectionsRes, attRes, invRes, examsRes] = await Promise.all([
        api.get('/academic/grades'),
        api.get('/sections/'),
        api.get(`/academic/attendance?student_id=${student.student_id}`),
        api.get(`/finance/invoices?student_id=${student.student_id}`),
        api.get('/academic/exams'),
      ]);
      const g = gradesRes.data.find((x) => x.grade_id === student.grade_id) || null;
      const s = (sectionsRes.data || []).find((x) => x.section_id === student.section_id) || null;
      setGrade(g);
      setSection(s);
      setAttendance(attRes.data || []);
      setInvoices(invRes.data || []);
      setExams((examsRes.data || []).filter((e) => !student.grade_id || e.grade_id === student.grade_id));

      // Fetch payments for each invoice (small N per student)
      const invoiceIds = (invRes.data || []).map((i) => i.invoice_id);
      if (invoiceIds.length) {
        const paymentResults = await Promise.all(
          invoiceIds.map((iid) => api.get(`/finance/payments?invoice_id=${iid}`).catch(() => ({ data: [] })))
        );
        setPayments(paymentResults.flatMap((r) => r.data || []));
      } else {
        setPayments([]);
      }
    } catch (e) {
      // Fail closed but don't crash UI
      console.error('Student 360 load error', e);
    } finally {
      setLoading(false);
    }
  }, [api, student]);

  useEffect(() => {
    if (open) loadProfile();
  }, [open, loadProfile]);

  // ---- Derived metrics (from backend data only) ----
  const totalInvoiced = invoices.reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalPaid = invoices.reduce((sum, i) => sum + (i.paid_amount || 0), 0);
  const outstanding = totalInvoiced - totalPaid;

  const attendanceCounts = attendance.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    },
    { present: 0, absent: 0, late: 0, excused: 0 }
  );
  const attTotal = attendance.length;
  const attRate = attTotal ? (((attendanceCounts.present + attendanceCounts.late) / attTotal) * 100).toFixed(1) : '0';

  const statusLabels = {
    present: isAr ? 'حاضر' : 'Present',
    absent: isAr ? 'غائب' : 'Absent',
    late: isAr ? 'متأخر' : 'Late',
    excused: isAr ? 'معذور' : 'Excused',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="student-360-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div>{student?.name_ar || student?.name}</div>
              <div className="text-xs font-normal text-muted-foreground">{student?.student_id}</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            {isAr ? 'ملف الطالب الشامل - أكاديمي وحضور ومالي' : 'Student 360 - academic, attendance & financial view'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-4 w-full" data-testid="student-360-tabs">
              <TabsTrigger value="overview" data-testid="tab-overview">
                <User className="w-4 h-4 me-2" />
                {isAr ? 'عام' : 'Overview'}
              </TabsTrigger>
              <TabsTrigger value="academic" data-testid="tab-academic">
                <GraduationCap className="w-4 h-4 me-2" />
                {isAr ? 'أكاديمي' : 'Academic'}
              </TabsTrigger>
              <TabsTrigger value="attendance" data-testid="tab-attendance">
                <CalendarCheck className="w-4 h-4 me-2" />
                {isAr ? 'الحضور' : 'Attendance'}
              </TabsTrigger>
              <TabsTrigger value="finance" data-testid="tab-finance">
                <Wallet className="w-4 h-4 me-2" />
                {isAr ? 'المالية' : 'Finance'}
              </TabsTrigger>
            </TabsList>

            {/* OVERVIEW */}
            <TabsContent value="overview" className="space-y-3 mt-4">
              <Card>
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InfoRow icon={<IdCard className="w-4 h-4" />} label={isAr ? 'الرقم الوطني' : 'National ID'} value={student?.national_id} />
                  <InfoRow icon={<Mail className="w-4 h-4" />} label={isAr ? 'البريد الإلكتروني' : 'Email'} value={student?.email} />
                  <InfoRow icon={<Phone className="w-4 h-4" />} label={isAr ? 'الهاتف' : 'Phone'} value={student?.phone} />
                  <InfoRow icon={<GraduationCap className="w-4 h-4" />} label={isAr ? 'الصف' : 'Grade'} value={grade?.name_ar || grade?.name} />
                  <InfoRow icon={<UsersIcon className="w-4 h-4" />} label={isAr ? 'الشعبة' : 'Section'} value={section?.name_ar || section?.name} />
                  <InfoRow icon={<CalendarCheck className="w-4 h-4" />} label={isAr ? 'تاريخ التسجيل' : 'Enrollment Date'} value={student?.enrollment_date} />
                  <InfoRow icon={<User className="w-4 h-4" />} label={isAr ? 'الجنس' : 'Gender'} value={student?.gender === 'male' ? (isAr ? 'ذكر' : 'Male') : (isAr ? 'أنثى' : 'Female')} />
                  <InfoRow icon={<CalendarCheck className="w-4 h-4" />} label={isAr ? 'تاريخ الميلاد' : 'Date of Birth'} value={student?.date_of_birth} />
                  <InfoRow icon={<UsersIcon className="w-4 h-4" />} label={isAr ? 'ولي الأمر' : 'Guardian ID'} value={student?.parent_id} />
                  <InfoRow icon={<User className="w-4 h-4" />} label={isAr ? 'العنوان' : 'Address'} value={student?.address} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* ACADEMIC */}
            <TabsContent value="academic" className="space-y-3 mt-4">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{isAr ? 'الاختبار' : 'Exam'}</TableHead>
                        <TableHead>{isAr ? 'النوع' : 'Type'}</TableHead>
                        <TableHead>{isAr ? 'التاريخ' : 'Date'}</TableHead>
                        <TableHead className="text-end">{isAr ? 'الدرجة القصوى' : 'Max Score'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exams.length > 0 ? (
                        exams.map((e) => (
                          <TableRow key={e.exam_id} data-testid={`student-exam-${e.exam_id}`}>
                            <TableCell className="font-medium">{e.name_ar || e.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{e.exam_type}</Badge>
                            </TableCell>
                            <TableCell>{e.date}</TableCell>
                            <TableCell className="text-end">{e.max_score}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            {isAr ? 'لا توجد اختبارات لهذا الصف' : 'No exams for this grade yet'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ATTENDANCE */}
            <TabsContent value="attendance" className="space-y-3 mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard label={isAr ? 'حاضر' : 'Present'} value={attendanceCounts.present} tone="success" />
                <MetricCard label={isAr ? 'غائب' : 'Absent'} value={attendanceCounts.absent} tone="destructive" />
                <MetricCard label={isAr ? 'متأخر' : 'Late'} value={attendanceCounts.late} tone="amber" />
                <MetricCard label={isAr ? 'نسبة الحضور' : 'Rate'} value={`${attRate}%`} tone="primary" />
              </div>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{isAr ? 'التاريخ' : 'Date'}</TableHead>
                        <TableHead>{isAr ? 'الحالة' : 'Status'}</TableHead>
                        <TableHead>{isAr ? 'ملاحظات' : 'Notes'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendance.length > 0 ? (
                        attendance
                          .slice()
                          .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
                          .slice(0, 30)
                          .map((r) => (
                            <TableRow key={r.attendance_id} data-testid={`student-attendance-${r.attendance_id}`}>
                              <TableCell className="font-mono text-sm">{r.date}</TableCell>
                              <TableCell>
                                <Badge variant={r.status === 'present' ? 'default' : r.status === 'absent' ? 'destructive' : 'secondary'}>
                                  {statusLabels[r.status] || r.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">{r.notes || '-'}</TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                            {isAr ? 'لا توجد سجلات حضور' : 'No attendance records'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* FINANCE */}
            <TabsContent value="finance" className="space-y-3 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <MetricCard label={isAr ? 'إجمالي الفواتير' : 'Invoiced'} value={`${totalInvoiced.toLocaleString()} ${isAr ? 'د.ل' : 'LYD'}`} tone="primary" />
                <MetricCard label={isAr ? 'المدفوع' : 'Paid'} value={`${totalPaid.toLocaleString()} ${isAr ? 'د.ل' : 'LYD'}`} tone="success" />
                <MetricCard label={isAr ? 'الرصيد المتبقي' : 'Outstanding'} value={`${outstanding.toLocaleString()} ${isAr ? 'د.ل' : 'LYD'}`} tone={outstanding > 0 ? 'destructive' : 'success'} />
              </div>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{isAr ? 'رقم الفاتورة' : 'Invoice'}</TableHead>
                        <TableHead>{isAr ? 'الوصف' : 'Description'}</TableHead>
                        <TableHead>{isAr ? 'المبلغ' : 'Amount'}</TableHead>
                        <TableHead>{isAr ? 'المدفوع' : 'Paid'}</TableHead>
                        <TableHead>{isAr ? 'الاستحقاق' : 'Due'}</TableHead>
                        <TableHead>{isAr ? 'الحالة' : 'Status'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.length > 0 ? (
                        invoices.map((inv) => (
                          <TableRow key={inv.invoice_id} data-testid={`student-invoice-${inv.invoice_id}`}>
                            <TableCell className="font-mono text-xs">{inv.invoice_number}</TableCell>
                            <TableCell>{inv.description_ar || inv.description}</TableCell>
                            <TableCell className="font-medium">{inv.amount}</TableCell>
                            <TableCell>{inv.paid_amount || 0}</TableCell>
                            <TableCell>{inv.due_date}</TableCell>
                            <TableCell>
                              <Badge variant={inv.status === 'paid' ? 'default' : inv.status === 'overdue' ? 'destructive' : 'secondary'}>
                                {inv.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            {isAr ? 'لا توجد فواتير' : 'No invoices'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              {payments.length > 0 && (
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{isAr ? 'رقم الإيصال' : 'Receipt'}</TableHead>
                          <TableHead>{isAr ? 'المبلغ' : 'Amount'}</TableHead>
                          <TableHead>{isAr ? 'الطريقة' : 'Method'}</TableHead>
                          <TableHead>{isAr ? 'التاريخ' : 'Date'}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((p) => (
                          <TableRow key={p.payment_id} data-testid={`student-payment-${p.payment_id}`}>
                            <TableCell className="font-mono text-xs">{p.receipt_number}</TableCell>
                            <TableCell className="font-medium">{p.amount}</TableCell>
                            <TableCell>{p.payment_method}</TableCell>
                            <TableCell>{p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium truncate">{value || '-'}</div>
      </div>
    </div>
  );
}

const toneClasses = {
  success: 'bg-success/10 text-success',
  destructive: 'bg-destructive/10 text-destructive',
  amber: 'bg-amber-500/10 text-amber-600',
  primary: 'bg-primary/10 text-primary',
};

function MetricCard({ label, value, tone = 'primary' }) {
  return (
    <Card>
      <CardContent className={`p-4 flex flex-col gap-1 rounded-lg ${toneClasses[tone] || toneClasses.primary}`}>
        <div className="text-xs opacity-80">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
