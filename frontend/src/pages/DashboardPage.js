import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Users, 
  GraduationCap, 
  Building2, 
  DollarSign, 
  Key,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  UserPlus,
  FileText,
  Bell,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function DashboardPage() {
  const { user, api, isSuperAdmin } = useAuth();
  const { t, language, isRTL } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const endpoint = isSuperAdmin ? '/dashboard/super-admin' : '/dashboard/school';
      const response = await api.get(endpoint);
      setStats(response.data);
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  // Sample chart data
  const revenueData = [
    { month: language === 'ar' ? 'يناير' : 'Jan', revenue: 4500 },
    { month: language === 'ar' ? 'فبراير' : 'Feb', revenue: 5200 },
    { month: language === 'ar' ? 'مارس' : 'Mar', revenue: 4800 },
    { month: language === 'ar' ? 'أبريل' : 'Apr', revenue: 6100 },
    { month: language === 'ar' ? 'مايو' : 'May', revenue: 5800 },
    { month: language === 'ar' ? 'يونيو' : 'Jun', revenue: 7200 },
  ];

  const attendanceData = [
    { name: t('present'), value: stats?.attendance_today?.present || 85, color: '#10b981' },
    { name: t('absent'), value: stats?.attendance_today?.absent || 10, color: '#ef4444' },
    { name: t('late'), value: 5, color: '#f59e0b' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Super Admin Dashboard
  if (isSuperAdmin) {
    return (
      <div className="space-y-8 animate-fade-in" data-testid="super-admin-dashboard">
        {/* Header */}
        <div>
          <h1 className="font-heading text-3xl font-bold">{t('dashboard')}</h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ar' ? 'مرحباً بك في لوحة تحكم النظام' : 'Welcome to the system dashboard'}
          </p>
        </div>

        {/* Stats Grid - Bento Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow" data-testid="stat-total-schools">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('total_schools')}</p>
                  <p className="text-3xl font-bold mt-1">{stats?.total_schools || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-sm text-success">
                <TrendingUp className="w-4 h-4" />
                <span>+12%</span>
                <span className="text-muted-foreground">{language === 'ar' ? 'هذا الشهر' : 'this month'}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow" data-testid="stat-total-students">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('total_students')}</p>
                  <p className="text-3xl font-bold mt-1">{stats?.total_students || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow" data-testid="stat-total-teachers">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('total_teachers')}</p>
                  <p className="text-3xl font-bold mt-1">{stats?.total_teachers || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow" data-testid="stat-total-revenue">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('total_revenue')}</p>
                  <p className="text-3xl font-bold mt-1">
                    {(stats?.total_revenue || 0).toLocaleString()} 
                    <span className="text-sm font-normal text-muted-foreground ms-1">
                      {language === 'ar' ? 'د.ل' : 'LYD'}
                    </span>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* License Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-amber-500/50 bg-amber-500/5" data-testid="expiring-licenses-card">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold">{t('expiring_licenses')}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === 'ar' 
                      ? `${stats?.expiring_licenses || 0} تراخيص تنتهي خلال 30 يوم`
                      : `${stats?.expiring_licenses || 0} licenses expiring within 30 days`}
                  </p>
                  <Link to="/licenses">
                    <Button variant="link" className="px-0 mt-2" data-testid="view-licenses-btn">
                      {t('view_all')}
                      <Arrow className="w-4 h-4 ms-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/50 bg-primary/5" data-testid="active-licenses-card">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Key className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{t('active_licenses')}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === 'ar' 
                      ? `${stats?.active_licenses || 0} ترخيص نشط`
                      : `${stats?.active_licenses || 0} active licenses`}
                  </p>
                  <Link to="/licenses">
                    <Button variant="link" className="px-0 mt-2" data-testid="manage-licenses-btn">
                      {language === 'ar' ? 'إدارة التراخيص' : 'Manage Licenses'}
                      <Arrow className="w-4 h-4 ms-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card data-testid="revenue-chart-card">
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'الإيرادات الشهرية' : 'Monthly Revenue'}</CardTitle>
            <CardDescription>
              {language === 'ar' ? 'إجمالي الإيرادات خلال الأشهر الستة الماضية' : 'Total revenue over the last 6 months'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card data-testid="quick-actions-card">
          <CardHeader>
            <CardTitle>{t('quick_actions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/schools">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2" data-testid="quick-add-school">
                  <Building2 className="w-5 h-5" />
                  <span>{t('add_school')}</span>
                </Button>
              </Link>
              <Link to="/licenses">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2" data-testid="quick-manage-licenses">
                  <Key className="w-5 h-5" />
                  <span>{t('licenses')}</span>
                </Button>
              </Link>
              <Link to="/support">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2" data-testid="quick-support">
                  <Bell className="w-5 h-5" />
                  <span>{t('support')}</span>
                </Button>
              </Link>
              <Link to="/reports">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2" data-testid="quick-reports">
                  <FileText className="w-5 h-5" />
                  <span>{t('reports')}</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // School Admin/Other Roles Dashboard
  return (
    <div className="space-y-8 animate-fade-in" data-testid="school-dashboard">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold">{t('dashboard')}</h1>
        <p className="text-muted-foreground mt-1">
          {language === 'ar' 
            ? `مرحباً ${user?.name_ar || user?.name}، إليك نظرة عامة على مدرستك`
            : `Welcome ${user?.name}, here's an overview of your school`}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow" data-testid="stat-students">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('total_students')}</p>
                <p className="text-3xl font-bold mt-1">{stats?.total_students || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow" data-testid="stat-teachers">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('total_teachers')}</p>
                <p className="text-3xl font-bold mt-1">{stats?.total_teachers || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow" data-testid="stat-collected">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('total_collected')}</p>
                <p className="text-3xl font-bold mt-1">
                  {(stats?.finance?.total_collected || 0).toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground ms-1">
                    {language === 'ar' ? 'د.ل' : 'LYD'}
                  </span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow" data-testid="stat-pending">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('total_pending')}</p>
                <p className="text-3xl font-bold mt-1">
                  {(stats?.finance?.pending || 0).toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground ms-1">
                    {language === 'ar' ? 'د.ل' : 'LYD'}
                  </span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Pie Chart */}
        <Card data-testid="attendance-chart-card">
          <CardHeader>
            <CardTitle>{t('attendance_today')}</CardTitle>
            <CardDescription>
              {language === 'ar' ? 'توزيع الحضور لهذا اليوم' : "Today's attendance distribution"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {attendanceData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Finance Bar Chart */}
        <Card data-testid="finance-chart-card">
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'ملخص المالية' : 'Finance Summary'}</CardTitle>
            <CardDescription>
              {language === 'ar' ? 'الفواتير والمدفوعات' : 'Invoices and payments'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={[
                    { 
                      name: t('total_invoiced'), 
                      value: stats?.finance?.total_invoiced || 0 
                    },
                    { 
                      name: t('total_collected'), 
                      value: stats?.finance?.total_collected || 0 
                    },
                    { 
                      name: t('total_pending'), 
                      value: stats?.finance?.pending || 0 
                    },
                  ]}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Notifications */}
      <Card data-testid="recent-notifications-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{language === 'ar' ? 'آخر الإشعارات' : 'Recent Notifications'}</CardTitle>
            <CardDescription>
              {language === 'ar' ? 'آخر 5 إشعارات' : 'Last 5 notifications'}
            </CardDescription>
          </div>
          <Link to="/notifications">
            <Button variant="outline" size="sm" data-testid="view-all-notifications-btn">
              {t('view_all')}
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {stats?.recent_notifications?.length > 0 ? (
            <div className="space-y-4">
              {stats.recent_notifications.map((notif, index) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{notif.title_ar || notif.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{notif.message_ar || notif.message}</p>
                  </div>
                  <Badge variant="outline" className="flex-shrink-0">
                    {notif.notification_type}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">{t('no_data')}</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card data-testid="school-quick-actions-card">
        <CardHeader>
          <CardTitle>{t('quick_actions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/students">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2" data-testid="quick-students">
                <UserPlus className="w-5 h-5" />
                <span>{t('add_student')}</span>
              </Button>
            </Link>
            <Link to="/attendance">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2" data-testid="quick-attendance">
                <CheckCircle className="w-5 h-5" />
                <span>{t('attendance')}</span>
              </Button>
            </Link>
            <Link to="/finance">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2" data-testid="quick-finance">
                <DollarSign className="w-5 h-5" />
                <span>{t('create_invoice')}</span>
              </Button>
            </Link>
            <Link to="/notifications">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2" data-testid="quick-notification">
                <Bell className="w-5 h-5" />
                <span>{t('send_notification')}</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
