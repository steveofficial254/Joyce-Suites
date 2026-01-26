import config from '../../config';
import './CaretakerRentDeposit.css';

const CaretakerRentDeposit = () => {
  const [activeTab, setActiveTab] = useState('rent');
  const [rentRecords, setRentRecords] = useState([]);
  const [depositRecords, setDepositRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [summary, setSummary] = useState(null);

  
  const [showRentPaymentModal, setShowRentPaymentModal] = useState(false);
  const [showDepositPaymentModal, setShowDepositPaymentModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  
  const [paymentForm, setPaymentForm] = useState({
    amount_paid: '',
    payment_method: 'Cash',
    payment_reference: '',
    notes: ''
  });

  
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

  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSummary();
    if (activeTab === 'rent') {
      fetchRentRecords();
    } else {
      fetchDepositRecords();
    }
  }, [activeTab, currentPage, rentFilters, depositFilters]);

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

  const handleMarkRentPayment = async () => {
    try {
      const token = localStorage.getItem('joyce-suites-token');
      const response = await fetch(`${config.apiBaseUrl}/api/rent-deposit/rent/mark-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rent_id: selectedRecord.id,
          ...paymentForm
        })
      });

      if (response.ok) {
        setSuccess('Rent payment marked successfully');
        setShowRentPaymentModal(false);
        setSelectedRecord(null);
        setPaymentForm({
          amount_paid: '',
          payment_method: 'Cash',
          payment_reference: '',
          notes: ''
        });
        fetchRentRecords();
        fetchSummary();
      } else {
        setError('Failed to mark payment');
      }
    } catch (err) {
      setError('Error marking payment');
    }
  };

  const handleMarkDepositPayment = async () => {
    try {
      const token = localStorage.getItem('joyce-suites-token');
      const response = await fetch(`${config.apiBaseUrl}/api/rent-deposit/deposit/mark-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deposit_id: selectedRecord.id,
          ...paymentForm
        })
      });

      if (response.ok) {
        setSuccess('Deposit payment marked successfully');
        setShowDepositPaymentModal(false);
        setSelectedRecord(null);
        setPaymentForm({
          amount_paid: '',
          payment_method: 'Cash',
          payment_reference: '',
          notes: ''
        });
        fetchDepositRecords();
        fetchSummary();
      } else {
        setError('Failed to mark payment');
      }
    } catch (err) {
      setError('Error marking payment');
    }
  };

  const openRentPaymentModal = (record) => {
    setSelectedRecord(record);
    setPaymentForm({
      ...paymentForm,
      amount_paid: record.balance.toString()
    });
    setShowRentPaymentModal(true);
  };

  const openDepositPaymentModal = (record) => {
    setSelectedRecord(record);
    setPaymentForm({
      ...paymentForm,
      amount_paid: record.balance.toString()
    });
    setShowDepositPaymentModal(true);
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
    <div className="caretaker-rent-deposit">
      <div className="caretaker-header">
        <h1>Rent & Deposit Management</h1>
        <p>Mark payments and manage rent/deposit records</p>
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
        ) : (
          <div className="filters">
            <select
              value={depositFilters.status}
              onChange={(e) => setDepositFilters({ ...depositFilters, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
            <input
              type="number"
              placeholder="Tenant ID"
              value={depositFilters.tenant_id}
              onChange={(e) => setDepositFilters({ ...depositFilters, tenant_id: e.target.value })}
            />
            <button onClick={fetchDepositRecords} className="filter-btn">Apply Filters</button>
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
                ) : (
                  <>
                    <th>Amount Required</th>
                    <th>Amount Paid</th>
                    <th>Balance</th>
                    <th>Payment Date</th>
                  </>
                )}
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'rent' ? rentRecords : depositRecords).map((record) => (
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
                  ) : (
                    <>
                      <td>{formatCurrency(record.amount_required)}</td>
                      <td>{formatCurrency(record.amount_paid)}</td>
                      <td>{formatCurrency(record.balance)}</td>
                      <td>{record.payment_date ? new Date(record.payment_date).toLocaleDateString() : 'N/A'}</td>
                    </>
                  )}
                  <td>
                    <span className={`status-badge ${getStatusColor(record.status)}`}>
                      {record.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {record.status !== 'paid' && (
                      <button
                        className="mark-payment-btn"
                        onClick={() => activeTab === 'rent' ? openRentPaymentModal(record) : openDepositPaymentModal(record)}
                      >
                        Mark Payment
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

      {/* Rent Payment Modal */}
      {showRentPaymentModal && selectedRecord && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Mark Rent Payment</h3>
              <button onClick={() => setShowRentPaymentModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="record-info">
                <p><strong>Tenant:</strong> {selectedRecord.tenant_name}</p>
                <p><strong>Property:</strong> {selectedRecord.property_name}</p>
                <p><strong>Month:</strong> {selectedRecord.month}/{selectedRecord.year}</p>
                <p><strong>Amount Due:</strong> {formatCurrency(selectedRecord.amount_due)}</p>
                <p><strong>Balance:</strong> {formatCurrency(selectedRecord.balance)}</p>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleMarkRentPayment(); }}>
                <div className="form-group">
                  <label>Amount Paid:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentForm.amount_paid}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount_paid: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Payment Method:</label>
                  <select
                    value={paymentForm.payment_method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                  >
                    <option value="Cash">Cash</option>
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Payment Reference:</label>
                  <input
                    type="text"
                    value={paymentForm.payment_reference}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_reference: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Notes:</label>
                  <textarea
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    rows="3"
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="submit-btn">Mark Payment</button>
                  <button type="button" onClick={() => setShowRentPaymentModal(false)} className="cancel-btn">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Payment Modal */}
      {showDepositPaymentModal && selectedRecord && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Mark Deposit Payment</h3>
              <button onClick={() => setShowDepositPaymentModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="record-info">
                <p><strong>Tenant:</strong> {selectedRecord.tenant_name}</p>
                <p><strong>Property:</strong> {selectedRecord.property_name}</p>
                <p><strong>Amount Required:</strong> {formatCurrency(selectedRecord.amount_required)}</p>
                <p><strong>Balance:</strong> {formatCurrency(selectedRecord.balance)}</p>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleMarkDepositPayment(); }}>
                <div className="form-group">
                  <label>Amount Paid:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentForm.amount_paid}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount_paid: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Payment Method:</label>
                  <select
                    value={paymentForm.payment_method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                  >
                    <option value="Cash">Cash</option>
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Payment Reference:</label>
                  <input
                    type="text"
                    value={paymentForm.payment_reference}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_reference: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Notes:</label>
                  <textarea
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    rows="3"
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="submit-btn">Mark Payment</button>
                  <button type="button" onClick={() => setShowDepositPaymentModal(false)} className="cancel-btn">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaretakerRentDeposit;
