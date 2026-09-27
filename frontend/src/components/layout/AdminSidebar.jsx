import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', path: '/admin', icon: '📊' },
    { name: 'Student Management', path: '/admin/students', icon: '👥' },
    { name: 'Room Allocation', path: '/admin/rooms', icon: '🏠' },
    { name: 'Fee Management', path: '/admin/fees', icon: '💰' },
    { name: 'Mess Management', path: '/admin/mess', icon: '🍽️' },
    { name: 'In/Out Register', path: '/admin/movements', icon: '🚪' },
    { name: 'Grievances', path: '/admin/grievances', icon: '📝' },
    { name: 'Notices', path: '/admin/notices', icon: '📢' },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavClick = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle sidebar"
        aria-expanded={isMobileOpen}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {/* Sidebar Backdrop for Mobile */}
      {isMobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isMobileOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/admin" className="admin-sidebar-logo">
            NIVASA
          </Link>
        </div>

        <nav className="admin-sidebar-nav">
          {navigation.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-sidebar-nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <span style={{ fontSize: '1.125rem' }}>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div style={{ padding: '0.5rem', fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Admin User</div>
            <button
              className="btn btn-ghost btn-sm"
              style={{ width: '100%', marginTop: '0.5rem' }}
              onClick={() => console.log('Sign out clicked')}
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 2.5rem;
            height: 2.5rem;
            padding: 0;
            border: 1px solid hsl(var(--border));
            border-radius: var(--radius);
            background-color: hsl(var(--card));
            color: hsl(var(--foreground));
            cursor: pointer;
            position: fixed;
            top: 1rem;
            left: 1rem;
            z-index: 60;
            transition: all 0.2s ease;
          }

          .mobile-menu-toggle:hover {
            background-color: hsl(var(--muted));
          }

          .sidebar-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 30;
          }

          .admin-sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }

          .admin-sidebar.open {
            transform: translateX(0);
          }
        }

        @media (min-width: 769px) {
          .mobile-menu-toggle,
          .sidebar-backdrop {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default AdminSidebar;
