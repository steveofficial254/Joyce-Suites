import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Lazy Load Pages
// Auth Pages
const TenantRegister = lazy(() => import('./pages/auth/TenantRegister'));
const TenantLogin = lazy(() => import('./pages/auth/TenantLogin'));
const CaretakerLogin = lazy(() => import('./pages/auth/CaretakerLogin'));
const AdminLogin = lazy(() => import('./pages/auth/AdminLogin'));

// Lease Agreement
const LeaseAgreement = lazy(() => import('./pages/Lease/LeaseAgreement'));

// Dashboard Pages
const TenantDashboard = lazy(() => import('./pages/tenant/TenantDashboard'));
const CaretakerDashboard = lazy(() => import('./pages/caretaker/CaretakerDashboard'));
const TenantPayments = lazy(() => import('./pages/tenant/TenantPayment'));
const TenantProfile = lazy(() => import('./pages/tenant/TenantProfile'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const MenuPage = lazy(() => import('./pages/MenuPage'));

// Loading Component
const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="loading-spinner">Loading...</div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    // Redirect to appropriate login based on allowed roles
    if (allowedRoles.includes('caretaker')) {
      return <Navigate to="/caretaker-login" replace />;
    } else if (allowedRoles.includes('admin')) {
      return <Navigate to="/admin-login" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children, restricted = true }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user && restricted) {
    // Redirect to appropriate dashboard based on user role
    switch (user.role) {
      case 'tenant':
        return <Navigate to="/tenant/dashboard" replace />;
      case 'caretaker':
        return <Navigate to="/caretaker/dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/tenant/dashboard" replace />;
    }
  }

  return children;
};

// Unauthorized Page
const UnauthorizedPage = () => (
  <div className="unauthorized-container">
    <h1>Access Denied</h1>
    <p>You don't have permission to access this page.</p>
    <button onClick={() => window.history.back()}>Go Back</button>
  </div>
);

// App Content with Routes
function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Landing/Home Route */}
        <Route
          path="/"
          element={
            <PublicRoute restricted={false}>
              <MenuPage />
            </PublicRoute>
          }
        />

        {/* Public Auth Routes */}
        <Route
          path="/register-tenant"
          element={
            <PublicRoute>
              <TenantRegister />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <TenantLogin />
            </PublicRoute>
          }
        />
        <Route
          path="/caretaker-login"
          element={
            <PublicRoute>
              <CaretakerLogin />
            </PublicRoute>
          }
        />
        <Route
          path="/admin-login"
          element={
            <PublicRoute>
              <AdminLogin />
            </PublicRoute>
          }
        />

        {/* Lease Agreement - Protected for tenants */}
        <Route
          path="/lease-agreement"
          element={
            <ProtectedRoute allowedRoles={['tenant']}>
              <LeaseAgreement />
            </ProtectedRoute>
          }
        />

        {/* Tenant Routes - Protected */}
        <Route
          path="/tenant/dashboard"
          element={
            <ProtectedRoute allowedRoles={['tenant']}>
              <TenantDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tenant/payments"
          element={
            <ProtectedRoute allowedRoles={['tenant']}>
              <TenantPayments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tenant/profile"
          element={
            <ProtectedRoute allowedRoles={['tenant']}>
              <TenantProfile />
            </ProtectedRoute>
          }
        />

        {/* Caretaker Routes - Protected */}
        <Route
          path="/caretaker/dashboard"
          element={
            <ProtectedRoute allowedRoles={['caretaker', 'admin']}>
              <CaretakerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes - Protected */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Error Routes */}
        <Route
          path="/unauthorized"
          element={<UnauthorizedPage />}
        />

        {/* Catch-all route */}
        <Route
          path="*"
          element={
            <div className="not-found-container">
              <h1>404 - Page Not Found</h1>
              <p>The page you're looking for doesn't exist.</p>
              <Navigate to="/" replace />
            </div>
          }
        />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;