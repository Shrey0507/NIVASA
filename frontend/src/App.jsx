import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/theme/ThemeProvider';
import AdminLayout from './components/layout/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import StudentsPage from './pages/admin/StudentsPage';
import RoomsPage from './pages/admin/RoomsPage';
import FeesPage from './pages/admin/FeesPage';
import MessPage from './pages/admin/MessPage';
import MovementsPage from './pages/admin/MovementsPage';
import GrievancesPage from './pages/admin/GrievancesPage';
import NoticesPage from './pages/admin/NoticesPage';
import CredentialsPage from './pages/admin/CredentialsPage';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="rooms" element={<RoomsPage />} />
            <Route path="fees" element={<FeesPage />} />
            <Route path="mess" element={<MessPage />} />
            <Route path="movements" element={<MovementsPage />} />
            <Route path="grievances" element={<GrievancesPage />} />
            <Route path="notices" element={<NoticesPage />} />
            <Route path="credentials" element={<CredentialsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
