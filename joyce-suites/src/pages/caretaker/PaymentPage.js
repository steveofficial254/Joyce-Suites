import React, { useState } from 'react';
import { CheckCircle, Clock, FileText } from 'lucide-react';

const PaymentsPage = ({ payments, onConfirm, onMarkPending }) => {
  const [expandedPayment, setExpandedPayment] = useState(null);

  return (
    <>
      <h2 className="page-title">Payment Verification</h2>

      {/* Payment Stats */}
      <div className="payment-stats">
        <div className="payment-stat-card pending">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <span className="stat-number">
              {payments.filter(p => p.status === 'Pending').length}
            </span>
            <span className="stat-text">Pending Verification</span>
          </div>
        </div>

        <div className="payment-stat-card confirmed">
          <div className="stat-icon">✓</div>
          <div className="stat-info">
            <span className="stat-number">
              {payments.filter(p => p.status === 'Confirmed').length}
            </span>
            <span className="stat-text">Confirmed</span>
          </div>
        </div>

        <div className="payment-stat-card total">
          <div className="stat-icon"></div>
          <div className="stat-info">
            <span className="stat-number">
              KSh {payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
            </span>
            <span className="stat-text">Total Amount</span>
          </div>
        </div>
      </div>

      {/* Payment List */}
      <div className="section">
        <h3 className="section-title">Payment Proofs</h3>
        
        {payments.length === 0 ? (
          <div className="empty-state">
            <p>No payments pending verification</p>
          </div>
        ) : (
          <div className="payment-list">
            {payments.map(payment => (
              <div 
                key={payment.id} 
                className={`payment-card ${payment.status.toLowerCase()}`}
              >
                <div className="payment-header">
                  <div className="payment-info">
                    <h4 className="payment-tenant">{payment.tenant}</h4>
                    <p className="payment-room">Room #{payment.room}</p>
                  </div>
                  <div className="payment-meta">
                    <span className={`status-badge status-${payment.status.toLowerCase()}`}>
                      {payment.status === 'Pending' ? '⏳ ' : '✓ '}
                      {payment.status}
                    </span>
                  </div>
                </div>

                <div className="payment-body">
                  <div className="payment-details">
                    <div className="detail-item">
                      <span className="detail-icon"></span>
                      <div className="detail-content">
                        <span className="detail-label">Amount</span>
                        <span className="detail-value">KSh {payment.amount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="detail-item">
                      <span className="detail-icon"></span>
                      <div className="detail-content">
                        <span className="detail-label">Payment Date</span>
                        <span className="detail-value">{payment.date}</span>
                      </div>
                    </div>

                    <div className="detail-item">
                      <span className="detail-icon">📎</span>
                      <div className="detail-content">
                        <span className="detail-label">Proof File</span>
                        <span className="detail-value">{payment.proof}</span>
                      </div>
                    </div>
                  </div>

                  {/* Proof Preview */}
                  <div className="proof-preview">
                    <FileText size={48} className="proof-icon" />
                    <p className="proof-text">Payment Proof: {payment.proof}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                {payment.status === 'Pending' && (
                  <div className="payment-actions">
                    <button 
                      className="btn btn-success"
                      onClick={() => onConfirm(payment.id)}
                    >
                      <CheckCircle size={16} /> Confirm Payment
                    </button>
                    <button 
                      className="btn btn-warning"
                      onClick={() => onMarkPending(payment.id)}
                    >
                      <Clock size={16} /> Mark as Pending
                    </button>
                  </div>
                )}

                {payment.status === 'Confirmed' && (
                  <div className="payment-confirmed-message">
                    <CheckCircle size={16} className="confirm-icon" />
                    <span>Payment confirmed and tenant record updated</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Guidelines */}
      <div className="section info-section">
        <h3 className="section-title">Verification Guidelines</h3>
        <div className="guidelines-list">
          <div className="guideline-item">
            <span className="guideline-number">1</span>
            <div className="guideline-text">
              <h5>Check Payment Amount</h5>
              <p>Verify the amount matches the rent due for the tenant</p>
            </div>
          </div>
          <div className="guideline-item">
            <span className="guideline-number">2</span>
            <div className="guideline-text">
              <h5>Verify Payment Date</h5>
              <p>Ensure the payment date is within the current month</p>
            </div>
          </div>
          <div className="guideline-item">
            <span className="guideline-number">3</span>
            <div className="guideline-text">
              <h5>Review Proof Document</h5>
              <p>Check the uploaded proof is clear and matches transaction details</p>
            </div>
          </div>
          <div className="guideline-item">
            <span className="guideline-number">4</span>
            <div className="guideline-text">
              <h5>Confirm Payment</h5>
              <p>Click confirm to update tenant record and clear their balance</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentsPage;