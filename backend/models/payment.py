const MarkPaymentModal = ({ tenant, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    tenant_id: tenant.tenant_id || tenant.id || '',
    amount: tenant.rent_amount || 0,
    status: 'paid',
    payment_method: 'cash'
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'amount') {
      // Ensure amount is a number
      const numValue = value === '' ? '' : parseFloat(value);
      setFormData({
        ...formData,
        [name]: numValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    // Validation
    if (!formData.tenant_id) {
      newErrors.tenant_id = 'Tenant ID is required';
    }
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.status || !['paid', 'unpaid'].includes(formData.status)) {
      newErrors.status = 'Status must be "paid" or "unpaid"';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare data exactly as backend expects
    const submitData = {
      tenant_id: parseInt(formData.tenant_id),
      amount: parseFloat(formData.amount),
      status: formData.status,
      payment_method: formData.payment_method || 'manual'
    };

    onSubmit(submitData);
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3>Record Payment</h3>
          <button style={styles.modalClose} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.modalBody}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Tenant Information</label>
              <div style={{ 
                backgroundColor: '#f9fafb', 
                padding: '12px', 
                borderRadius: '6px',
                margin: '8px 0'
              }}>
                <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>
                  {tenant.tenant_name || tenant.name || 'N/A'}
                </p>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  <span>Room: {tenant.room_number || 'N/A'}</span>
                  <span>Rent: KSh {tenant.rent_amount ? tenant.rent_amount.toLocaleString() : '0'}</span>
                </div>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Tenant ID *</label>
              <input
                type="text"
                name="tenant_id"
                value={formData.tenant_id}
                onChange={handleChange}
                placeholder="Tenant ID"
                style={{ ...styles.formInput, ...(errors.tenant_id ? styles.inputError : {}) }}
                disabled={!!tenant.tenant_id || !!tenant.id}
              />
              {errors.tenant_id && <span style={styles.errorText}>{errors.tenant_id}</span>}
              <small style={styles.helpText}>
                This should be populated automatically
              </small>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Payment Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{ ...styles.formSelect, ...(errors.status ? styles.inputError : {}) }}
              >
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
              {errors.status && <span style={styles.errorText}>{errors.status}</span>}
              <small style={styles.helpText}>
                • Paid: Mark payment as completed<br/>
                • Unpaid: Mark payment as not received
              </small>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Amount (KES) *</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                min="1"
                step="0.01"
                style={{ ...styles.formInput, ...(errors.amount ? styles.inputError : {}) }}
              />
              {errors.amount && <span style={styles.errorText}>{errors.amount}</span>}
              <small style={styles.helpText}>
                Amount to be recorded
              </small>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Payment Method</label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                style={styles.formSelect}
              >
                <option value="cash">Cash</option>
                <option value="manual">Manual</option>
                <option value="mpesa">M-Pesa</option>
                <option value="bank">Bank Transfer</option>
              </select>
              <small style={styles.helpText}>
                How was this payment received?
              </small>
            </div>
          </div>

          <div style={styles.modalFooter}>
            <button type="button" style={styles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" style={styles.btnPrimary} disabled={loading}>
              {loading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid white',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: '8px'
                  }}></div>
                  Processing...
                </>
              ) : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
