import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';

// Layout components — always loaded (small, needed on every page)
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import AdminLayout from './components/Layout/AdminLayout';
import Footer from './components/Layout/Footer';
import BottomNav from './components/Layout/BottomNav';

// Lazy-loaded pages — split into separate chunks for faster initial load
const Landing        = lazy(() => import('./pages/Landing'));
const Login          = lazy(() => import('./pages/Login'));
const AdminLogin     = lazy(() => import('./pages/AdminLogin'));
const Dashboard      = lazy(() => import('./pages/Dashboard'));
const SendMoney      = lazy(() => import('./pages/SendMoney'));
const TransactionHistory = lazy(() => import('./pages/TransactionHistory'));
const Profile        = lazy(() => import('./pages/Profile'));
const Loans          = lazy(() => import('./pages/Loans'));
const Support        = lazy(() => import('./pages/Support'));
const TransactionPinSetup = lazy(() => import('./pages/TransactionPinSetup'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AccountManagement = lazy(() => import('./pages/admin/AccountManagement'));
const TransactionManagement = lazy(() => import('./pages/admin/TransactionManagement'));
const LoanManagement = lazy(() => import('./pages/admin/LoanManagement'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminAuditLogs = lazy(() => import('./pages/admin/AdminAuditLogs'));
const SystemMetrics = lazy(() => import('./pages/admin/SystemMetrics'));

// Full-screen spinner shown while a lazy chunk is loading
const PageLoader = () => (
  <div className="w-full h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-950">
    <div className="w-8 h-8 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin" />
  </div>
);

// Auth guard — handles loading state, role checks, and redirects
const ProtectedRoute = ({ children, requireAdmin = false, redirectPath = '/' }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <PageLoader />;

  if (!isAuthenticated) return <Navigate to={redirectPath} replace />;

  // Client route accessed by admin → send to admin dashboard
  if (!requireAdmin && user?.role === 'ADMIN') return <Navigate to="/admin" replace />;

  // Admin route accessed by regular user → send to client dashboard
  if (requireAdmin && user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;

  return children;
};

// Shared layout shell for all authenticated pages
const AppLayout = ({ children }) => (
  <div className="flex w-full min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 font-sans">
    <Sidebar />
    <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <BottomNav />
    </div>
  </div>
);

// Wrap a page in ProtectedRoute + AppLayout + Suspense
const ProtectedPage = ({ element, requireAdmin = false, redirectPath = '/' }) => (
  <ProtectedRoute requireAdmin={requireAdmin} redirectPath={redirectPath}>
    <AppLayout>
      <Suspense fallback={<PageLoader />}>
        {element}
      </Suspense>
    </AppLayout>
  </ProtectedRoute>
);

// Wrap admin page in ProtectedRoute + AdminLayout + Suspense
const AdminProtectedPage = ({ element, redirectPath = '/admin-login' }) => (
  <ProtectedRoute requireAdmin={true} redirectPath={redirectPath}>
    <AdminLayout>
      <Suspense fallback={<PageLoader />}>
        {element}
      </Suspense>
    </AdminLayout>
  </ProtectedRoute>
);

export const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/"            element={<Landing />} />
            <Route path="/login"       element={<Login />} />
            <Route path="/admin-login" element={<AdminLogin />} />

            {/* Client protected routes */}
            <Route path="/dashboard"   element={<ProtectedPage element={<Dashboard />} />} />
            <Route path="/send-money"  element={<ProtectedPage element={<SendMoney />} />} />
            <Route path="/transactions" element={<ProtectedPage element={<TransactionHistory />} />} />
            <Route path="/loans"       element={<ProtectedPage element={<Loans />} />} />
            <Route path="/transaction-pin" element={<ProtectedPage element={<TransactionPinSetup />} />} />
            <Route path="/profile"     element={<ProtectedPage element={<Profile />} />} />
            <Route path="/support"     element={<ProtectedPage element={<Support />} />} />

            {/* Admin protected routes */}
            <Route path="/admin/dashboard" element={<AdminProtectedPage element={<AdminDashboard />} />} />
            <Route path="/admin/users" element={<AdminProtectedPage element={<AdminDashboard />} />} />
            <Route path="/admin/accounts" element={<AdminProtectedPage element={<AccountManagement />} />} />
            <Route path="/admin/transactions" element={<AdminProtectedPage element={<TransactionManagement />} />} />
            <Route path="/admin/loans" element={<AdminProtectedPage element={<LoanManagement />} />} />
            <Route path="/admin/reports" element={<AdminProtectedPage element={<AdminReports />} />} />
            <Route path="/admin/audit-logs" element={<AdminProtectedPage element={<AdminAuditLogs />} />} />
            <Route path="/admin/system-metrics" element={<AdminProtectedPage element={<SystemMetrics />} />} />
            <Route path="/admin/settings" element={<AdminProtectedPage element={<AdminSettings />} />} />
            
            {/* Admin root redirect */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>

      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{ duration: 4000 }}
      />
    </AuthProvider>
  </ThemeProvider>
);

export default App;
