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
  
  // Check for session_id in URL fragment (OAuth callback)
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
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
      </Route>

      <Route
        path="/students"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentsPage />} />
      </Route>

      <Route
        path="/teachers"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TeachersPage />} />
      </Route>

      <Route
        path="/grades"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<GradesPage />} />
      </Route>

      <Route
        path="/subjects"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SubjectsPage />} />
      </Route>

      <Route
        path="/exams"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ExamsPage />} />
      </Route>

      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AttendancePage />} />
      </Route>

      <Route
        path="/finance"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<FinancePage />} />
      </Route>

      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MessagesPage />} />
      </Route>

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ReportsPage />} />
      </Route>

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SettingsPage />} />
      </Route>

      <Route
        path="/schedule"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SchedulePage />} />
      </Route>

      <Route
        path="/activity-log"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'school_admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ActivityLogPage />} />
      </Route>

      <Route
        path="/schools"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'support_agent']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SchoolsPage />} />
      </Route>

      <Route
        path="/licenses"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'support_agent']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<LicensesPage />} />
      </Route>

      <Route
        path="/ai-assistant"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AIAssistantPage />} />
      </Route>

      {/* Placeholder routes for other pages */}
      <Route
        path="/grades"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PlaceholderPage title="الصفوف الدراسية" />} />
      </Route>

      <Route
        path="/subjects"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PlaceholderPage title="المواد الدراسية" />} />
      </Route>

      <Route
        path="/exams"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PlaceholderPage title="الاختبارات" />} />
      </Route>

      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PlaceholderPage title="الحضور والغياب" />} />
      </Route>

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PlaceholderPage title="الإشعارات" />} />
      </Route>

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PlaceholderPage title="الإعدادات" />} />
      </Route>

      <Route
        path="/support"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'support_agent']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PlaceholderPage title="الدعم الفني" />} />
      </Route>

      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PlaceholderPage title="التقويم" />} />
      </Route>

      <Route
        path="/invoices"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<FinancePage />} />
      </Route>

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PlaceholderPage title="التقارير" />} />
      </Route>

      {/* Catch all - redirect to dashboard if authenticated, otherwise to login */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

// Placeholder Page Component
const PlaceholderPage = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center" data-testid="placeholder-page">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      </div>
      <h2 className="font-heading text-2xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground">قريباً...</p>
    </div>
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
