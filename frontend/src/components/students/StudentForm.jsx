import { useState, useEffect } from 'react';
import { createStudent, updateStudent } from '../../services/adminService';

const StudentForm = ({ student, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    usn: '',
    department: '',
    class: '',
    semester: '',
    email: '',
    phone: '',
    guardianName: '',
    guardianPhone: '',
    hostelType: 'boys',
    room: '',
    floor: '',
    block: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({ // eslint-disable-line react-hooks/set-state-in-effect
        fullName: student.fullName || '',
        usn: student.usn || '',
        department: student.department || '',
        class: student.class || '',
        semester: student.semester || '',
        email: student.email || '',
        phone: student.phone || '',
        guardianName: student.guardianName || '',
        guardianPhone: student.guardianPhone || '',
        hostelType: student.hostelType || 'boys',
        room: student.room || '',
        floor: student.floor || '',
        block: student.block || ''
      });
    }
  }, [student]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.usn.trim()) {
      newErrors.usn = 'USN is required';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.guardianName.trim()) {
      newErrors.guardianName = 'Guardian name is required';
    }

    if (!formData.guardianPhone.trim()) {
      newErrors.guardianPhone = 'Guardian phone is required';
    } else if (!/^[0-9]{10}$/.test(formData.guardianPhone)) {
      newErrors.guardianPhone = 'Phone number must be 10 digits';
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

      if (student) {
        await updateStudent(student.id, formData);
      } else {
        await createStudent(formData);
      }

      onClose(true); // Pass true to indicate success
    } catch (err) {
      alert('Error saving student: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dialog-overlay" onClick={() => onClose(false)}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2 className="dialog-title">
            {student ? 'Edit Student' : 'Add New Student'}
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="dialog-body">
            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                />
                {errors.fullName && <div className="form-error">{errors.fullName}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">USN *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.usn}
                  onChange={(e) => handleChange('usn', e.target.value.toUpperCase())}
                  placeholder="1MS22CS001"
                />
                {errors.usn && <div className="form-error">{errors.usn}</div>}
              </div>
            </div>

            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Department *</label>
                <select
                  className="form-select"
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="Electrical">Electrical</option>
                </select>
                {errors.department && <div className="form-error">{errors.department}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Class / Year</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.class}
                  onChange={(e) => handleChange('class', e.target.value)}
                  placeholder="3rd Year"
                />
              </div>
            </div>

            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="student@sjbit.edu.in"
                />
                {errors.email && <div className="form-error">{errors.email}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="9876543210"
                />
                {errors.phone && <div className="form-error">{errors.phone}</div>}
              </div>
            </div>

            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Guardian Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.guardianName}
                  onChange={(e) => handleChange('guardianName', e.target.value)}
                />
                {errors.guardianName && <div className="form-error">{errors.guardianName}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Guardian Phone *</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.guardianPhone}
                  onChange={(e) => handleChange('guardianPhone', e.target.value)}
                  placeholder="9876543210"
                />
                {errors.guardianPhone && <div className="form-error">{errors.guardianPhone}</div>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Hostel Type *</label>
              <select
                className="form-select"
                value={formData.hostelType}
                onChange={(e) => handleChange('hostelType', e.target.value)}
              >
                <option value="boys">Boys Hostel</option>
                <option value="girls">Girls Hostel</option>
              </select>
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))', marginTop: '1rem' }}>
              Room assignment is managed through the Room Allocation module.
            </p>
          </div>

          <div className="dialog-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onClose(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : student ? 'Update Student' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;
