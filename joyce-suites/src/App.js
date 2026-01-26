import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PageTransition from './components/PageTransition';
import './styles/transitions.css';



const TenantRegister = lazy(() => import('./pages/auth/TenantRegister'));
const TenantLogin = lazy(() => import('./pages/auth/TenantLogin'));
const CaretakerLogin = lazy(() => import('./pages/auth/CaretakerLogin'));
const AdminLogin = lazy(() => import('./pages/auth/AdminLogin'));


const LeaseAgreement = lazy(() => import('./pages/Lease/LeaseAgreement'));


const TenantDashboard = lazy(() => import('./pages/tenant/TenantDashboard'));
const CaretakerDashboard = lazy(() => import('./pages/caretaker/CaretakerDashboard'));
const TenantPayments = lazy(() => import('./pages/tenant/TenantPayment'));
const TenantProfile = lazy(() => import('./pages/tenant/TenantProfile'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const MenuPage = lazy(() => import('./pages/MenuPage'));


const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  </div>
);


const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    
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


const PublicRoute = ({ children }) => {
  return children;
};


const UnauthorizedPage = () => (
  <div className="unauthorized-container">
    <h1>Access Denied</h1>
    <p>You don't have permission to access this page.</p>
    <button onClick={() => window.history.back()}>Go Back</button>
  </div>
);


function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <PageTransition>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {}
          <Route
            path="/"
            element={
              <PublicRoute>
                <MenuPage />
              </PublicRoute>
            }
          />

          {}
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

        {}
        <Route
          path="/lease-agreement"
          element={
            <ProtectedRoute allowedRoles={['tenant']}>
              <LeaseAgreement />
            </ProtectedRoute>
          }
        />

        {}
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

        {}
        <Route
          path="/caretaker/dashboard"
          element={
            <ProtectedRoute allowedRoles={['caretaker', 'admin']}>
              <CaretakerDashboard />
            </ProtectedRoute>
          }
        />

        {}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {}
        <Route
          path="/unauthorized"
          element={<UnauthorizedPage />}
        />

        {}
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
    </PageTransition>
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