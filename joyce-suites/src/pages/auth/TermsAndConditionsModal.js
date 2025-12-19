import React from 'react';
import './TenantRegister.css';

const TermsAndConditionsModal = ({ roomData, onClose, onAccept, onDecline }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <h3>Lease Agreement Terms and Conditions</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        <div className="modal-body">
          {roomData && (
            <div className="lease-summary">
              <h4>Lease Summary</h4>
              <div className="summary-card">
                <div className="summary-row">
                  <span>Room:</span>
                  <strong>{roomData.name}</strong>
                </div>
                <div className="summary-row">
                  <span>Type:</span>
                  <strong>{roomData.type}</strong>
                </div>
                <div className="summary-row">
                  <span>Monthly Rent:</span>
                  <strong className="rent-highlight">KSh {roomData.rent?.toLocaleString() || '0'}</strong>
                </div>
                <div className="summary-row">
                  <span>Security Deposit (7%):</span>
                  <strong className="deposit-highlight">KSh {Math.round(roomData.deposit || 0).toLocaleString()}</strong>
                </div>
                <div className="summary-row">
                  <span>Total Initial Payment:</span>
                  <strong className="total-highlight">KSh {Math.round((roomData.rent + roomData.deposit) || 0).toLocaleString()}</strong>
                </div>
                {roomData.paybill && (
                  <div className="summary-row">
                    <span>Paybill:</span>
                    <strong>{roomData.paybill}</strong>
                  </div>
                )}
                {roomData.account && (
                  <div className="summary-row">
                    <span>Account:</span>
                    <strong>{roomData.account}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="terms-content">
            <h4>Terms and Conditions</h4>
            
            <section className="terms-section">
              <h5>1. Lease Term</h5>
              <p>The lease is on a month-to-month basis and continues until terminated by either party with 30 days written notice.</p>
            </section>

            <section className="terms-section">
              <h5>2. Rent Payment</h5>
              <p>Monthly rent of KSh {roomData?.rent?.toLocaleString() || '0'} is payable on or before the 5th day of each month. Late payment may incur additional charges of 5% per day.</p>
            </section>

            <section className="terms-section">
              <h5>3. Security Deposit</h5>
              <p>A security deposit of KSh {roomData ? Math.round(roomData.deposit || 0).toLocaleString() : '0'} is required. This will be returned within 30 days of lease termination, subject to property condition inspection.</p>
            </section>

            <section className="terms-section">
              <h5>4. Utilities and Services</h5>
              <p>Water and electricity deposits are separate from the security deposit. Internet service is available at additional cost. Tenants are responsible for their consumption bills.</p>
            </section>

            <section className="terms-section">
              <h5>5. Property Maintenance</h5>
              <p>Tenant must maintain the premises in clean and habitable condition. Damage beyond normal wear and tear will be charged to the tenant. Major repairs should be reported to the caretaker immediately.</p>
            </section>

            <section className="terms-section">
              <h5>6. Noise Policy</h5>
              <p>Quiet hours are from 10:00 PM to 8:00 AM. Excessive noise is prohibited and may result in warnings or eviction.</p>
            </section>

            <section className="terms-section">
              <h5>7. Guest Policy</h5>
              <p>Guests are allowed but must not stay overnight for more than 3 consecutive nights without prior approval from the caretaker.</p>
            </section>

            <section className="terms-section">
              <h5>8. Termination</h5>
              <p>Either party may terminate the lease with 30 days written notice. Upon move-out, the premises must be empty, clean, and in the same condition as at move-in.</p>
            </section>

            <section className="terms-section">
              <h5>9. Breach of Terms</h5>
              <p>Any breach of these terms may result in legal action, including eviction and deduction from the security deposit. Repeated violations may lead to immediate termination of lease.</p>
            </section>

            <section className="terms-section">
              <h5>10. Governing Law</h5>
              <p>This agreement shall be governed by and construed in accordance with the laws of Kenya.</p>
            </section>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onDecline} className="btn btn-outline">
            Do Not Accept
          </button>
          <button onClick={onAccept} className="btn btn-primary">
            Accept Terms
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsModal;