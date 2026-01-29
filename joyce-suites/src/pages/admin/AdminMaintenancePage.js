import React, { useState } from 'react';
import { Check, CheckCircle, Eye, AlertTriangle, Clock, Wrench } from 'lucide-react';

const AdminMaintenancePage = ({ requests, loading, onUpdateStatus, onViewDetails }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

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

  const filtered = requests.filter(function (r) {
    const statusMatch = filterStatus === 'all' || r.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || r.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const statusColor = function (status) {
    switch (status) {
      case 'pending': return { bg: '#fef3c7', color: '#92400e' };
      case 'in_progress': return { bg: '#dbeafe', color: '#1e40af' };
      case 'completed': return { bg: '#dcfce7', color: '#166534' };
      default: return { bg: '#f3f4f6', color: '#4b5563' };
    }
  };

  const priorityColor = function (priority) {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'normal': return '#3b82f6';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle size={14} />;
      case 'high': return <AlertTriangle size={14} />;
      case 'normal': return <Clock size={14} />;
      case 'low': return <Clock size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={14} />;
      case 'in_progress': return <Wrench size={14} />;
      case 'completed': return <CheckCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  return (
    <>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px',
        padding: '16px 0'
      }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          color: '#1f2937',
          margin: 0
        }}>
          Maintenance Requests ({filtered.length})
        </h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                color: '#374151'
              }}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Priority:</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                color: '#374151'
              }}
            >
              <option value="all">All</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #e5e7eb'
                }}>ID</th>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #e5e7eb'
                }}>Title</th>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #e5e7eb'
                }}>Property</th>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #e5e7eb'
                }}>Priority</th>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #e5e7eb'
                }}>Status</th>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #e5e7eb'
                }}>Reported</th>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #e5e7eb'
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map(function (req) {
                  return (
                    <tr key={req.id} style={{ 
                      borderBottom: '1px solid #f3f4f6',
                      '&:hover': {
                        backgroundColor: '#f9fafb'
                      }
                    }}>
                      <td style={{ 
                        padding: '16px', 
                        fontSize: '14px', 
                        color: '#374151',
                        fontWeight: '500'
                      }}>
                        #{req.id}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div>
                          <div style={{ 
                            fontSize: '14px', 
                            fontWeight: '500', 
                            color: '#1f2937',
                            marginBottom: '4px'
                          }}>
                            {req.title}
                          </div>
                          <small style={{ color: '#6b7280', fontSize: '12px' }}>
                            {req.description}
                          </small>
                        </div>
                      </td>
                      <td style={{ 
                        padding: '16px', 
                        fontSize: '14px', 
                        color: '#374151'
                      }}>
                        {req.property_name || `Property ${req.property_id}`}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: priorityColor(req.priority) + '20',
                            color: priorityColor(req.priority)
                          }}
                        >
                          {getPriorityIcon(req.priority)}
                          {req.priority}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            ...statusColor(req.status)
                          }}
                        >
                          {getStatusIcon(req.status)}
                          {req.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ 
                        padding: '16px', 
                        fontSize: '14px', 
                        color: '#374151'
                      }}>
                        {new Date(req.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => onViewDetails(req)}
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
                              fontSize: '12px'
                            }}
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          {req.status === 'pending' && (
                            <button
                              onClick={() => onUpdateStatus(req.id, 'in_progress')}
                              style={{
                                padding: '6px 8px',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                backgroundColor: 'white',
                                color: '#059669',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px'
                              }}
                              title="Start Work"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          {req.status === 'in_progress' && (
                            <button
                              onClick={() => onUpdateStatus(req.id, 'completed')}
                              style={{
                                padding: '6px 8px',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                backgroundColor: 'white',
                                color: '#059669',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px'
                              }}
                              title="Mark Complete"
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ 
                    textAlign: 'center', 
                    padding: '40px',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    No maintenance requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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

export default AdminMaintenancePage;
