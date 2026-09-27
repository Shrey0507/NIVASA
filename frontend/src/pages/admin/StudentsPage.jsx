import { useState, useEffect } from 'react';
import AdminHeader from '../../components/layout/AdminHeader';
import StudentForm from '../../components/students/StudentForm';
import { getStudents, deleteStudent } from '../../services/adminService';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    hostel: '',
    department: '',
    status: '',
    floor: '',
    block: ''
  });

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStudents(filters);
      setStudents(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleDeleteStudent = async (student) => {
    if (!window.confirm(`Are you sure you want to delete ${student.fullName}?`)) {
      return;
    }

    try {
      await deleteStudent(student.id);
      await loadStudents();
    } catch (err) {
      alert('Error deleting student: ' + err.message);
    }
  };

  const handleFormClose = (updated) => {
    setShowForm(false);
    setSelectedStudent(null);
    if (updated) {
      loadStudents();
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-success">Active</span>;
      case 'inactive':
        return <span className="badge badge-default">Inactive</span>;
      default:
        return <span className="badge badge-default">{status}</span>;
    }
  };

  return (
    <>
      <AdminHeader title="Student Management" />
      <div className="admin-content">
        <div className="actions-bar">
          <h1 className="page-title">Student Management</h1>
          <button className="btn btn-primary" onClick={handleAddStudent}>
            + Add Student
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
            <option value="Computer Science">Computer Science</option>
            <option value="Electronics">Electronics</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Civil">Civil</option>
            <option value="Electrical">Electrical</option>
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
                <p className="empty-state-title">Error loading students</p>
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
                  <th>Class</th>
                  <th>Contact</th>
                  <th>Room</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div style={{ fontWeight: '500' }}>{student.fullName}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))' }}>
                        {student.hostelType === 'boys' ? 'Boys Hostel' : 'Girls Hostel'}
                      </div>
                    </td>
                    <td>{student.usn}</td>
                    <td>{student.department}</td>
                    <td>{student.class}</td>
                    <td>{student.phone}</td>
                    <td>{student.room || '-'}</td>
                    <td>{getStatusBadge(student.status)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleEditStudent(student)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleDeleteStudent(student)}
                          style={{ color: 'hsl(var(--destructive))' }}
                        >
                          Delete
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

      {/* Student Form Dialog */}
      {showForm && (
        <StudentForm
          student={selectedStudent}
          onClose={handleFormClose}
        />
      )}
    </>
  );
};

export default StudentsPage;
