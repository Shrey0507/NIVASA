const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  }
};

const RecentActivity = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Activity</h3>
        </div>
        <div className="card-content">
          <div className="empty-state">
            <p className="empty-state-title">No recent activity</p>
          </div>
        </div>
      </div>
    );
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'registration': return '👤';
      case 'allocation': return '🏠';
      case 'fee': return '💰';
      case 'movement': return '🚪';
      case 'grievance': return '📝';
      default: return '📋';
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Recent Activity</h3>
        <p className="card-description">Latest updates across the hostel</p>
      </div>
      <div className="card-content">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {activities.map((activity) => (
            <div key={activity.id} style={{
              display: 'flex',
              gap: '1rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid hsl(var(--border))'
            }}>
              <div style={{ fontSize: '1.5rem' }}>{getActivityIcon(activity.type)}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  {activity.message}
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))' }}>
                  {formatDateTime(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
