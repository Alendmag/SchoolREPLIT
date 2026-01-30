import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { 
  Bot, 
  Send, 
  Loader2,
  User,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function AIAssistantPage() {
  const { api, user } = useAuth();
  const { t, language, isRTL } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Add welcome message
    setMessages([
      {
        role: 'assistant',
        content: language === 'ar' 
          ? 'مرحباً! أنا مساعدك الذكي لنظام إدارة المدارس. كيف يمكنني مساعدتك اليوم؟'
          : 'Hello! I am your AI assistant for the School Management System. How can I help you today?',
        timestamp: new Date(),
      }
    ]);
  }, [language]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        message: userMessage.content,
        context: `User role: ${user?.role}, School: ${user?.school_id || 'N/A'}`,
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(response.data.timestamp),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      toast.error(language === 'ar' ? 'حدث خطأ في المحادثة' : 'Chat error occurred');
      
      // Add error message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: language === 'ar' 
          ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
          : 'Sorry, an error occurred. Please try again.',
        timestamp: new Date(),
        error: true,
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const suggestedQuestions = [
    language === 'ar' ? 'كيف أضيف طالب جديد؟' : 'How do I add a new student?',
    language === 'ar' ? 'كيف أنشئ فاتورة؟' : 'How do I create an invoice?',
    language === 'ar' ? 'كيف أسجل الحضور؟' : 'How do I record attendance?',
    language === 'ar' ? 'كيف أرسل إشعار؟' : 'How do I send a notification?',
  ];

  const handleSuggestedQuestion = (question) => {
    setInput(question);
    inputRef.current?.focus();
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in" data-testid="ai-assistant-page">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-primary" />
          {t('ai_assistant')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {language === 'ar' 
            ? 'اسألني أي سؤال حول استخدام نظام إدارة المدارس'
            : 'Ask me anything about using the School Management System'}
        </p>
      </div>

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}
                  data-testid={`message-${index}`}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className={cn(
                      message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                    )}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-3',
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted',
                      message.error && 'bg-destructive/10 text-destructive'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={cn(
                      'text-xs mt-1 opacity-70',
                      message.role === 'user' ? 'text-end' : 'text-start'
                    )}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-secondary">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'جاري الكتابة...' : 'Typing...'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Suggested Questions */}
          {messages.length <= 1 && (
            <div className="px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                {language === 'ar' ? 'أسئلة مقترحة:' : 'Suggested questions:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestedQuestion(question)}
                    className="text-xs"
                    data-testid={`suggested-q-${index}`}
                  >
                    <MessageSquare className="w-3 h-3 me-1" />
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={language === 'ar' ? 'اكتب رسالتك هنا...' : 'Type your message here...'}
                disabled={loading}
                className="flex-1"
                data-testid="ai-input"
              />
              <Button type="submit" disabled={loading || !input.trim()} data-testid="ai-send-btn">
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className={cn('w-4 h-4', isRTL && 'rotate-180')} />
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
