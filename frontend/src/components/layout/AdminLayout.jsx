import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import PageTransition from './PageTransition';

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </div>
    </div>
  );
};

export default AdminLayout;
