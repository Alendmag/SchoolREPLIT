import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  Search,
  Menu,
} from 'lucide-react';
import { Input } from './ui/input';
import { cn } from '../lib/utils';

export const Header = ({ sidebarCollapsed, onMenuClick }) => {
  const { user } = useAuth();
  const { t, language, toggleLanguage, isRTL } = useLanguage();
  const [theme, setTheme] = React.useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleBadge = (role) => {
    const roleLabels = {
      super_admin: { label: 'مدير النظام', variant: 'destructive' },
      school_admin: { label: 'مدير المدرسة', variant: 'default' },
      school_manager: { label: 'مدير', variant: 'secondary' },
      teacher: { label: 'معلم', variant: 'outline' },
      student: { label: 'طالب', variant: 'outline' },
      parent: { label: 'ولي أمر', variant: 'outline' },
      accountant: { label: 'محاسب', variant: 'secondary' },
      support_agent: { label: 'دعم فني', variant: 'destructive' },
    };
    return roleLabels[role] || { label: role, variant: 'outline' };
  };

  return (
    <header 
      className={cn(
        'fixed top-0 h-16 bg-card/80 backdrop-blur-md border-b border-border z-30 transition-all duration-300',
        sidebarCollapsed ? 'w-[calc(100%-4rem)]' : 'w-[calc(100%-16rem)]',
        isRTL 
          ? (sidebarCollapsed ? 'left-0 mr-16' : 'left-0 mr-64')
          : (sidebarCollapsed ? 'right-0 ml-16' : 'right-0 ml-64')
      )}
      data-testid="header"
    >
      <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
          data-testid="mobile-menu-btn"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('search')}
              className="ps-9 bg-muted/50 border-none"
              data-testid="search-input"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            className="relative"
            data-testid="language-toggle"
          >
            <Globe className="w-5 h-5" />
            <span className="absolute -bottom-1 -end-1 text-[10px] font-bold">
              {language === 'ar' ? 'EN' : 'ع'}
            </span>
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="theme-toggle"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            data-testid="notifications-btn"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 end-1 w-2 h-2 bg-destructive rounded-full" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 px-2"
                data-testid="user-menu-trigger"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getInitials(user?.name_ar || user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-start">
                  <p className="text-sm font-medium leading-none">{user?.name_ar || user?.name}</p>
                  <Badge variant={getRoleBadge(user?.role).variant} className="mt-1 text-[10px] px-1 py-0">
                    {getRoleBadge(user?.role).label}
                  </Badge>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.name_ar || user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem data-testid="profile-menu-item">
                {t('profile_settings')}
              </DropdownMenuItem>
              <DropdownMenuItem data-testid="settings-menu-item">
                {t('settings')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
