
import React, { useState } from 'react';
import { AlertCircle, Search, Filter } from 'lucide-react';

const MaintenancePage = ({ requests, loading, onUpdateStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const filtered = requests.filter(req => {
    const matchSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       req.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || req.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const handleStatusUpdate = async (requestId, newStatus) => {
    setUpdatingId(requestId);
    try {
      await onUpdateStatus(requestId, { status: newStatus });
      setSelectedRequest(null);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#FF9800',
      'in_progress': '#2196F3',
      'completed': '#4CAF50',
      'cancelled': '#F44336'
    };
    return colors[status] || '#757575';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': '#4CAF50',
      'medium': '#FF9800',
      'high': '#F44336',
      'urgent': '#C62828'
    };
    return colors[priority] || '#757575';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading maintenance requests...</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Maintenance Requests</h2>
        <span className="badge">{filtered.length} Total</span>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-bg warning">
            <AlertCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Pending</span>
            <span className="stat-value">
              {requests.filter(r => r.status === 'pending').length}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg info">
            ⏱️
          </div>
          <div className="stat-content">
            <span className="stat-label">In Progress</span>
            <span className="stat-value">
              {requests.filter(r => r.status === 'in_progress').length}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg success">
            ✓
          </div>
          <div className="stat-content">
            <span className="stat-label">Completed</span>
            <span className="stat-value">
              {requests.filter(r => r.status === 'completed').length}
            </span>
          </div>
        </div>
      </div>

      <div className="search-filter-section">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <Filter size={18} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="filter-group">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      <div className="section">
        <h3 className="section-title">Requests ({filtered.length})</h3>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={48} className="empty-icon" />
            <p>No maintenance requests found</p>
          </div>
        ) : (
          <div className="maintenance-list">
            {filtered.map(req => (
              <div key={req.request_id} className="maintenance-item">
                <div className="maintenance-header">
                  <div className="maintenance-title">
                    <h4>{req.title}</h4>
                    <p className="maintenance-room">Room #{req.room_id}</p>
                  </div>
                  <div className="maintenance-badges">
                    <span 
                      className="badge-status" 
                      style={{ backgroundColor: getStatusColor(req.status) }}
                    >
                      {req.status.replace('_', ' ')}
                    </span>
                    <span 
                      className="badge-priority" 
                      style={{ backgroundColor: getPriorityColor(req.priority) }}
                    >
                      {req.priority}
                    </span>
                  </div>
                </div>

                <div className="maintenance-body">
                  <p className="maintenance-description">{req.description}</p>
                  <div className="maintenance-details">
                    <span><strong>Category:</strong> {req.category}</span>
                    <span><strong>Created:</strong> {new Date(req.created_at).toLocaleDateString()}</span>
                    <span><strong>Assigned:</strong> {req.assigned_to || 'Unassigned'}</span>
                    {req.notes && <span><strong>Notes:</strong> {req.notes}</span>}
                  </div>
                </div>

                <div className="maintenance-actions">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => setSelectedRequest(req)}
                  >
                    Update Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Update Maintenance Request</h3>
            <div className="modal-body">
              <p><strong>Title:</strong> {selectedRequest.title}</p>
              <p><strong>Current Status:</strong> {selectedRequest.status}</p>
              <p><strong>Priority:</strong> {selectedRequest.priority}</p>
            </div>
            <div className="modal-actions">
              <select 
                defaultValue={selectedRequest.status}
                onChange={(e) => handleStatusUpdate(selectedRequest.request_id, e.target.value)}
                disabled={updatingId === selectedRequest.request_id}
                className="modal-select"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedRequest(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MaintenancePage;