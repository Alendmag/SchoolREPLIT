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
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { 
  UserCheck, 
  UserX,
  Clock,
  FileCheck,
  Loader2,
  CalendarDays,
  Users,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '../lib/utils';

export default function AttendancePage() {
  const { api, user } = useAuth();
  const { t, language, isRTL } = useLanguage();
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [sections, setSections] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [activeTab, setActiveTab] = useState('record');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedGrade || selectedSection) {
      fetchStudentsAndAttendance();
    }
  }, [selectedGrade, selectedSection, selectedDate]);

  const fetchInitialData = async () => {
    try {
      const [gradesRes, sectionsRes] = await Promise.all([
        api.get('/academic/grades/'),
        api.get('/sections/')
      ]);
      setGrades(gradesRes.data);
      setSections(sectionsRes.data);
    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsAndAttendance = async () => {
    try {
      // Fetch students
      let studentsQuery = '';
      if (selectedGrade) studentsQuery += `grade_id=${selectedGrade}`;
      if (selectedSection) studentsQuery += `${studentsQuery ? '&' : ''}section_id=${selectedSection}`;
      
      const studentsRes = await api.get(`/students/?${studentsQuery}`);
      setStudents(studentsRes.data);

      // Fetch existing attendance for selected date
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const attendanceRes = await api.get(`/academic/attendance/?date=${dateStr}`);
      
      // Convert to lookup object
      const attendanceLookup = {};
      attendanceRes.data.forEach(record => {
        attendanceLookup[record.student_id] = record.status;
      });
      setAttendance(attendanceLookup);
      setAttendanceRecords(attendanceRes.data);
    } catch (error) {
      console.error('Fetch students error:', error);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleGradeChange = (value) => {
    setSelectedGrade(value);
    // Reset section when grade changes so we never keep a section from another grade
    setSelectedSection('');
  };

  const handleSubmitAttendance = async () => {
    setSubmitting(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    try {
      // Single idempotent bulk request (upserts per student — no duplicates on re-save)
      const records = students.map((student) => ({
        student_id: student.student_id,
        status: attendance[student.student_id] || 'present',
      }));
      await api.post('/academic/attendance/bulk', {
        date: dateStr,
        records,
      });
      toast.success(language === 'ar' ? 'تم حفظ الحضور بنجاح' : 'Attendance saved successfully');
      fetchStudentsAndAttendance();
    } catch (error) {
      console.error('Submit attendance error:', error);
      toast.error(t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'late':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'excused':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      present: { ar: 'حاضر', en: 'Present' },
      absent: { ar: 'غائب', en: 'Absent' },
      late: { ar: 'متأخر', en: 'Late' },
      excused: { ar: 'معذور', en: 'Excused' }
    };
    return labels[status]?.[language] || status;
  };

  // Calculate statistics
  const presentCount = Object.values(attendance).filter(s => s === 'present').length;
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length;
  const lateCount = Object.values(attendance).filter(s => s === 'late').length;
  const excusedCount = Object.values(attendance).filter(s => s === 'excused').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="attendance-page">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold">{t('attendance')}</h1>
        <p className="text-muted-foreground mt-1">
          {language === 'ar' 
            ? 'تسجيل ومتابعة حضور الطلاب'
            : 'Record and track student attendance'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{presentCount}</p>
                <p className="text-sm text-muted-foreground">{t('present')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <UserX className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{absentCount}</p>
                <p className="text-sm text-muted-foreground">{t('absent')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{lateCount}</p>
                <p className="text-sm text-muted-foreground">{t('late')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{excusedCount}</p>
                <p className="text-sm text-muted-foreground">{t('excused')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full md:w-[240px] justify-start text-start font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                  data-testid="date-picker-btn"
                >
                  <CalendarDays className="me-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP", { locale: language === 'ar' ? ar : undefined })
                  ) : (
                    <span>{language === 'ar' ? 'اختر التاريخ' : 'Pick a date'}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Grade Select */}
            <Select value={selectedGrade} onValueChange={handleGradeChange}>
              <SelectTrigger className="w-full md:w-[200px]" data-testid="grade-select">
                <SelectValue placeholder={language === 'ar' ? 'اختر الصف' : 'Select Grade'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ar' ? 'جميع الصفوف' : 'All Grades'}</SelectItem>
                {grades.map((grade) => (
                  <SelectItem key={grade.grade_id} value={grade.grade_id}>
                    {grade.name_ar || grade.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Section Select */}
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger className="w-full md:w-[200px]" data-testid="section-select">
                <SelectValue placeholder={language === 'ar' ? 'اختر الشعبة' : 'Select Section'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ar' ? 'جميع الشعب' : 'All Sections'}</SelectItem>
                {sections
                  .filter(s => !selectedGrade || selectedGrade === 'all' || s.grade_id === selectedGrade)
                  .map((section) => (
                    <SelectItem key={section.section_id} value={section.section_id}>
                      {section.name_ar || section.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="ms-auto" data-testid="export-attendance-btn">
              <Download className="w-4 h-4 me-2" />
              {t('export')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{language === 'ar' ? 'تسجيل الحضور' : 'Record Attendance'}</CardTitle>
            <CardDescription>
              {format(selectedDate, "PPP", { locale: language === 'ar' ? ar : undefined })} - {students.length} {language === 'ar' ? 'طالب' : 'students'}
            </CardDescription>
          </div>
          <Button 
            onClick={handleSubmitAttendance} 
            disabled={submitting || students.length === 0}
            data-testid="save-attendance-btn"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 me-2 animate-spin" />
                {t('loading')}
              </>
            ) : (
              <>
                <FileCheck className="w-4 h-4 me-2" />
                {language === 'ar' ? 'حفظ الحضور' : 'Save Attendance'}
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>{t('student_name')}</TableHead>
                <TableHead>{language === 'ar' ? 'الصف' : 'Grade'}</TableHead>
                <TableHead className="text-center">{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length > 0 ? (
                students.map((student, index) => {
                  const currentStatus = attendance[student.student_id] || 'present';
                  const grade = grades.find(g => g.grade_id === student.grade_id);
                  
                  return (
                    <TableRow key={student.student_id} data-testid={`attendance-row-${student.student_id}`}>
                      <TableCell className="font-mono text-muted-foreground">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium">{student.name_ar || student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{grade?.name_ar || grade?.name || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant={currentStatus === 'present' ? 'default' : 'outline'}
                            className={cn("h-8", currentStatus === 'present' && 'bg-success hover:bg-success/90')}
                            onClick={() => handleAttendanceChange(student.student_id, 'present')}
                            data-testid={`mark-present-${student.student_id}`}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={currentStatus === 'absent' ? 'default' : 'outline'}
                            className={cn("h-8", currentStatus === 'absent' && 'bg-destructive hover:bg-destructive/90')}
                            onClick={() => handleAttendanceChange(student.student_id, 'absent')}
                            data-testid={`mark-absent-${student.student_id}`}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={currentStatus === 'late' ? 'default' : 'outline'}
                            className={cn("h-8", currentStatus === 'late' && 'bg-amber-500 hover:bg-amber-500/90')}
                            onClick={() => handleAttendanceChange(student.student_id, 'late')}
                            data-testid={`mark-late-${student.student_id}`}
                          >
                            <Clock className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={currentStatus === 'excused' ? 'default' : 'outline'}
                            className={cn("h-8", currentStatus === 'excused' && 'bg-blue-500 hover:bg-blue-500/90')}
                            onClick={() => handleAttendanceChange(student.student_id, 'excused')}
                            data-testid={`mark-excused-${student.student_id}`}
                          >
                            <AlertCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    {selectedGrade || selectedSection 
                      ? t('no_data')
                      : (language === 'ar' ? 'اختر الصف والشعبة لعرض الطلاب' : 'Select grade and section to view students')}
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
