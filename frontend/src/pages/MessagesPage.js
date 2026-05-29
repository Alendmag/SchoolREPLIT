import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
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
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { 
  MessageSquare, 
  Plus, 
  Send,
  Inbox,
  SendHorizontal,
  Loader2,
  Mail,
  MailOpen,
  Paperclip,
  Trash2,
  Reply,
  Users,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function MessagesPage() {
  const { api, user } = useAuth();
  const { t, language, isRTL } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('inbox');
  const [unreadCount, setUnreadCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [composeForm, setComposeForm] = useState({
    subject: '',
    subject_ar: '',
    content: '',
    content_ar: '',
    recipient_type: 'user',
    recipient_ids: [],
    message_type: 'general'
  });

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = activeTab === 'sent' ? '?sent=true&inbox=false' : '?inbox=true';
      const response = await api.get(`/messages/${params}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Fetch messages error:', error);
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  }, [activeTab, api, t]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get('/messages/unread-count');
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error('Fetch unread count error:', error);
    }
  }, [api]);

  useEffect(() => {
    fetchMessages();
    fetchUnreadCount();
  }, [fetchMessages, fetchUnreadCount]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/messages/', {
        ...composeForm,
        school_id: user.school_id
      });
      toast.success(language === 'ar' ? 'تم إرسال الرسالة بنجاح' : 'Message sent successfully');
      setComposeOpen(false);
      setComposeForm({
        subject: '',
        subject_ar: '',
        content: '',
        content_ar: '',
        recipient_type: 'user',
        recipient_ids: [],
        message_type: 'general'
      });
      fetchMessages();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await api.put(`/messages/${messageId}/read`);
      fetchMessages();
      fetchUnreadCount();
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      handleMarkAsRead(message.message_id);
    }
  };

  const filteredMessages = messages.filter(msg => 
    msg.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.subject_ar?.includes(searchTerm) ||
    msg.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.sender_name?.includes(searchTerm)
  );

  const getMessageTypeColor = (type) => {
    switch (type) {
      case 'urgent': return 'destructive';
      case 'announcement': return 'default';
      default: return 'secondary';
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="messages-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">{language === 'ar' ? 'الرسائل' : 'Messages'}</h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ar' 
              ? `نظام التواصل الداخلي (${unreadCount} غير مقروءة)`
              : `Internal messaging system (${unreadCount} unread)`}
          </p>
        </div>

        <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
          <DialogTrigger asChild>
            <Button data-testid="compose-message-btn">
              <Plus className="w-4 h-4 me-2" />
              {language === 'ar' ? 'رسالة جديدة' : 'New Message'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{language === 'ar' ? 'إرسال رسالة جديدة' : 'Send New Message'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSendMessage}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'نوع المستلم' : 'Recipient Type'}</Label>
                    <Select
                      value={composeForm.recipient_type}
                      onValueChange={(value) => setComposeForm({ ...composeForm, recipient_type: value })}
                    >
                      <SelectTrigger data-testid="recipient-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{language === 'ar' ? 'الجميع' : 'All'}</SelectItem>
                        <SelectItem value="teacher">{language === 'ar' ? 'المعلمون' : 'Teachers'}</SelectItem>
                        <SelectItem value="student">{language === 'ar' ? 'الطلاب' : 'Students'}</SelectItem>
                        <SelectItem value="parent">{language === 'ar' ? 'أولياء الأمور' : 'Parents'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'نوع الرسالة' : 'Message Type'}</Label>
                    <Select
                      value={composeForm.message_type}
                      onValueChange={(value) => setComposeForm({ ...composeForm, message_type: value })}
                    >
                      <SelectTrigger data-testid="message-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">{language === 'ar' ? 'عام' : 'General'}</SelectItem>
                        <SelectItem value="announcement">{language === 'ar' ? 'إعلان' : 'Announcement'}</SelectItem>
                        <SelectItem value="urgent">{language === 'ar' ? 'عاجل' : 'Urgent'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الموضوع' : 'Subject'}</Label>
                  <Input
                    value={composeForm.subject_ar || composeForm.subject}
                    onChange={(e) => setComposeForm({ 
                      ...composeForm, 
                      subject: e.target.value,
                      subject_ar: e.target.value 
                    })}
                    required
                    data-testid="message-subject-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'المحتوى' : 'Content'}</Label>
                  <Textarea
                    value={composeForm.content_ar || composeForm.content}
                    onChange={(e) => setComposeForm({ 
                      ...composeForm, 
                      content: e.target.value,
                      content_ar: e.target.value 
                    })}
                    rows={6}
                    required
                    data-testid="message-content-input"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setComposeOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={submitting} data-testid="send-message-btn">
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 me-2" />
                      {language === 'ar' ? 'إرسال' : 'Send'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
        {/* Messages List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Button
                variant={activeTab === 'inbox' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('inbox')}
                data-testid="inbox-tab"
              >
                <Inbox className="w-4 h-4 me-2" />
                {language === 'ar' ? 'الوارد' : 'Inbox'}
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ms-2">{unreadCount}</Badge>
                )}
              </Button>
              <Button
                variant={activeTab === 'sent' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('sent')}
                data-testid="sent-tab"
              >
                <SendHorizontal className="w-4 h-4 me-2" />
                {language === 'ar' ? 'المرسل' : 'Sent'}
              </Button>
            </div>
            <div className="relative mt-3">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ps-10"
                data-testid="search-messages-input"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-24rem)]">
              {filteredMessages.length > 0 ? (
                filteredMessages.map((message) => (
                  <div
                    key={message.message_id}
                    className={cn(
                      "p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors",
                      selectedMessage?.message_id === message.message_id && "bg-muted",
                      !message.is_read && "bg-primary/5"
                    )}
                    onClick={() => handleSelectMessage(message)}
                    data-testid={`message-item-${message.message_id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                        message.is_read ? "bg-muted" : "bg-primary/10"
                      )}>
                        {message.is_read ? (
                          <MailOpen className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <Mail className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn(
                            "font-medium truncate",
                            !message.is_read && "text-primary"
                          )}>
                            {message.sender_name || (language === 'ar' ? 'مجهول' : 'Unknown')}
                          </p>
                          <Badge variant={getMessageTypeColor(message.message_type)} className="text-xs">
                            {message.message_type === 'urgent' ? (language === 'ar' ? 'عاجل' : 'Urgent') : 
                             message.message_type === 'announcement' ? (language === 'ar' ? 'إعلان' : 'Announcement') :
                             (language === 'ar' ? 'عام' : 'General')}
                          </Badge>
                        </div>
                        <p className={cn(
                          "text-sm truncate",
                          message.is_read ? "text-muted-foreground" : "text-foreground"
                        )}>
                          {message.subject_ar || message.subject}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(message.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('no_data')}</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Message Detail */}
        <Card className="lg:col-span-2">
          {selectedMessage ? (
            <>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selectedMessage.subject_ar || selectedMessage.subject}</CardTitle>
                    <CardDescription className="mt-2">
                      <span className="font-medium">{language === 'ar' ? 'من:' : 'From:'}</span> {selectedMessage.sender_name}
                      <span className="mx-2">•</span>
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Reply className="w-4 h-4 me-2" />
                      {language === 'ar' ? 'رد' : 'Reply'}
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="whitespace-pre-wrap">
                    {selectedMessage.content_ar || selectedMessage.content}
                  </p>
                </div>
                {selectedMessage.attachments?.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <p className="text-sm font-medium mb-3">
                      <Paperclip className="w-4 h-4 inline me-2" />
                      {language === 'ar' ? 'المرفقات' : 'Attachments'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedMessage.attachments.map((attachment, index) => (
                        <Badge key={index} variant="outline" className="cursor-pointer">
                          {attachment}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>{language === 'ar' ? 'اختر رسالة لعرضها' : 'Select a message to view'}</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
