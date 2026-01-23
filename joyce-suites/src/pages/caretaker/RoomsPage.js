import React, { useState } from 'react';
import { Home, Search, Filter } from 'lucide-react';

const RoomsPage = ({ availableRooms, occupiedRooms, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState('all');
  const [showTab, setShowTab] = useState('occupied');

  const rooms = showTab === 'occupied' ? occupiedRooms : availableRooms;

  const filtered = rooms.filter(room => {
    const matchSearch =
      room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.tenant_name && room.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchType = roomTypeFilter === 'all' || room.property_type === roomTypeFilter;

    return matchSearch && matchType;
  });

  const occupancyRate = ((occupiedRooms.length / (occupiedRooms.length + availableRooms.length)) * 100).toFixed(1);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading room data...</p>
      </div>
    );
  }

  return (
    <>
      <h2 className="page-title">Room Management</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-bg success">
            🏠
          </div>
          <div className="stat-content">
            <span className="stat-label">Occupied Rooms</span>
            <span className="stat-value">{occupiedRooms.length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg warning">
            🔓
          </div>
          <div className="stat-content">
            <span className="stat-label">Available Rooms</span>
            <span className="stat-value">{availableRooms.length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg info">
            📊
          </div>
          <div className="stat-content">
            <span className="stat-label">Occupancy Rate</span>
            <span className="stat-value">{occupancyRate}%</span>
          </div>
        </div>
      </div>

      <div className="tabs-section">
        <button
          className={`tab-btn ${showTab === 'occupied' ? 'active' : ''}`}
          onClick={() => setShowTab('occupied')}
        >
          Occupied Rooms ({occupiedRooms.length})
        </button>
        <button
          className={`tab-btn ${showTab === 'available' ? 'active' : ''}`}
          onClick={() => setShowTab('available')}
        >
          Available Rooms ({availableRooms.length})
        </button>
      </div>

      <div className="search-filter-section">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by room number or tenant name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <Filter size={18} />
          <select
            value={roomTypeFilter}
            onChange={(e) => setRoomTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="bedsitter">Bedsitter</option>
            <option value="one_bedroom">One Bedroom</option>
          </select>
        </div>
      </div>

      <div className="section">
        <h3 className="section-title">
          {showTab === 'occupied' ? 'Occupied Rooms' : 'Available Rooms'} ({filtered.length})
        </h3>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <Home size={48} className="empty-icon" />
            <p>No rooms found</p>
          </div>
        ) : (
          <div className="rooms-grid">
            {filtered.map(room => (
              <div key={room.room_id} className="room-card">
                <div className="room-header">
                  <h4 className="room-number">Room #{room.room_number}</h4>
                  <span className="room-type">{room.property_type === 'bedsitter' ? 'Bedsitter' : 'One Bedroom'}</span>
                </div>

                <div className="room-details">
                  <div className="detail">
                    <span className="label">Floor</span>
                    <span className="value">{room.floor}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Rent</span>
                    <span className="value">KSh {room.rent_amount.toLocaleString()}</span>
                  </div>
                </div>

                {showTab === 'occupied' && room.tenant_name && (
                  <div className="room-tenant">
                    <h5>Tenant: {room.tenant_name}</h5>
                  </div>
                )}

                <div className="room-amenities">
                  <span className="label">Amenities:</span>
                  <div className="amenities-list">
                    {room.amenities && room.amenities.map((amenity, idx) => (
                      <span key={idx} className="amenity-tag">{amenity}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default RoomsPage;