import { useState, useEffect, useCallback } from 'react';
import AdminHeader from '../../components/layout/AdminHeader';
import StudentForm from '../../components/students/StudentForm';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { getStudents, deleteStudent } from '../../services/adminService';

const DEPARTMENTS = [
  'Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical',
];

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    hostel: '',
    department: '',
    status: '',
  });

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStudents(filters);
      setStudents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadStudents(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [loadStudents]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setShowForm(true);
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setShowForm(true);
  };

  const handleDeleteClick = (student) => {
    setDeleteTarget(student);
    setDeleteError('');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      setDeleteError('');
      await deleteStudent(deleteTarget.id);
      setDeleteTarget(null);
      await loadStudents();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleFormClose = (updated) => {
    setShowForm(false);
    setSelectedStudent(null);
    if (updated) loadStudents();
  };

  const getStatusBadge = (status) => {
    if (status === 'active') return <span className="badge badge-success">Active</span>;
    return <span className="badge badge-default">Inactive</span>;
  };

  return (
    <>
      <AdminHeader title="Students" />
      <div className="admin-content">
        <div className="actions-bar">
          <div>
            <h1 className="page-title">Students</h1>
            {!loading && !error && (
              <p className="page-subtitle">{students.length} resident{students.length !== 1 ? 's' : ''} found</p>
            )}
          </div>
          <button className="btn btn-primary" onClick={handleAddStudent}>
            Add Student
          </button>
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
            value={filters.hostel}
            onChange={(e) => handleFilterChange('hostel', e.target.value)}
          >
            <option value="">All Hostels</option>
            <option value="boys">Boys Hostel</option>
            <option value="girls">Girls Hostel</option>
          </select>
          <select
            className="form-select"
            value={filters.department}
            onChange={(e) => handleFilterChange('department', e.target.value)}
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select
            className="form-select"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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
                <p className="empty-state-title">Failed to load students</p>
                <p>{error}</p>
                <button className="btn btn-primary" onClick={loadStudents} style={{ marginTop: '1rem' }}>
                  Retry
                </button>
              </div>
            </div>
          </div>
        ) : students.length === 0 ? (
          <div className="card">
            <div className="card-content">
              <div className="empty-state">
                <p className="empty-state-title">No students found</p>
                <p>Try adjusting your filters or add a new student.</p>
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
                  <th>Department</th>
                  <th>Year</th>
                  <th>Contact</th>
                  <th>Room</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div style={{ fontWeight: '500', lineHeight: '1.3' }}>{student.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.125rem' }}>
                        {student.hostelType === 'boys' ? 'Boys Hostel' : 'Girls Hostel'}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{student.usn}</td>
                    <td>{student.department}</td>
                    <td>{student.class || '-'}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{student.phone}</td>
                    <td>{student.room || <span style={{ color: 'hsl(var(--muted-foreground))' }}>Unassigned</span>}</td>
                    <td>{getStatusBadge(student.status)}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleEditStudent(student)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-ghost btn-sm btn-danger-ghost"
                          onClick={() => handleDeleteClick(student)}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <StudentForm
          student={selectedStudent}
          onClose={handleFormClose}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Remove Student"
          description={
            <>
              <p>You are about to permanently remove <strong>{deleteTarget.fullName}</strong> ({deleteTarget.usn}) from the system.</p>
              <p style={{ marginTop: '0.75rem' }}>This action cannot be undone. All associated records will remain, but this student will no longer have access.</p>
            </>
          }
          confirmLabel="Remove Student"
          variant="destructive"
          loading={deleting}
          error={deleteError}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
};

export default StudentsPage;
