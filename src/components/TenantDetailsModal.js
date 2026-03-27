import React, { useState } from 'react';
import { X, User, Mail, Phone, Home, Calendar, DollarSign, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

const TenantDetailsModal = ({ tenant, onClose }) => {
  const [activeTab, setActiveTab] = useState('details');

  if (!tenant) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '12px',
      width: '90%',
      maxWidth: '800px',
      maxHeight: '90vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    },
    header: {
      padding: '24px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      fontSize: '20px',
      fontWeight: '600',
      margin: 0,
      color: '#1f2937'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    tabs: {
      display: 'flex',
      borderBottom: '1px solid #e5e7eb'
    },
    tab: {
      padding: '16px 24px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      color: '#6b7280',
      borderBottom: '2px solid transparent'
    },
    activeTab: {
      color: '#3b82f6',
      borderBottomColor: '#3b82f6'
    },
    content: {
      padding: '24px',
      overflow: 'auto',
      flex: 1
    },
    section: {
      marginBottom: '24px'
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '16px',
      color: '#1f2937',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px'
    },
    infoItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    infoLabel: {
      fontSize: '12px',
      fontWeight: '500',
      color: '#6b7280',
      textTransform: 'uppercase'
    },
    infoValue: {
      fontSize: '14px',
      color: '#1f2937'
    },
    statusBadge: {
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    },
    statusPaid: {
      backgroundColor: '#d1fae5',
      color: '#065f46'
    },
    statusPending: {
      backgroundColor: '#fef3c7',
      color: '#92400e'
    },
    statusOverdue: {
      backgroundColor: '#fee2e2',
      color: '#991b1b'
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return (
          <span style={{ ...styles.statusBadge, ...styles.statusPaid }}>
            <CheckCircle size={12} /> Paid
          </span>
        );
      case 'pending':
        return (
          <span style={{ ...styles.statusBadge, ...styles.statusPending }}>
            <Clock size={12} /> Pending
          </span>
        );
      case 'overdue':
        return (
          <span style={{ ...styles.statusBadge, ...styles.statusOverdue }}>
            <XCircle size={12} /> Overdue
          </span>
        );
      default:
        return (
          <span style={{ ...styles.statusBadge, ...styles.statusPending }}>
            <Clock size={12} /> Unknown
          </span>
        );
    }
  };

  const renderPersonalDetails = () => (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>
        <User size={16} /> Personal Information
      </h3>
      <div style={styles.infoGrid}>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>Full Name</span>
          <span style={styles.infoValue}>{tenant.full_name || 'N/A'}</span>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>ID Number</span>
          <span style={styles.infoValue}>{tenant.id_number || 'N/A'}</span>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>Phone Number</span>
          <span style={styles.infoValue}>{tenant.phone_number || 'N/A'}</span>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>Email Address</span>
          <span style={styles.infoValue}>{tenant.email || 'N/A'}</span>
        </div>
      </div>
    </div>
  );

  const renderPropertyDetails = () => (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>
        <Home size={16} /> Property Information
      </h3>
      <div style={styles.infoGrid}>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>Room Number</span>
          <span style={styles.infoValue}>{tenant.room_number || 'N/A'}</span>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>Property Type</span>
          <span style={styles.infoValue}>{tenant.property_type || 'N/A'}</span>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>Rent Amount</span>
          <span style={styles.infoValue}>KES {tenant.rent_amount || 0}</span>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>Deposit Amount</span>
          <span style={styles.infoValue}>KES {tenant.deposit_amount || 0}</span>
        </div>
      </div>
    </div>
  );

  const renderPaymentHistory = () => {
    const payments = tenant.payments || [];
    
    return (
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          <DollarSign size={16} /> Payment History
        </h3>
        {payments.length > 0 ? (
          <div style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Type</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Amount</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', fontSize: '14px' }}>
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>
                      {payment.type || 'Rent'}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>
                      KES {payment.amount || 0}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {getStatusBadge(payment.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '24px' }}>
            No payment records found
          </p>
        )}
      </div>
    );
  };

  const renderLeaseDetails = () => (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>
        <FileText size={16} /> Lease Information
      </h3>
      <div style={styles.infoGrid}>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>Lease Start Date</span>
          <span style={styles.infoValue}>
            {tenant.lease_start_date ? new Date(tenant.lease_start_date).toLocaleDateString() : 'N/A'}
          </span>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>Lease End Date</span>
          <span style={styles.infoValue}>
            {tenant.lease_end_date ? new Date(tenant.lease_end_date).toLocaleDateString() : 'N/A'}
          </span>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>Payment Status</span>
          <span style={styles.infoValue}>
            {getStatusBadge(tenant.payment_status)}
          </span>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>Outstanding Balance</span>
          <span style={styles.infoValue}>KES {tenant.outstanding_balance || 0}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Tenant Details</h2>
          <button style={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(activeTab === 'details' ? styles.activeTab : {}) }}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            style={{ ...styles.tab, ...(activeTab === 'lease' ? styles.activeTab : {}) }}
            onClick={() => setActiveTab('lease')}
          >
            Lease
          </button>
          <button
            style={{ ...styles.tab, ...(activeTab === 'payments' ? styles.activeTab : {}) }}
            onClick={() => setActiveTab('payments')}
          >
            Payments
          </button>
        </div>

        <div style={styles.content}>
          {activeTab === 'details' && (
            <>
              {renderPersonalDetails()}
              {renderPropertyDetails()}
            </>
          )}
          {activeTab === 'lease' && renderLeaseDetails()}
          {activeTab === 'payments' && renderPaymentHistory()}
        </div>
      </div>
    </div>
  );
};

export default TenantDetailsModal;
