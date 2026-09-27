import { useState, useEffect } from 'react';
import AdminHeader from '../../components/layout/AdminHeader';
import { getFeeRecords, updateFeeRecord } from '../../services/adminService';

const FeesPage = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: ''
  });

  const loadFees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFeeRecords(filters);
      setFees(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading fees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFees(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdatePayment = (fee) => {
    setSelectedFee(fee);
    setShowForm(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="badge badge-paid">Paid</span>;
      case 'partial':
        return <span className="badge badge-warning">Partial</span>;
      case 'pending':
        return <span className="badge badge-pending">Pending</span>;
      case 'overdue':
        return <span className="badge badge-overdue">Overdue</span>;
      default:
        return <span className="badge badge-default">{status}</span>;
    }
  };

  const calculateStats = () => {
    const total = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const collected = fees.reduce((sum, fee) => sum + fee.paid, 0);
    const outstanding = total - collected;
    const overdueCount = fees.filter(f => f.status === 'overdue').length;

    return { total, collected, outstanding, overdueCount };
  };

  const stats = calculateStats();

  return (
    <>
      <AdminHeader title="Fee Management" />
      <div className="admin-content">
        <div className="page-header">
          <h1 className="page-title">Fee Management</h1>
          <p className="page-subtitle">Track and manage hostel fee payments</p>
        </div>

        {/* Stats Cards */}
        <div className="stat-cards-grid">
          <div className="stat-card">
            <h3 className="stat-card-title">Total Fees</h3>
            <p className="stat-card-value">₹{stats.total.toLocaleString('en-IN')}</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-card-title">Collected</h3>
            <p className="stat-card-value">₹{stats.collected.toLocaleString('en-IN')}</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-card-title">Outstanding</h3>
            <p className="stat-card-value">₹{stats.outstanding.toLocaleString('en-IN')}</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-card-title">Overdue</h3>
            <p className="stat-card-value">{stats.overdueCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search by student name or USN..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <select
            className="form-select"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
          <select
            className="form-select"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Semester Fee">Semester Fee</option>
            <option value="Hostel Fee">Hostel Fee</option>
            <option value="Mess Fee">Mess Fee</option>
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
                <p className="empty-state-title">Error loading fees</p>
                <p>{error}</p>
                <button className="btn btn-primary" onClick={loadFees} style={{ marginTop: '1rem' }}>
                  Retry
                </button>
              </div>
            </div>
          </div>
        ) : fees.length === 0 ? (
          <div className="card">
            <div className="card-content">
              <div className="empty-state">
                <p className="empty-state-title">No fee records found</p>
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
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee) => (
                  <tr key={fee.id}>
                    <td>
                      <div style={{ fontWeight: '500' }}>{fee.studentName}</div>
                    </td>
                    <td>{fee.usn}</td>
                    <td>{fee.category}</td>
                    <td>₹{fee.amount.toLocaleString('en-IN')}</td>
                    <td>₹{fee.paid.toLocaleString('en-IN')}</td>
                    <td>₹{fee.balance.toLocaleString('en-IN')}</td>
                    <td>{new Date(fee.dueDate).toLocaleDateString('en-IN')}</td>
                    <td>{getStatusBadge(fee.status)}</td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleUpdatePayment(fee)}
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Update Dialog */}
      {showForm && selectedFee && (
        <PaymentUpdateDialog
          fee={selectedFee}
          onClose={(updated) => {
            setShowForm(false);
            setSelectedFee(null);
            if (updated) loadFees();
          }}
        />
      )}
    </>
  );
};

const PaymentUpdateDialog = ({ fee, onClose }) => {
  const [paidAmount, setPaidAmount] = useState(fee.paid);
  const [receiptNumber, setReceiptNumber] = useState(fee.receiptNumber || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (paidAmount < 0 || paidAmount > fee.amount) {
      alert('Invalid payment amount');
      return;
    }

    try {
      setSubmitting(true);
      await updateFeeRecord(fee.id, {
        ...fee,
        paid: parseFloat(paidAmount),
        receiptNumber: receiptNumber || null,
        paidDate: paidAmount > 0 ? new Date().toISOString().split('T')[0] : null
      });
      onClose(true);
    } catch (err) {
      alert('Error updating payment: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dialog-overlay" onClick={() => onClose(false)}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2 className="dialog-title">Update Payment</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="dialog-body">
            <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'hsl(var(--muted))', borderRadius: 'var(--radius)' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{fee.studentName}</div>
              <div style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
                {fee.usn} • {fee.category}
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                Total Amount: ₹{fee.amount.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Paid Amount (₹)</label>
              <input
                type="number"
                className="form-input"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                min="0"
                max={fee.amount}
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Receipt Number</label>
              <input
                type="text"
                className="form-input"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'hsl(var(--muted))', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}>
              Balance: ₹{(fee.amount - paidAmount).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="dialog-footer">
            <button type="button" className="btn btn-secondary" onClick={() => onClose(false)} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Update Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeesPage;
