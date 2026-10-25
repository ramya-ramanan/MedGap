import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DisclaimerBanner } from './components/layout/DisclaimerBanner';
import { ToastContainer } from './components/common/ToastContainer';
import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { SignUpPage } from './components/auth/SignUpPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProfileView } from './components/profile/ProfileView';
import { MedicationWalletView } from './components/wallet/MedicationWalletView';
import { PrescriptionsView } from './components/prescriptions/PrescriptionsView';
import { SafetyCheckerView } from './components/safety/SafetyCheckerView';
import { SafetyAlertsView } from './components/alerts/SafetyAlertsView';
import { MedicationHistoryView } from './components/history/MedicationHistoryView';
import { SecureShareView } from './components/share/SecureShareView';
import { SettingsView } from './components/settings/SettingsView';
import { SharedDoctorPortalView } from './components/share/SharedDoctorPortalView';
import { AiAssistantView } from './components/assistant/AiAssistantView';
import { AiAssistantWidget } from './components/assistant/AiAssistantWidget';

// Protected App Shell with Disclaimer, Navbar, and Sidebar
const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-medblue-600 selection:text-white">
      {/* Top Clinical Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Top Navigation Bar */}
      <Navbar onMobileMenuToggle={() => setIsMobileSidebarOpen(true)} />

      {/* Main Layout: Sidebar + View Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Floating AI Assistant Widget for fast triage anywhere */}
      <AiAssistantWidget />

      {/* Global Toast System */}
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing & Authentication Routes */}
        <Route
          path="/"
          element={
            <>
              <DisclaimerBanner compact />
              <LandingPage />
              <ToastContainer />
            </>
          }
        />

        <Route
          path="/login"
          element={
            <>
              <DisclaimerBanner compact />
              <LoginPage />
              <ToastContainer />
            </>
          }
        />

        <Route
          path="/signup"
          element={
            <>
              <DisclaimerBanner compact />
              <SignUpPage />
              <ToastContainer />
            </>
          }
        />

        {/* Public / Authorized Doctor Read-Only Portal */}
        <Route path="/shared/:token" element={<SharedDoctorPortalView />} />

        {/* Protected Dashboard & Internal Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <DashboardView />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/assistant"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <AiAssistantView />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <ProfileView />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/medications"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <MedicationWalletView />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/prescriptions"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <PrescriptionsView />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/safety-checker"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <SafetyCheckerView />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <SafetyAlertsView />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <MedicationHistoryView />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/share"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <SecureShareView />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <SettingsView />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect to /dashboard if logged in or / if not */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
