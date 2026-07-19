import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import LandingPage from '@/features/landing/pages/LandingPage';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage';
import ChangePasswordPage from '@/features/auth/pages/ChangePasswordPage';
import SuperadminOwnersPage from '@/features/superadmin/pages/SuperadminOwnersPage';
import SuperadminVerificationQueuePage from '@/features/superadmin/pages/SuperadminVerificationQueuePage';
import SuperadminSaaSSettingsPage from '@/features/superadmin/pages/SuperadminSaaSSettingsPage';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import MembersPage from '@/features/members/pages/MembersPage';
import MemberDetailPage from '@/features/members/pages/MemberDetailPage';
import PlansPage from '@/features/plans/pages/PlansPage';
import SaaSSubscriptionPage from '@/features/plans/pages/SaaSSubscriptionPage';
import PaymentsPage from '@/features/payments/pages/PaymentsPage';
import RenewalsPage from '@/features/renewals/pages/RenewalsPage';
import ExpiryPage from '@/features/expiry/pages/ExpiryPage';
import ReportsPage from '@/features/reports/pages/ReportsPage';
import SettingsPage from '@/features/settings/pages/SettingsPage';
import EventsPage from '@/features/events/pages/EventsPage';
import PublicEventPage from '@/features/events/pages/PublicEventPage';
import EventRegistrationsPage from '@/features/events/pages/EventRegistrationsPage';

function FullScreenLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Rendered at "/" (and its nested paths) when the user is NOT authenticated.
 * The marketing landing page is public; any deeper app path redirects to login.
 */
function PublicGate() {
  const location = useLocation();
  if (location.pathname === '/') return <LandingPage />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const isSuperadmin = user?.role === 'superadmin';

  const rootElement = isLoading ? (
    <FullScreenLoader />
  ) : isAuthenticated ? (
    <AppLayout />
  ) : (
    <PublicGate />
  );

  return (
    <Routes>
      {/* Public unauthenticated route */}
      <Route path="/e/:id" element={<PublicEventPage />} />

      {/* Auth routes */}
      <Route
        path="/login"
        element={isAuthenticated && !isLoading ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated && !isLoading ? <Navigate to="/" replace /> : <RegisterPage />}
      />
      <Route
        path="/forgot-password"
        element={isAuthenticated && !isLoading ? <Navigate to="/" replace /> : <ForgotPasswordPage />}
      />
      <Route
        path="/reset-password"
        element={isAuthenticated && !isLoading ? <Navigate to="/" replace /> : <ResetPasswordPage />}
      />

      {/*
        Root: landing page for guests, authenticated app shell for signed-in users.
        Nested app routes only render when AppLayout provides an <Outlet />.
      */}
      <Route path="/" element={rootElement}>
        {isSuperadmin ? (
          <>
            <Route index element={<SuperadminOwnersPage />} />
            <Route path="verification-queue" element={<SuperadminVerificationQueuePage />} />
            <Route path="saas-settings" element={<SuperadminSaaSSettingsPage />} />
            <Route path="change-password" element={<ChangePasswordPage />} />
          </>
        ) : (
          <>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="members" element={<MembersPage />} />
            <Route path="members/:id" element={<MemberDetailPage />} />
            <Route path="plans" element={<PlansPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="renewals" element={<RenewalsPage />} />
            <Route path="expiry" element={<ExpiryPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="subscription" element={<SaaSSubscriptionPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="events/:id/registrations" element={<EventRegistrationsPage />} />
            <Route path="change-password" element={<ChangePasswordPage />} />
          </>
        )}
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
