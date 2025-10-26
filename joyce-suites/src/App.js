import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Auth Pages
import TenantRegister from './pages/auth/TenantRegister';
import TenantLogin from './pages/auth/TenantLogin';
import CaretakerLogin from './pages/auth/CaretakerLogin';
import AdminLogin from './pages/auth/AdminLogin';

// Lease Agreement
import LeaseAgreement from './pages/Lease/LeaseAgreement';

// Dashboard Pages
import TenantDashboard from './pages/tenant/TenantDashboard';
import TenantPayments from './pages/tenant/TenantPayment';
import TenantProfile from './pages/tenant/TenantProfile';
import AdminDashboard from './pages/admin/AdminDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Landing/Home Route */}
          <Route path="/" element={<Navigate to="/register-tenant" replace />} />

          {/* Auth Routes */}
          <Route path="/register-tenant" element={<TenantRegister />} />
          <Route path="/login" element={<TenantLogin />} />
          <Route path="/caretaker-login" element={<CaretakerLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Lease Agreement - Protected */}
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
          <Route path="/tenant/dashboard" element={<TenantDashboard />} />
          <Route path="/tenant/payments" element={<TenantPayments />} />
          <Route path="/tenant/profile" element={<TenantProfile />} />

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
          
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;