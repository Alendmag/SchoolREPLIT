import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  DollarSign, 
  Bell, 
  Shield,
  ChevronLeft,
  ChevronRight,
  Globe,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

export default function LandingPage() {
  const { t, language, toggleLanguage, isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Users,
      title: t('feature_students'),
      description: t('feature_students_desc'),
      color: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      icon: GraduationCap,
      title: t('feature_teachers'),
      description: t('feature_teachers_desc'),
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      icon: DollarSign,
      title: t('feature_finance'),
      description: t('feature_finance_desc'),
      color: 'bg-amber-500/10 text-amber-600',
    },
    {
      icon: BookOpen,
      title: t('feature_reports'),
      description: t('feature_reports_desc'),
      color: 'bg-purple-500/10 text-purple-600',
    },
    {
      icon: Bell,
      title: t('feature_communication'),
      description: t('feature_communication_desc'),
      color: 'bg-pink-500/10 text-pink-600',
    },
    {
      icon: Shield,
      title: t('feature_security'),
      description: t('feature_security_desc'),
      color: 'bg-slate-500/10 text-slate-600',
    },
  ];

  const pricingPlans = [
    {
      name: language === 'ar' ? 'شهري' : 'Monthly',
      price: '99',
      currency: language === 'ar' ? 'د.ل' : 'LYD',
      period: language === 'ar' ? '/شهر' : '/month',
      features: [
        language === 'ar' ? 'حتى 500 طالب' : 'Up to 500 students',
        language === 'ar' ? 'حتى 50 معلم' : 'Up to 50 teachers',
        language === 'ar' ? 'جميع الميزات الأساسية' : 'All basic features',
        language === 'ar' ? 'دعم فني' : 'Technical support',
      ],
    },
    {
      name: language === 'ar' ? 'سنوي' : 'Yearly',
      price: '899',
      currency: language === 'ar' ? 'د.ل' : 'LYD',
      period: language === 'ar' ? '/سنة' : '/year',
      popular: true,
      features: [
        language === 'ar' ? 'حتى 1000 طالب' : 'Up to 1000 students',
        language === 'ar' ? 'حتى 100 معلم' : 'Up to 100 teachers',
        language === 'ar' ? 'جميع الميزات' : 'All features',
        language === 'ar' ? 'دعم فني أولوية' : 'Priority support',
        language === 'ar' ? 'شهرين مجاناً' : '2 months free',
      ],
    },
    {
      name: language === 'ar' ? 'مدى الحياة' : 'Lifetime',
      price: '4,999',
      currency: language === 'ar' ? 'د.ل' : 'LYD',
      period: '',
      features: [
        language === 'ar' ? 'طلاب غير محدود' : 'Unlimited students',
        language === 'ar' ? 'معلمين غير محدود' : 'Unlimited teachers',
        language === 'ar' ? 'جميع الميزات' : 'All features',
        language === 'ar' ? 'دعم مخصص' : 'Dedicated support',
        language === 'ar' ? 'تحديثات مجانية' : 'Free updates',
      ],
    },
  ];

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full bg-card/80 backdrop-blur-md border-b border-border z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-xl">{t('app_name')}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t('features')}
            </a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t('pricing')}
            </a>
            <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t('contact')}
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              data-testid="landing-lang-toggle"
            >
              <Globe className="w-5 h-5" />
            </Button>
            
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button data-testid="go-to-dashboard-btn">
                  {t('dashboard')}
                  <Arrow className="w-4 h-4 ms-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" data-testid="login-btn">
                    {t('login')}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button data-testid="register-btn">
                    {t('get_started')}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
            <GraduationCap className="w-4 h-4" />
            <span>{language === 'ar' ? 'الإصدار الأحدث متاح الآن' : 'Latest version available now'}</span>
          </div>
          
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in stagger-1">
            {t('hero_title')}
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in stagger-2">
            {t('hero_subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in stagger-3">
            <Link to="/register">
              <Button size="lg" className="text-lg px-8 py-6" data-testid="hero-get-started-btn">
                {t('get_started')}
                <Arrow className="w-5 h-5 ms-2" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6" data-testid="hero-learn-more-btn">
                {t('learn_more')}
              </Button>
            </a>
          </div>
        </div>

        {/* Hero Image */}
        <div className="container mx-auto mt-16 max-w-5xl animate-fade-in stagger-4">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border">
            <img 
              src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2600&auto=format&fit=crop" 
              alt="School Management"
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              {t('features')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === 'ar' 
                ? 'نظام متكامل يوفر كل ما تحتاجه لإدارة مدرستك بكفاءة عالية'
                : 'A comprehensive system that provides everything you need to manage your school efficiently'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-lg transition-shadow duration-300"
                data-testid={`feature-card-${index}`}
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              {t('pricing')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === 'ar' 
                ? 'اختر الخطة المناسبة لحجم مدرستك واحتياجاتك'
                : 'Choose the right plan for your school size and needs'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
                data-testid={`pricing-card-${index}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 start-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                    {language === 'ar' ? 'الأكثر شيوعاً' : 'Most Popular'}
                  </div>
                )}
                <CardContent className="p-6 pt-8">
                  <h3 className="font-heading text-xl font-semibold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.currency}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? 'default' : 'outline'}
                    data-testid={`pricing-btn-${index}`}
                  >
                    {t('get_started')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
            {language === 'ar' ? 'ابدأ إدارة مدرستك اليوم' : 'Start Managing Your School Today'}
          </h2>
          <p className="text-lg opacity-90 mb-8">
            {language === 'ar' 
              ? 'انضم إلى مئات المدارس التي تستخدم نظامنا لإدارة عملياتها بكفاءة'
              : 'Join hundreds of schools using our system to manage their operations efficiently'}
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8" data-testid="cta-get-started-btn">
              {t('get_started')}
              <Arrow className="w-5 h-5 ms-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-12 px-4 bg-card border-t border-border">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-heading font-bold text-lg">{t('app_name')}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' 
                  ? 'نظام إدارة المدارس الأكثر تكاملاً في ليبيا'
                  : 'The most comprehensive school management system in Libya'}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{language === 'ar' ? 'روابط سريعة' : 'Quick Links'}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">{t('features')}</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">{t('pricing')}</a></li>
                <li><Link to="/login" className="hover:text-foreground transition-colors">{t('login')}</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{language === 'ar' ? 'الدعم' : 'Support'}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">{language === 'ar' ? 'المساعدة' : 'Help Center'}</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">{language === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">{language === 'ar' ? 'تواصل معنا' : 'Contact Us'}</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{language === 'ar' ? 'تواصل معنا' : 'Contact'}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>info@schoolsms.ly</li>
                <li>+218 91 000 0000</li>
                <li>{language === 'ar' ? 'طرابلس، ليبيا' : 'Tripoli, Libya'}</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 {t('app_name')}. {language === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
