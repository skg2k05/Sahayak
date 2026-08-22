import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { AppLayout } from './layouts/AppLayout';
import { Loading } from './components/ui';
import {
  Accounts,
  Dashboard,
  Landing,
  Login,
  Register,
  SendMoney,
  Settings,
  TransactionDetail,
  Transactions,
  Translator,
  VoiceAssistant,
  Security,
  AccessibilityGuide,
  HowItWorks,
  Payees,
} from './pages';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  if (loading) return <Loading label="Authenticating session..." />;
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AccessibilityProvider>
        <AuthProvider>
          <Routes>
            {/* Public Layout */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/security" element={<Security />} />
              <Route path="/accessibility" element={<AccessibilityGuide />} />
              <Route path="/how-it-works" element={<HowItWorks />} />

              {/* Protected Authenticated Banking Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/accounts"
                element={
                  <ProtectedRoute>
                    <Accounts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payees"
                element={
                  <ProtectedRoute>
                    <Payees />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/send"
                element={
                  <ProtectedRoute>
                    <SendMoney />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute>
                    <Transactions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions/:id"
                element={
                  <ProtectedRoute>
                    <TransactionDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/voice"
                element={
                  <ProtectedRoute>
                    <VoiceAssistant />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/translator"
                element={
                  <ProtectedRoute>
                    <Translator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </AccessibilityProvider>
    </BrowserRouter>
  );
}
