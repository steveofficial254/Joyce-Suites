import config from '../../config';
import './CaretakerWaterBill.css';

const CaretakerWaterBill = () => {
  const [waterBillRecords, setWaterBillRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tenants, setTenants] = useState([]);

  
  const [showBulkCreateModal, setShowBulkCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  
  const [bulkForm, setBulkForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    reading_date: new Date().toISOString().split('T')[0],
    unit_rate: 50.0,
    bills: []
  });

  
  const [paymentForm, setPaymentForm] = useState({
    amount_paid: '',
    payment_method: 'Cash',
    payment_reference: '',
    notes: ''
  });

  
  const [filters, setFilters] = useState({
    status: '',
    tenant_id: '',
    month: '',
    year: ''
  });

  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchWaterBillRecords();
    fetchTenants();
  }, [currentPage, filters]);

  const fetchWaterBillRecords = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('joyce-suites-token');
      const params = new URLSearchParams({
        page: currentPage,
        ...filters
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

  const fetchTenants = async () => {
    try {
      const token = localStorage.getItem('joyce-suites-token');
      const response = await fetch(`${config.apiBaseUrl}/api/caretaker/tenants?per_page=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTenants(data.tenants || []);
      }
    } catch (err) {
      console.error('Error fetching tenants:', err);
    }
  };

  const handleBulkCreate = async () => {
    try {
      const token = localStorage.getItem('joyce-suites-token');
      const response = await fetch(`${config.apiBaseUrl}/api/rent-deposit/water-bill/bulk-create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bulkForm)
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Created ${data.created_bills.length} water bills successfully`);
        setShowBulkCreateModal(false);
        setBulkForm({
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          reading_date: new Date().toISOString().split('T')[0],
          unit_rate: 50.0,
          bills: []
        });
        fetchWaterBillRecords();
      } else {
        setError('Failed to create water bills');
      }
    } catch (err) {
      setError('Error creating water bills');
    }
  };

  const handleMarkPayment = async () => {
    try {
      const token = localStorage.getItem('joyce-suites-token');
      const response = await fetch(`${config.apiBaseUrl}/api/rent-deposit/water-bill/mark-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          water_bill_id: selectedRecord.id,
          ...paymentForm
        })
      });

      if (response.ok) {
        setSuccess('Water bill payment marked successfully');
        setShowPaymentModal(false);
        setSelectedRecord(null);
        setPaymentForm({
          amount_paid: '',
          payment_method: 'Cash',
          payment_reference: '',
          notes: ''
        });
        fetchWaterBillRecords();
      } else {
        setError('Failed to mark payment');
      }
    } catch (err) {
      setError('Error marking payment');
    }
  };

  const openPaymentModal = (record) => {
    setSelectedRecord(record);
    setPaymentForm({
      ...paymentForm,
      amount_paid: record.balance.toString()
    });
    setShowPaymentModal(true);
  };

  const initializeBulkBills = () => {
    const bills = tenants.map(tenant => ({
      tenant_id: tenant.id,
      property_id: tenant.property_id || 1, 
      lease_id: tenant.lease_id || 1, 
      previous_reading: 0,
      current_reading: 0
    }));
    setBulkForm({ ...bulkForm, bills });
  };

  const updateBillReading = (index, field, value) => {
    const updatedBills = [...bulkForm.bills];
    updatedBills[index] = {
      ...updatedBills[index],
      [field]: parseFloat(value) || 0
    };
    setBulkForm({ ...bulkForm, bills: updatedBills });
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
    <div className="caretaker-water-bill">
      <div className="caretaker-header">
        <h1>Water Bill Management</h1>
        <p>Record monthly water readings and manage water bill payments</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          className="bulk-create-btn"
          onClick={() => {
            initializeBulkBills();
            setShowBulkCreateModal(true);
          }}
        >
          Create Monthly Water Bills
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
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
            value={filters.tenant_id}
            onChange={(e) => setFilters({ ...filters, tenant_id: e.target.value })}
          />
          <input
            type="number"
            placeholder="Month (1-12)"
            min="1"
            max="12"
            value={filters.month}
            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
          />
          <input
            type="number"
            placeholder="Year"
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          />
          <button onClick={fetchWaterBillRecords} className="filter-btn">Apply Filters</button>
        </div>
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
                <th>Month</th>
                <th>Reading Date</th>
                <th>Previous Reading</th>
                <th>Current Reading</th>
                <th>Units Consumed</th>
                <th>Amount Due</th>
                <th>Amount Paid</th>
                <th>Balance</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {waterBillRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.tenant_name}</td>
                  <td>{record.property_name}</td>
                  <td>{record.month}/{record.year}</td>
                  <td>{record.reading_date ? new Date(record.reading_date).toLocaleDateString() : 'N/A'}</td>
                  <td>{record.previous_reading}</td>
                  <td>{record.current_reading}</td>
                  <td>{record.units_consumed}</td>
                  <td>{formatCurrency(record.amount_due)}</td>
                  <td>{formatCurrency(record.amount_paid)}</td>
                  <td>{formatCurrency(record.balance)}</td>
                  <td>{record.due_date ? new Date(record.due_date).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(record.status)}`}>
                      {record.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {record.status !== 'paid' && (
                      <button
                        className="mark-payment-btn"
                        onClick={() => openPaymentModal(record)}
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

      {/* Bulk Create Modal */}
      {showBulkCreateModal && (
        <div className="modal-overlay">
          <div className="modal bulk-modal">
            <div className="modal-header">
              <h3>Create Monthly Water Bills</h3>
              <button onClick={() => setShowBulkCreateModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="bulk-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Month:</label>
                    <select
                      value={bulkForm.month}
                      onChange={(e) => setBulkForm({ ...bulkForm, month: parseInt(e.target.value) })}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Year:</label>
                    <input
                      type="number"
                      value={bulkForm.year}
                      onChange={(e) => setBulkForm({ ...bulkForm, year: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Reading Date:</label>
                    <input
                      type="date"
                      value={bulkForm.reading_date}
                      onChange={(e) => setBulkForm({ ...bulkForm, reading_date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Unit Rate (KSh):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={bulkForm.unit_rate}
                      onChange={(e) => setBulkForm({ ...bulkForm, unit_rate: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="bills-table">
                  <h4>Tenant Readings</h4>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Tenant</th>
                          <th>Previous Reading</th>
                          <th>Current Reading</th>
                          <th>Units Consumed</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkForm.bills.map((bill, index) => {
                          const unitsConsumed = bill.current_reading - bill.previous_reading;
                          const amount = unitsConsumed * bulkForm.unit_rate;
                          return (
                            <tr key={index}>
                              <td>{tenants.find(t => t.id === bill.tenant_id)?.full_name || `Tenant ${bill.tenant_id}`}</td>
                              <td>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={bill.previous_reading}
                                  onChange={(e) => updateBillReading(index, 'previous_reading', e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={bill.current_reading}
                                  onChange={(e) => updateBillReading(index, 'current_reading', e.target.value)}
                                />
                              </td>
                              <td>{unitsConsumed.toFixed(2)}</td>
                              <td>{formatCurrency(amount)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={handleBulkCreate} className="submit-btn">Create Water Bills</button>
              <button onClick={() => setShowBulkCreateModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedRecord && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Mark Water Bill Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="record-info">
                <p><strong>Tenant:</strong> {selectedRecord.tenant_name}</p>
                <p><strong>Property:</strong> {selectedRecord.property_name}</p>
                <p><strong>Month:</strong> {selectedRecord.month}/{selectedRecord.year}</p>
                <p><strong>Amount Due:</strong> {formatCurrency(selectedRecord.amount_due)}</p>
                <p><strong>Balance:</strong> {formatCurrency(selectedRecord.balance)}</p>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleMarkPayment(); }}>
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
                  <button type="button" onClick={() => setShowPaymentModal(false)} className="cancel-btn">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaretakerWaterBill;
