import React, { useState } from 'react';
import { MessageSquare, Filter, Search, Send, Calendar } from 'lucide-react';

const CommentsPage = ({ comments, tenants, onAddComment }) => {
  const [selectedTenant, setSelectedTenant] = useState('');
  const [commentText, setCommentText] = useState('');
  const [filterTenant, setFilterTenant] = useState('All');
  const [filterDate, setFilterDate] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter comments
  const filtered = comments.filter(comment => {
    const matchTenant = filterTenant === 'All' || comment.tenant === filterTenant;
    const matchSearch = comment.comment.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTenant && matchSearch;
  });

  // Handle add comment
  const handleAddComment = () => {
    if (selectedTenant && commentText.trim()) {
      onAddComment(selectedTenant, commentText);
      setSelectedTenant('');
      setCommentText('');
    }
  };

  return (
    <>
      <h2 className="page-title">Comments & Feedback</h2>

      {/* Add Comment Form */}
      <div className="section">
        <h3 className="section-title">Add New Comment</h3>
        
        <div className="comment-form">
          <div className="form-group">
            <label className="form-label">Select Tenant *</label>
            <select 
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="form-input"
            >
              <option value="">-- Choose a tenant --</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} (Room #{t.room})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Your Comment *</label>
            <textarea 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Enter your feedback or notes about the tenant..."
              className="form-textarea comment-textarea"
              rows="5"
            />
            <div className="char-count">
              {commentText.length} / 500 characters
            </div>
          </div>

          <button 
            className="btn btn-primary"
            onClick={handleAddComment}
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            disabled={!selectedTenant || !commentText.trim()}
          >
            <Send size={16} /> Add Comment
          </button>
        </div>
      </div>

      {/* Comments List Header with Filters */}
      <div className="section">
        <h3 className="section-title">Recent Comments ({filtered.length})</h3>

        {/* Search and Filter Bar */}
        <div className="comments-filter-bar">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search comments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <Filter size={18} />
            <select
              value={filterTenant}
              onChange={(e) => setFilterTenant(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Tenants</option>
              {tenants.map(t => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <Calendar size={18} />
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Comments List */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <MessageSquare size={48} className="empty-icon" />
            <p>No comments found</p>
          </div>
        ) : (
          <div className="comments-list">
            {filtered.map(comment => (
              <div key={comment.id} className="comment-item">
                <div className="comment-header">
                  <div className="comment-meta">
                    <h4 className="comment-tenant">{comment.tenant}</h4>
                    <span className="comment-room">Room #{comment.room}</span>
                  </div>
                  <div className="comment-badge-group">
                    <span className="comment-date">{comment.date}</span>
                    <span className={`author-badge ${comment.author.toLowerCase()}`}>
                      {comment.author}
                    </span>
                  </div>
                </div>
                <p className="comment-text">{comment.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comment Statistics */}
      <div className="section">
        <h3 className="section-title"> Comment Statistics</h3>
        <div className="stats-grid-mini">
          <div className="stat-mini">
            <span className="stat-icon"></span>
            <div className="stat-data">
              <span className="stat-label">Total Comments</span>
              <span className="stat-value">{comments.length}</span>
            </div>
          </div>
          <div className="stat-mini">
            <span className="stat-icon">👤</span>
            <div className="stat-data">
              <span className="stat-label">Tenants with Comments</span>
              <span className="stat-value">
                {new Set(comments.map(c => c.tenant)).size}
              </span>
            </div>
          </div>
          <div className="stat-mini">
            <span className="stat-icon"></span>
            <div className="stat-data">
              <span className="stat-label">Caretaker Comments</span>
              <span className="stat-value">
                {comments.filter(c => c.author === 'Caretaker').length}
              </span>
            </div>
          </div>
          <div className="stat-mini">
            <span className="stat-icon"></span>
            <div className="stat-data">
              <span className="stat-label">Admin Comments</span>
              <span className="stat-value">
                {comments.filter(c => c.author === 'Admin').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Best Practices */}
      <div className="section info-section">
        <h3 className="section-title">Best Practices for Comments</h3>
        <div className="practices-list">
          <div className="practice-item">
            <span className="practice-number">1</span>
            <div className="practice-content">
              <h5>Be Specific</h5>
              <p>Include dates and specific issues when documenting tenant concerns</p>
            </div>
          </div>
          <div className="practice-item">
            <span className="practice-number">2</span>
            <div className="practice-content">
              <h5>Professional Tone</h5>
              <p>Use professional language - comments are visible to both admin and tenants</p>
            </div>
          </div>
          <div className="practice-item">
            <span className="practice-number">3</span>
            <div className="practice-content">
              <h5>Document Positives</h5>
              <p>Record good behavior and on-time payments to build positive records</p>
            </div>
          </div>
          <div className="practice-item">
            <span className="practice-number">4</span>
            <div className="practice-content">
              <h5>Regular Updates</h5>
              <p>Keep comments current and update with follow-up actions taken</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommentsPage;