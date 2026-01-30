import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
  DollarSign, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Loader2,
  Download,
  FileText,
  Receipt,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function FinancePage() {
  const { api, user } = useAuth();
  const { t, language } = useLanguage();
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [invoiceForm, setInvoiceForm] = useState({
    student_id: '',
    amount: '',
    description: '',
    description_ar: '',
    due_date: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    invoice_id: '',
    amount: '',
    payment_method: 'cash',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invoicesRes, paymentsRes, summaryRes, studentsRes] = await Promise.all([
        api.get('/finance/invoices'),
        api.get('/finance/payments'),
        api.get('/finance/summary'),
        api.get('/students'),
      ]);
      setInvoices(invoicesRes.data);
      setPayments(paymentsRes.data);
      setSummary(summaryRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      console.error('Fetch finance data error:', error);
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/finance/invoices', {
        ...invoiceForm,
        amount: parseFloat(invoiceForm.amount),
        school_id: user.school_id,
      });
      toast.success(language === 'ar' ? 'تم إنشاء الفاتورة بنجاح' : 'Invoice created successfully');
      setInvoiceDialogOpen(false);
      fetchData();
      setInvoiceForm({
        student_id: '',
        amount: '',
        description: '',
        description_ar: '',
        due_date: '',
      });
    } catch (error) {
      console.error('Create invoice error:', error);
      toast.error(error.response?.data?.detail || t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/finance/payments', {
        ...paymentForm,
        amount: parseFloat(paymentForm.amount),
        school_id: user.school_id,
      });
      toast.success(language === 'ar' ? 'تم تسجيل الدفعة بنجاح' : 'Payment recorded successfully');
      setPaymentDialogOpen(false);
      fetchData();
      setPaymentForm({
        invoice_id: '',
        amount: '',
        payment_method: 'cash',
        notes: '',
      });
    } catch (error) {
      console.error('Record payment error:', error);
      toast.error(error.response?.data?.detail || t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  const openPaymentDialog = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentForm({
      invoice_id: invoice.invoice_id,
      amount: (invoice.amount - invoice.paid_amount).toString(),
      payment_method: 'cash',
      notes: '',
    });
    setPaymentDialogOpen(true);
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: 'outline', label: t('pending'), icon: Clock },
      paid: { variant: 'default', label: t('paid'), icon: CheckCircle },
      overdue: { variant: 'destructive', label: t('overdue'), icon: AlertTriangle },
    };
    return variants[status] || variants.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="finance-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">{t('finance')}</h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ar' ? 'إدارة الفواتير والمدفوعات' : 'Manage invoices and payments'}
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="create-invoice-btn">
                <FileText className="w-4 h-4 me-2" />
                {t('create_invoice')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('create_invoice')}</DialogTitle>
                <DialogDescription>
                  {language === 'ar' ? 'إنشاء فاتورة جديدة لطالب' : 'Create a new invoice for a student'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateInvoice}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>{t('student_name')}</Label>
                    <Select
                      value={invoiceForm.student_id}
                      onValueChange={(value) => setInvoiceForm({ ...invoiceForm, student_id: value })}
                    >
                      <SelectTrigger data-testid="invoice-student-select">
                        <SelectValue placeholder={language === 'ar' ? 'اختر طالب' : 'Select student'} />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.student_id} value={student.student_id}>
                            {student.name_ar || student.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('amount')} ({language === 'ar' ? 'د.ل' : 'LYD'})</Label>
                    <Input
                      type="number"
                      value={invoiceForm.amount}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                      required
                      data-testid="invoice-amount-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الوصف بالعربية' : 'Description (Arabic)'}</Label>
                    <Input
                      value={invoiceForm.description_ar}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, description_ar: e.target.value })}
                      required
                      data-testid="invoice-desc-ar-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الوصف بالإنجليزية' : 'Description (English)'}</Label>
                    <Input
                      value={invoiceForm.description}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                      required
                      data-testid="invoice-desc-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('due_date')}</Label>
                    <Input
                      type="date"
                      value={invoiceForm.due_date}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
                      required
                      data-testid="invoice-due-date-input"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setInvoiceDialogOpen(false)}>
                    {t('cancel')}
                  </Button>
                  <Button type="submit" disabled={submitting} data-testid="submit-invoice-btn">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('save')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('record_payment')}</DialogTitle>
                <DialogDescription>
                  {language === 'ar' ? 'تسجيل دفعة للفاتورة' : 'Record payment for invoice'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleRecordPayment}>
                <div className="space-y-4 py-4">
                  {selectedInvoice && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="font-medium">{t('invoice_number')}: {selectedInvoice.invoice_number}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {language === 'ar' ? 'المتبقي' : 'Remaining'}: {(selectedInvoice.amount - selectedInvoice.paid_amount).toLocaleString()} {language === 'ar' ? 'د.ل' : 'LYD'}
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>{t('amount')} ({language === 'ar' ? 'د.ل' : 'LYD'})</Label>
                    <Input
                      type="number"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      required
                      data-testid="payment-amount-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('payment_method')}</Label>
                    <Select
                      value={paymentForm.payment_method}
                      onValueChange={(value) => setPaymentForm({ ...paymentForm, payment_method: value })}
                    >
                      <SelectTrigger data-testid="payment-method-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">{t('cash')}</SelectItem>
                        <SelectItem value="transfer">{t('transfer')}</SelectItem>
                        <SelectItem value="card">{t('card')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'ملاحظات' : 'Notes'}</Label>
                    <Input
                      value={paymentForm.notes}
                      onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                      data-testid="payment-notes-input"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                    {t('cancel')}
                  </Button>
                  <Button type="submit" disabled={submitting} data-testid="submit-payment-btn">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('save')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card data-testid="stat-total-invoiced">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('total_invoiced')}</p>
                <p className="text-2xl font-bold mt-1">
                  {(summary?.total_invoiced || 0).toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground ms-1">
                    {language === 'ar' ? 'د.ل' : 'LYD'}
                  </span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stat-total-collected">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('total_collected')}</p>
                <p className="text-2xl font-bold mt-1 text-success">
                  {(summary?.total_collected || 0).toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground ms-1">
                    {language === 'ar' ? 'د.ل' : 'LYD'}
                  </span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stat-total-pending">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('total_pending')}</p>
                <p className="text-2xl font-bold mt-1 text-amber-500">
                  {(summary?.total_pending || 0).toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground ms-1">
                    {language === 'ar' ? 'د.ل' : 'LYD'}
                  </span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stat-invoice-counts">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{language === 'ar' ? 'إجمالي الفواتير' : 'Total Invoices'}</p>
                <p className="text-2xl font-bold mt-1">
                  {summary?.invoice_counts?.total || 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices" data-testid="invoices-tab">{t('invoices')}</TabsTrigger>
          <TabsTrigger value="payments" data-testid="payments-tab">{t('payments')}</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('invoice_number')}</TableHead>
                    <TableHead>{t('student_name')}</TableHead>
                    <TableHead>{t('amount')}</TableHead>
                    <TableHead>{t('paid')}</TableHead>
                    <TableHead>{t('due_date')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead className="text-end">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length > 0 ? (
                    invoices.map((invoice) => {
                      const student = students.find(s => s.student_id === invoice.student_id);
                      const statusBadge = getStatusBadge(invoice.status);
                      
                      return (
                        <TableRow key={invoice.invoice_id} data-testid={`invoice-row-${invoice.invoice_id}`}>
                          <TableCell className="font-mono">{invoice.invoice_number}</TableCell>
                          <TableCell>{student?.name_ar || student?.name || '-'}</TableCell>
                          <TableCell>{invoice.amount.toLocaleString()} {language === 'ar' ? 'د.ل' : 'LYD'}</TableCell>
                          <TableCell>{invoice.paid_amount.toLocaleString()} {language === 'ar' ? 'د.ل' : 'LYD'}</TableCell>
                          <TableCell>{invoice.due_date}</TableCell>
                          <TableCell>
                            <Badge variant={statusBadge.variant}>
                              <statusBadge.icon className="w-3 h-3 me-1" />
                              {statusBadge.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-end">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" data-testid={`view-invoice-${invoice.invoice_id}`}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              {invoice.status !== 'paid' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => openPaymentDialog(invoice)}
                                  data-testid={`pay-invoice-${invoice.invoice_id}`}
                                >
                                  <DollarSign className="w-4 h-4 me-1" />
                                  {t('record_payment')}
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
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('receipt_number')}</TableHead>
                    <TableHead>{t('invoice_number')}</TableHead>
                    <TableHead>{t('amount')}</TableHead>
                    <TableHead>{t('payment_method')}</TableHead>
                    <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                    <TableHead className="text-end">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length > 0 ? (
                    payments.map((payment) => {
                      const invoice = invoices.find(i => i.invoice_id === payment.invoice_id);
                      
                      return (
                        <TableRow key={payment.payment_id} data-testid={`payment-row-${payment.payment_id}`}>
                          <TableCell className="font-mono">{payment.receipt_number}</TableCell>
                          <TableCell className="font-mono">{invoice?.invoice_number || '-'}</TableCell>
                          <TableCell>{payment.amount.toLocaleString()} {language === 'ar' ? 'د.ل' : 'LYD'}</TableCell>
                          <TableCell>{t(payment.payment_method)}</TableCell>
                          <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-end">
                            <Button variant="ghost" size="icon" data-testid={`view-payment-${payment.payment_id}`}>
                              <Eye className="w-4 h-4" />
                            </Button>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
