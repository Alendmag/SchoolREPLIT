import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Layers, Plus, Edit, Trash2, Loader2, Search, Users, GraduationCap, BookOpen, Clock, MoreVertical, Building, DoorOpen } from 'lucide-react';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';

const SUBJECT_ICONS = ['📐', '📖', '🔬', '🧪', '🌍', '💻', '🎨', '⚽', '🎵', '📊'];

export default function GradesPage() {
  const { api, user } = useAuth();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('levels');
  const [loading, setLoading] = useState(true);
  const [levels, setLevels] = useState([]);
  const [grades, setGrades] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    try {
      const [levelsRes, gradesRes, sectionsRes, subjectsRes, roomsRes] = await Promise.all([
        api.get('/levels/').catch(() => ({ data: [] })),
        api.get('/academic/grades/').catch(() => ({ data: [] })),
        api.get('/sections/').catch(() => ({ data: [] })),
        api.get('/academic/subjects/').catch(() => ({ data: [] })),
        api.get('/rooms/').catch(() => ({ data: [] }))
      ]);
      setLevels(levelsRes.data || []);
      setGrades(gradesRes.data || []);
      setSections(sectionsRes.data || []);
      setSubjects(subjectsRes.data || []);
      setRooms(roomsRes.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = (type) => {
    setDialogType(type);
    setEditMode(false);
    setEditId(null);
    setFormData(type === 'subject' ? { name: '', name_ar: '', code: '', credits: 1, icon: '📐' } : type === 'room' ? { name: '', name_ar: '', capacity: 30, type: 'classroom' } : { name: '', name_ar: '', description: '' });
    setDialogOpen(true);
  };

  const openEditDialog = (type, item) => {
    setDialogType(type);
    setEditMode(true);
    const idField = type === 'level' ? 'level_id' : type === 'grade' ? 'grade_id' : type === 'section' ? 'section_id' : type === 'subject' ? 'subject_id' : 'room_id';
    setEditId(item[idField]);
    setFormData({ ...item });
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoints = { level: '/levels/', grade: '/academic/grades/', section: '/sections/', subject: '/academic/subjects/', room: '/rooms/' };
      if (editMode) {
        await api.put(`${endpoints[dialogType]}${editId}`, { ...formData, school_id: user.school_id });
        toast.success(language === 'ar' ? 'تم التحديث بنجاح' : 'Updated successfully');
      } else {
        await api.post(endpoints[dialogType], { ...formData, school_id: user.school_id });
        toast.success(language === 'ar' ? 'تم الإضافة بنجاح' : 'Added successfully');
      }
      setDialogOpen(false);
      setFormData({});
      fetchAllData();
    } catch (error) {
      const errMsg = error.response?.data?.detail;
      toast.error(typeof errMsg === 'string' ? errMsg : (language === 'ar' ? 'حدث خطأ' : 'Error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure?')) return;
    try {
      const endpoints = { level: `/levels/${id}`, grade: `/academic/grades/${id}`, section: `/sections/${id}`, subject: `/academic/subjects/${id}`, room: `/rooms/${id}` };
      await api.delete(endpoints[type]);
      toast.success(language === 'ar' ? 'تم الحذف' : 'Deleted');
      fetchAllData();
    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ' : 'Error');
    }
  };

  const filterData = (data) => data.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name_ar?.includes(searchTerm) ||
    item.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const stats = [
    { label: language === 'ar' ? 'المراحل' : 'Levels', value: levels.length, icon: Building, color: 'bg-blue-500', tab: 'levels' },
    { label: language === 'ar' ? 'الصفوف' : 'Grades', value: grades.length, icon: Layers, color: 'bg-emerald-500', tab: 'grades' },
    { label: language === 'ar' ? 'الشُعب' : 'Sections', value: sections.length, icon: Users, color: 'bg-amber-500', tab: 'sections' },
    { label: language === 'ar' ? 'المواد' : 'Subjects', value: subjects.length, icon: BookOpen, color: 'bg-purple-500', tab: 'subjects' },
    { label: language === 'ar' ? 'القاعات' : 'Rooms', value: rooms.length, icon: DoorOpen, color: 'bg-rose-500', tab: 'rooms' },
  ];

  const renderCards = (type, data, idField, icon, color) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filterData(data).length > 0 ? filterData(data).map((item) => (
        <Card key={item[idField]} className="group hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${color}/10 flex items-center justify-center`}>
                  {type === 'subject' ? <span className="text-xl">{item.icon || '📐'}</span> : React.createElement(icon, { className: `w-6 h-6 ${color.replace('bg-', 'text-')}` })}
                </div>
                <div>
                  <h3 className="font-semibold">{item.name_ar || item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.name || item.code || ''}</p>
                  {type === 'room' && <Badge variant="outline" className="mt-1">{item.type === 'lab' ? (language === 'ar' ? 'مختبر' : 'Lab') : (language === 'ar' ? 'فصل' : 'Classroom')}</Badge>}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEditDialog(type, item)}><Edit className="w-4 h-4 me-2" />{language === 'ar' ? 'تعديل' : 'Edit'}</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(type, item[idField])}><Trash2 className="w-4 h-4 me-2" />{language === 'ar' ? 'حذف' : 'Delete'}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {type === 'room' && <div className="mt-3 text-sm text-muted-foreground"><Users className="w-4 h-4 inline me-1" />{item.capacity} {language === 'ar' ? 'مقعد' : 'seats'}</div>}
          </CardContent>
        </Card>
      )) : <p className="text-muted-foreground col-span-3 text-center py-8">{language === 'ar' ? 'لا توجد بيانات' : 'No data'}</p>}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in" data-testid="grades-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">{language === 'ar' ? 'الفصول والمواد' : 'Classes & Subjects'}</h1>
          <p className="text-muted-foreground mt-1">{language === 'ar' ? 'إدارة المراحل والصفوف والشعب والمواد والقاعات' : 'Manage levels, grades, sections, subjects and rooms'}</p>
        </div>
        <Button onClick={() => openAddDialog(activeTab === 'levels' ? 'level' : activeTab === 'grades' ? 'grade' : activeTab === 'sections' ? 'section' : activeTab === 'subjects' ? 'subject' : 'room')}>
          <Plus className="w-4 h-4 me-2" />{language === 'ar' ? 'إضافة جديد' : 'Add New'}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className={`cursor-pointer hover:border-primary transition-colors ${activeTab === stat.tab ? 'border-primary' : ''}`} onClick={() => setActiveTab(stat.tab)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center text-white`}><stat.icon className="w-5 h-5" /></div>
                <div><p className="text-xl font-bold">{stat.value}</p><p className="text-xs text-muted-foreground">{stat.label}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder={language === 'ar' ? 'بحث...' : 'Search...'} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="ps-10" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="levels"><Building className="w-4 h-4 me-1" />{language === 'ar' ? 'المراحل' : 'Levels'}</TabsTrigger>
          <TabsTrigger value="grades"><Layers className="w-4 h-4 me-1" />{language === 'ar' ? 'الصفوف' : 'Grades'}</TabsTrigger>
          <TabsTrigger value="sections"><Users className="w-4 h-4 me-1" />{language === 'ar' ? 'الشُعب' : 'Sections'}</TabsTrigger>
          <TabsTrigger value="subjects"><BookOpen className="w-4 h-4 me-1" />{language === 'ar' ? 'المواد' : 'Subjects'}</TabsTrigger>
          <TabsTrigger value="rooms"><DoorOpen className="w-4 h-4 me-1" />{language === 'ar' ? 'القاعات' : 'Rooms'}</TabsTrigger>
        </TabsList>

        <TabsContent value="levels" className="mt-6">{renderCards('level', levels, 'level_id', Building, 'bg-blue-500')}</TabsContent>
        <TabsContent value="grades" className="mt-6">{renderCards('grade', grades, 'grade_id', Layers, 'bg-emerald-500')}</TabsContent>
        <TabsContent value="sections" className="mt-6">{renderCards('section', sections, 'section_id', Users, 'bg-amber-500')}</TabsContent>
        <TabsContent value="subjects" className="mt-6">{renderCards('subject', subjects, 'subject_id', BookOpen, 'bg-purple-500')}</TabsContent>
        <TabsContent value="rooms" className="mt-6">{renderCards('room', rooms, 'room_id', DoorOpen, 'bg-rose-500')}</TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editMode ? (language === 'ar' ? 'تعديل' : 'Edit') : (language === 'ar' ? 'إضافة' : 'Add')} {' '}
              {dialogType === 'level' && (language === 'ar' ? 'مرحلة' : 'Level')}
              {dialogType === 'grade' && (language === 'ar' ? 'صف' : 'Grade')}
              {dialogType === 'section' && (language === 'ar' ? 'شعبة' : 'Section')}
              {dialogType === 'subject' && (language === 'ar' ? 'مادة' : 'Subject')}
              {dialogType === 'room' && (language === 'ar' ? 'قاعة' : 'Room')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'}</Label>
                  <Input value={formData.name_ar || ''} onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الاسم بالإنجليزية' : 'English Name'}</Label>
                  <Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
              </div>
              
              {dialogType === 'subject' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الرمز' : 'Code'}</Label>
                      <Input value={formData.code || ''} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="MATH-101" />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الحصص/أسبوع' : 'Hours/Week'}</Label>
                      <Input type="number" min={1} value={formData.credits || 1} onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الأيقونة' : 'Icon'}</Label>
                    <div className="flex gap-2 flex-wrap">
                      {SUBJECT_ICONS.map((icon) => (
                        <button key={icon} type="button" onClick={() => setFormData({ ...formData, icon })} className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center border-2 ${formData.icon === icon ? 'border-primary bg-primary/10' : 'border-muted'}`}>{icon}</button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {dialogType === 'grade' && (
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'المرحلة' : 'Level'}</Label>
                  <Select value={formData.level_id || ''} onValueChange={(v) => setFormData({ ...formData, level_id: v })}>
                    <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'اختر المرحلة' : 'Select Level'} /></SelectTrigger>
                    <SelectContent>{levels.map(l => <SelectItem key={l.level_id} value={l.level_id}>{l.name_ar || l.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              
              {dialogType === 'section' && (
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الصف' : 'Grade'}</Label>
                  <Select value={formData.grade_id || ''} onValueChange={(v) => setFormData({ ...formData, grade_id: v })}>
                    <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'اختر الصف' : 'Select Grade'} /></SelectTrigger>
                    <SelectContent>{grades.map(g => <SelectItem key={g.grade_id} value={g.grade_id}>{g.name_ar || g.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              
              {dialogType === 'room' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'النوع' : 'Type'}</Label>
                      <Select value={formData.type || 'classroom'} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="classroom">{language === 'ar' ? 'فصل دراسي' : 'Classroom'}</SelectItem>
                          <SelectItem value="lab">{language === 'ar' ? 'مختبر' : 'Lab'}</SelectItem>
                          <SelectItem value="computer_lab">{language === 'ar' ? 'معمل حاسوب' : 'Computer Lab'}</SelectItem>
                          <SelectItem value="library">{language === 'ar' ? 'مكتبة' : 'Library'}</SelectItem>
                          <SelectItem value="gym">{language === 'ar' ? 'صالة رياضية' : 'Gym'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'السعة' : 'Capacity'}</Label>
                      <Input type="number" min={1} value={formData.capacity || 30} onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })} />
                    </div>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
              <Button type="submit" disabled={submitting}>{submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (language === 'ar' ? 'حفظ' : 'Save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
