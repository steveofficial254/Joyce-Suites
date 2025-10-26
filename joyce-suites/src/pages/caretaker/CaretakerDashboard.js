// src/pages/caretaker/CaretakerDashboard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, X, Bell } from 'lucide-react';
import DashboardPage from './pages/DashboardPage';
import TenantsPage from './pages/TenantsPage';
import PaymentsPage from './pages/PaymentsPage';
import BalancesPage from './pages/BalancesPage';
import CommentsPage from './pages/CommentsPage';
import './CaretakerDashboard.css';

const CaretakerDashboard = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Sample Data - Tenants
  const [tenants, setTenants] = useState([
    { id: 1, name: 'John Mwangi', room: '101', type: 'Single', rent: 15000, status: 'Paid', balance: 0 },
    { id: 2, name: 'Sarah Kipchoge', room: '102', type: 'Double', rent: 20000, status: 'Pending', balance: 20000 },
    { id: 3, name: 'Michael Okonkwo', room: '103', type: 'Single', rent: 15000, status: 'Overdue', balance: 45000 },
    { id: 4, name: 'Grace Adeyemi', room: '104', type: 'Double', rent: 20000, status: 'Paid', balance: 0 },
    { id: 5, name: 'Peter Musyoka', room: '105', type: 'Single', rent: 15000, status: 'Pending', balance: 30000 },
  ]);

  // Sample Data - Payments
  const [payments, setPayments] = useState([
    { id: 1, tenant: 'John Mwangi', room: '101', amount: 15000, date: '2025-10-15', proof: 'proof1.jpg', status: 'Pending' },
    { id: 2, tenant: 'Sarah Kipchoge', room: '102', amount: 20000, date: '2025-10-18', proof: 'proof2.jpg', status: 'Pending' },
  ]);

  // Sample Data - Comments
  const [comments, setComments] = useState([
    { id: 1, tenant: 'Michael Okonkwo', room: '103', comment: 'Overdue for 2 months. Follow up needed.', date: '2025-10-19', author: 'Admin' },
    { id: 2, tenant: 'Grace Adeyemi', room: '104', comment: 'Good tenant, rent paid on time.', date: '2025-10-18', author: 'Caretaker' },
  ]);

  // Calculate Stats
  const stats = {
    totalTenants: tenants.length,
    paidThisMonth: tenants.filter(t => t.status === 'Paid').length,
    pendingPayments: tenants.filter(t => t.status === 'Pending').length,
    overdueAccounts: tenants.filter(t => t.status === 'Overdue').length,
  };

  // Payment Actions
  const confirmPayment = (paymentId) => {
    const payment = payments.find(p => p.id === paymentId);
    setPayments(payments.map(p => 
      p.id === paymentId ? { ...p, status: 'Confirmed' } : p
    ));
    setTenants(tenants.map(t => 
      t.name === payment.tenant 
        ? { ...t, status: 'Paid', balance: 0 }
        : t
    ));
  };

  const markPending = (paymentId) => {
    setPayments(payments.map(p => 
      p.id === paymentId ? { ...p, status: 'Pending' } : p
    ));
  };

  // Comment Actions
  const addComment = (tenantId, commentText) => {
    if (commentText.trim()) {
      const tenant = tenants.find(t => t.id === parseInt(tenantId));
      setComments([...comments, {
        id: comments.length + 1,
        tenant: tenant?.name,
        room: tenant?.room,
        comment: commentText,
        date: new Date().toISOString().split('T')[0],
        author: 'Caretaker'
      }]);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    navigate('/');
  };

  // Render Page Content
  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage stats={stats} tenants={tenants} />;
      case 'tenants':
        return <TenantsPage tenants={tenants} />;
      case 'payments':
        return <PaymentsPage payments={payments} onConfirm={confirmPayment} onMarkPending={markPending} />;
      case 'balances':
        return <BalancesPage tenants={tenants} />;
      case 'comments':
        return <CommentsPage comments={comments} tenants={tenants} onAddComment={addComment} />;
      default:
        return <DashboardPage stats={stats} tenants={tenants} />;
    }
  };

  return (
    <div className="caretaker-dashboard-container">
      {/* Sidebar */}
      <aside className={`caretaker-sidebar ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Joyce Suits</h2>
          <button 
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {[
            { id: 'dashboard', label: '📊 Dashboard' },
            { id: 'tenants', label: '👥 Tenants' },
            { id: 'payments', label: '💳 Payments' },
            { id: 'balances', label: '💰 Balances' },
            { id: 'comments', label: '💬 Comments' }
          ].map(item => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => {
                setActivePage(item.id);
                setSidebarOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="caretaker-main-content">
        {/* Header */}
        <header className="caretaker-header">
          <button 
            className="menu-toggle-btn"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <h1 className="header-title">Caretaker – Joyce Suits Apartments</h1>
          <div className="header-right">
            <button className="notification-btn">
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <section className="caretaker-content-area">
          {renderContent()}
        </section>
      </main>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="caretaker-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default CaretakerDashboard;