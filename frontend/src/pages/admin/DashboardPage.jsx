import { useState, useEffect } from 'react';
import AdminHeader from '../../components/layout/AdminHeader';
import StatCard from '../../components/dashboard/StatCard';
import OccupancyOverview from '../../components/dashboard/OccupancyOverview';
import RecentActivity from '../../components/dashboard/RecentActivity';
import PendingActions from '../../components/dashboard/PendingActions';
import NoticesPreview from '../../components/dashboard/NoticesPreview';
import {
  getDashboardStats,
  getOccupancyData,
  getRecentActivity,
  getPendingActions,
  getNoticesPreview
} from '../../services/adminService';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [occupancyData, setOccupancyData] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingActions, setPendingActions] = useState(null);
  const [notices, setNotices] = useState([]);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, occupancyDataBoys, occupancyDataGirls, activityData, actionsData, noticesData] = await Promise.all([
        getDashboardStats(),
        getOccupancyData('boys'),
        getOccupancyData('girls'),
        getRecentActivity(),
        getPendingActions(),
        getNoticesPreview()
      ]);

      setStats(statsData);
      setOccupancyData({ boys: occupancyDataBoys, girls: occupancyDataGirls });
      setRecentActivity(activityData);
      setPendingActions(actionsData);
      setNotices(noticesData);
    } catch (err) {
      setError(err.message);
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  if (loading) {
    return (
      <>
        <AdminHeader title="Dashboard" />
        <div className="admin-content">
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <AdminHeader title="Dashboard" />
        <div className="admin-content">
          <div className="card">
            <div className="card-content">
              <div className="empty-state">
                <p className="empty-state-title">Error loading dashboard</p>
                <p>{error}</p>
                <button className="btn btn-primary" onClick={loadDashboardData} style={{ marginTop: '1rem' }}>
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader title="Dashboard" />
      <div className="admin-content">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Here's what's happening across your hostel.</p>
        </div>

        {/* Statistics Cards */}
        <div className="stat-cards-grid">
          <StatCard
            title="Total Students"
            value={stats?.totalStudents || 0}
            description="Current registered residents"
            icon="👥"
          />
          <StatCard
            title="Room Occupancy"
            value={`${stats?.roomOccupancy?.percentage?.toFixed(1) || 0}%`}
            description={`${stats?.roomOccupancy?.occupied || 0} / ${stats?.roomOccupancy?.total || 0} beds occupied`}
            icon="🏠"
          />
          <StatCard
            title="Pending Fees"
            value={`₹${(stats?.pendingFees || 0).toLocaleString('en-IN')}`}
            description="Outstanding balance"
            icon="💰"
          />
          <StatCard
            title="Open Grievances"
            value={stats?.openGrievances || 0}
            description="Unresolved complaints"
            icon="📝"
          />
        </div>

        {/* Occupancy Overview */}
        <div style={{ marginBottom: '2rem' }}>
          <OccupancyOverview occupancyData={occupancyData} />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-2" style={{ marginBottom: '2rem' }}>
          <RecentActivity activities={recentActivity} />
          <PendingActions pendingData={pendingActions} />
        </div>

        {/* Notices Preview */}
        <NoticesPreview notices={notices} />
      </div>
    </>
  );
};

export default DashboardPage;
