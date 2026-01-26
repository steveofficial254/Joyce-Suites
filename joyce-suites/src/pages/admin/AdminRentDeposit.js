import config from '../../config';
import './AdminRentDeposit.css';

const AdminRentDeposit = () => {
  const [activeTab, setActiveTab] = useState('rent');
  const [rentRecords, setRentRecords] = useState([]);
  const [depositRecords, setDepositRecords] = useState([]);
  const [waterBillRecords, setWaterBillRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [summary, setSummary] = useState(null);

  
  const [rentFilters, setRentFilters] = useState({
    status: '',
    tenant_id: '',
    month: '',
    year: ''
  });

  const [depositFilters, setDepositFilters] = useState({
    status: '',
    tenant_id: ''
  });

  const [waterBillFilters, setWaterBillFilters] = useState({
    status: '',
    tenant_id: '',
    month: '',
    year: ''
  });

  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSummary();
    if (activeTab === 'rent') {
      fetchRentRecords();
    } else if (activeTab === 'deposit') {
      fetchDepositRecords();
    } else if (activeTab === 'water') {
      fetchWaterBillRecords();
    }
  }, [activeTab, currentPage, rentFilters, depositFilters, waterBillFilters]);

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('joyce-suites-token');
      const response = await fetch(`${config.apiBaseUrl}/api/rent-deposit/dashboard/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const fetchRentRecords = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('joyce-suites-token');
      const params = new URLSearchParams({
        page: currentPage,
        ...rentFilters
      });

      const response = await fetch(`${config.apiBaseUrl}/api/rent-deposit/rent/records?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRentRecords(data.records);
        setTotalPages(data.pages);
      } else {
        setError('Failed to fetch rent records');
      }
    } catch (err) {
      setError('Error fetching rent records');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepositRecords = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('joyce-suites-token');
      const params = new URLSearchParams({
        page: currentPage,
        ...depositFilters
      });

      const response = await fetch(`${config.apiBaseUrl}/api/rent-deposit/deposit/records?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDepositRecords(data.records);
        setTotalPages(data.pages);
      } else {
        setError('Failed to fetch deposit records');
      }
    } catch (err) {
      setError('Error fetching deposit records');
    } finally {
      setLoading(false);
    }
  };

  const fetchWaterBillRecords = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('joyce-suites-token');
      const params = new URLSearchParams({
        page: currentPage,
        ...waterBillFilters
      });

      const response = await fetch(`${config.apiBaseUrl}/api/rent-deposit/water-bill/records?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWaterBillRecords(data.records);
        setTotalPages(data.pages);
      } else {
        setError('Failed to fetch water bill records');
      }
    } catch (err) {
      setError('Error fetching water bill records');
    } finally {
      setLoading(false);
    }
  };

  const handleRefundDeposit = async (depositId, refundAmount) => {
    try {
      const token = localStorage.getItem('joyce-suites-token');
      const response = await fetch(`${config.apiBaseUrl}/api/rent-deposit/deposit/mark-refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deposit_id: depositId,
          refund_amount: refundAmount,
          refund_method: 'Bank Transfer',
          refund_notes: 'Refund processed by admin'
        })
      });

      if (response.ok) {
        setSuccess('Deposit refund processed successfully');
        fetchDepositRecords();
        fetchSummary();
      } else {
        setError('Failed to process refund');
      }
    } catch (err) {
      setError('Error processing refund');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'status-paid';
      case 'unpaid':
        return 'status-unpaid';
      case 'partially_paid':
        return 'status-partial';
      case 'overdue':
        return 'status-overdue';
      case 'refunded':
        return 'status-refunded';
      case 'partially_refunded':
        return 'status-partial-refund';
      default:
        return 'status-default';
    }
  };

  const getWaterBillStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'status-paid';
      case 'unpaid':
        return 'status-unpaid';
      case 'partially_paid':
        return 'status-partial';
      case 'overdue':
        return 'status-overdue';
      default:
        return 'status-default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  return (
    <div className="admin-rent-deposit">
      <div className="admin-header">
        <h1>Rent & Deposit Management</h1>
        <p>Manage rent payments and deposit records for all tenants</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Summary Cards */}
      {summary && (
        <div className="summary-grid">
          <div className="summary-card rent-summary">
            <h3>Rent Summary</h3>
            <div className="summary-stats">
              <div className="stat">
                <span className="label">Total Records:</span>
                <span className="value">{summary.rent_summary.total_records}</span>
              </div>
              <div className="stat">
                <span className="label">Paid:</span>
                <span className="value paid">{summary.rent_summary.paid}</span>
              </div>
              <div className="stat">
                <span className="label">Unpaid:</span>
                <span className="value unpaid">{summary.rent_summary.unpaid}</span>
              </div>
              <div className="stat">
                <span className="label">Overdue:</span>
                <span className="value overdue">{summary.rent_summary.overdue}</span>
              </div>
              <div className="stat">
                <span className="label">Current Month Due:</span>
                <span className="value">{formatCurrency(summary.rent_summary.current_month.total_due)}</span>
              </div>
              <div className="stat">
                <span className="label">Current Month Collected:</span>
                <span className="value collected">{formatCurrency(summary.rent_summary.current_month.total_collected)}</span>
              </div>
            </div>
          </div>

          <div className="summary-card deposit-summary">
            <h3>Deposit Summary</h3>
            <div className="summary-stats">
              <div className="stat">
                <span className="label">Total Records:</span>
                <span className="value">{summary.deposit_summary.total_records}</span>
              </div>
              <div className="stat">
                <span className="label">Paid:</span>
                <span className="value paid">{summary.deposit_summary.paid}</span>
              </div>
              <div className="stat">
                <span className="label">Unpaid:</span>
                <span className="value unpaid">{summary.deposit_summary.unpaid}</span>
              </div>
              <div className="stat">
                <span className="label">Refunded:</span>
                <span className="value refunded">{summary.deposit_summary.refunded}</span>
              </div>
            </div>
          </div>

          <div className="summary-card water-bill-summary">
            <h3>Water Bill Summary</h3>
            <div className="summary-stats">
              <div className="stat">
                <span className="label">Total Records:</span>
                <span className="value">{summary.water_bill_summary.total_records}</span>
              </div>
              <div className="stat">
                <span className="label">Paid:</span>
                <span className="value paid">{summary.water_bill_summary.paid}</span>
              </div>
              <div className="stat">
                <span className="label">Unpaid:</span>
                <span className="value unpaid">{summary.water_bill_summary.unpaid}</span>
              </div>
              <div className="stat">
                <span className="label">Overdue:</span>
                <span className="value overdue">{summary.water_bill_summary.overdue}</span>
              </div>
              <div className="stat">
                <span className="label">Current Month Due:</span>
                <span className="value">{formatCurrency(summary.water_bill_summary.current_month.total_due)}</span>
              </div>
              <div className="stat">
                <span className="label">Current Month Collected:</span>
                <span className="value collected">{formatCurrency(summary.water_bill_summary.current_month.total_collected)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'rent' ? 'active' : ''}`}
          onClick={() => setActiveTab('rent')}
        >
          Rent Records
        </button>
        <button
          className={`tab-button ${activeTab === 'deposit' ? 'active' : ''}`}
          onClick={() => setActiveTab('deposit')}
        >
          Deposit Records
        </button>
        <button
          className={`tab-button ${activeTab === 'water' ? 'active' : ''}`}
          onClick={() => setActiveTab('water')}
        >
          Water Bills
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        {activeTab === 'rent' ? (
          <div className="filters">
            <select
              value={rentFilters.status}
              onChange={(e) => setRentFilters({ ...rentFilters, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <input
              type="number"
              placeholder="Tenant ID"
              value={rentFilters.tenant_id}
              onChange={(e) => setRentFilters({ ...rentFilters, tenant_id: e.target.value })}
            />
            <input
              type="number"
              placeholder="Month (1-12)"
              min="1"
              max="12"
              value={rentFilters.month}
              onChange={(e) => setRentFilters({ ...rentFilters, month: e.target.value })}
            />
            <input
              type="number"
              placeholder="Year"
              value={rentFilters.year}
              onChange={(e) => setRentFilters({ ...rentFilters, year: e.target.value })}
            />
            <button onClick={fetchRentRecords} className="filter-btn">Apply Filters</button>
          </div>
        ) : activeTab === 'deposit' ? (
          <div className="filters">
            <select
              value={depositFilters.status}
              onChange={(e) => setDepositFilters({ ...depositFilters, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="refunded">Refunded</option>
              <option value="partially_refunded">Partially Refunded</option>
            </select>
            <input
              type="number"
              placeholder="Tenant ID"
              value={depositFilters.tenant_id}
              onChange={(e) => setDepositFilters({ ...depositFilters, tenant_id: e.target.value })}
            />
            <button onClick={fetchDepositRecords} className="filter-btn">Apply Filters</button>
          </div>
        ) : (
          <div className="filters">
            <select
              value={waterBillFilters.status}
              onChange={(e) => setWaterBillFilters({ ...waterBillFilters, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <input
              type="number"
              placeholder="Tenant ID"
              value={waterBillFilters.tenant_id}
              onChange={(e) => setWaterBillFilters({ ...waterBillFilters, tenant_id: e.target.value })}
            />
            <input
              type="number"
              placeholder="Month (1-12)"
              min="1"
              max="12"
              value={waterBillFilters.month}
              onChange={(e) => setWaterBillFilters({ ...waterBillFilters, month: e.target.value })}
            />
            <input
              type="number"
              placeholder="Year"
              value={waterBillFilters.year}
              onChange={(e) => setWaterBillFilters({ ...waterBillFilters, year: e.target.value })}
            />
            <button onClick={fetchWaterBillRecords} className="filter-btn">Apply Filters</button>
          </div>
        )}
      </div>

      {/* Records Table */}
      <div className="records-table">
        {loading ? (
          <div className="loading">Loading records...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Property</th>
                {activeTab === 'rent' ? (
                  <>
                    <th>Month</th>
                    <th>Amount Due</th>
                    <th>Amount Paid</th>
                    <th>Balance</th>
                    <th>Due Date</th>
                    <th>Payment Date</th>
                  </>
                ) : activeTab === 'deposit' ? (
                  <>
                    <th>Amount Required</th>
                    <th>Amount Paid</th>
                    <th>Balance</th>
                    <th>Payment Date</th>
                    <th>Refund Amount</th>
                    <th>Refund Date</th>
                  </>
                ) : (
                  <>
                    <th>Month</th>
                    <th>Reading Date</th>
                    <th>Units Consumed</th>
                    <th>Amount Due</th>
                    <th>Amount Paid</th>
                    <th>Balance</th>
                    <th>Due Date</th>
                    <th>Payment Date</th>
                  </>
                )}
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'rent' ? rentRecords : activeTab === 'deposit' ? depositRecords : waterBillRecords).map((record) => (
                <tr key={record.id}>
                  <td>{record.tenant_name}</td>
                  <td>{record.property_name}</td>
                  {activeTab === 'rent' ? (
                    <>
                      <td>{record.month}/{record.year}</td>
                      <td>{formatCurrency(record.amount_due)}</td>
                      <td>{formatCurrency(record.amount_paid)}</td>
                      <td>{formatCurrency(record.balance)}</td>
                      <td>{record.due_date ? new Date(record.due_date).toLocaleDateString() : 'N/A'}</td>
                      <td>{record.payment_date ? new Date(record.payment_date).toLocaleDateString() : 'N/A'}</td>
                    </>
                  ) : activeTab === 'deposit' ? (
                    <>
                      <td>{formatCurrency(record.amount_required)}</td>
                      <td>{formatCurrency(record.amount_paid)}</td>
                      <td>{formatCurrency(record.balance)}</td>
                      <td>{record.payment_date ? new Date(record.payment_date).toLocaleDateString() : 'N/A'}</td>
                      <td>{formatCurrency(record.refund_amount || 0)}</td>
                      <td>{record.refund_date ? new Date(record.refund_date).toLocaleDateString() : 'N/A'}</td>
                    </>
                  ) : (
                    <>
                      <td>{record.month}/{record.year}</td>
                      <td>{record.reading_date ? new Date(record.reading_date).toLocaleDateString() : 'N/A'}</td>
                      <td>{record.units_consumed}</td>
                      <td>{formatCurrency(record.amount_due)}</td>
                      <td>{formatCurrency(record.amount_paid)}</td>
                      <td>{formatCurrency(record.balance)}</td>
                      <td>{record.due_date ? new Date(record.due_date).toLocaleDateString() : 'N/A'}</td>
                      <td>{record.payment_date ? new Date(record.payment_date).toLocaleDateString() : 'N/A'}</td>
                    </>
                  )}
                  <td>
                    <span className={`status-badge ${activeTab === 'water' ? getWaterBillStatusColor(record.status) : getStatusColor(record.status)}`}>
                      {record.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {activeTab === 'deposit' && record.status === 'paid' && (
                      <button
                        className="refund-btn"
                        onClick={() => {
                          const amount = prompt('Enter refund amount:');
                          if (amount && !isNaN(amount)) {
                            handleRefundDeposit(record.id, parseFloat(amount));
                          }
                        }}
                      >
                        Process Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminRentDeposit;
