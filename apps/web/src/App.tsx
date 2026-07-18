import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage';
import ChangePasswordPage from '@/features/auth/pages/ChangePasswordPage';
import SuperadminOwnersPage from '@/features/superadmin/pages/SuperadminOwnersPage';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import MembersPage from '@/features/members/pages/MembersPage';
import MemberDetailPage from '@/features/members/pages/MemberDetailPage';
import PlansPage from '@/features/plans/pages/PlansPage';
import PaymentsPage from '@/features/payments/pages/PaymentsPage';
import RenewalsPage from '@/features/renewals/pages/RenewalsPage';
import ExpiryPage from '@/features/expiry/pages/ExpiryPage';
import ReportsPage from '@/features/reports/pages/ReportsPage';
import SettingsPage from '@/features/settings/pages/SettingsPage';
import EventsPage from '@/features/events/pages/EventsPage';
import PublicEventPage from '@/features/events/pages/PublicEventPage';
import EventRegistrationsPage from '@/features/events/pages/EventRegistrationsPage';

export default function App() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <Routes>
      {/* Public Unauthenticated routes */}
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

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {user?.role === 'superadmin' ? (
            <>
              <Route index element={<SuperadminOwnersPage />} />
              <Route path="/change-password" element={<ChangePasswordPage />} />
            </>
          ) : (
            <>
              <Route index element={<DashboardPage />} />
              <Route path="/members" element={<MembersPage />} />
              <Route path="/members/:id" element={<MemberDetailPage />} />
              <Route path="/plans" element={<PlansPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/renewals" element={<RenewalsPage />} />
              <Route path="/expiry" element={<ExpiryPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id/registrations" element={<EventRegistrationsPage />} />
              <Route path="/change-password" element={<ChangePasswordPage />} />
            </>
          )}
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
