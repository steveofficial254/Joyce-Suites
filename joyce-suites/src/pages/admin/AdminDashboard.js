import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, X, Bell, Users, DollarSign, Home, Send, Eye, Edit, Trash2, Filter } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Sample Data - Tenants
  const [tenants, setTenants] = useState([
    { id: 1, name: 'John Mwangi', room: '101', status: 'Active', rentPaid: true, amount: 15000 },
    { id: 2, name: 'Sarah Kipchoge', room: '102', status: 'Active', rentPaid: false, amount: 20000 },
    { id: 3, name: 'Michael Okonkwo', room: '103', status: 'Inactive', rentPaid: false, amount: 15000 },
    { id: 4, name: 'Grace Adeyemi', room: '104', status: 'Active', rentPaid: true, amount: 20000 },
    { id: 5, name: 'Peter Musyoka', room: '105', status: 'Active', rentPaid: false, amount: 15000 },
  ]);

  // Sample Data - Caretakers
  const [caretakers, setCaretakers] = useState([
    { id: 1, name: 'James Kipchoge', email: 'james@joyce.com', phone: '+254712345678', status: 'Active', property: 'Main Building' },
    { id: 2, name: 'Faith Odhiambo', email: 'faith@joyce.com', phone: '+254712345679', status: 'Active', property: 'Annex Building' },
  ]);

  // Sample Data - Payments
  const [payments, setPayments] = useState([
    { id: 1, tenant: 'John Mwangi', amount: 15000, date: '2025-10-15', status: 'Paid' },
    { id: 2, tenant: 'Grace Adeyemi', amount: 20000, date: '2025-10-16', status: 'Paid' },
    { id: 3, tenant: 'Sarah Kipchoge', amount: 20000, date: '2025-10-18', status: 'Pending' },
    { id: 4, tenant: 'Peter Musyoka', amount: 15000, date: '2025-10-10', status: 'Overdue' },
  ]);

  // Notification State
  const [notification, setNotification] = useState({
    recipient: 'all',
    type: 'caretaker',
    subject: '',
    message: '',
  });

  const [notifications, setNotifications] = useState([
    { id: 1, to: 'James Kipchoge', message: 'Please collect pending payments', date: '2025-10-19' },
    { id: 2, to: 'All Tenants', message: 'Rent due on 1st of each month', date: '2025-10-18' },
  ]);

  // Calculate Dashboard Stats
  const stats = {
    totalTenants: tenants.length,
    occupiedUnits: tenants.filter(t => t.status === 'Active').length,
    vacantUnits: tenants.filter(t => t.status === 'Inactive').length,
    unpaidBalances: tenants.filter(t => !t.rentPaid).length,
    totalRentCollected: payments.filter(p => p.status === 'Paid').reduce((acc, p) => acc + p.amount, 0),
    pendingPayments: payments.filter(p => p.status === 'Pending').reduce((acc, p) => acc + p.amount, 0),
    overduePayments: payments.filter(p => p.status === 'Overdue').reduce((acc, p) => acc + p.amount, 0),
    totalCaretakers: caretakers.length,
  };

  // Handle Send Notification
  const handleSendNotification = () => {
    if (notification.subject && notification.message) {
      const newNotif = {
        id: notifications.length + 1,
        to: notification.recipient === 'all' ? `All ${notification.type}s` : notification.recipient,
        message: notification.message,
        date: new Date().toISOString().split('T')[0],
      };
      setNotifications([...notifications, newNotif]);
      setNotification({ recipient: 'all', type: 'caretaker', subject: '', message: '' });
    }
  };

  // Handle Caretaker Edit
  const handleEditCaretaker = (id) => {
    alert(`Edit caretaker ${id}`);
  };

  // Handle Caretaker Delete
  const handleDeleteCaretaker = (id) => {
    setCaretakers(caretakers.filter(c => c.id !== id));
  };

  // Handle Logout
  const handleLogout = () => {
    navigate('/');
  };

  // Render Page Content
  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage stats={stats} payments={payments} tenants={tenants} />;
      case 'tenants':
        return <TenantsPage tenants={tenants} />;
      case 'caretakers':
        return (
          <CaretakersPage 
            caretakers={caretakers}
            onEdit={handleEditCaretaker}
            onDelete={handleDeleteCaretaker}
          />
        );
      case 'payments':
        return <PaymentsPage payments={payments} />;
      case 'notifications':
        return (
          <NotificationsPage
            notification={notification}
            setNotification={setNotification}
            onSend={handleSendNotification}
            notifications={notifications}
            caretakers={caretakers}
            tenants={tenants}
          />
        );
      default:
        return <DashboardPage stats={stats} payments={payments} tenants={tenants} />;
    }
  };

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? '' : 'hidden'}`}>
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
            { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
            { id: 'tenants', label: '👥 Tenants', icon: '👥' },
            { id: 'caretakers', label: '🔑 Caretakers', icon: '🔑' },
            { id: 'payments', label: '💳 Payments', icon: '💳' },
            { id: 'notifications', label: '🔔 Notifications', icon: '🔔' }
          ].map(item => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => {
                setActivePage(item.id);
                setSidebarOpen(false);
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main-content">
        {/* Header */}
        <header className="admin-header">
          <button 
            className="admin-menu-toggle-btn"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <h1 className="admin-header-title">Admin Dashboard – Joyce Suits Apartments</h1>
          <div className="header-right">
            <button className="notification-btn">
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <section className="admin-content-area">
          {renderContent()}
        </section>
      </main>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

// Dashboard Page Component
const DashboardPage = ({ stats, payments, tenants }) => (
  <>
    <h2 className="page-title">System Overview</h2>
    
    <div className="dashboard-grid">
      <DashboardCard 
        title="Total Tenants" 
        value={stats.totalTenants} 
        icon="👥" 
        color="primary"
        subtext={`${stats.occupiedUnits} active`}
      />
      <DashboardCard 
        title="Occupied Units" 
        value={stats.occupiedUnits} 
        icon="🏠" 
        color="success"
        subtext={`${stats.vacantUnits} vacant`}
      />
      <DashboardCard 
        title="Rent Collected" 
        value={`KSh ${(stats.totalRentCollected / 1000).toFixed(0)}K`} 
        icon="💰" 
        color="success"
        subtext="This month"
      />
      <DashboardCard 
        title="Pending Payments" 
        value={`KSh ${(stats.pendingPayments / 1000).toFixed(0)}K`} 
        icon="⏳" 
        color="warning"
        subtext={`${payments.filter(p => p.status === 'Pending').length} payments`}
      />
      <DashboardCard 
        title="Overdue Balance" 
        value={`KSh ${(stats.overduePayments / 1000).toFixed(0)}K`} 
        icon="⚠️" 
        color="danger"
        subtext={`${payments.filter(p => p.status === 'Overdue').length} overdue`}
      />
      <DashboardCard 
        title="Active Caretakers" 
        value={stats.totalCaretakers} 
        
        color="primary"
        subtext="Managing properties"
      />
    </div>

    {/* Recent Transactions */}
    <div className="section">
      <h3 className="section-title">Recent Payment Transactions</h3>
      <table className="data-table">
        <thead className="table-header">
          <tr>
            <th>Tenant Name</th>
            <th>Amount</th>
            <th>Payment Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.slice(0, 5).map(payment => (
            <tr key={payment.id} className="table-row">
              <td>{payment.tenant}</td>
              <td>KSh {payment.amount.toLocaleString()}</td>
              <td>{payment.date}</td>
              <td>
                <span className={`status-badge status-${payment.status.toLowerCase()}`}>
                  {payment.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Financial Summary */}
    <div className="financial-summary">
      <h3 className="section-title">Financial Summary</h3>
      <div className="summary-grid">
        <div className="summary-card">
          <span className="summary-label">Total Revenue</span>
          <span className="summary-value">KSh {(stats.totalRentCollected).toLocaleString()}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Pending Amount</span>
          <span className="summary-value warning">KSh {(stats.pendingPayments).toLocaleString()}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Overdue Amount</span>
          <span className="summary-value danger">KSh {(stats.overduePayments).toLocaleString()}</span>
        </div>
      </div>
    </div>
  </>
);

// Tenants Page Component
const TenantsPage = ({ tenants }) => {
  const [filterStatus, setFilterStatus] = useState('All');
  
  const filtered = filterStatus === 'All' 
    ? tenants 
    : tenants.filter(t => t.status === filterStatus);

  return (
    <>
      <h2 className="page-title">Manage Tenants</h2>
      
      <div className="filter-section">
        <label className="filter-label">
          <Filter size={16} /> Filter by Status:
        </label>
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option>All</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>

      <div className="section">
        <h3 className="section-title">All Tenants ({filtered.length})</h3>
        <table className="data-table">
          <thead className="table-header">
            <tr>
              <th>Tenant Name</th>
              <th>Room Number</th>
              <th>Status</th>
              <th>Rent Paid</th>
              <th>Rent Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(tenant => (
              <tr key={tenant.id} className="table-row">
                <td>{tenant.name}</td>
                <td>#{tenant.room}</td>
                <td>
                  <span className={`status-badge status-${tenant.status.toLowerCase()}`}>
                    {tenant.status}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${tenant.rentPaid ? 'status-paid' : 'status-pending'}`}>
                    {tenant.rentPaid ? 'Paid' : 'Pending'}
                  </span>
                </td>
                <td>KSh {tenant.amount.toLocaleString()}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-sm btn-primary">
                      <Eye size={14} />
                    </button>
                    <button className="btn btn-sm btn-secondary">
                      <Edit size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

// Caretakers Page Component
const CaretakersPage = ({ caretakers, onEdit, onDelete }) => (
  <>
    <h2 className="page-title">Manage Caretakers</h2>
    
    <button className="btn btn-primary" style={{ marginBottom: '20px' }}>
      + Add New Caretaker
    </button>

    <div className="section">
      <h3 className="section-title">Active Caretakers</h3>
      <div className="caretaker-list">
        {caretakers.map(caretaker => (
          <div key={caretaker.id} className="caretaker-card">
            <div className="caretaker-header">
              <div>
                <h4 className="caretaker-name">{caretaker.name}</h4>
                <p className="caretaker-property">{caretaker.property}</p>
              </div>
              <span className="status-badge status-active">Active</span>
            </div>
            
            <div className="caretaker-details">
              <div className="detail-item">
                <span className="detail-icon"></span>
                <span className="detail-value">{caretaker.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon"></span>
                <span className="detail-value">{caretaker.phone}</span>
              </div>
            </div>

            <div className="caretaker-actions">
              <button 
                className="btn btn-primary"
                onClick={() => onEdit(caretaker.id)}
              >
                <Edit size={14} /> Edit
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => onDelete(caretaker.id)}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </>
);

// Payments Page Component
const PaymentsPage = ({ payments }) => {
  const [filterStatus, setFilterStatus] = useState('All');
  
  const filtered = filterStatus === 'All' 
    ? payments 
    : payments.filter(p => p.status === filterStatus);

  return (
    <>
      <h2 className="page-title">Payment Management</h2>
      
      <div className="filter-section">
        <label className="filter-label">
          <Filter size={16} /> Filter by Status:
        </label>
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option>All</option>
          <option>Paid</option>
          <option>Pending</option>
          <option>Overdue</option>
        </select>
      </div>

      <div className="section">
        <h3 className="section-title">All Payments ({filtered.length})</h3>
        <table className="data-table">
          <thead className="table-header">
            <tr>
              <th>Tenant</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(payment => (
              <tr key={payment.id} className="table-row">
                <td>{payment.tenant}</td>
                <td>KSh {payment.amount.toLocaleString()}</td>
                <td>{payment.date}</td>
                <td>
                  <span className={`status-badge status-${payment.status.toLowerCase()}`}>
                    {payment.status}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-primary">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

// Notifications Page Component
const NotificationsPage = ({ notification, setNotification, onSend, notifications, caretakers, tenants }) => (
  <>
    <h2 className="page-title">Send Notifications</h2>
    
    <div className="section">
      <h3 className="section-title">Compose Message</h3>
      
      <div className="form-group">
        <label className="form-label">Send To *</label>
        <div className="radio-group">
          <label className="radio-option">
            <input 
              type="radio" 
              value="all" 
              checked={notification.recipient === 'all'}
              onChange={(e) => setNotification({ ...notification, recipient: e.target.value })}
            />
            All Users
          </label>
          <label className="radio-option">
            <input 
              type="radio" 
              value="specific" 
              checked={notification.recipient === 'specific'}
              onChange={(e) => setNotification({ ...notification, recipient: e.target.value })}
            />
            Specific User
          </label>
        </div>
      </div>

      {notification.recipient === 'specific' && (
        <div className="form-group">
          <label className="form-label">Select User *</label>
          <select className="form-select">
            <option>-- Select a user --</option>
            {caretakers.map(c => (
              <option key={c.id}>{c.name} (Caretaker)</option>
            ))}
            {tenants.map(t => (
              <option key={t.id}>{t.name} (Tenant)</option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">User Type *</label>
        <select 
          value={notification.type}
          onChange={(e) => setNotification({ ...notification, type: e.target.value })}
          className="form-select"
        >
          <option>caretaker</option>
          <option>tenant</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Subject *</label>
        <input 
          type="text"
          value={notification.subject}
          onChange={(e) => setNotification({ ...notification, subject: e.target.value })}
          placeholder="Enter message subject"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Message *</label>
        <textarea 
          value={notification.message}
          onChange={(e) => setNotification({ ...notification, message: e.target.value })}
          placeholder="Enter your message here..."
          className="form-textarea"
          rows="6"
        />
        <small style={{ color: '#6b7280', display: 'block', marginTop: '6px' }}>
          {notification.message.length} / 500 characters
        </small>
      </div>

      <button 
        className="btn btn-primary"
        onClick={onSend}
        style={{ width: '100%', justifyContent: 'center', padding: '12px 20px' }}
      >
        <Send size={16} /> Send Notification
      </button>
    </div>

    {/* Sent Notifications */}
    <div className="section">
      <h3 className="section-title">Notification History</h3>
      <div className="notification-list">
        {notifications.map(notif => (
          <div key={notif.id} className="notification-item">
            <div className="notification-header">
              <h4 className="notification-recipient">📬 To: {notif.to}</h4>
              <span className="notification-date">{notif.date}</span>
            </div>
            <p className="notification-message">{notif.message}</p>
          </div>
        ))}
      </div>
    </div>
  </>
);

// Dashboard Card Component
const DashboardCard = ({ title, value, icon, color, subtext }) => (
  <div className={`dashboard-card card-${color}`}>
    <div className="card-icon">{icon}</div>
    <div className="card-content">
      <h3 className="card-title">{title}</h3>
      <p className="card-value">{value}</p>
      {subtext && <p className="card-subtext">{subtext}</p>}
    </div>
  </div>
);

export default AdminDashboard;