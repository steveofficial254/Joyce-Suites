import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu, LogOut, X, Bell, Eye, Edit, Trash2, Filter, Search,
  Download, Mail, Phone, FileText, ArrowLeft, User, Send,
  Check, AlertCircle, Home, Plus, Calendar, DollarSign,
  Building, Users, CreditCard, Key, CheckCircle, Clock, UserPlus,
  RefreshCw, XCircle, Wrench, AlertTriangle, UserX, MessageSquare,
  TrendingUp, PieChart, FileSpreadsheet, DoorOpen, List, CreditCard as PaymentIcon,
  FileCheck, AlertOctagon, Home as RoomIcon, CalendarDays, UserCheck,
  Receipt, FileWarning, ShieldCheck, ShieldX, CalendarCheck, CalendarX,
  BedDouble, Bath, Square, Layers, MapPin, Droplet
} from 'lucide-react';

import config from '../../config';

const API_BASE_URL = config.apiBaseUrl;

const WaterBillPage = () => {
  const [waterBillRecords, setWaterBillRecords] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [financialSummary, setFinancialSummary] = useState(null);
  const [showReadingModal, setShowReadingModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);
  const [readingForm, setReadingForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    previous_reading: '',
    current_reading: '',
    unit_rate: 50.0
  });

  const fetchWaterBillRecords = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${config.apiBaseUrl}/api/rent-deposit/water-bill/records`);
      if (response.ok) {
        const data = await response.json();
        setWaterBillRecords(data.records || []);
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
      const response = await fetchWithAuth(`${config.apiBaseUrl}/api/caretaker/tenants`);
      if (response.ok) {
        const data = await response.json();
        setTenants(data.tenants || []);
      }
    } catch (err) {
      console.error('Failed to fetch tenants:', err);
    }
  };

  const handleCreateWaterBill = async () => {
    try {
      const units_consumed = parseFloat(readingForm.current_reading) - parseFloat(readingForm.previous_reading);
      const amount = units_consumed * parseFloat(readingForm.unit_rate);

      const response = await fetchWithAuth(`${config.apiBaseUrl}/api/rent-deposit/water-bill/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: selectedTenant,
          month: readingForm.month,
          year: readingForm.year,
          previous_reading: parseFloat(readingForm.previous_reading),
          current_reading: parseFloat(readingForm.current_reading),
          units_consumed: units_consumed,
          unit_rate: parseFloat(readingForm.unit_rate),
          amount_due: amount
        })
      });

      if (response.ok) {
        setSuccess('Water bill created successfully');
        setShowReadingModal(false);
        setReadingForm({
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          previous_reading: '',
          current_reading: '',
          unit_rate: 50.0
        });
        setSelectedTenant(null);
        fetchWaterBillRecords();
      } else {
        setError('Failed to create water bill');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRecordPayment = async (billId, paymentData) => {
    try {
      const response = await fetchWithAuth(`${config.apiBaseUrl}/api/rent-deposit/water-bill/mark-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bill_id: billId,
          ...paymentData
        })
      });

      if (response.ok) {
        setSuccess('Payment recorded successfully');
        setShowPaymentModal(false);
        setSelectedBillForPayment(null);
        fetchWaterBillRecords();
      } else {
        setError('Failed to record payment');
      }
    } catch (err) {
      setError('Failed to record payment');
    }
  };

  useEffect(() => {
    fetchWaterBillRecords();
    fetchTenants();
  }, []);

  const getMonthName = (month) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1] || 'Unknown';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f4f6',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading water bill records...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', margin: 0 }}>
          Water Bill Management
        </h2>
        <button
          onClick={() => setShowReadingModal(true)}
          style={{
            padding: '10px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Create Water Bill
        </button>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          marginBottom: '16px',
          color: '#991b1b'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#dcfce7',
          border: '1px solid #bbf7d0',
          borderRadius: '6px',
          marginBottom: '16px',
          color: '#166534'
        }}>
          {success}
        </div>
      )}

      <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f9fafb' }}>
            <tr>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Tenant</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Period</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Units</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Amount</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {waterBillRecords.map(record => (
              <tr key={record.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 16px', color: '#6b7280' }}>
                  <div>
                    <div style={{ fontWeight: '500', color: '#111827' }}>{record.tenant_name || 'Unknown'}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>{record.property_name || 'N/A'}</div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', color: '#6b7280' }}>
                  {getMonthName(record.month)} {record.year}
                </td>
                <td style={{ padding: '12px 16px', color: '#6b7280' }}>
                  {record.units_consumed} units
                </td>
                <td style={{ padding: '12px 16px', color: '#6b7280' }}>
                  KSh {record.amount_due?.toLocaleString() || 0}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: record.status === 'paid' ? '#dcfce7' : 
                                     record.status === 'overdue' ? '#fee2e2' : '#fef3c7',
                    color: record.status === 'paid' ? '#166534' : 
                           record.status === 'overdue' ? '#991b1b' : '#92400e'
                  }}>
                    {record.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {record.status !== 'paid' && (
                      <button
                        onClick={() => {
                          setSelectedBillForPayment(record);
                          setShowPaymentModal(true);
                        }}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Record Payment
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {waterBillRecords.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            No water bill records found
          </div>
        )}
      </div>

      {/* Create Water Bill Modal */}
      {showReadingModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Create Water Bill</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Tenant</label>
              <select
                value={selectedTenant || ''}
                onChange={(e) => setSelectedTenant(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">Choose a tenant...</option>
                {tenants.map(tenant => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.tenant_name} - {tenant.property_name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Month</label>
                <select
                  value={readingForm.month}
                  onChange={(e) => setReadingForm({...readingForm, month: parseInt(e.target.value)})}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  {['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => (
                    <option key={month} value={index + 1}>{month}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Year</label>
                <input
                  type="number"
                  value={readingForm.year}
                  onChange={(e) => setReadingForm({...readingForm, year: parseInt(e.target.value)})}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Previous Reading</label>
                <input
                  type="number"
                  value={readingForm.previous_reading}
                  onChange={(e) => setReadingForm({...readingForm, previous_reading: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Current Reading</label>
                <input
                  type="number"
                  value={readingForm.current_reading}
                  onChange={(e) => setReadingForm({...readingForm, current_reading: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Unit Rate (KSh)</label>
              <input
                type="number"
                value={readingForm.unit_rate}
                onChange={(e) => setReadingForm({...readingForm, unit_rate: parseFloat(e.target.value)})}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowReadingModal(false);
                  setSelectedTenant(null);
                }}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWaterBill}
                disabled={!selectedTenant || !readingForm.previous_reading || !readingForm.current_reading}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  opacity: (!selectedTenant || !readingForm.previous_reading || !readingForm.current_reading) ? 0.5 : 1
                }}
              >
                Create Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedBillForPayment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '400px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Record Water Bill Payment</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                <div><strong>Tenant:</strong> {selectedBillForPayment.tenant_name}</div>
                <div><strong>Amount Due:</strong> KSh {selectedBillForPayment.amount_due?.toLocaleString() || 0}</div>
                <div><strong>Balance:</strong> KSh {selectedBillForPayment.balance?.toLocaleString() || 0}</div>
              </div>
            </div>

            <WaterBillPaymentForm
              bill={selectedBillForPayment}
              onSubmit={(paymentData) => handleRecordPayment(selectedBillForPayment.id, paymentData)}
              onCancel={() => {
                setShowPaymentModal(false);
                setSelectedBillForPayment(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const WaterBillPaymentForm = ({ bill, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    amount_paid: bill.balance || bill.amount_due,
    payment_method: 'Cash',
    payment_reference: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Amount Paid (KSh)</label>
        <input
          type="number"
          value={formData.amount_paid}
          onChange={(e) => setFormData({...formData, amount_paid: parseFloat(e.target.value)})}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px'
          }}
          required
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Payment Method</label>
        <select
          value={formData.payment_method}
          onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          <option value="Cash">Cash</option>
          <option value="M-Pesa">M-Pesa</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Cheque">Cheque</option>
        </select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Payment Reference</label>
        <input
          type="text"
          value={formData.payment_reference}
          onChange={(e) => setFormData({...formData, payment_reference: e.target.value})}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px'
          }}
          placeholder="Transaction ID, Receipt No., etc."
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
            minHeight: '60px'
          }}
          placeholder="Additional notes..."
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '10px 16px',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{
            padding: '10px 16px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Record Payment
        </button>
      </div>
    </form>
  );
};

const DepositsPage = () => {
  const [depositRecords, setDepositRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount_paid: '',
    payment_method: 'Cash',
    payment_reference: '',
    notes: ''
  });

  const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('joyce-suites-token');
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      ...options,
    };
    return fetch(url, defaultOptions);
  };

  useEffect(() => {
    fetchDepositRecords();
  }, []);

  const fetchDepositRecords = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${config.apiBaseUrl}/api/rent-deposit/deposit/records`);
      if (response.ok) {
        const data = await response.json();
        setDepositRecords(data.records || []);
      } else {
        setError('Failed to fetch deposit records');
      }
    } catch (err) {
      setError('Error fetching deposit records');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPayment = async () => {
    try {
      const response = await fetchWithAuth(`${config.apiBaseUrl}/api/rent-deposit/deposit/mark-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deposit_id: selectedRecord.id,
          ...paymentForm
        })
      });

      if (response.ok) {
        setSuccess('Payment marked successfully');
        setShowPaymentModal(false);
        setPaymentForm({ amount_paid: '', payment_method: 'Cash', payment_reference: '', notes: '' });
        setSelectedRecord(null);
        fetchDepositRecords();
      } else {
        setError('Failed to mark payment');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'paid': '#10b981',
      'unpaid': '#ef4444',
      'partial': '#f59e0b'
    };
    return colors[status] || '#6b7280';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f4f6',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading deposit records...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', margin: 0 }}>
          Deposit Management
        </h2>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {success && (
        <div style={{
          backgroundColor: '#dcfce7',
          color: '#166534',
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '20px'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px'
        }}>
          <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Tenant</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Property</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Required</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Paid</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Balance</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {depositRecords.map(record => (
              <tr key={record.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 16px', color: '#6b7280' }}>{record.tenant_name}</td>
                <td style={{ padding: '12px 16px', color: '#6b7280' }}>{record.property_name}</td>
                <td style={{ padding: '12px 16px', color: '#6b7280' }}>
                  {formatCurrency(record.amount_required)}
                </td>
                <td style={{ padding: '12px 16px', color: '#6b7280' }}>
                  {formatCurrency(record.amount_paid || 0)}
                </td>
                <td style={{ padding: '12px 16px', color: '#6b7280' }}>
                  {formatCurrency(record.balance || 0)}
                </td>
                <td style={{ padding: '12px 16px', color: '#6b7280' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: getStatusColor(record.status) + '20',
                    color: getStatusColor(record.status)
                  }}>
                    {record.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: '#6b7280' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setSelectedRecord(record);
                        setShowPaymentModal(true);
                      }}
                      style={{
                        padding: '6px 8px',
                        border: '1px solid #10b981',
                        borderRadius: '4px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <DollarSign size={14} />
                      Mark Payment
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedRecord && (
        <div style={{
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
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            padding: '20px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              Mark Deposit Payment
            </h3>
            <div style={{
              backgroundColor: '#f9fafb',
              padding: '16px',
              borderRadius: '6px',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '13px', color: '#0c4a6e', lineHeight: '1.5' }}>
                <div><strong>Tenant:</strong> {selectedRecord.tenant_name}</div>
                <div><strong>Property:</strong> {selectedRecord.property_name}</div>
                <div><strong>Required Amount:</strong> {formatCurrency(selectedRecord.amount_required)}</div>
                <div><strong>Current Balance:</strong> {formatCurrency(selectedRecord.balance)}</div>
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Amount Paid
              </label>
              <input
                type="number"
                value={paymentForm.amount_paid}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount_paid: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Payment Method
              </label>
              <select
                value={paymentForm.payment_method}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="Cash">Cash</option>
                <option value="M-Pesa">M-Pesa</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Payment Reference
              </label>
              <input
                type="text"
                value={paymentForm.payment_reference}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_reference: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="Transaction ID, Reference number, etc."
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Notes
              </label>
              <textarea
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
                placeholder="Additional notes about this payment..."
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowPaymentModal(false)}
                style={{
                  padding: '10px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleMarkPayment}
                style={{
                  padding: '10px 16px',
                  border: '1px solid #10b981',
                  borderRadius: '6px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Mark Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MaintenancePage = ({ requests, loading, onUpdateStatus, onViewDetails }) => {
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading maintenance requests...</p>
      </div>
    );
  }

  return (
    <div style={styles.section}>
      <div style={styles.pageHeaderControls}>
        <h2 style={styles.pageTitle}>Maintenance Requests ({requests?.length || 0})</h2>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Tenant</th>
              <th style={styles.th}>Room</th>
              <th style={styles.th}>Issue</th>
              <th style={styles.th}>Priority</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests?.length > 0 ? (
              requests.map(request => (
                <tr key={request.id} style={styles.tableRow}>
                  <td style={styles.td}>#{request.id}</td>
                  <td style={styles.td}>{request.tenant_name || 'N/A'}</td>
                  <td style={styles.td}>{request.room_number || 'N/A'}</td>
                  <td style={styles.td}>{request.issue_type || 'N/A'}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: request.priority === 'high' ? '#fee2e2' : 
                                       request.priority === 'medium' ? '#fef3c7' : '#dcfce7',
                      color: request.priority === 'high' ? '#991b1b' : 
                             request.priority === 'medium' ? '#92400e' : '#166534'
                    }}>
                      {request.priority || 'medium'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: request.status === 'completed' ? '#dcfce7' : 
                                       request.status === 'in_progress' ? '#fef3c7' : '#fee2e2',
                      color: request.status === 'completed' ? '#166534' : 
                             request.status === 'in_progress' ? '#92400e' : '#991b1b'
                    }}>
                      {request.status || 'pending'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        style={{ ...styles.btn, ...styles.btnSm, ...styles.btnPrimary }}
                        onClick={() => onViewDetails(request)}
                      >
                        <Eye size={14} />
                      </button>
                      <select
                        value={request.status}
                        onChange={(e) => onUpdateStatus(request.id, e.target.value)}
                        style={{ ...styles.filterSelect, padding: '4px 8px', fontSize: '12px' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ ...styles.td, textAlign: 'center', padding: '40px' }}>
                  No maintenance requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CaretakerDashboard = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [loading, setLoading] = useState(true);
  const [financialSummary, setFinancialSummary] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userProfile, setUserProfile] = useState(null);


  const [overview, setOverview] = useState(null);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [occupiedRooms, setOccupiedRooms] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [allTenantsPaymentStatus, setAllTenantsPaymentStatus] = useState([]);
  const [vacateNotices, setVacateNotices] = useState([]);


  const [selectedMaintenanceRequest, setSelectedMaintenanceRequest] = useState(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showCreateMaintenanceModal, setShowCreateMaintenanceModal] = useState(false);
  const [showSendNotificationModal, setShowSendNotificationModal] = useState(false);
  const [showMarkPaymentModal, setShowMarkPaymentModal] = useState(false);
  const [selectedTenantForPayment, setSelectedTenantForPayment] = useState(null);
  const [showVacateNoticeModal, setShowVacateNoticeModal] = useState(false);
  const [selectedVacateNotice, setSelectedVacateNotice] = useState(null);
  const [showCreateVacateNoticeModal, setShowCreateVacateNoticeModal] = useState(false);
  const [selectedLeaseForVacate, setSelectedLeaseForVacate] = useState(null);

  const [showPropertyDetailsModal, setShowPropertyDetailsModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showTenantDetailsModal, setShowTenantDetailsModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);

  const getToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('joyce-suites-token');
  };


  const apiCall = async (endpoint, options = {}) => {
    const token = getToken();

    if (!token) {
      localStorage.clear();
      window.location.href = '/caretaker-login';
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.clear();
        window.location.href = '/caretaker-login';
        return null;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (err) {
      throw err;
    }
  };


  const fetchOverview = async () => {
    try {
      const data = await apiCall('/api/caretaker/overview');
      if (data && data.success) {
        setOverview(data.overview);
      }
    } catch (err) {
      // Failed to fetch overview
    }
  };

  const fetchMaintenanceRequests = async () => {
    try {
      const data = await apiCall('/api/caretaker/maintenance?page=1&per_page=100');
      if (data && data.success) {
        setMaintenanceRequests(data.requests || []);
      }
    } catch (err) {
      // Failed to fetch maintenance requests
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      const data = await apiCall('/api/caretaker/rooms/available');
      if (data && data.success) {
        setAvailableRooms(data.available_rooms || []);
      }
    } catch (err) {
      // Error occurred
    }
  };

  const fetchOccupiedRooms = async () => {
    try {
      const data = await apiCall('/api/caretaker/rooms/occupied');
      if (data && data.success) {
        setOccupiedRooms(data.occupied_rooms || []);
      }
    } catch (err) {
      // Error occurred
    }
  };

  const fetchAllRooms = async () => {
    try {
      const data = await apiCall('/api/caretaker/rooms/all');
      if (data && data.success) {
        setAllRooms(data.rooms || []);
      }
    } catch (err) {
      // Error occurred
    }
  };

  const fetchTenants = async () => {
    try {
      const data = await apiCall('/api/caretaker/tenants?page=1&per_page=100');
      if (data && data.success) {
        setTenants(data.tenants || []);
      }
    } catch (err) {
      // Error occurred
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const data = await apiCall('/api/caretaker/payments/pending');
      if (data && data.success) {
        setPendingPayments(data.tenants_with_arrears || []);
      }
    } catch (err) {
      // Error occurred
    }
  };

  const fetchAllTenantsPaymentStatus = async () => {
    try {
      const data = await apiCall('/api/caretaker/payments/all-tenants');
      if (data && data.success) {
        setAllTenantsPaymentStatus(data.tenants || []);
      }
    } catch (err) {
      // Error occurred
    }
  };

  const fetchVacateNotices = async () => {
    try {
      const data = await apiCall('/api/caretaker/vacate-notices?per_page=100');
      if (data && data.success) {
        setVacateNotices(data.notices || []);
      }
    } catch (err) {
      // Error occurred
    }
  };

  const handleUpdateMaintenanceStatus = async (requestId, newStatus) => {
    try {
      const data = await apiCall(`/api/caretaker/maintenance/${requestId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      if (data && data.success) {
        setSuccessMessage('Maintenance request updated');
        await fetchMaintenanceRequests();
        await fetchOverview();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      // Failed to update maintenance
    }
  };

  const handleViewMaintenanceDetails = (request) => {
    // For now, just log the details. In a real implementation, this would open a modal
    console.log('Maintenance details:', request);
  };

  const handleCreateMaintenance = async (maintenanceData) => {
    try {
      setLoading(true);
      const data = await apiCall('/api/caretaker/maintenance/create', {
        method: 'POST',
        body: JSON.stringify(maintenanceData)
      });

      if (data && data.success) {
        setSuccessMessage('Maintenance request created successfully');
        await fetchMaintenanceRequests();
        await fetchOverview();
        setShowCreateMaintenanceModal(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (notificationData) => {
    try {
      setLoading(true);
      const data = await apiCall('/api/caretaker/notifications/send', {
        method: 'POST',
        body: JSON.stringify(notificationData)
      });

      if (data && data.success) {
        setSuccessMessage('Notification sent successfully');
        setShowSendNotificationModal(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await apiCall('/api/auth/notifications');
      if (data && data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      // Failed to fetch notifications
    }
  };

  const fetchUserProfile = async () => {
    try {
      const data = await apiCall('/api/auth/profile');
      if (data && data.success) {
        setUserProfile(data.user);
        // Debug: Log profile data
        if (data.user?.photo_path) {
          console.log('✅ Caretaker photo found:', data.user.photo_path);
        } else {
          console.log('ℹ️ No caretaker photo found, will use default icon');
        }
      }
    } catch (err) {
      // Failed to fetch user profile
      console.log('❌ Failed to fetch caretaker profile');
    }
  };

  const fetchFinancialSummary = async () => {
    try {
      const data = await apiCall('/api/caretaker/financial-summary');
      if (data && data.success) {
        setFinancialSummary(data.summary);
      }
    } catch (err) {
      console.log('❌ Failed to fetch financial summary');
    }
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      await apiCall(`/api/auth/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      // Failed to mark notification read
    }
  };

  const handleMarkPayment = async (paymentData) => {
    try {
      setLoading(true);
      const data = await apiCall('/api/caretaker/payments/mark', {
        method: 'POST',
        body: JSON.stringify(paymentData)
      });

      if (data && data.success) {
        setSuccessMessage('Payment marked successfully');
        await fetchPendingPayments();
        await fetchOverview();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      // Failed to mark payment
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRentPaid = async (rentId) => {
    try {
      const data = await apiCall(`/api/rent-deposit/rent/${rentId}/mark-paid`, {
        method: 'PUT'
      });

      if (data && data.success) {
        setSuccessMessage('Rent marked as paid');
        await fetchPendingPayments();
        await fetchOverview();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      // Failed to mark rent as paid
    }
  };

  const handleMarkRentUnpaid = async (rentId) => {
    try {
      const data = await apiCall(`/api/rent-deposit/rent/${rentId}/mark-unpaid`, {
        method: 'PUT'
      });

      if (data && data.success) {
        setSuccessMessage('Rent marked as unpaid');
        await fetchPendingPayments();
        await fetchOverview();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      // Failed to mark rent as unpaid
    }
  };

  const handleCreateVacateNotice = async (noticeData) => {
    try {
      setLoading(true);
      const data = await apiCall('/api/caretaker/vacate-notices', {
        method: 'POST',
        body: JSON.stringify(noticeData)
      });

      if (data && data.success) {
        setSuccessMessage('Vacate notice created successfully');
        await fetchVacateNotices();
        await fetchAllTenantsPaymentStatus();
        setShowCreateVacateNoticeModal(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVacateNoticeStatus = async (noticeId, action, notes = '') => {
    try {
      let endpoint = '';
      let method = 'POST';

      switch (action) {
        case 'approve':
          endpoint = `/api/caretaker/vacate-notices/${noticeId}/approve`;
          break;
        case 'reject':
          endpoint = `/api/caretaker/vacate-notices/${noticeId}/reject`;
          break;
        case 'complete':
          endpoint = `/api/caretaker/vacate-notices/${noticeId}/complete`;
          break;
        default:
          return;
      }

      const data = await apiCall(endpoint, {
        method,
        body: JSON.stringify(notes ? { admin_notes: notes } : {})
      });

      if (data && data.success) {
        setSuccessMessage(`Vacate notice ${action}d successfully`);
        await fetchVacateNotices();
        setShowVacateNoticeModal(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteVacateNotice = async (noticeId) => {
    if (!window.confirm('Are you sure you want to delete this vacate notice?')) return;

    try {
      const data = await apiCall(`/api/caretaker/vacate-notices/${noticeId}`, {
        method: 'DELETE'
      });

      if (data && data.success) {
        setSuccessMessage('Vacate notice deleted successfully');
        await fetchVacateNotices();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePageChange = (pageId) => {
    setActivePage(pageId);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      const token = getToken();
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (err) {
      // Logout error
    } finally {
      localStorage.clear();
      navigate('/caretaker-login');
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/caretaker-login');
      return;
    }

    const fetchPageData = async () => {
      setLoading(true);
      setError('');

      try {
        switch (activePage) {
          case 'dashboard':
            await Promise.all([
              fetchOverview().catch(() => {}),
              fetchMaintenanceRequests().catch(() => {}),
              fetchAvailableRooms().catch(() => {}),
              fetchTenants().catch(() => {}),
              fetchPendingPayments().catch(() => {}),
              fetchVacateNotices().catch(() => {}),
              fetchNotifications().catch(() => {}),
              fetchUserProfile().catch(() => {}),
              fetchFinancialSummary().catch(() => {})
            ]);
            break;
          case 'maintenance':
            await fetchMaintenanceRequests();
            break;
          case 'properties':
            await Promise.all([
              fetchAvailableRooms(),
              fetchOccupiedRooms(),
              fetchAllRooms()
            ]);
            break;
          case 'tenants':
            await Promise.all([
              fetchTenants(),
              fetchAllTenantsPaymentStatus()
            ]);
            break;
          case 'payments':
            await Promise.all([
              fetchPendingPayments(),
              fetchAllTenantsPaymentStatus()
            ]);
            break;
          case 'vacate':
            await fetchVacateNotices();
            break;
          case 'notifications':
          case 'inquiries':
            await fetchNotifications();
            break;
          default:
            break;
        }
      } catch (err) {
        // Page data fetch error
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [activePage]);

  // Dashboard Page Component
  const DashboardPage = ({ overview, maintenanceRequests, availableRooms, pendingPayments, vacateNotices, loading, onUpdateStatus, onViewDetails, onCreateMaintenance, onViewAllMaintenance, onMarkPayment, onViewVacateNotice, financialSummary }) => {
    if (loading) {
      return (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading dashboard...</p>
        </div>
      );
    }

    return (
      <div style={styles.section}>
        <h2 style={styles.pageTitle}>Dashboard Overview</h2>
        
        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <Home size={24} style={styles.statIcon} />
            <div>
              <div style={styles.statNumber}>{availableRooms?.length || 0}</div>
              <div style={styles.statLabel}>Available Rooms</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <Users size={24} style={styles.statIcon} />
            <div>
              <div style={styles.statNumber}>{overview?.total_tenants || 0}</div>
              <div style={styles.statLabel}>Total Tenants</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <Wrench size={24} style={styles.statIcon} />
            <div>
              <div style={styles.statNumber}>{maintenanceRequests?.filter(m => m.status === 'pending').length || 0}</div>
              <div style={styles.statLabel}>Pending Maintenance</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <CreditCard size={24} style={styles.statIcon} />
            <div>
              <div style={styles.statNumber}>{pendingPayments?.length || 0}</div>
              <div style={styles.statLabel}>Pending Payments</div>
            </div>
          </div>
        </div>

        {/* Financial Summary Section */}
        {financialSummary && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Financial Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {/* Rent Summary */}
              <div style={{ ...styles.card, borderLeft: '4px solid #3b82f6' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#3b82f6' }}>Rent Collection</h4>
                <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  <div><strong>Collection Rate:</strong> {financialSummary.rent.collection_rate}%</div>
                  <div><strong>Paid:</strong> {financialSummary.rent.paid} / {financialSummary.rent.total_records}</div>
                  <div><strong>Current Month:</strong> KSh {financialSummary.rent.current_month.paid.toLocaleString()}</div>
                  <div><strong>Outstanding:</strong> KSh {financialSummary.rent.current_month.balance.toLocaleString()}</div>
                </div>
              </div>

              {/* Deposit Summary */}
              <div style={{ ...styles.card, borderLeft: '4px solid #10b981' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#10b981' }}>Deposits</h4>
                <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  <div><strong>Collection Rate:</strong> {financialSummary.deposits.collection_rate}%</div>
                  <div><strong>Paid:</strong> {financialSummary.deposits.paid} / {financialSummary.deposits.total_records}</div>
                  <div><strong>Total Amount:</strong> KSh {financialSummary.deposits.total_amount.toLocaleString()}</div>
                  <div><strong>Outstanding:</strong> KSh {financialSummary.deposits.outstanding.toLocaleString()}</div>
                </div>
              </div>

              {/* Water Bills Summary */}
              <div style={{ ...styles.card, borderLeft: '4px solid #06b6d4' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#06b6d4' }}>Water Bills</h4>
                <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  <div><strong>Collection Rate:</strong> {financialSummary.water_bills.collection_rate}%</div>
                  <div><strong>Paid:</strong> {financialSummary.water_bills.paid} / {financialSummary.water_bills.total_records}</div>
                  <div><strong>Total Amount:</strong> KSh {financialSummary.water_bills.total_amount.toLocaleString()}</div>
                  <div><strong>Outstanding:</strong> KSh {financialSummary.water_bills.outstanding.toLocaleString()}</div>
                </div>
              </div>

              {/* Overall Summary */}
              <div style={{ ...styles.card, borderLeft: '4px solid #8b5cf6' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#8b5cf6' }}>Overall</h4>
                <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  <div><strong>Monthly Revenue:</strong> KSh {financialSummary.overall.monthly_revenue.toLocaleString()}</div>
                  <div><strong>Total Outstanding:</strong> KSh {financialSummary.overall.total_outstanding.toLocaleString()}</div>
                  <div><strong>Recent Transactions:</strong> {financialSummary.overall.recent_transactions}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Maintenance Requests */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Recent Maintenance Requests</h3>
            <button style={styles.btnSecondary} onClick={onViewAllMaintenance}>
              View All
            </button>
          </div>
          {maintenanceRequests?.slice(0, 5).map(request => (
            <div key={request.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>{request.title}</span>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: request.status === 'pending' ? '#fef3c7' : '#dcfce7',
                  color: request.status === 'pending' ? '#92400e' : '#166534'
                }}>
                  {request.status}
                </span>
              </div>
              <p style={styles.cardDescription}>{request.description}</p>
              <div style={styles.cardActions}>
                <button style={styles.btnSmallPrimary} onClick={() => onViewDetails(request)}>
                  View Details
                </button>
                {request.status === 'pending' && (
                  <button style={styles.btnSmallSecondary} onClick={() => onUpdateStatus(request.id, 'in_progress')}>
                    Start Work
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Tenants Page Component
  const TenantsPage = ({ tenants, paymentStatus, loading, onMarkPayment, onSendNotification, onViewDetails, onCreateVacateNotice }) => {
    if (loading) {
      return (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading tenants...</p>
        </div>
      );
    }

    return (
      <div style={styles.section}>
        <h2 style={styles.pageTitle}>Tenants Management</h2>
        
        {tenants?.length === 0 ? (
          <div style={styles.emptyState}>
            <Users size={48} />
            <p>No tenants found</p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Room</th>
                  <th style={styles.th}>Rent</th>
                  <th style={styles.th}>Payment Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants?.map(tenant => (
                  <tr key={tenant.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <User size={16} />
                        <span>{tenant.name}</span>
                      </div>
                    </td>
                    <td style={styles.td}>{tenant.room_number}</td>
                    <td style={styles.td}>KSh {tenant.rent_amount?.toLocaleString() || '0'}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: paymentStatus?.[tenant.id]?.status === 'paid' ? '#dcfce7' : '#fef3c7',
                        color: paymentStatus?.[tenant.id]?.status === 'paid' ? '#166534' : '#92400e'
                      }}>
                        {paymentStatus?.[tenant.id]?.status || 'Unknown'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button style={styles.btnSmallPrimary} onClick={() => onViewDetails(tenant)}>
                          View
                        </button>
                        {paymentStatus?.[tenant.id]?.status !== 'paid' && (
                          <button style={styles.btnSmallSecondary} onClick={() => onMarkPayment(tenant)}>
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // Payments Page Component
  const PaymentsPage = ({ pendingPayments, allPayments, loading, onMarkPayment }) => {
    if (loading) {
      return (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading payments...</p>
        </div>
      );
    }

    return (
      <div style={styles.section}>
        <h2 style={styles.pageTitle}>Payments Management</h2>
        
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Pending Payments</h3>
          {pendingPayments?.length === 0 ? (
            <div style={styles.emptyState}>
              <CreditCard size={48} />
              <p>No pending payments</p>
            </div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Tenant</th>
                    <th style={styles.th}>Room</th>
                    <th style={styles.th}>Amount</th>
                    <th style={styles.th}>Due Date</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPayments?.map(payment => (
                    <tr key={payment.id} style={styles.tr}>
                      <td style={styles.td}>{payment.tenant_name}</td>
                      <td style={styles.td}>{payment.room_number}</td>
                      <td style={styles.td}>KSh {payment.amount?.toLocaleString() || '0'}</td>
                      <td style={styles.td}>{payment.due_date}</td>
                      <td style={styles.td}>
                        <button style={styles.btnSmallPrimary} onClick={() => onMarkPayment(payment)}>
                          Mark as Paid
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Vacate Page Component
  const VacatePage = ({ notices, loading, onViewDetails, onUpdateStatus, onDelete, onCreateNotice }) => {
    if (loading) {
      return (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading vacate notices...</p>
        </div>
      );
    }

    return (
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.pageTitle}>Vacate Notices</h2>
          <button style={styles.btnPrimary} onClick={onCreateNotice}>
            Create Notice
          </button>
        </div>
        
        {notices?.length === 0 ? (
          <div style={styles.emptyState}>
            <DoorOpen size={48} />
            <p>No vacate notices found</p>
          </div>
        ) : (
          <div style={styles.cardsGrid}>
            {notices?.map(notice => (
              <div key={notice.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.cardTitle}>{notice.tenant_name}</span>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: notice.status === 'pending' ? '#fef3c7' : '#dcfce7',
                    color: notice.status === 'pending' ? '#92400e' : '#166534'
                  }}>
                    {notice.status}
                  </span>
                </div>
                <div style={styles.cardDetails}>
                  <p><strong>Room:</strong> {notice.room_number}</p>
                  <p><strong>Notice Date:</strong> {notice.notice_date}</p>
                  <p><strong>Vacate Date:</strong> {notice.vacate_date}</p>
                </div>
                <div style={styles.cardActions}>
                  <button style={styles.btnSmallPrimary} onClick={() => onViewDetails(notice)}>
                    View Details
                  </button>
                  {notice.status === 'pending' && (
                    <button style={styles.btnSmallSecondary} onClick={() => onUpdateStatus(notice.id, 'approved')}>
                      Approve
                    </button>
                  )}
                  <button style={styles.btnSmallDanger} onClick={() => onDelete(notice.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Properties Page Component
  const PropertiesPage = ({ availableRooms, occupiedRooms, allRooms, loading, onViewDetails }) => {
    if (loading) {
      return (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading properties...</p>
        </div>
      );
    }

    return (
      <div style={styles.section}>
        <h2 style={styles.pageTitle}>Properties Management</h2>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Available Rooms ({availableRooms?.length || 0})</h3>
          {availableRooms?.length === 0 ? (
            <div style={styles.emptyState}>
              <Building size={48} />
              <p>No available rooms found</p>
            </div>
          ) : (
            <div style={styles.roomsGrid}>
              {availableRooms?.map(room => (
                <div key={room.id} style={styles.roomCard} onClick={() => onViewDetails(room)}>
                  <div style={styles.roomHeader}>
                    <Building size={20} />
                    <span style={styles.roomName}>{room.name}</span>
                    <span style={styles.roomTypeBadge}>{room.property_type}</span>
                  </div>
                  <div style={styles.roomDetails}>
                    <div style={styles.roomDetail}>
                      <span style={styles.detailLabel}>Monthly Rent:</span>
                      <span style={styles.detailValue}>KSh {room.rent_amount?.toLocaleString() || '0'}</span>
                    </div>
                    <div style={styles.roomDetail}>
                      <span style={styles.detailLabel}>Deposit:</span>
                      <span style={styles.detailValue}>KSh {room.deposit_amount?.toLocaleString() || '0'}</span>
                    </div>
                    <div style={styles.roomDetail}>
                      <span style={styles.detailLabel}>Status:</span>
                      <span style={{ ...styles.statusBadge, backgroundColor: '#dcfce7', color: '#166534' }}>
                        Vacant
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Occupied Rooms ({occupiedRooms?.length || 0})</h3>
          {occupiedRooms?.length === 0 ? (
            <div style={styles.emptyState}>
              <Home size={48} />
              <p>No occupied rooms found</p>
            </div>
          ) : (
            <div style={styles.roomsGrid}>
              {occupiedRooms?.map(room => (
                <div key={room.id} style={styles.roomCard} onClick={() => onViewDetails(room)}>
                  <div style={styles.roomHeader}>
                    <Home size={20} />
                    <span style={styles.roomName}>{room.name}</span>
                    <span style={styles.roomTypeBadge}>{room.property_type}</span>
                  </div>
                  <div style={styles.roomDetails}>
                    <div style={styles.roomDetail}>
                      <span style={styles.detailLabel}>Monthly Rent:</span>
                      <span style={styles.detailValue}>KSh {room.rent_amount?.toLocaleString() || '0'}</span>
                    </div>
                    <div style={styles.roomDetail}>
                      <span style={styles.detailLabel}>Tenant:</span>
                      <span style={styles.detailValue}>{room.current_tenant || 'N/A'}</span>
                    </div>
                    <div style={styles.roomDetail}>
                      <span style={styles.detailLabel}>Status:</span>
                      <span style={{ ...styles.statusBadge, backgroundColor: '#fef3c7', color: '#92400e' }}>
                        Occupied
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <DashboardPage
            overview={overview}
            maintenanceRequests={maintenanceRequests}
            availableRooms={availableRooms}
            pendingPayments={pendingPayments}
            vacateNotices={vacateNotices}
            financialSummary={financialSummary}
            loading={loading}
            onUpdateStatus={handleUpdateMaintenanceStatus}
            onViewDetails={(request) => {
              setSelectedMaintenanceRequest(request);
              setShowMaintenanceModal(true);
            }}
            onCreateMaintenance={() => setShowCreateMaintenanceModal(true)}
            onViewAllMaintenance={() => handlePageChange('maintenance')}
            onMarkPayment={(tenant) => {
              setSelectedTenantForPayment(tenant);
              setShowMarkPaymentModal(true);
            }}
            onViewVacateNotice={(notice) => {
              setSelectedVacateNotice(notice);
              setShowCreateVacateNoticeModal(true);
            }}
          />
        );
      case 'maintenance':
        return (
          <MaintenancePage
            requests={maintenanceRequests}
            loading={loading}
            onUpdateStatus={handleUpdateMaintenanceStatus}
            onViewDetails={handleViewMaintenanceDetails}
          />
        );
      case 'properties':
        return (
          <PropertiesPage
            availableRooms={availableRooms}
            occupiedRooms={occupiedRooms}
            allRooms={allRooms}
            loading={loading}
            onViewDetails={(property) => {
              setSelectedProperty(property);
              setShowPropertyDetailsModal(true);
            }}
          />
        );
      case 'tenants':
        return (
          <TenantsPage
            tenants={tenants}
            paymentStatus={allTenantsPaymentStatus}
            loading={loading}
            onMarkPayment={(tenant) => {
              setSelectedTenantForPayment(tenant);
              setShowMarkPaymentModal(true);
            }}
            onSendNotification={() => setShowSendNotificationModal(true)}
            onViewDetails={(tenant) => {
              setSelectedTenant(tenant);
              setShowTenantDetailsModal(true);
            }}
            onCreateVacateNotice={(leaseId) => {
              const tenant = tenants.find(t => t.id === leaseId);
              if (tenant) {
                setSelectedLeaseForVacate({
                  lease_id: leaseId,
                  tenant_name: tenant.name,
                  room_number: tenant.room_number
                });
                setShowCreateVacateNoticeModal(true);
              }
            }}
          />
        );
      case 'payments':
        return (
          <PaymentsPage
            pendingPayments={pendingPayments}
            allPayments={allTenantsPaymentStatus}
            loading={loading}
            onMarkPayment={(tenant) => {
              setSelectedTenantForPayment(tenant);
              setShowMarkPaymentModal(true);
            }}
          />
        );
      case 'vacate':
        return (
          <VacatePage
            notices={vacateNotices}
            loading={loading}
            onViewDetails={(notice) => {
              setSelectedVacateNotice(notice);
              setShowVacateNoticeModal(true);
            }}
            onUpdateStatus={handleUpdateVacateNoticeStatus}
            onDelete={handleDeleteVacateNotice}
            onCreateNotice={() => setShowCreateVacateNoticeModal(true)}
          />
        );
      case 'notifications':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Inquiries & Notifications</h2>
            {loading && !notifications.length ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280', backgroundColor: 'white', borderRadius: '0.5rem' }}>
                <MessageSquare size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p>No new notifications.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {notifications.map(note => (
                  <div
                    key={note.id}
                    style={{
                      backgroundColor: note.is_read ? 'white' : '#f0f9ff',
                      borderLeft: `4px solid ${note.is_read ? '#e5e7eb' : '#3b82f6'}`,
                      padding: '1.5rem',
                      borderRadius: '0.5rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div>
                        <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{note.title}</h3>
                        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                          {new Date(note.created_at).toLocaleString()}
                        </span>
                      </div>
                      {!note.is_read && (
                        <button
                          onClick={() => handleMarkNotificationRead(note.id)}
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            backgroundColor: '#dbeafe',
                            color: '#1e40af',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap', color: '#374151' }}>
                      {note.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'inquiries':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Inquiries & Booking Requests</h2>
            {loading && !notifications.length ? (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Loading messages...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div style={styles.emptyState}>
                <MessageSquare size={48} />
                <p>No new messages or booking requests.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {notifications.map(note => {
                  const isBooking = note.subject?.includes('BOOKING') || note.title?.includes('BOOKING') || note.message?.includes('BOOKING REQUEST');
                  return (
                    <div
                      key={note.id}
                      style={{
                        ...styles.inquiryCard,
                        borderLeft: note.is_read ? '1px solid #e5e7eb' : (isBooking ? '4px solid #16a34a' : '4px solid #3b82f6')
                      }}
                    >
                      <div style={styles.inquiryHeader}>
                        <div style={styles.senderInfo}>
                          <div style={styles.avatar}>
                            <User size={20} />
                          </div>
                          <div style={styles.msgMeta}>
                            <span style={styles.senderName}>{note.title || 'New Inquiry'}</span>
                            <span style={styles.msgTime}>
                              {new Date(note.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                            {isBooking && (
                              <span style={{
                                ...styles.subjectBadge,
                                backgroundColor: '#dcfce7',
                                color: '#166534'
                              }}>BOOKING REQUEST</span>
                            )}
                          </div>
                        </div>
                        {!note.is_read && (
                          <button
                            onClick={() => handleMarkNotificationRead(note.id)}
                            style={styles.btnSmallPrimary}
                          >
                            Mark as Read
                          </button>
                        )}
                      </div>
                      <div style={styles.msgPreview}>
                        {note.message}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      case 'water-bill':
        return <WaterBillPage />;
      case 'deposits':
        return <DepositsPage />;
      default:
        return null;
    }
  };

  return (
    <div className="caretaker-dashboard">
      <aside className={`caretaker-sidebar ${sidebarOpen ? '' : 'caretaker-sidebar-closed'}`}>
        <div className="caretaker-sidebar-header">
          <h2 className="caretaker-sidebar-title">Joyce Suites</h2>
          {isMobile && (
            <button 
              className="text-white hover:bg-secondary-800 p-2 rounded-md"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={24} />
            </button>
          )}
        </div>

        <nav className="px-4 py-6">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home },
            { id: 'maintenance', label: 'Maintenance', icon: Wrench },
            { id: 'properties', label: 'Properties', icon: Building },
            { id: 'tenants', label: 'Tenants', icon: Users },
            { id: 'payments', label: 'Payments', icon: PaymentIcon },
            { id: 'deposits', label: 'Deposits', icon: DollarSign },
            { id: 'water-bill', label: 'Water Bills', icon: Droplet },
            { id: 'vacate', label: 'Vacate Notices', icon: DoorOpen },
            { id: 'inquiries', label: 'Inquiries', icon: MessageSquare },
            { id: 'notifications', label: 'Notifications', icon: Bell }
          ].map(item => (
            <button
              key={item.id}
              className={`caretaker-nav-item ${activePage === item.id ? 'caretaker-nav-item-active' : ''}`}
              onClick={() => handlePageChange(item.id)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>
            {userProfile?.photo_path ? (
              <img 
                src={`${API_BASE_URL}/${userProfile.photo_path}`}
                alt="Profile" 
                style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  console.log('❌ Caretaker photo failed to load:', e.target.src);
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            {(!userProfile?.photo_path || userProfile?.photo_path === '') && (
              <User size={20} />
            )}
          </div>
          <div style={styles.userDetails}>
            <strong>{userProfile?.full_name || 'Caretaker'}</strong>
            <small>{userProfile?.email || 'Joyce Suites'}</small>
          </div>
        </div>

        <div style={{ ...styles.logoutBtnWrapper, ...(sidebarOpen && styles.logoutBtnWrapperVisible), flexDirection: 'column', gap: '8px' }}>
          <button
            style={{ ...styles.logoutBtn, backgroundColor: 'transparent', color: '#64748b', border: '1px solid #e2e8f0' }}
            onClick={() => window.location.href = '/'}
          >
            <Home size={18} /> <span style={{ display: sidebarOpen ? 'inline' : 'none' }}>Main Menu</span>
          </button>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={18} /> <span style={{ display: sidebarOpen ? 'inline' : 'none' }}>Logout</span>
          </button>
        </div>
      </aside>

      <main style={{
        ...styles.main,
        marginLeft: isMobile ? 0 : (sidebarOpen ? '260px' : 0),
        width: isMobile ? '100%' : (sidebarOpen ? 'calc(100% - 260px)' : '100%')
      }}>
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            {!isMobile && (
              <button style={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
                <Menu size={24} />
              </button>
            )}
            <button style={styles.homeBtn} onClick={() => handlePageChange('dashboard')}>
              <Home size={20} />
            </button>
            <h1 style={styles.headerTitle}>Caretaker Dashboard</h1>
          </div>
          <div style={styles.headerRight}>
            <button style={styles.refreshBtn} onClick={() => {
              if (activePage === 'dashboard') {
                fetchOverview();
                fetchMaintenanceRequests();
              }
            }}>
              <RefreshCw size={20} />
            </button>
            <div style={styles.notificationBadge}>
              <Bell size={20} />
              {overview?.pending_maintenance > 0 && (
                <span style={styles.badgeCount}>{overview.pending_maintenance}</span>
              )}
            </div>
          </div>
        </header>

        {isMobile && (
          <div style={styles.mobileTopNav}>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Home },
              { id: 'maintenance', label: 'Requests', icon: Wrench },
              { id: 'properties', label: 'Rooms', icon: Building },
              { id: 'tenants', label: 'Tenants', icon: Users },
              { id: 'payments', label: 'Payments', icon: PaymentIcon },
              { id: 'deposits', label: 'Deposits', icon: DollarSign },
              { id: 'water-bill', label: 'Water', icon: Droplet },
              { id: 'vacate', label: 'Vacate', icon: DoorOpen },
              { id: 'inquiries', label: 'Messages', icon: MessageSquare },
            ].map(item => (
              <button
                key={item.id}
                style={{
                  ...styles.mobileNavItem,
                  ...(activePage === item.id ? styles.mobileNavActive : {})
                }}
                onClick={() => handlePageChange(item.id)}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </button>
            ))}
            <button
              style={{ ...styles.mobileNavItem, backgroundColor: '#ef4444', color: 'white' }}
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}

        {error && (
          <div style={styles.errorBanner}>
            <AlertCircle size={16} />
            <span>{error}</span>
            <button style={styles.closeBannerBtn} onClick={() => setError('')}>×</button>
          </div>
        )}

        {successMessage && (
          <div style={styles.successBanner}>
            <CheckCircle size={16} />
            <span>{successMessage}</span>
            <button style={styles.closeBannerBtn} onClick={() => setSuccessMessage('')}>×</button>
          </div>
        )}

        <section style={styles.content}>
          {renderContent()}
        </section>
      </main>

      { }
      {showMaintenanceModal && selectedMaintenanceRequest && (
        <MaintenanceDetailsModal
          request={selectedMaintenanceRequest}
          onClose={() => {
            setShowMaintenanceModal(false);
            setSelectedMaintenanceRequest(null);
          }}
          onUpdateStatus={handleUpdateMaintenanceStatus}
        />
      )}

      {showCreateMaintenanceModal && (
        <CreateMaintenanceModal
          rooms={availableRooms}
          onClose={() => setShowCreateMaintenanceModal(false)}
          onSubmit={handleCreateMaintenance}
          loading={loading}
        />
      )}

      {showSendNotificationModal && (
        <SendNotificationModal
          tenants={tenants}
          onClose={() => setShowSendNotificationModal(false)}
          onSubmit={handleSendNotification}
          loading={loading}
        />
      )}

      {showMarkPaymentModal && selectedTenantForPayment && (
        <MarkPaymentModal
          tenant={selectedTenantForPayment}
          onClose={() => {
            setShowMarkPaymentModal(false);
            setSelectedTenantForPayment(null);
          }}
          onSubmit={handleMarkPayment}
          loading={loading}
        />
      )}

      {showVacateNoticeModal && selectedVacateNotice && (
        <VacateNoticeDetailsModal
          notice={selectedVacateNotice}
          onClose={() => {
            setShowVacateNoticeModal(false);
            setSelectedVacateNotice(null);
          }}
          onUpdateStatus={handleUpdateVacateNoticeStatus}
          onDelete={handleDeleteVacateNotice}
        />
      )}

      {showCreateVacateNoticeModal && (
        <CreateVacateNoticeModal
          leases={

            occupiedRooms.length > 0 ? occupiedRooms.map(room => ({
              lease_id: room.lease_id,
              tenant_name: room.tenant_name,
              room_number: room.name
            })) : []
          }
          initialData={selectedLeaseForVacate}
          onClose={() => {
            setShowCreateVacateNoticeModal(false);
            setSelectedLeaseForVacate(null);
          }}
          onSubmit={handleCreateVacateNotice}
          loading={loading}
        />
      )}

      {showPropertyDetailsModal && selectedProperty && (
        <PropertyDetailsModal
          property={selectedProperty}
          onClose={() => {
            setShowPropertyDetailsModal(false);
            setSelectedProperty(null);
          }}
        />
      )}

      {showTenantDetailsModal && selectedTenant && (
        <TenantDetailsModal
          tenant={selectedTenant}
          onClose={() => {
            setShowTenantDetailsModal(false);
            setSelectedTenant(null);
          }}
        />
      )}

      {sidebarOpen && (
        <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};


const DashboardPage = ({
  overview,
  maintenanceRequests,
  availableRooms,
  pendingPayments,
  vacateNotices,
  loading,
  onUpdateStatus,
  onViewDetails,
  onCreateMaintenance,
  onMarkPayment,
  onViewVacateNotice,
  onViewAllMaintenance
}) => {
  const [filterStatus, setFilterStatus] = useState('all');

  if (loading || !overview) {
    return (
      <div style={styles.loadingContainer}>
        {loading ? (
          <>
            <div style={styles.spinner}></div>
            <p>Loading dashboard...</p>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <AlertCircle size={48} color="#ef4444" />
            <p style={{ marginTop: '16px', color: '#ef4444', fontWeight: '500' }}>
              Failed to load dashboard data
            </p>
            <button
              style={{ ...styles.btnPrimary, marginTop: '16px' }}
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  const filteredMaintenance = maintenanceRequests.filter(function (r) {
    return filterStatus === 'all' || r.status === filterStatus;
  });

  const pendingNotices = vacateNotices.filter(n => n.status === 'pending').length;
  const completedToday = maintenanceRequests.filter(r =>
    r.status === 'completed' &&
    new Date(r.updated_at).toDateString() === new Date().toDateString()
  ).length;

  return (
    <>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Caretaker Overview</h2>
        <div style={styles.headerActions}>
          <button style={styles.btnSecondary} onClick={onCreateMaintenance}>
            <Plus size={16} /> Maintenance
          </button>
          <button style={styles.btnPrimary} onClick={() => window.location.reload()}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      <div style={styles.gridContainer}>
        <OverviewCard
          title="Pending Maintenance"
          value={overview.pending_maintenance || 0}
          icon={AlertTriangle}
          color="#f59e0b"
        />
        <OverviewCard
          title="Completed Today"
          value={completedToday}
          icon={CheckCircle}
          color="#10b981"
        />
        <OverviewCard
          title="Available Rooms"
          value={availableRooms.length}
          icon={Building}
          color="#3b82f6"
        />
        <OverviewCard
          title="Pending Payments"
          value={pendingPayments.length}
          icon={DollarSign}
          color="#ef4444"
        />
        <OverviewCard
          title="Total Tenants"
          value={overview.occupied_properties || 0}
          icon={Users}
          color="#8b5cf6"
        />
        <OverviewCard
          title="Vacate Notices"
          value={pendingNotices}
          icon={DoorOpen}
          color="#f97316"
        />
      </div>

      <div style={styles.columnsContainer}>
        <div style={styles.column}>
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>
                <Wrench size={18} /> Recent Maintenance ({filteredMaintenance.length})
              </h3>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Priority</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaintenance.length > 0 ? (
                    filteredMaintenance.slice(0, 5).map(function (req) {
                      return (
                        <tr key={req.id} style={styles.tableRow}>
                          <td style={styles.td}>#{req.id}</td>
                          <td style={styles.td}>{req.title}</td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.statusBadge,
                              backgroundColor: req.priority === 'urgent' ? '#fee2e2' : '#dbeafe',
                              color: req.priority === 'urgent' ? '#991b1b' : '#1e40af'
                            }}>
                              {req.priority}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.statusBadge,
                              backgroundColor: req.status === 'completed' ? '#dcfce7' : '#fef3c7',
                              color: req.status === 'completed' ? '#166534' : '#92400e'
                            }}>
                              {req.status}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <button
                              style={styles.btnSmallPrimary}
                              onClick={() => onViewDetails(req)}
                              title="View Details"
                            >
                              <Eye size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ ...styles.td, textAlign: 'center', padding: '20px' }}>
                        No maintenance requests
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div style={styles.sectionFooter}>
              <button
                style={styles.btnText}
                onClick={onViewAllMaintenance || (() => { })}
              >
                View All <ArrowLeft size={14} style={{ transform: 'rotate(180deg)' }} />
              </button>
            </div>
          </div>
        </div>

        <div style={styles.column}>
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>
                <DollarSign size={18} /> Pending Payments ({pendingPayments.length})
              </h3>
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.th}>Tenant</th>
                    <th style={styles.th}>Room</th>
                    <th style={styles.th}>Pending</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPayments.length > 0 ? (
                    pendingPayments.slice(0, 5).map(function (tenant) {
                      return (
                        <tr key={tenant.tenant_id} style={styles.tableRow}>
                          <td style={styles.td}>{tenant.tenant_name}</td>
                          <td style={styles.td}>{tenant.room_number || 'N/A'}</td>
                          <td style={styles.td}>
                            <span style={styles.badgeWarning}>
                              {tenant.pending_payments} payments
                            </span>
                          </td>
                          <td style={styles.td}>
                            <button
                              style={styles.btnSmallPrimary}
                              onClick={() => onMarkPayment(tenant)}
                              title="Mark Payment"
                            >
                              <Check size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ ...styles.td, textAlign: 'center', padding: '20px' }}>
                        No pending payments
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>
                <DoorOpen size={18} /> Recent Vacate Notices
              </h3>
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.th}>Tenant</th>
                    <th style={styles.th}>Room</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vacateNotices.length > 0 ? (
                    vacateNotices.slice(0, 5).map(function (notice) {
                      return (
                        <tr key={notice.id} style={styles.tableRow}>
                          <td style={styles.td}>{notice.tenant_name}</td>
                          <td style={styles.td}>{notice.room_number || 'N/A'}</td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.statusBadge,
                              backgroundColor:
                                notice.status === 'approved' ? '#dcfce7' :
                                  notice.status === 'rejected' ? '#fee2e2' :
                                    notice.status === 'completed' ? '#dbeafe' : '#fef3c7',
                              color:
                                notice.status === 'approved' ? '#166534' :
                                  notice.status === 'rejected' ? '#991b1b' :
                                    notice.status === 'completed' ? '#1e40af' : '#92400e'
                            }}>
                              {notice.status}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <button
                              style={styles.btnSmallPrimary}
                              onClick={() => onViewVacateNotice(notice)}
                              title="View Details"
                            >
                              <Eye size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ ...styles.td, textAlign: 'center', padding: '20px' }}>
                        No vacate notices
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


const PaymentsPage = ({ pendingPayments, allPayments, loading, onMarkPayment }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading payments...</p>
      </div>
    );
  }

  const paymentsToShow = activeTab === 'pending' ? pendingPayments : allPayments;

  const filteredPayments = paymentsToShow.filter(payment =>
    !searchTerm ||
    payment.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.room_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPending = pendingPayments.reduce((sum, p) => sum + (p.pending_payments || 0), 0);
  const paidCount = allPayments.filter(p => p.current_month_paid).length;
  const unpaidCount = allPayments.filter(p => !p.current_month_paid).length;

  return (
    <>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Payments Management</h2>
        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === 'all' ? styles.tabButtonActive : {})
            }}
            onClick={() => setActiveTab('all')}
          >
            All Payments ({allPayments.length})
          </button>
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === 'pending' ? styles.tabButtonActive : {})
            }}
            onClick={() => setActiveTab('pending')}
          >
            Pending ({pendingPayments.length})
          </button>
        </div>
      </div>

      <div style={styles.gridContainer}>
        <OverviewCard
          title="Paid This Month"
          value={paidCount}
          icon={CheckCircle}
          color="#10b981"
        />
        <OverviewCard
          title="Unpaid This Month"
          value={unpaidCount}
          icon={AlertCircle}
          color="#ef4444"
        />
        <OverviewCard
          title="Total Pending"
          value={totalPending}
          icon={FileWarning}
          color="#f59e0b"
        />
        <OverviewCard
          title="Total Tenants"
          value={allPayments.length}
          icon={Users}
          color="#3b82f6"
        />
      </div>

      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search tenants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.th}>Tenant Name</th>
                <th style={styles.th}>Room</th>
                <th style={styles.th}>Rent Amount</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Last Payment</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map(function (payment) {
                  return (
                    <tr key={payment.tenant_id || payment.id} style={styles.tableRow}>
                      <td style={styles.td}>{payment.tenant_name}</td>
                      <td style={styles.td}>
                        <span style={styles.roomBadge}>{payment.room_number || 'N/A'}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.rentAmount}>
                          KSh {payment.rent_amount ? payment.rent_amount.toLocaleString() : '0'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: payment.current_month_paid ? '#dcfce7' :
                            payment.pending_payments > 0 ? '#fee2e2' : '#fef3c7',
                          color: payment.current_month_paid ? '#166534' :
                            payment.pending_payments > 0 ? '#991b1b' : '#92400e'
                        }}>
                          {payment.current_month_paid ? 'Paid' :
                            payment.pending_payments > 0 ? `Pending (${payment.pending_payments})` : 'Unpaid'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {payment.last_payment_date ?
                          new Date(payment.last_payment_date).toLocaleDateString() : 'Never'}
                      </td>
                      <td style={styles.td}>
                        <button
                          style={styles.btnSmallPrimary}
                          onClick={() => onMarkPayment(payment)}
                          title="Mark Payment"
                        >
                          <CreditCard size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ ...styles.td, textAlign: 'center', padding: '40px' }}>
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};


const VacatePage = ({ notices, loading, onViewDetails, onUpdateStatus, onDelete, onCreateNotice }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading vacate notices...</p>
      </div>
    );
  }

  const filtered = notices.filter(notice => {
    const statusMatch = filterStatus === 'all' || notice.status === filterStatus;
    const searchMatch = !searchTerm ||
      notice.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.property_name.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  const summary = {
    pending: notices.filter(n => n.status === 'pending').length,
    approved: notices.filter(n => n.status === 'approved').length,
    rejected: notices.filter(n => n.status === 'rejected').length,
    completed: notices.filter(n => n.status === 'completed').length,
    total: notices.length
  };

  return (
    <>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Vacate Notices Management</h2>
        <button style={styles.btnPrimary} onClick={onCreateNotice}>
          <Plus size={16} /> Create Notice
        </button>
      </div>

      <div style={styles.gridContainer}>
        <OverviewCard
          title="Pending"
          value={summary.pending}
          icon={Clock}
          color="#f59e0b"
        />
        <OverviewCard
          title="Approved"
          value={summary.approved}
          icon={CheckCircle}
          color="#10b981"
        />
        <OverviewCard
          title="Rejected"
          value={summary.rejected}
          icon={XCircle}
          color="#ef4444"
        />
        <OverviewCard
          title="Completed"
          value={summary.completed}
          icon={ShieldCheck}
          color="#3b82f6"
        />
      </div>

      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search vacate notices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div style={styles.section}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.th}>Tenant</th>
                <th style={styles.th}>Property</th>
                <th style={styles.th}>Vacate Date</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map(function (notice) {
                  return (
                    <tr key={notice.id} style={styles.tableRow}>
                      <td style={styles.td}>
                        <div style={styles.tenantInfo}>
                          <User size={16} />
                          <span>{notice.tenant_name}</span>
                        </div>
                        {notice.room_number && (
                          <small style={styles.roomNumber}>Room {notice.room_number}</small>
                        )}
                      </td>
                      <td style={styles.td}>{notice.property_name}</td>
                      <td style={styles.td}>
                        {notice.vacate_date ? new Date(notice.vacate_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor:
                            notice.status === 'approved' ? '#dcfce7' :
                              notice.status === 'rejected' ? '#fee2e2' :
                                notice.status === 'completed' ? '#dbeafe' : '#fef3c7',
                          color:
                            notice.status === 'approved' ? '#166534' :
                              notice.status === 'rejected' ? '#991b1b' :
                                notice.status === 'completed' ? '#1e40af' : '#92400e'
                        }}>
                          {notice.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {notice.created_at ? new Date(notice.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionButtons}>
                          <button
                            style={styles.btnSmallPrimary}
                            onClick={() => onViewDetails(notice)}
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          {notice.status === 'pending' && (
                            <>
                              <button
                                style={styles.btnSmallSuccess}
                                onClick={() => onUpdateStatus(notice.id, 'approve')}
                                title="Approve"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                style={styles.btnSmallDanger}
                                onClick={() => onUpdateStatus(notice.id, 'reject')}
                                title="Reject"
                              >
                                <X size={14} />
                              </button>
                            </>
                          )}
                          {notice.status === 'approved' && (
                            <button
                              style={styles.btnSmallSuccess}
                              onClick={() => onUpdateStatus(notice.id, 'complete')}
                              title="Mark Complete"
                            >
                              <ShieldCheck size={14} />
                            </button>
                          )}
                          {notice.status === 'pending' && (
                            <button
                              style={styles.btnSmallDanger}
                              onClick={() => onDelete(notice.id)}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ ...styles.td, textAlign: 'center', padding: '40px' }}>
                    No vacate notices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};


const NotificationsPage = ({ tenants, onSendNotification }) => {
  const [messageType, setMessageType] = useState('individual');
  const [selectedTenant, setSelectedTenant] = useState('');
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!messageTitle || !messageContent) {
      alert('Please fill in all required fields');
      return;
    }

    if (messageType === 'individual' && !selectedTenant) {
      alert('Please select a tenant');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('joyce-suites-token');
      const recipients = messageType === 'all' 
        ? tenants.map(t => t.id)
        : [parseInt(selectedTenant)];

      const response = await fetch(`${config.apiBaseUrl}/api/caretaker/notifications/send-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipient_ids: recipients,
          title: messageTitle,
          message: messageContent,
          type: 'general'
        })
      });

      if (response.ok) {
        alert('Message sent successfully!');
        setMessageTitle('');
        setMessageContent('');
        setSelectedTenant('');
      } else {
        alert('Failed to send message');
      }
    } catch (err) {
      alert('Error sending message');
    } finally {
      setLoading(false);
    }
  };

  const activeTenantsCount = tenants.filter(t => t.is_active).length;

  return (
    <div style={styles.section}>
      <div style={styles.pageHeaderControls}>
        <h2 style={styles.pageTitle}>Send Messages ({activeTenantsCount} active tenants)</h2>
      </div>

      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Message Type</label>
          <div style={{ display: 'flex', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                value="individual"
                checked={messageType === 'individual'}
                onChange={(e) => setMessageType(e.target.value)}
                style={{ marginRight: '8px' }}
              />
              Send to Individual Tenant
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                value="all"
                checked={messageType === 'all'}
                onChange={(e) => setMessageType(e.target.value)}
                style={{ marginRight: '8px' }}
              />
              Send to All Tenants
            </label>
          </div>
        </div>

        {messageType === 'individual' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Select Tenant</label>
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">Choose a tenant...</option>
              {tenants.filter(t => t.is_active).map(tenant => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name} - Room {tenant.room_number}
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Message Title</label>
          <input
            type="text"
            value={messageTitle}
            onChange={(e) => setMessageTitle(e.target.value)}
            placeholder="Enter message title..."
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Message Content</label>
          <textarea
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="Type your message here..."
            rows={6}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              minHeight: '120px',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              setMessageTitle('');
              setMessageContent('');
              setSelectedTenant('');
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Clear
          </button>
          <button
            onClick={handleSendMessage}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: loading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {loading ? 'Sending...' : `Send Message${messageType === 'all' ? ' to All Tenants' : ''}`}
          </button>
        </div>

        {messageType === 'all' && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#92400e'
          }}>
            <strong>Note:</strong> This message will be sent to all {activeTenantsCount} active tenants.
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          onClick={() => {
            setMessageTitle('');
            setMessageContent('');
            setSelectedTenant('');
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Clear
        </button>
        <button
          onClick={handleSendMessage}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          {loading ? 'Sending...' : `Send Message${messageType === 'all' ? ' to All Tenants' : ''}`}
        </button>
      </div>

      {messageType === 'all' && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '6px',
          fontSize: '14px',
          color: '#92400e'
        }}>
          <strong>Note:</strong> This message will be sent to all {activeTenantsCount} active tenants.
        </div>
      )}
    </div>
  );
};

export default CaretakerDashboard;