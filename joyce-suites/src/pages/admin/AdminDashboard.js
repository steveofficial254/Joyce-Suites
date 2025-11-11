import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, X, Bell, Eye, Edit, Trash2, Filter } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State for all data
  const [overview, setOverview] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [paymentReport, setPaymentReport] = useState(null);
  const [occupancyReport, setOccupancyReport] = useState(null);

  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  // API call helper
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`/api/admin${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return null;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      setError(err.message);
      console.error('API Error:', err);
      throw err;
    }
  };

  // Fetch admin overview
  const fetchOverview = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/overview');
      if (data && data.overview) {
        setOverview(data.overview);
      }
    } catch (err) {
      console.error('Failed to fetch overview');
    } finally {
      setLoading(false);
    }
  };

  // Fetch tenants
  const fetchTenants = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/tenants?page=1&per_page=10');
      if (data && data.tenants) {
        setTenants(data.tenants);
      }
    } catch (err) {
      console.error('Failed to fetch tenants');
    } finally {
      setLoading(false);
    }
  };

  // Fetch contracts
  const fetchContracts = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/contracts?page=1&per_page=10');
      if (data && data.contracts) {
        setContracts(data.contracts);
      }
    } catch (err) {
      console.error('Failed to fetch contracts');
    } finally {
      setLoading(false);
    }
  };

  // Fetch payment report
  const fetchPaymentReport = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/payments/report');
      if (data && data.report) {
        setPaymentReport(data.report);
      }
    } catch (err) {
      console.error('Failed to fetch payment report');
    } finally {
      setLoading(false);
    }
  };

  // Fetch occupancy report
  const fetchOccupancyReport = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/occupancy/report');
      if (data && data.report) {
        setOccupancyReport(data.report);
      }
    } catch (err) {
      console.error('Failed to fetch occupancy report');
    } finally {
      setLoading(false);
    }
  };

  // Delete tenant
  const handleDeleteTenant = async (tenantId) => {
    if (!window.confirm('Are you sure you want to delete this tenant?')) {
      return;
    }

    try {
      const data = await apiCall(`/tenant/delete/${tenantId}`, { method: 'DELETE' });
      if (data && data.success) {
        setTenants(tenants.filter(t => t.tenant_id !== tenantId));
      }
    } catch (err) {
      console.error('Failed to delete tenant');
    }
  };

  // Fetch data on page change
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Verify user is admin
    if (userRole !== 'admin') {
      navigate('/login');
      return;
    }

    const fetchPageData = async () => {
      switch (activePage) {
        case 'dashboard':
          await Promise.all([fetchOverview(), fetchPaymentReport(), fetchOccupancyReport()]);
          break;
        case 'tenants':
          await fetchTenants();
          break;
        case 'contracts':
          await fetchContracts();
          break;
        case 'reports':
          await Promise.all([fetchPaymentReport(), fetchOccupancyReport()]);
          break;
        default:
          break;
      }
    };

    fetchPageData();
  }, [activePage, token, userRole, navigate]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.clear();
      navigate('/login');
    }
  };

  // Render Page Content
  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <DashboardPage 
            overview={overview} 
            paymentReport={paymentReport}
            occupancyReport={occupancyReport}
            loading={loading}
          />
        );
      case 'tenants':
        return (
          <TenantsPage 
            tenants={tenants} 
            loading={loading}
            onDelete={handleDeleteTenant}
          />
        );
      case 'contracts':
        return <ContractsPage contracts={contracts} loading={loading} />;
      case 'reports':
        return (
          <ReportsPage 
            paymentReport={paymentReport}
            occupancyReport={occupancyReport}
            loading={loading}
          />
        );
      default:
        return (
          <DashboardPage 
            overview={overview} 
            paymentReport={paymentReport}
            occupancyReport={occupancyReport}
            loading={loading}
          />
        );
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
            { id: 'dashboard', label: '📊 Dashboard' },
            { id: 'tenants', label: '👥 Tenants' },
            { id: 'contracts', label: '📋 Contracts' },
            { id: 'reports', label: '📈 Reports' }
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
            </button>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

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
const DashboardPage = ({ overview, paymentReport, occupancyReport, loading }) => {
  if (loading || !overview) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <h2 className="page-title">System Overview</h2>
      
      <div className="dashboard-grid">
        <DashboardCard 
          title="Total Tenants" 
          value={overview.total_tenants} 
          icon="👥" 
          color="primary"
        />
        <DashboardCard 
          title="Occupied Units" 
          value={overview.occupied_rooms} 
          icon="🏠" 
          color="success"
          subtext={`${overview.available_rooms} vacant`}
        />
        <DashboardCard 
          title="Total Rooms" 
          value={overview.total_rooms} 
          icon="🏢" 
          color="info"
        />
        <DashboardCard 
          title="Active Contracts" 
          value={overview.total_contracts} 
          icon="📋" 
          color="warning"
        />
      </div>

      {/* Payment Summary */}
      {paymentReport && (
        <div className="section">
          <h3 className="section-title">Payment Summary</h3>
          <div className="summary-grid">
            <div className="summary-card">
              <span className="summary-label">Expected Revenue</span>
              <span className="summary-value">
                KSh {paymentReport.summary.expected_monthly_revenue.toLocaleString()}
              </span>
            </div>
            <div className="summary-card success">
              <span className="summary-label">Collected</span>
              <span className="summary-value">
                KSh {paymentReport.summary.payments_collected.toLocaleString()}
              </span>
            </div>
            <div className="summary-card info">
              <span className="summary-label">Active Contracts</span>
              <span className="summary-value">
                {paymentReport.summary.total_active_contracts}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Occupancy Summary */}
      {occupancyReport && (
        <div className="section">
          <h3 className="section-title">Occupancy Status</h3>
          <div className="summary-grid">
            <div className="summary-card">
              <span className="summary-label">Total Rooms</span>
              <span className="summary-value">
                {occupancyReport.summary.total_rooms}
              </span>
            </div>
            <div className="summary-card success">
              <span className="summary-label">Occupied</span>
              <span className="summary-value">
                {occupancyReport.summary.occupied_rooms}
              </span>
            </div>
            <div className="summary-card warning">
              <span className="summary-label">Vacant</span>
              <span className="summary-value">
                {occupancyReport.summary.vacant_rooms}
              </span>
            </div>
            <div className="summary-card info">
              <span className="summary-label">Occupancy Rate</span>
              <span className="summary-value">
                {occupancyReport.summary.occupancy_rate}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Tenants Page Component
const TenantsPage = ({ tenants, loading, onDelete }) => {
  const [filterStatus, setFilterStatus] = useState('active');
  
  const filtered = tenants.filter(t => {
    if (filterStatus === 'active') return t.is_active;
    return !t.is_active;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading tenants...</p>
      </div>
    );
  }

  return (
    <>
      <h2 className="page-title">Manage Tenants</h2>
      
      <div className="filter-section">
        <label className="filter-label">
          <Filter size={16} /> Filter:
        </label>
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="section">
        <h3 className="section-title">All Tenants ({filtered.length})</h3>
        <table className="data-table">
          <thead className="table-header">
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Room ID</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(tenant => (
              <tr key={tenant.tenant_id} className="table-row">
                <td>{tenant.full_name}</td>
                <td>{tenant.email}</td>
                <td>{tenant.phone}</td>
                <td>#{tenant.room_id || 'N/A'}</td>
                <td>
                  <span className={`status-badge status-${tenant.is_active ? 'active' : 'inactive'}`}>
                    {tenant.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-sm btn-primary">
                      <Eye size={14} />
                    </button>
                    <button className="btn btn-sm btn-secondary">
                      <Edit size={14} />
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => onDelete(tenant.tenant_id)}
                    >
                      <Trash2 size={14} />
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

// Contracts Page Component
const ContractsPage = ({ contracts, loading }) => {
  const [filterStatus, setFilterStatus] = useState('all');

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading contracts...</p>
      </div>
    );
  }

  const filtered = filterStatus === 'all' 
    ? contracts 
    : contracts.filter(c => c.status === filterStatus);

  return (
    <>
      <h2 className="page-title">Lease Contracts</h2>
      
      <div className="filter-section">
        <label className="filter-label">
          <Filter size={16} /> Filter by Status:
        </label>
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className="section">
        <h3 className="section-title">All Contracts ({filtered.length})</h3>
        <table className="data-table">
          <thead className="table-header">
            <tr>
              <th>Contract ID</th>
              <th>Tenant ID</th>
              <th>Room ID</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Rent Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(contract => (
              <tr key={contract.contract_id} className="table-row">
                <td>{contract.contract_id}</td>
                <td>{contract.tenant_id}</td>
                <td>#{contract.room_id}</td>
                <td>{new Date(contract.start_date).toLocaleDateString()}</td>
                <td>{new Date(contract.end_date).toLocaleDateString()}</td>
                <td>KSh {contract.rent_amount.toLocaleString()}</td>
                <td>
                  <span className={`status-badge status-${contract.status}`}>
                    {contract.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

// Reports Page Component
const ReportsPage = ({ paymentReport, occupancyReport, loading }) => {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <>
      <h2 className="page-title">Reports</h2>

      {/* Payment Report */}
      {paymentReport && (
        <div className="section">
          <h3 className="section-title">Payment Report</h3>
          <div className="summary-grid">
            <div className="summary-card">
              <span className="summary-label">Expected Revenue</span>
              <span className="summary-value">
                KSh {paymentReport.summary.expected_monthly_revenue.toLocaleString()}
              </span>
            </div>
            <div className="summary-card success">
              <span className="summary-label">Collected</span>
              <span className="summary-value">
                KSh {paymentReport.summary.payments_collected.toLocaleString()}
              </span>
            </div>
            <div className="summary-card info">
              <span className="summary-label">Active Contracts</span>
              <span className="summary-value">
                {paymentReport.summary.total_active_contracts}
              </span>
            </div>
          </div>
          <p className="report-date">Generated: {new Date(paymentReport.date_generated).toLocaleString()}</p>
        </div>
      )}

      {/* Occupancy Report */}
      {occupancyReport && (
        <div className="section">
          <h3 className="section-title">Occupancy Report</h3>
          <div className="summary-grid">
            <div className="summary-card">
              <span className="summary-label">Total Rooms</span>
              <span className="summary-value">
                {occupancyReport.summary.total_rooms}
              </span>
            </div>
            <div className="summary-card success">
              <span className="summary-label">Occupied</span>
              <span className="summary-value">
                {occupancyReport.summary.occupied_rooms}
              </span>
            </div>
            <div className="summary-card warning">
              <span className="summary-label">Vacant</span>
              <span className="summary-value">
                {occupancyReport.summary.vacant_rooms}
              </span>
            </div>
            <div className="summary-card info">
              <span className="summary-label">Occupancy Rate</span>
              <span className="summary-value">
                {occupancyReport.summary.occupancy_rate}
              </span>
            </div>
          </div>
          <p className="report-date">Generated: {new Date(occupancyReport.date_generated).toLocaleString()}</p>
        </div>
      )}
    </>
  );
};

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