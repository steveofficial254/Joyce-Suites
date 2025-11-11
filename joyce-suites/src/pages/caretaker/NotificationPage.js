import React, { useState } from 'react';
import { Send } from 'lucide-react';

const NotificationsPage = ({ onSendNotification, loading }) => {
  const [tenantId, setTenantId] = useState('');
  const [notificationType, setNotificationType] = useState('rent_reminder');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!tenantId || !title || !message) {
      setError('Please fill in all required fields');
      return;
    }

    setSending(true);
    try {
      await onSendNotification({
        tenant_id: parseInt(tenantId),
        type: notificationType,
        title: title.trim(),
        message: message.trim()
      });

      setSuccess('Notification sent successfully!');
      setTenantId('');
      setTitle('');
      setMessage('');
      setNotificationType('rent_reminder');
      setError('');

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <h2 className="page-title">Send Notifications</h2>

      {success && (
        <div className="alert alert-success">
          {success}
          <button onClick={() => setSuccess('')} className="alert-close">×</button>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError('')} className="alert-close">×</button>
        </div>
      )}

      <div className="section">
        <h3 className="section-title">Compose New Notification</h3>

        <div className="form-section">
          <div className="form-group">
            <label className="form-label">Tenant ID *</label>
            <input
              type="number"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              placeholder="Enter tenant ID"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notification Type *</label>
            <select
              value={notificationType}
              onChange={(e) => setNotificationType(e.target.value)}
              className="form-input"
            >
              <option value="rent_reminder">Rent Reminder</option>
              <option value="maintenance_update">Maintenance Update</option>
              <option value="general_notice">General Notice</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Message *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message here..."
              className="form-textarea"
              rows="6"
            />
            <div className="char-count">
              {message.length} / 500 characters
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={sending || !tenantId || !title || !message}
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
          >
            <Send size={16} /> {sending ? 'Sending...' : 'Send Notification'}
          </button>
        </div>
      </div>

      <div className="section info-section">
        <h3 className="section-title">Notification Templates</h3>
        <div className="guidelines-list">
          <div className="guideline-item">
            <span className="guideline-number">1</span>
            <div className="guideline-text">
              <h5>Rent Reminder</h5>
              <p>Send reminders before rent is due or for overdue payments</p>
            </div>
          </div>
          <div className="guideline-item">
            <span className="guideline-number">2</span>
            <div className="guideline-text">
              <h5>Maintenance Updates</h5>
              <p>Notify tenants about maintenance work in their room</p>
            </div>
          </div>
          <div className="guideline-item">
            <span className="guideline-number">3</span>
            <div className="guideline-text">
              <h5>General Notices</h5>
              <p>Communicate important building or complex-wide announcements</p>
            </div>
          </div>
          <div className="guideline-item">
            <span className="guideline-number">4</span>
            <div className="guideline-text">
              <h5>Emergency Alerts</h5>
              <p>Send urgent alerts for safety or critical issues</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;