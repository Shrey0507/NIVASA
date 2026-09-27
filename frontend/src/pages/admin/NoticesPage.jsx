import { useState, useEffect } from 'react';
import AdminHeader from '../../components/layout/AdminHeader';
import { getNotices, createNotice, updateNotice, deleteNotice } from '../../services/adminService';

const NoticesPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    audience: ''
  });

  const loadNotices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotices(filters);
      setNotices(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleAddNotice = () => {
    setSelectedNotice(null);
    setShowForm(true);
  };

  const handleEditNotice = (notice) => {
    setSelectedNotice(notice);
    setShowForm(true);
  };

  const handleDeleteNotice = async (notice) => {
    if (!window.confirm(`Delete notice "${notice.title}"?`)) {
      return;
    }

    try {
      await deleteNotice(notice.id);
      await loadNotices();
    } catch (err) {
      alert('Error deleting notice: ' + err.message);
    }
  };

  const handleFormClose = (updated) => {
    setShowForm(false);
    setSelectedNotice(null);
    if (updated) {
      loadNotices();
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return <span className="badge badge-success">Published</span>;
      case 'draft':
        return <span className="badge badge-default">Draft</span>;
      default:
        return <span className="badge badge-default">{status}</span>;
    }
  };

  const getAudienceBadge = (audience) => {
    switch (audience) {
      case 'all':
        return <span className="badge badge-default">All Students</span>;
      case 'boys':
        return <span className="badge badge-default">Boys Hostel</span>;
      case 'girls':
        return <span className="badge badge-default">Girls Hostel</span>;
      default:
        return null;
    }
  };

  return (
    <>
      <AdminHeader title="Notices & Announcements" />
      <div className="admin-content">
        <div className="actions-bar">
          <h1 className="page-title">Notices & Announcements</h1>
          <button className="btn btn-primary" onClick={handleAddNotice}>
            + Create Notice
          </button>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search notices..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <select
            className="form-select"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <select
            className="form-select"
            value={filters.audience}
            onChange={(e) => handleFilterChange('audience', e.target.value)}
          >
            <option value="">All Audience</option>
            <option value="all">All Students</option>
            <option value="boys">Boys Hostel</option>
            <option value="girls">Girls Hostel</option>
          </select>
        </div>

        {/* Notices List */}
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <div className="card">
            <div className="card-content">
              <div className="empty-state">
                <p className="empty-state-title">Error loading notices</p>
                <p>{error}</p>
                <button className="btn btn-primary" onClick={loadNotices} style={{ marginTop: '1rem' }}>
                  Retry
                </button>
              </div>
            </div>
          </div>
        ) : notices.length === 0 ? (
          <div className="card">
            <div className="card-content">
              <div className="empty-state">
                <p className="empty-state-title">No notices found</p>
                <p>Create your first notice to get started.</p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notices.map((notice) => (
              <div key={notice.id} className="card">
                <div className="card-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
                          {notice.title}
                        </h3>
                        {getStatusBadge(notice.status)}
                        {getAudienceBadge(notice.audience)}
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.75rem', lineHeight: '1.6' }}>
                        {notice.body}
                      </p>
                      <div style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))' }}>
                        Published: {new Date(notice.publishDate).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                        {notice.expiryDate && ` • Expires: ${new Date(notice.expiryDate).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}`}
                        {notice.author && ` • By: ${notice.author}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleEditNotice(notice)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleDeleteNotice(notice)}
                        style={{ color: 'hsl(var(--destructive))' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notice Form Dialog */}
      {showForm && (
        <NoticeForm notice={selectedNotice} onClose={handleFormClose} />
      )}
    </>
  );
};

const NoticeForm = ({ notice, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    audience: 'all',
    expiryDate: '',
    status: 'published'
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (notice) {
      setFormData({ // eslint-disable-line react-hooks/set-state-in-effect
        title: notice.title,
        body: notice.body,
        audience: notice.audience,
        expiryDate: notice.expiryDate || '',
        status: notice.status
      });
    }
  }, [notice]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.body.trim()) {
      newErrors.body = 'Body is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);

      if (notice) {
        await updateNotice(notice.id, formData);
      } else {
        await createNotice(formData);
      }

      onClose(true);
    } catch (err) {
      alert('Error saving notice: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dialog-overlay" onClick={() => onClose(false)}>
      <div className="dialog-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2 className="dialog-title">{notice ? 'Edit Notice' : 'Create Notice'}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="dialog-body">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                type="text"
                className="form-input"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Notice title"
              />
              {errors.title && <div className="form-error">{errors.title}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Body *</label>
              <textarea
                className="form-textarea"
                value={formData.body}
                onChange={(e) => handleChange('body', e.target.value)}
                placeholder="Notice content..."
                rows="6"
              />
              {errors.body && <div className="form-error">{errors.body}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Audience *</label>
              <select
                className="form-select"
                value={formData.audience}
                onChange={(e) => handleChange('audience', e.target.value)}
              >
                <option value="all">All Students</option>
                <option value="boys">Boys Hostel</option>
                <option value="girls">Girls Hostel</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Expiry Date (Optional)</label>
              <input
                type="date"
                className="form-input"
                value={formData.expiryDate}
                onChange={(e) => handleChange('expiryDate', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status *</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
          <div className="dialog-footer">
            <button type="button" className="btn btn-secondary" onClick={() => onClose(false)} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : notice ? 'Update Notice' : 'Create Notice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoticesPage;
