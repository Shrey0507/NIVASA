import { useState, useEffect } from 'react';
import AdminHeader from '../../components/layout/AdminHeader';
import { getMessMenu, createMessMenu, updateMessMenu, deleteMessMenu } from '../../services/adminService';

const MessPage = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const loadMenus = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMessMenu();
      setMenus(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading mess menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenus(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const handleAddMenu = () => {
    setSelectedMenu(null);
    setShowForm(true);
  };

  const handleEditMenu = (menu) => {
    setSelectedMenu(menu);
    setShowForm(true);
  };

  const handleDeleteMenu = async (menu) => {
    if (!window.confirm(`Delete menu for ${menu.date}?`)) {
      return;
    }

    try {
      await deleteMessMenu(menu.id);
      await loadMenus();
    } catch (err) {
      alert('Error deleting menu: ' + err.message);
    }
  };

  const handleFormClose = (updated) => {
    setShowForm(false);
    setSelectedMenu(null);
    if (updated) {
      loadMenus();
    }
  };

  const filteredMenus = menus.filter(m => !selectedDate || m.date === selectedDate);

  return (
    <>
      <AdminHeader title="Mess Management" />
      <div className="admin-content">
        <div className="actions-bar">
          <h1 className="page-title">Mess Management</h1>
          <button className="btn btn-primary" onClick={handleAddMenu}>
            + Add Menu
          </button>
        </div>

        <div className="filters-bar">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Select Date</label>
            <input
              type="date"
              className="form-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <div className="card">
            <div className="card-content">
              <div className="empty-state">
                <p className="empty-state-title">Error loading menu</p>
                <p>{error}</p>
                <button className="btn btn-primary" onClick={loadMenus} style={{ marginTop: '1rem' }}>
                  Retry
                </button>
              </div>
            </div>
          </div>
        ) : filteredMenus.length === 0 ? (
          <div className="card">
            <div className="card-content">
              <div className="empty-state">
                <p className="empty-state-title">No menu for this date</p>
                <p>Add a menu to get started.</p>
              </div>
            </div>
          </div>
        ) : (
          filteredMenus.map((menu) => (
            <div key={menu.id} className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 className="card-title">{menu.day}, {new Date(menu.date).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</h3>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleEditMenu(menu)}>
                    Edit
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteMenu(menu)} style={{ color: 'hsl(var(--destructive))' }}>
                    Delete
                  </button>
                </div>
              </div>
              <div className="card-content">
                <div className="grid grid-cols-2">
                  <MealCard title="Breakfast" meal={menu.breakfast} />
                  <MealCard title="Lunch" meal={menu.lunch} />
                  <MealCard title="Snacks" meal={menu.snacks} />
                  <MealCard title="Dinner" meal={menu.dinner} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <MenuForm menu={selectedMenu} onClose={handleFormClose} />
      )}
    </>
  );
};

const MealCard = ({ title, meal }) => (
  <div style={{ padding: '1rem', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}>
    <h4 style={{ fontSize: '0.9375rem', fontWeight: '600', marginBottom: '0.5rem' }}>{title}</h4>
    <div style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }}>
      {meal.time}
    </div>
    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
      {meal.items.map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  </div>
);

const MenuForm = ({ menu, onClose }) => {
  const [formData, setFormData] = useState({
    date: '',
    day: '',
    breakfast: { items: [''], time: '7:00 AM - 9:00 AM' },
    lunch: { items: [''], time: '12:00 PM - 2:00 PM' },
    snacks: { items: [''], time: '4:00 PM - 5:00 PM' },
    dinner: { items: [''], time: '7:00 PM - 9:00 PM' }
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (menu) {
      setFormData({ // eslint-disable-line react-hooks/set-state-in-effect
        date: menu.date,
        day: menu.day,
        breakfast: menu.breakfast,
        lunch: menu.lunch,
        snacks: menu.snacks,
        dinner: menu.dinner
      });
    } else {
      setFormData(prev => ({ ...prev, date: new Date().toISOString().split('T')[0] }));
    }
  }, [menu]);

  const updateMealItems = (meal, items) => {
    setFormData(prev => ({
      ...prev,
      [meal]: { ...prev[meal], items: items.filter(i => i.trim()) }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.date || !formData.day) {
      alert('Please fill in date and day');
      return;
    }

    try {
      setSubmitting(true);

      if (menu) {
        await updateMessMenu(menu.id, formData);
      } else {
        await createMessMenu(formData);
      }

      onClose(true);
    } catch (err) {
      alert('Error saving menu: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dialog-overlay" onClick={() => onClose(false)}>
      <div className="dialog-content" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2 className="dialog-title">{menu ? 'Edit Menu' : 'Add Menu'}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="dialog-body">
            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Day *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.day}
                  onChange={(e) => setFormData(prev => ({ ...prev, day: e.target.value }))}
                  placeholder="Monday"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Breakfast Items (comma separated)</label>
              <textarea
                className="form-textarea"
                value={formData.breakfast.items.join(', ')}
                onChange={(e) => updateMealItems('breakfast', e.target.value.split(','))}
                rows="2"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lunch Items (comma separated)</label>
              <textarea
                className="form-textarea"
                value={formData.lunch.items.join(', ')}
                onChange={(e) => updateMealItems('lunch', e.target.value.split(','))}
                rows="2"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Snacks Items (comma separated)</label>
              <textarea
                className="form-textarea"
                value={formData.snacks.items.join(', ')}
                onChange={(e) => updateMealItems('snacks', e.target.value.split(','))}
                rows="2"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Dinner Items (comma separated)</label>
              <textarea
                className="form-textarea"
                value={formData.dinner.items.join(', ')}
                onChange={(e) => updateMealItems('dinner', e.target.value.split(','))}
                rows="2"
              />
            </div>
          </div>
          <div className="dialog-footer">
            <button type="button" className="btn btn-secondary" onClick={() => onClose(false)} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : menu ? 'Update Menu' : 'Add Menu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessPage;
