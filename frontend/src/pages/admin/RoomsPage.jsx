import { useState, useEffect } from 'react';
import AdminHeader from '../../components/layout/AdminHeader';
import { getRooms, allocateRoom, getStudents } from '../../services/adminService';

const RoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllocationDialog, setShowAllocationDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [filters, setFilters] = useState({
    hostel: 'boys',
    floor: '',
    block: '',
    search: '',
    availability: ''
  });

  const loadRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRooms(filters);
      setRooms(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadStudents = async () => {
    try {
      const data = await getStudents({ hostel: filters.hostel, status: 'active' });
      // Filter students without room assignment
      setStudents(data.filter(s => !s.room));
    } catch (err) {
      console.error('Error loading students:', err);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleAllocateClick = async (room) => {
    if (room.occupied >= room.capacity) {
      alert('This room is full');
      return;
    }
    setSelectedRoom(room);
    setSelectedStudent('');
    await loadStudents();
    setShowAllocationDialog(true);
  };

  const handleAllocateSubmit = async () => {
    if (!selectedStudent) {
      alert('Please select a student');
      return;
    }

    try {
      await allocateRoom(selectedStudent, selectedRoom.id);
      setShowAllocationDialog(false);
      setSelectedRoom(null);
      setSelectedStudent('');
      await loadRooms();
    } catch (err) {
      alert('Error allocating room: ' + err.message);
    }
  };

  const getAvailabilityBadge = (room) => {
    const available = room.capacity - room.occupied;
    if (available === 0) {
      return <span className="badge badge-destructive">Full</span>;
    } else if (available === room.capacity) {
      return <span className="badge badge-success">Available</span>;
    } else {
      return <span className="badge badge-warning">Partial</span>;
    }
  };

  return (
    <>
      <AdminHeader title="Room Allocation" />
      <div className="admin-content">
        <div className="page-header">
          <h1 className="page-title">Room Allocation</h1>
          <p className="page-subtitle">Manage hostel room assignments</p>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search room number..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <select
            className="form-select"
            value={filters.hostel}
            onChange={(e) => handleFilterChange('hostel', e.target.value)}
          >
            <option value="boys">Boys Hostel</option>
            <option value="girls">Girls Hostel</option>
          </select>
          <select
            className="form-select"
            value={filters.floor}
            onChange={(e) => handleFilterChange('floor', e.target.value)}
          >
            <option value="">All Floors</option>
            <option value="1">Floor 1</option>
            <option value="2">Floor 2</option>
            <option value="3">Floor 3</option>
            <option value="4">Floor 4</option>
          </select>
          <select
            className="form-select"
            value={filters.block}
            onChange={(e) => handleFilterChange('block', e.target.value)}
          >
            <option value="">All Blocks</option>
            <option value="A">Block A</option>
            <option value="B">Block B</option>
            <option value="C">Block C</option>
          </select>
          <select
            className="form-select"
            value={filters.availability}
            onChange={(e) => handleFilterChange('availability', e.target.value)}
          >
            <option value="">All Rooms</option>
            <option value="available">Available Only</option>
            <option value="full">Full Only</option>
          </select>
        </div>

        {/* Room Grid */}
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <div className="card">
            <div className="card-content">
              <div className="empty-state">
                <p className="empty-state-title">Error loading rooms</p>
                <p>{error}</p>
                <button className="btn btn-primary" onClick={loadRooms} style={{ marginTop: '1rem' }}>
                  Retry
                </button>
              </div>
            </div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="card">
            <div className="card-content">
              <div className="empty-state">
                <p className="empty-state-title">No rooms found</p>
                <p>Try adjusting your filters.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="room-grid">
            {rooms.map((room) => (
              <div
                key={room.id}
                className={`room-card ${room.occupied >= room.capacity ? 'full' : ''}`}
              >
                <div className="room-card-number">{room.number}</div>
                <div className="room-card-info">
                  Floor {room.floor}, Block {room.block}
                </div>
                <div className="room-card-info">
                  Capacity: {room.occupied}/{room.capacity}
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  {getAvailabilityBadge(room)}
                </div>
                {room.occupied < room.capacity && (
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: '0.75rem', width: '100%' }}
                    onClick={() => handleAllocateClick(room)}
                  >
                    Allocate
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Allocation Dialog */}
      {showAllocationDialog && (
        <div className="dialog-overlay" onClick={() => setShowAllocationDialog(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">Allocate Room {selectedRoom?.number}</h2>
            </div>
            <div className="dialog-body">
              <div className="form-group">
                <label className="form-label">Select Student</label>
                <select
                  className="form-select"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                >
                  <option value="">Choose a student...</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.fullName} - {student.usn} ({student.department})
                    </option>
                  ))}
                </select>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginTop: '1rem' }}>
                ℹ️ Only students without room assignments are shown.
              </p>
            </div>
            <div className="dialog-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowAllocationDialog(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAllocateSubmit}
                disabled={!selectedStudent}
              >
                Allocate Room
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RoomsPage;
