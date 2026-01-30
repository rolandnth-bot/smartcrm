import { useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import ToastContainer from './components/common/Toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import { PermissionProvider } from './contexts/PermissionContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { SkeletonCard } from './components/common/Skeleton';
import useAuthStore from './stores/authStore';
import useToastStore from './stores/toastStore';
import { useOnlineStatus } from './hooks/useOnlineStatus';

// Direct imports - NO lazy loading to fix Vercel deployment
import DashboardPage from './pages/DashboardPage';
import LeadsPage from './pages/LeadsPage';
import MarketingPage from './pages/MarketingPage';
import SalesPage from './pages/SalesPage';
import ApartmentsPage from './pages/ApartmentsPage';
import BookingsPage from './pages/BookingsPage';
import CleaningPage from './pages/CleaningPage';
import FinancePage from './pages/FinancePage';
import SettlementsPage from './pages/SettlementsPage';
import MaintenancePage from './pages/MaintenancePage';
import SettingsPage from './pages/SettingsPage';
import EmailPage from './pages/EmailPage';
import AppsPage from './pages/AppsPage';
import ProjectsPage from './pages/ProjectsPage';
import DocumentsPage from './pages/DocumentsPage';
import AIAssistantPage from './pages/AIAssistantPage';
import SmartChatPage from './pages/SmartChatPage';
import LoginPage from './pages/LoginPage';
import PartnerRegistrationPage from './pages/PartnerRegistrationPage';
import PartnersPage from './pages/PartnersPage';
import IcalExportPage from './pages/IcalExportPage';
function App() {
  const { isAuthenticated, isLoading, initAuth, logout } = useAuthStore();
  const isOnline = useOnlineStatus();
  const wasOnlineRef = useRef(navigator.onLine);

  useEffect(() => {
    // Auth state listener inicializálása
    const unsubscribe = initAuth();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [initAuth]);

  // Online/offline állapot változás figyelése
  useEffect(() => {
    // Csak akkor jelenítünk meg toast-ot, ha az állapot változott
    if (wasOnlineRef.current !== isOnline) {
      if (isOnline) {
        useToastStore.getState().success('Internetkapcsolat visszaállítva');
      } else {
        useToastStore.getState().warning('Offline mód. Az alkalmazás korlátozottan mködik.');
      }
      wasOnlineRef.current = isOnline;
    }
  }, [isOnline]);

  const handleLogout = async () => {
    const result = await logout();
    // Ha Firebase logout nem sikerült, próbáljuk a mock logout-ot
    if (!result.success) {
      useAuthStore.getState().mockLogout();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4" aria-live="polite" aria-busy="true">
        <div className="w-full max-w-md">
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const fallback = (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4" aria-live="polite" aria-busy="true">
      <div className="w-full max-w-md">
        <SkeletonCard />
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <HashRouter>
          <PermissionProvider>
            <Routes>
              <Route
                path="/login"
                element={
                  isAuthenticated ? (
                    <Navigate to="/" replace />
                  ) : (
                    <LoginPage />
                  )
                }
              />
              <Route
                path="/register"
                element={
                  isAuthenticated ? (
                    <Navigate to="/" replace />
                  ) : (
                    <PartnerRegistrationPage />
                  )
                }
              />
              {/* iCal Export - Publikus route foglalások exportálásához */}
              <Route path="/ical/export/:apartmentId" element={<IcalExportPage />} />
              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    <MainLayout onLogout={handleLogout} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              >
                <Route index element={<DashboardPage />} />
                <Route 
                  path="leads" 
                  element={
                    <ProtectedRoute permission="leads.view">
                      <LeadsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="marketing" 
                  element={
                    <ProtectedRoute permission="marketing.view">
                      <MarketingPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="sales" 
                  element={
                    <ProtectedRoute permission="sales.view">
                      <SalesPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="projects" 
                  element={
                    <ProtectedRoute permission="sales.view">
                      <ProjectsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="apartments" 
                  element={
                    <ProtectedRoute permission="apartments.view">
                      <ApartmentsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="bookings" 
                  element={
                    <ProtectedRoute permission="bookings.view">
                      <BookingsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="cleaning" 
                  element={
                    <ProtectedRoute permission="cleaning.view">
                      <CleaningPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="finance"
                  element={
                    <ProtectedRoute permission="finance.view">
                      <FinancePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="settlements"
                  element={
                    <ProtectedRoute permission="finance.view">
                      <SettlementsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="maintenance" 
                  element={
                    <ProtectedRoute permission="maintenance.view">
                      <MaintenancePage />
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="settings"
                  element={
                    <ProtectedRoute permission="settings.view">
                      <SettingsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="email"
                  element={
                    <ProtectedRoute permission="email.view">
                      <EmailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="apps"
                  element={<AppsPage />}
                />
                <Route
                  path="partners"
                  element={<PartnersPage />}
                />
                <Route
                  path="partner-registration"
                  element={<PartnerRegistrationPage />}
                />
                <Route
                  path="documents"
                  element={<DocumentsPage />}
                />
                <Route
                  path="ai-assistant"
                  element={
                    <ProtectedRoute permission="ai.view">
                      <AIAssistantPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="smart-chat" element={<SmartChatPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <ToastContainer />
          </PermissionProvider>
        </HashRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

