import React, { useState } from 'react';
import { 
  AlertTriangle, Clock, Wrench, CheckCircle, Eye, Search, Filter,
  Calendar, MapPin, User, AlertCircle, XCircle
} from 'lucide-react';

const CaretakerMaintenancePage = ({ requests, loading, onUpdateStatus, onViewDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const filtered = requests.filter(req => {
    const matchSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (req.property_name && req.property_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || req.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const handleStatusUpdate = async (requestId, newStatus) => {
    setUpdatingId(requestId);
    try {
      await onUpdateStatus(requestId, newStatus);
      setSelectedRequest(null);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': { bg: '#fef3c7', color: '#92400e', icon: Clock },
      'in_progress': { bg: '#dbeafe', color: '#1e40af', icon: Wrench },
      'completed': { bg: '#dcfce7', color: '#166534', icon: CheckCircle },
      'cancelled': { bg: '#fee2e2', color: '#991b1b', icon: XCircle }
    };
    return colors[status] || { bg: '#f3f4f6', color: '#4b5563', icon: AlertCircle };
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': { bg: '#dcfce7', color: '#166534', icon: AlertCircle },
      'medium': { bg: '#fef3c7', color: '#92400e', icon: AlertTriangle },
      'high': { bg: '#fee2e2', color: '#991b1b', icon: AlertTriangle },
      'urgent': { bg: '#dc2626', color: 'white', icon: AlertTriangle }
    };
    return colors[priority] || { bg: '#f3f4f6', color: '#4b5563', icon: AlertCircle };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f4f6',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading maintenance requests...</p>
      </div>
    );
  }

  return (
    <>
      {/* Header with Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #f59e0b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={20} color="#92400e" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937' }}>
                {requests.filter(r => r.status === 'pending').length}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Pending</div>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #3b82f6'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Wrench size={20} color="#1e40af" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937' }}>
                {requests.filter(r => r.status === 'in_progress').length}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>In Progress</div>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #10b981'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle size={20} color="#166534" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937' }}>
                {requests.filter(r => r.status === 'completed').length}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Completed</div>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #ef4444'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={20} color="#991b1b" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937' }}>
                {requests.filter(r => r.priority === 'urgent').length}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Urgent</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280'
              }} />
              <input
                type="text"
                placeholder="Search maintenance requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  ':focus': {
                    borderColor: '#3b82f6',
                    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
                  }
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} color="#6b7280" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                color: '#374151',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="#6b7280" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                color: '#374151',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Maintenance Requests List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#6b7280'
          }}>
            <Wrench size={48} style={{ marginBottom: '16px', color: '#d1d5db' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              No maintenance requests found
            </h3>
            <p style={{ fontSize: '14px' }}>
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'No maintenance requests have been created yet'}
            </p>
          </div>
        ) : (
          <div style={{ padding: '16px' }}>
            {filtered.map(request => {
              const statusInfo = getStatusColor(request.status);
              const priorityInfo = getPriorityColor(request.priority);
              const StatusIcon = statusInfo.icon;
              const PriorityIcon = priorityInfo.icon;

              return (
                <div
                  key={request.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '16px',
                    backgroundColor: 'white',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    ':hover': {
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      borderColor: '#d1d5db'
                    }
                  }}
                  onClick={() => onViewDetails && onViewDetails(request)}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                  }}>
                    <div style={{ flex: '1' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '8px'
                      }}>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#1f2937',
                          margin: 0
                        }}>
                          {request.title}
                        </h3>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: priorityInfo.bg,
                          color: priorityInfo.color
                        }}>
                          <PriorityIcon size={12} />
                          {request.priority}
                        </span>
                      </div>
                      
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        margin: '0 0 12px 0',
                        lineHeight: '1.5'
                      }}>
                        {request.description}
                      </p>

                      <div style={{
                        display: 'flex',
                        gap: '16px',
                        flexWrap: 'wrap',
                        fontSize: '13px',
                        color: '#6b7280'
                      }}>
                        {request.property_name && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={14} />
                            {request.property_name}
                          </div>
                        )}
                        {request.reported_by && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <User size={14} />
                            {request.reported_by}
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} />
                          {formatDate(request.created_at)}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '8px'
                    }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: statusInfo.bg,
                        color: statusInfo.color
                      }}>
                        <StatusIcon size={14} />
                        {request.status.replace('_', ' ')}
                      </span>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails && onViewDetails(request);
                          }}
                          style={{
                            padding: '6px 8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            backgroundColor: 'white',
                            color: '#6b7280',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            ':hover': {
                              backgroundColor: '#f9fafb',
                              borderColor: '#9ca3af'
                            }
                          }}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>

                        {request.status === 'pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(request.id, 'in_progress');
                            }}
                            disabled={updatingId === request.id}
                            style={{
                              padding: '6px 8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              cursor: updatingId === request.id ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              opacity: updatingId === request.id ? 0.6 : 1,
                              ':hover': {
                                backgroundColor: updatingId === request.id ? '#3b82f6' : '#2563eb'
                              }
                            }}
                            title="Start Work"
                          >
                            <Wrench size={14} />
                            {updatingId === request.id ? '...' : 'Start'}
                          </button>
                        )}

                        {request.status === 'in_progress' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(request.id, 'completed');
                            }}
                            disabled={updatingId === request.id}
                            style={{
                              padding: '6px 8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              backgroundColor: '#10b981',
                              color: 'white',
                              cursor: updatingId === request.id ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              opacity: updatingId === request.id ? 0.6 : 1,
                              ':hover': {
                                backgroundColor: updatingId === request.id ? '#10b981' : '#059669'
                              }
                            }}
                            title="Mark Complete"
                          >
                            <CheckCircle size={14} />
                            {updatingId === request.id ? '...' : 'Complete'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default CaretakerMaintenancePage;
