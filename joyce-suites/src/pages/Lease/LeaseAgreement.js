import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import './LeaseAgreement.css';
import logo from '../../assets/image1.png';

const LeaseAgreement = ({ tenantData, unitData }) => {
  const navigate = useNavigate();
  const signatureRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signatureEmpty, setSignatureEmpty] = useState(true);
  const [leaseData, setLeaseData] = useState(null);

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  useEffect(() => {
    // Fetch tenant and unit data on mount
    fetchLeaseData();
  }, []);

  const fetchLeaseData = async () => {
    try {
      // In production, fetch from backend
      // For now, using mock data structure
      setLeaseData({
        tenant: tenantData || {
          fullName: 'John Doe',
          idNumber: '12345678',
          phone: '+254 712 345 678',
          email: 'john.doe@example.com',
          roomNumber: '12'
        },
        unit: unitData || {
          rent_amount: 5500,
          deposit_amount: 5900,
          water_deposit: 400,
          room_type: 'bedsitter'
        },
        landlord: {
          name: 'JOYCE MUTHONI MATHEA',
          phone: '0758 999322',
          email: 'joycesuites@gmail.com'
        }
      });
    } catch (err) {
      setError('Failed to load lease data');
    }
  };

  const handleClearSignature = () => {
    signatureRef.current.clear();
    setSignatureEmpty(true);
  };

  const handleSignatureEnd = () => {
    setSignatureEmpty(signatureRef.current.isEmpty());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!termsAccepted) {
      setError('Please accept the terms and conditions');
      return;
    }

    if (signatureEmpty) {
      setError('Please provide your signature');
      return;
    }

    setLoading(true);

    try {
      // Get signature as data URL
      const signatureDataUrl = signatureRef.current.toDataURL();

      // Prepare lease data
      const leaseSubmission = {
        tenantId: leaseData.tenant.id,
        roomNumber: leaseData.tenant.roomNumber,
        signature: signatureDataUrl,
        signedAt: new Date().toISOString(),
        termsAccepted: true,
        leaseDetails: {
          startDate: currentDate.toISOString(),
          monthlyRent: leaseData.unit.rent_amount,
          securityDeposit: leaseData.unit.deposit_amount,
          waterDeposit: leaseData.unit.water_deposit
        }
      };

      // Send to backend
      const response = await fetch('/api/lease/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(leaseSubmission)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit lease agreement');
      }

      setSuccess('Lease agreement signed successfully! Redirecting to dashboard...');
      
      setTimeout(() => {
        navigate('/tenant/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to sign lease. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!leaseData) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading lease agreement...</p>
      </div>
    );
  }

  return (
    <div className="lease-agreement-container">
      <div className="lease-header">
        <img src={logo} alt="Joyce Suits Logo" className="lease-logo" />
        <h1>Joyce Suits Apartments</h1>
        <h2>House Lease Agreement</h2>
      </div>

      <div className="lease-content-wrapper">
        {/* Error/Success Messages */}
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Lease Document */}
        <div className="lease-document">
          <div className="lease-intro">
            <p>
              This Lease Agreement is made and entered into on this{' '}
              <strong>{formattedDate}</strong>, by and between:
            </p>
          </div>

          {/* Landlord Section */}
          <div className="lease-section">
            <h3>LANDLORD:</h3>
            <div className="info-box">
              <p><strong>Joyce Suites</strong> ({leaseData.landlord.name})</p>
              <p>Phone: {leaseData.landlord.phone}</p>
              <p>Email: {leaseData.landlord.email}</p>
            </div>
          </div>

          {/* Tenant Section */}
          <div className="lease-section">
            <h3>TENANT:</h3>
            <div className="info-box tenant-info">
              <p><strong>Name:</strong> {leaseData.tenant.fullName}</p>
              <p><strong>ID No.:</strong> {leaseData.tenant.idNumber}</p>
              <p><strong>Phone:</strong> {leaseData.tenant.phone}</p>
              <p><strong>Email:</strong> {leaseData.tenant.email}</p>
            </div>
          </div>

          {/* Property Address */}
          <div className="lease-section">
            <h3>PROPERTY ADDRESS:</h3>
            <div className="info-box">
              <p>
                Joyce Suites, Plot No: <strong>Room {leaseData.tenant.roomNumber}</strong>
              </p>
              <p>Type: <strong>{leaseData.unit.room_type}</strong></p>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="lease-terms">
            <div className="term-item">
              <h4>1. TERM OF LEASE</h4>
              <p>
                The lease shall commence on <strong>{formattedDate}</strong> and shall
                continue on a month-to-month basis until terminated by either party with
                30 days' notice.
              </p>
            </div>

            <div className="term-item">
              <h4>2. RENTAL PAYMENT</h4>
              <p>
                The Tenant agrees to pay a monthly rent of{' '}
                <strong>KSh {leaseData.unit.rent_amount.toLocaleString()}/=</strong> payable
                on or before the <strong>5th day of each month</strong>.
              </p>
            </div>

            <div className="term-item">
              <h4>3. SECURITY DEPOSIT</h4>
              <p>
                The Tenant shall pay a security deposit equivalent to one (1) month's rent,
                totaling <strong>KSh {leaseData.unit.deposit_amount.toLocaleString()}/=</strong>,
                to be held by the Landlord as security for damages beyond normal wear and tear.
              </p>
              <p>
                This deposit shall be refunded upon termination of the lease, subject to an
                inspection of the premises.
              </p>
            </div>

            <div className="term-item">
              <h4>4. UTILITIES & SERVICES</h4>
              <p>
                <strong>Water & Electricity Deposit:</strong> The Tenant shall pay a deposit of{' '}
                <strong>KSh {leaseData.unit.water_deposit.toLocaleString()}/=</strong> to cover
                any outstanding utility bills at the end of the lease term.
              </p>
              <p>
                <strong>Internet Charges:</strong> Internet service is available but shall be
                paid separately based on individual usage. The Tenant shall be responsible for
                their subscription.
              </p>
            </div>

            <div className="term-item">
              <h4>5. PROPERTY CONDITION & MAINTENANCE</h4>
              <ul>
                <li>
                  The Tenant shall maintain the premises in a clean and habitable condition.
                </li>
                <li>
                  Any damage beyond normal wear and tear shall be the responsibility of the Tenant.
                </li>
                <li>
                  Breach of Security and Property Destruction is considered unlawful and will
                  result in legal consequences, including but not limited to eviction and
                  deduction from the security deposit.
                </li>
                <li>
                  The Tenant shall notify the Landlord of any maintenance issues immediately.
                </li>
              </ul>
            </div>

            <div className="term-item">
              <h4>6. NOISE AND DISTURBANCE POLICY</h4>
              <ul>
                <li>
                  The Tenant agrees to respect the peace and quiet of the property and the
                  surrounding community.
                </li>
                <li>
                  Loud music, excessive noise, or any other disturbances that may cause a
                  nuisance to neighbors are strictly prohibited.
                </li>
                <li>
                  The Tenant agrees to keep noise levels to a minimum between the hours of{' '}
                  <strong>10:00 PM and 8:00 AM</strong>, especially loud music, television, or
                  other sound systems.
                </li>
                <li>
                  If noise complaints are received, the Landlord reserves the right to issue a
                  written warning, and if the issue persists, the Tenant may be subject to
                  penalties or eviction.
                </li>
              </ul>
            </div>

            <div className="term-item">
              <h4>7. TERMINATION & MOVE-OUT PROCEDURE</h4>
              <ul>
                <li>Either party may terminate the lease with 30 days' notice.</li>
                <li>
                  The premises shall be returned in the same condition as received, subject to
                  reasonable wear and tear.
                </li>
                <li>
                  Unpaid rent, utility bills, and damages shall be deducted from the security
                  deposit.
                </li>
              </ul>
            </div>

            <div className="term-item">
              <h4>8. GOVERNING LAW</h4>
              <p>
                This Agreement shall be governed by the laws of Kenya. Any disputes arising
                shall be resolved amicably or through legal proceedings within the jurisdiction.
              </p>
            </div>
          </div>
        </div>

        {/* Signature Section */}
        <div className="signature-section">
          <h3>Agreement Acceptance & Signature</h3>

          {/* Terms Acceptance */}
          <div className="terms-acceptance">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                required
              />
              <span>
                I have read, understood, and agree to all the terms and conditions stated in
                this lease agreement. I confirm that all information provided is accurate and
                true.
              </span>
            </label>
          </div>

          {/* Signature Canvas */}
          <div className="signature-canvas-container">
            <label className="signature-label">
              Tenant's Signature *
              <span className="signature-instruction">
                (Draw your signature in the box below)
              </span>
            </label>
            
            <div className="canvas-wrapper">
              <SignatureCanvas
                ref={signatureRef}
                onEnd={handleSignatureEnd}
                canvasProps={{
                  className: 'signature-canvas',
                  width: 600,
                  height: 200
                }}
              />
            </div>

            <div className="signature-actions">
              <button
                type="button"
                onClick={handleClearSignature}
                className="btn btn-secondary"
              >
                Clear Signature
              </button>
              <span className="signature-date">
                Date: {formattedDate}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="submit-section">
            <button
              onClick={handleSubmit}
              className="btn btn-primary btn-large"
              disabled={loading || !termsAccepted || signatureEmpty}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Submitting...
                </>
              ) : (
                'Sign & Submit Lease Agreement'
              )}
            </button>

            <p className="submit-note">
              By clicking submit, you are electronically signing this lease agreement and
              agreeing to be legally bound by its terms.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="lease-actions">
          <button
            onClick={() => window.print()}
            className="btn btn-outline"
          >
            📄 Print Agreement
          </button>
          <button
            onClick={() => navigate('/tenant/dashboard')}
            className="btn btn-outline"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaseAgreement;