import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Bell, Check, Clock, User, BookOpen, DollarSign, AlertCircle, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const { api } = useAuth();
  const { language } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/notifications/');
      setNotifications(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ' : 'Error');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      toast.success(language === 'ar' ? 'تم تحديد الكل كمقروء' : 'All marked as read');
    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ' : 'Error');
    }
  };

  const getIcon = (type) => {
    const icons = { attendance: User, grade: BookOpen, payment: DollarSign, alert: AlertCircle, system: Bell };
    const Icon = icons[type] || Bell;
    return <Icon className="w-5 h-5" />;
  };

  const getTypeColor = (type) => {
    const colors = { attendance: 'bg-blue-500', grade: 'bg-green-500', payment: 'bg-amber-500', alert: 'bg-red-500', system: 'bg-purple-500' };
    return colors[type] || 'bg-gray-500';
  };

  const filtered = notifications.filter(n => filter === 'all' || (filter === 'unread' && !n.is_read));
  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 animate-fade-in" data-testid="notifications-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">{language === 'ar' ? 'الإشعارات' : 'Notifications'}</h1>
          <p className="text-muted-foreground mt-1">{unreadCount} {language === 'ar' ? 'غير مقروءة' : 'unread'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>{language === 'ar' ? 'الكل' : 'All'}</Button>
          <Button variant={filter === 'unread' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('unread')}>{language === 'ar' ? 'غير مقروءة' : 'Unread'}</Button>
          {unreadCount > 0 && <Button variant="outline" size="sm" onClick={markAllAsRead}><Check className="w-4 h-4 me-1" />{language === 'ar' ? 'تحديد الكل' : 'Mark all'}</Button>}
        </div>
      </div>

      <Card>
        <CardContent className="p-0 divide-y">
          {filtered.length > 0 ? filtered.map((notif) => (
            <div key={notif.notification_id} className={`p-4 flex items-start gap-4 hover:bg-muted/50 transition-colors ${!notif.is_read ? 'bg-primary/5' : ''}`}>
              <div className={`w-10 h-10 rounded-full ${getTypeColor(notif.type)} flex items-center justify-center text-white`}>{getIcon(notif.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{notif.title_ar || notif.title}</p>
                  {!notif.is_read && <Badge variant="default" className="text-xs">{language === 'ar' ? 'جديد' : 'New'}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notif.message_ar || notif.message}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(notif.created_at).toLocaleString(language === 'ar' ? 'ar-LY' : 'en-US')}</span>
                </div>
              </div>
              {!notif.is_read && <Button variant="ghost" size="icon" onClick={() => markAsRead(notif.notification_id)}><Check className="w-4 h-4" /></Button>}
            </div>
          )) : (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{language === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
