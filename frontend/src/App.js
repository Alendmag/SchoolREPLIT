import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { DashboardLayout } from './components/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuthCallback from './pages/AuthCallback';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import TeachersPage from './pages/TeachersPage';
import GradesPage from './pages/GradesPage';
import SubjectsPage from './pages/SubjectsPage';
import ExamsPage from './pages/ExamsPage';
import AttendancePage from './pages/AttendancePage';
import FinancePage from './pages/FinancePage';
import MessagesPage from './pages/MessagesPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import SchedulePage from './pages/SchedulePage';
import ActivityLogPage from './pages/ActivityLogPage';
import SchoolsPage from './pages/SchoolsPage';
import LicensesPage from './pages/LicensesPage';
import AIAssistantPage from './pages/AIAssistantPage';
import OnboardingPage from './pages/OnboardingPage';
import NotificationsPage from './pages/NotificationsPage';
import ExportReportsPage from './pages/ExportReportsPage';

import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// App Router Component
const AppRouter = () => {
  const location = useLocation();
  
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected Routes - Dashboard Layout */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
      </Route>

      <Route path="/students" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<StudentsPage />} />
      </Route>

      <Route path="/teachers" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<TeachersPage />} />
      </Route>

      <Route path="/grades" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<GradesPage />} />
      </Route>

      <Route path="/subjects" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<SubjectsPage />} />
      </Route>

      <Route path="/exams" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<ExamsPage />} />
      </Route>

      <Route path="/attendance" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<AttendancePage />} />
      </Route>

      <Route path="/finance" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<FinancePage />} />
      </Route>

      <Route path="/invoices" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<FinancePage />} />
      </Route>

      <Route path="/messages" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<MessagesPage />} />
      </Route>

      <Route path="/notifications" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<MessagesPage />} />
      </Route>

      <Route path="/reports" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<ReportsPage />} />
      </Route>

      <Route path="/settings" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<SettingsPage />} />
      </Route>

      <Route path="/schedule" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<SchedulePage />} />
      </Route>

      <Route path="/activity-log" element={<ProtectedRoute allowedRoles={['super_admin', 'school_admin']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<ActivityLogPage />} />
      </Route>

      {/* Super Admin Routes */}
      <Route path="/schools" element={<ProtectedRoute allowedRoles={['super_admin', 'support_agent']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<SchoolsPage />} />
      </Route>

      <Route path="/licenses" element={<ProtectedRoute allowedRoles={['super_admin', 'support_agent']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<LicensesPage />} />
      </Route>

      <Route path="/ai-assistant" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<AIAssistantPage />} />
      </Route>

      <Route path="/onboarding" element={<ProtectedRoute allowedRoles={['school_admin', 'school_manager']}><OnboardingPage /></ProtectedRoute>} />

      <Route path="/notifications" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<NotificationsPage />} />
      </Route>

      <Route path="/export-reports" element={<ProtectedRoute allowedRoles={['super_admin', 'school_admin', 'school_manager', 'accountant']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<ExportReportsPage />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRouter />
          <Toaster 
            position="top-center" 
            richColors 
            closeButton
            toastOptions={{
              className: 'font-body',
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
