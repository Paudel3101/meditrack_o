import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';

const STATUS_COLORS = {
  scheduled: '#0891b2',
  completed: '#16a34a',
  cancelled: '#dc2626',
  'no-show': '#d97706',
};

function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, recentRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentAppointments(),
      ]);
      setStats(statsRes.data.data);
      setRecentAppointments(recentRes.data.data || []);
    } catch (err) {
      setError('Failed to load dashboard data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {/* Welcome banner */}
      <div style={styles.banner}>
        <div>
          <h1 style={styles.bannerTitle}>
            Welcome back, {user?.first_name || 'User'}
          </h1>
          <p style={styles.bannerSub}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
        <span style={styles.roleChip}>{user?.role}</span>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats grid */}
      <div style={styles.statsGrid}>
        <StatCard
          title="Total Patients"
          value={stats?.total_patients}
          subtitle="All records"
          color="#2563eb"
        />
        <StatCard
          title="Today's Appointments"
          value={stats?.appointments_today}
          subtitle="Scheduled for today"
          color="#0891b2"
        />
        <StatCard
          title="Total Appointments"
          value={stats?.total_appointments}
          subtitle="All time"
          color="#7c3aed"
        />
        <StatCard
          title="Staff Members"
          value={stats?.total_staff}
          subtitle="Active staff"
          color="#059669"
        />
      </div>

      {/* Quick actions */}
      <div style={styles.sectionHeader}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Quick Actions</h2>
      </div>
      <div style={styles.actionsGrid}>
        <Link to="/patients" className="btn btn-primary">
          View Patients
        </Link>
        <Link to="/appointments" className="btn btn-secondary">
          View Appointments
        </Link>
      </div>

      {/* Recent appointments */}
      <div style={{ ...styles.sectionHeader, marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Recent Appointments</h2>
        <Link to="/appointments" style={styles.viewAll}>View all</Link>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {recentAppointments.length === 0 ? (
          <div className="empty-state">
            <strong>No recent appointments</strong>
            <p>Appointments will appear here once scheduled.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Doctor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map((appt) => (
                  <tr key={appt.id}>
                    <td className="font-medium">{appt.patient_name || `#${appt.patient_id}`}</td>
                    <td>{appt.appointment_date ? new Date(appt.appointment_date).toLocaleDateString() : '—'}</td>
                    <td>{appt.appointment_time || '—'}</td>
                    <td>{appt.doctor_name || '—'}</td>
                    <td>
                      <span
                        className={`badge badge-${appt.status}`}
                      >
                        {appt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  banner: {
    background: 'linear-gradient(135deg, #1e40af, #2563eb)',
    color: 'white',
    borderRadius: '12px',
    padding: '1.5rem 2rem',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'white',
    marginBottom: '0.25rem',
  },
  bannerSub: {
    fontSize: '0.875rem',
    color: 'rgba(255,255,255,0.8)',
  },
  roleChip: {
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.3)',
    color: 'white',
    padding: '0.375rem 0.875rem',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
  },
  viewAll: {
    fontSize: '0.875rem',
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 500,
  },
  actionsGrid: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
};

export default DashboardPage;
