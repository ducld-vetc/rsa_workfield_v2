import React from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import DemoControls from './components/DemoControls';
import DeviceChrome from './components/DeviceChrome';
import { RoleGuard, RoleHomeRedirect } from './components/RoleGuard';
import { RoleRouteSync } from './components/RoleRouteSync';
import FilterSheet from './components/FilterSheet';
import { LocationModal } from './components/LocationModal';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AccountLockedPage from './pages/AccountLockedPage';
import ActivityPage from './pages/ActivityPage';
import CameraPage from './pages/CameraPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ExtraCostsPage from './pages/ExtraCostsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import RescuePage from './pages/RescuePage';
import JobNavigationPage from './pages/JobNavigationPage';
import LoginPage from './pages/LoginPage';
import MapPage from './pages/MapPage';
import NewPasswordPage from './pages/NewPasswordPage';
import NotificationDetailPage from './pages/NotificationDetailPage';
import NotificationsPage from './pages/NotificationsPage';
import OrderDetailPage from './pages/OrderDetailPage';
import OtpPage from './pages/OtpPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentWaitPage from './pages/PaymentWaitPage';
import QuoteFormPage from './pages/QuoteFormPage';
import QuoteListPage from './pages/QuoteListPage';
import SettingsPage from './pages/SettingsPage';
import { FilterState } from './types';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const LoginRedirect: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const { driverRole } = useApp();
  const navigate = useNavigate();

  const handleLogin = () => {
    onLogin();
    const dest =
      driverRole === 'quote-only' ? '/quotes' : '/home';
    navigate(dest);
  };

  return <LoginPage onLogin={handleLogin} />;
};

const AppRoutes: React.FC = () => {
  const { isLoggedIn, login, logout } = useAuth();
  const { appliedFilter, setAppliedFilter, emptyFilter } = useApp();
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [filterDraft, setFilterDraft] = React.useState<FilterState>(emptyFilter);
  const [locationPrompt, setLocationPrompt] = React.useState(false);

  const handleLogin = () => {
    login();
    setLocationPrompt(true);
  };

  return (
    <>
      <RoleRouteSync />
      <Routes>
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <RoleHomeRedirect />
            ) : (
              <LoginRedirect onLogin={handleLogin} />
            )
          }
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/new-password" element={<NewPasswordPage />} />
        <Route path="/account-locked" element={<AccountLockedPage />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <RoleGuard allow={['quote-rescue', 'rescue-only']}>
                <RescuePage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotes"
          element={
            <ProtectedRoute>
              <RoleGuard allow={['quote-rescue', 'quote-only']}>
                <QuoteListPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotes/:id"
          element={
            <ProtectedRoute>
              <RoleGuard allow={['quote-rescue', 'quote-only']}>
                <QuoteFormPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/activity"
          element={
            <ProtectedRoute>
              <RoleGuard allow={['quote-rescue', 'rescue-only', 'quote-only']}>
                <ActivityPage
                  onOpenFilter={() => {
                    setFilterDraft(appliedFilter);
                    setFilterOpen(true);
                  }}
                />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
        <Route path="/jobs/:id" element={<ProtectedRoute><JobNavigationPage /></ProtectedRoute>} />
        <Route path="/jobs/:id/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
        <Route path="/jobs/:id/camera" element={<ProtectedRoute><CameraPage /></ProtectedRoute>} />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage
                onLogout={() => {
                  logout();
                }}
              />
            </ProtectedRoute>
          }
        />
        <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
        <Route path="/notifications/:id" element={<ProtectedRoute><NotificationDetailPage /></ProtectedRoute>} />
        <Route path="/extra-costs/:id" element={<ProtectedRoute><ExtraCostsPage /></ProtectedRoute>} />
        <Route path="/payment-wait/:id" element={<ProtectedRoute><PaymentWaitPage /></ProtectedRoute>} />
        <Route path="/payment-success/:id" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><RoleHomeRedirect /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={isLoggedIn ? '/' : '/login'} replace />} />
      </Routes>

      <FilterSheet
        open={filterOpen}
        value={filterDraft}
        onChange={setFilterDraft}
        onClose={() => setFilterOpen(false)}
        onApply={() => {
          setAppliedFilter(filterDraft);
          setFilterOpen(false);
        }}
        onClear={() => setFilterDraft(emptyFilter)}
      />

      <LocationModal
        open={locationPrompt}
        onAllow={() => setLocationPrompt(false)}
        onDeny={() => setLocationPrompt(false)}
      />
    </>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppProvider>
      <div className="dm-preview-frame">
        <DemoControls />
        <div className="dm-iphone-frame">
          <div className="dm-device dm-device--chrome">
            <DeviceChrome />
            <div className="dm-device__app">
              <AppRoutes />
            </div>
          </div>
        </div>
        <p className="dm-preview-hint">
          Preview — Workfield Driver · Báo giá + Cứu hộ · Dữ liệu mẫu
        </p>
      </div>
    </AppProvider>
  </AuthProvider>
);

export default App;
