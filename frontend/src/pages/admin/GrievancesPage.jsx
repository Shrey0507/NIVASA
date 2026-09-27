import { useState, useEffect } from 'react';
import AdminHeader from '../../components/layout/AdminHeader';
import { getGrievances, getGrievanceById, updateGrievanceStatus, addGrievanceResponse } from '../../services/adminService';

const GrievancesPage = () => {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    priority: ''
  });

  const loadGrievances = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getGrievances(filters);
      setGrievances(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading grievances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGrievances(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleViewDetails = async (grievance) => {
    try {
      const fullGrievance = await getGrievanceById(grievance.id);
      setSelectedGrievance(fullGrievance);
      setShowDetailDialog(true);
    } catch (err) {
      alert('Error loading grievance details: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <span className="badge badge-warning">Open</span>;
      case 'in_progress':
        return <span className="badge badge-default">In Progress</span>;
      case 'resolved':
        return <span className="badge badge-success">Resolved</span>;
      default:
        return <span className="badge badge-default">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <span className="badge badge-destructive">High</span>;
      case 'medium':
        return <span className="badge badge-warning">Medium</span>;
      case 'low':
        return <span className="badge badge-default">Low</span>;
      default:
        return null;
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <AdminHeader title="Grievances" />
      <div className="admin-content">
        <div className="page-header">
          <h1 className="page-title">Grievances</h1>
          <p className="page-subtitle">Manage student complaints and issues</p>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search by student or subject..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <select
            className="form-select"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            className="form-select"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Mess">Mess</option>
            <option value="Security">Security</option>
          </select>
          <select
            className="form-select"
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          >
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
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
                <p className="empty-state-title">Error loading grievances</p>
                <p>{error}</p>
                <button className="btn btn-primary" onClick={loadGrievances} style={{ marginTop: '1rem' }}>
                  Retry
                </button>
              </div>
            </div>
          </div>
        ) : grievances.length === 0 ? (
          <div className="card">
            <div className="card-content">
              <div className="empty-state">
                <p className="empty-state-title">No grievances found</p>
                <p>Try adjusting your filters.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Category</th>
                  <th>Subject</th>
                  <th>Submitted</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {grievances.map((grievance) => (
                  <tr key={grievance.id}>
                    <td>#{grievance.id}</td>
                    <td>
                      <div style={{ fontWeight: '500' }}>{grievance.studentName}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))' }}>
                        {grievance.usn}
                      </div>
                    </td>
                    <td>{grievance.category}</td>
                    <td>{grievance.subject}</td>
                    <td>{formatDateTime(grievance.submittedDate)}</td>
                    <td>{getPriorityBadge(grievance.priority)}</td>
                    <td>{getStatusBadge(grievance.status)}</td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleViewDetails(grievance)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      {showDetailDialog && selectedGrievance && (
        <GrievanceDetailDialog
          grievance={selectedGrievance}
          onClose={(updated) => {
            setShowDetailDialog(false);
            setSelectedGrievance(null);
            if (updated) loadGrievances();
          }}
        />
      )}
    </>
  );
};

const GrievanceDetailDialog = ({ grievance, onClose }) => {
  const [status, setStatus] = useState(grievance.status);
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleUpdateStatus = async () => {
    try {
      setSubmitting(true);
      await updateGrievanceStatus(grievance.id, status);
      onClose(true);
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddResponse = async () => {
    if (!response.trim()) {
      alert('Please enter a response');
      return;
    }

    try {
      setSubmitting(true);
      await addGrievanceResponse(grievance.id, response);
      onClose(true);
    } catch (err) {
      alert('Error adding response: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dialog-overlay" onClick={() => onClose(false)}>
      <div className="dialog-content" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2 className="dialog-title">Grievance #{grievance.id}</h2>
        </div>
        <div className="dialog-body">
          {/* Student Info */}
          <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'hsl(var(--muted))', borderRadius: 'var(--radius)' }}>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{grievance.studentName} ({grievance.usn})</div>
            <div style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
              {grievance.category} • Submitted: {new Date(grievance.submittedDate).toLocaleDateString('en-IN')}
            </div>
          </div>

          {/* Complaint */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              {grievance.subject}
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', lineHeight: '1.6' }}>
              {grievance.description}
            </p>
          </div>

          {/* Responses */}
          {grievance.responses && grievance.responses.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: '600', marginBottom: '0.75rem' }}>Responses</h4>
              {grievance.responses.map((resp) => (
                <div key={resp.id} style={{
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  backgroundColor: 'hsl(var(--muted))',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.875rem'
                }}>
                  <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{resp.respondent}</div>
                  <div style={{ marginBottom: '0.5rem' }}>{resp.message}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))' }}>
                    {new Date(resp.timestamp).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Status Update */}
          <div className="form-group">
            <label className="form-label">Update Status</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Add Response */}
          <div className="form-group">
            <label className="form-label">Add Response</label>
            <textarea
              className="form-textarea"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Enter your response..."
              rows="4"
            />
          </div>
        </div>
        <div className="dialog-footer">
          <button className="btn btn-secondary" onClick={() => onClose(false)} disabled={submitting}>
            Close
          </button>
          <button className="btn btn-primary" onClick={handleUpdateStatus} disabled={submitting}>
            Update Status
          </button>
          <button className="btn btn-primary" onClick={handleAddResponse} disabled={submitting || !response.trim()}>
            Add Response
          </button>
        </div>
      </div>
    </div>
  );
};

export default GrievancesPage;
