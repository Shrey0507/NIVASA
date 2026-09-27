import { useState, useEffect } from 'react';
import AdminHeader from '../../components/layout/AdminHeader';
import { getMovementRecords, updateMovementRecord } from '../../services/adminService';

const MovementsPage = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });

  const loadMovements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMovementRecords(filters);
      setMovements(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading movements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovements(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleMarkReturn = (movement) => {
    setSelectedMovement(movement);
    setShowReturnDialog(true);
  };

  const handleReturnSubmit = async () => {
    try {
      await updateMovementRecord(selectedMovement.id, {
        actualReturn: new Date().toISOString(),
        status: 'returned'
      });
      setShowReturnDialog(false);
      setSelectedMovement(null);
      await loadMovements();
    } catch (err) {
      alert('Error marking return: ' + err.message);
    }
  };

  const getStatusBadge = (movement) => {
    if (movement.status === 'returned') {
      return <span className="badge badge-success">Returned</span>;
    }

    const expectedReturn = new Date(movement.expectedReturn);
    const now = new Date();

    if (now > expectedReturn) {
      return <span className="badge badge-overdue">Overdue</span>;
    }

    return <span className="badge badge-warning">Out</span>;
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <AdminHeader title="In/Out Register" />
      <div className="admin-content">
        <div className="page-header">
          <h1 className="page-title">In/Out Register</h1>
          <p className="page-subtitle">Track student movement records</p>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search by name or USN..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <select
            className="form-select"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="out">Currently Out</option>
            <option value="returned">Returned</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <div className="card">
            <div className="card-content">
              <div className="empty-state">
                <p className="empty-state-title">Error loading records</p>
                <p>{error}</p>
                <button className="btn btn-primary" onClick={loadMovements} style={{ marginTop: '1rem' }}>
                  Retry
                </button>
              </div>
            </div>
          </div>
        ) : movements.length === 0 ? (
          <div className="card">
            <div className="card-content">
              <div className="empty-state">
                <p className="empty-state-title">No movement records found</p>
                <p>Try adjusting your filters.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>USN</th>
                  <th>Room</th>
                  <th>Departure</th>
                  <th>Expected Return</th>
                  <th>Actual Return</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id}>
                    <td>
                      <div style={{ fontWeight: '500' }}>{movement.studentName}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))' }}>
                        {movement.hostel}
                      </div>
                    </td>
                    <td>{movement.usn}</td>
                    <td>{movement.room}</td>
                    <td>{formatDateTime(movement.departureTime)}</td>
                    <td>{formatDateTime(movement.expectedReturn)}</td>
                    <td>{movement.actualReturn ? formatDateTime(movement.actualReturn) : '-'}</td>
                    <td>{movement.reason}</td>
                    <td>{getStatusBadge(movement)}</td>
                    <td>
                      {movement.status === 'out' && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleMarkReturn(movement)}
                        >
                          Mark Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Return Dialog */}
      {showReturnDialog && selectedMovement && (
        <div className="dialog-overlay" onClick={() => setShowReturnDialog(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">Mark Return</h2>
            </div>
            <div className="dialog-body">
              <p>Confirm return for <strong>{selectedMovement.studentName}</strong>?</p>
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'hsl(var(--muted))', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}>
                <div>Room: {selectedMovement.room}</div>
                <div>Expected: {formatDateTime(selectedMovement.expectedReturn)}</div>
                <div>Current Time: {new Date().toLocaleString('en-IN')}</div>
              </div>
            </div>
            <div className="dialog-footer">
              <button className="btn btn-secondary" onClick={() => setShowReturnDialog(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleReturnSubmit}>
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MovementsPage;
