import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  DollarSign,
  FileText,
  Bell,
  Settings,
  Building2,
  Key,
  HeadphonesIcon,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bot,
  ClipboardList,
  UserCheck,
  BarChart3,
  Clock,
  Activity,
  Layers,
} from 'lucide-react';

export const Sidebar = ({ collapsed, onToggle }) => {
  const { user, logout, isSuperAdmin, isSchoolAdmin, isTeacher, isStudent, isParent, isAccountant } = useAuth();
  const { t, isRTL } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Navigation items based on role
  const getNavItems = () => {
    const items = [];

    // Dashboard - for all roles
    items.push({
      icon: LayoutDashboard,
      label: t('dashboard'),
      href: '/dashboard',
    });

    // Super Admin items
    if (isSuperAdmin) {
      items.push(
        { icon: Building2, label: t('schools'), href: '/schools' },
        { icon: Key, label: t('licenses'), href: '/licenses' },
        { icon: Activity, label: language === 'ar' ? 'سجل النشاط' : 'Activity Log', href: '/activity-log' },
      );
    }

    // School Admin / Manager items
    if (isSchoolAdmin || user?.role === 'school_manager') {
      items.push(
        { icon: Users, label: t('students'), href: '/students' },
        { icon: GraduationCap, label: t('teachers'), href: '/teachers' },
        { icon: Layers, label: language === 'ar' ? 'الصفوف والشعب' : 'Grades', href: '/grades' },
        { icon: BookOpen, label: t('subjects'), href: '/subjects' },
        { icon: FileText, label: t('exams'), href: '/exams' },
        { icon: UserCheck, label: t('attendance'), href: '/attendance' },
        { icon: Clock, label: language === 'ar' ? 'الجدول' : 'Schedule', href: '/schedule' },
        { icon: DollarSign, label: t('finance'), href: '/finance' },
        { icon: MessageSquare, label: language === 'ar' ? 'الرسائل' : 'Messages', href: '/messages' },
        { icon: BarChart3, label: t('reports'), href: '/reports' },
        { icon: Activity, label: language === 'ar' ? 'سجل النشاط' : 'Activity Log', href: '/activity-log' },
        { icon: Settings, label: t('settings'), href: '/settings' },
      );
    }

    // Teacher items
    if (isTeacher) {
      items.push(
        { icon: Users, label: t('students'), href: '/students' },
        { icon: BookOpen, label: t('subjects'), href: '/subjects' },
        { icon: FileText, label: t('exams'), href: '/exams' },
        { icon: UserCheck, label: t('attendance'), href: '/attendance' },
        { icon: Clock, label: language === 'ar' ? 'الجدول' : 'Schedule', href: '/schedule' },
        { icon: MessageSquare, label: language === 'ar' ? 'الرسائل' : 'Messages', href: '/messages' },
      );
    }

    // Student items
    if (isStudent) {
      items.push(
        { icon: BookOpen, label: t('subjects'), href: '/subjects' },
        { icon: FileText, label: t('exams'), href: '/exams' },
        { icon: Clock, label: language === 'ar' ? 'الجدول' : 'Schedule', href: '/schedule' },
        { icon: DollarSign, label: t('finance'), href: '/finance' },
        { icon: MessageSquare, label: language === 'ar' ? 'الرسائل' : 'Messages', href: '/messages' },
      );
    }

    // Parent items
    if (isParent) {
      items.push(
        { icon: Users, label: t('students'), href: '/students' },
        { icon: UserCheck, label: t('attendance'), href: '/attendance' },
        { icon: FileText, label: t('exams'), href: '/exams' },
        { icon: DollarSign, label: t('finance'), href: '/finance' },
        { icon: MessageSquare, label: language === 'ar' ? 'الرسائل' : 'Messages', href: '/messages' },
      );
    }

    // Accountant items
    if (isAccountant) {
      items.push(
        { icon: DollarSign, label: t('finance'), href: '/finance' },
        { icon: BarChart3, label: t('reports'), href: '/reports' },
        { icon: MessageSquare, label: language === 'ar' ? 'الرسائل' : 'Messages', href: '/messages' },
      );
    }

    // AI Assistant - for all authenticated users
    items.push({
      icon: Bot,
      label: t('ai_assistant'),
      href: '/ai-assistant',
    });

    return items;
  };

  const navItems = getNavItems();

  return (
    <aside
      className={cn(
        'fixed top-0 h-screen bg-card border-e border-border transition-all duration-300 z-40 flex flex-col',
        collapsed ? 'w-16' : 'w-64',
        isRTL ? 'right-0' : 'left-0'
      )}
      data-testid="sidebar"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-border px-4">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-heading font-bold text-lg gradient-text">
              {t('app_name')}
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                data-testid={`nav-${item.href.slice(1)}`}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  collapsed && 'justify-center'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User & Logout */}
      <div className="border-t border-border p-4">
        {!collapsed && user && (
          <div className="mb-3 px-2">
            <p className="font-medium text-sm truncate">{user.name_ar || user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'default'}
          onClick={handleLogout}
          className={cn('w-full text-destructive hover:text-destructive hover:bg-destructive/10', collapsed && 'justify-center')}
          data-testid="logout-btn"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="me-2">{t('logout')}</span>}
        </Button>
      </div>

      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className={cn(
          'absolute top-20 -translate-y-1/2 w-6 h-6 rounded-full bg-card border border-border shadow-sm',
          isRTL ? '-left-3' : '-right-3'
        )}
        data-testid="sidebar-toggle"
      >
        {isRTL ? (
          collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
        ) : (
          collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
        )}
      </Button>
    </aside>
  );
};
