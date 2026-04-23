import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Maps appointment status strings to CSS class names.
 * Centralised here so badge rendering stays consistent.
 */
const STATUS_BADGE = {
  scheduled: 'badge-scheduled',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
  'no-show': 'badge-no-show',
};

/* SVG icons for each stat card — defined outside component to avoid re-rendering */
const Icons = {
  patients: (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  todayAppts: (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  totalAppts: (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  staff: (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
};

/**
 * DashboardPage — protected page at /dashboard.
 * Fetches clinic stats and recent appointments in parallel on mount.
 */
function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /** Parallel fetch of stats + recent appointments for faster load */
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
    } catch {
      setError('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading dashboard…" />;

  return (
    <div>
      {/* ── Welcome banner ── */}
      <div style={styles.banner}>
        <div>
          <h1 style={styles.bannerTitle}>
            Good {getGreeting()}, {user?.first_name || 'User'} 👋
          </h1>
          <p style={styles.bannerSub}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
        <div style={styles.bannerRight}>
          <span style={styles.roleChip}>{user?.role}</span>
          <button onClick={fetchDashboardData} style={styles.refreshBtn} title="Refresh data">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* ── Stats grid ── */}
      <div style={styles.statsGrid}>
        <StatCard
          title="Total Patients"
          value={stats?.total_patients}
          subtitle="All records in system"
          color="#2563eb"
          icon={Icons.patients}
        />
        <StatCard
          title="Today's Appointments"
          value={stats?.appointments_today}
          subtitle="Scheduled for today"
          color="#0891b2"
          icon={Icons.todayAppts}
        />
        <StatCard
          title="Total Appointments"
          value={stats?.total_appointments}
          subtitle="All time"
          color="#7c3aed"
          icon={Icons.totalAppts}
        />
        <StatCard
          title="Active Staff"
          value={stats?.total_staff}
          subtitle="Registered members"
          color="#059669"
          icon={Icons.staff}
        />
      </div>

      {/* ── Quick actions ── */}
      <div style={styles.quickActions}>
        <div style={styles.quickCard}>
          <div style={styles.quickIcon} className="text-primary">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <div style={styles.quickText}>
            <strong>Add Patient</strong>
            <span>Register a new patient record</span>
          </div>
          <Link to="/patients" className="btn btn-primary btn-sm">Open →</Link>
        </div>

        <div style={styles.quickCard}>
          <div style={{ ...styles.quickIcon, color: '#7c3aed' }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div style={styles.quickText}>
            <strong>New Appointment</strong>
            <span>Schedule an appointment</span>
          </div>
          <Link to="/appointments" className="btn btn-secondary btn-sm">Open →</Link>
        </div>

        <div style={styles.quickCard}>
          <div style={{ ...styles.quickIcon, color: '#059669' }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div style={styles.quickText}>
            <strong>View Reports</strong>
            <span>Patient and appointment data</span>
          </div>
          <Link to="/patients" className="btn btn-secondary btn-sm">Open →</Link>
        </div>
      </div>

      {/* ── Recent appointments ── */}
      <div className="section-header" style={{ marginTop: '2rem', marginBottom: '0.875rem' }}>
        <h3 className="section-title">Recent Appointments</h3>
        <Link to="/appointments" style={styles.viewAll}>View all →</Link>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {recentAppointments.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
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
                    <td className="font-semibold">{appt.patient_name || `#${appt.patient_id}`}</td>
                    <td className="text-muted">
                      {appt.appointment_date
                        ? new Date(appt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="text-muted">{appt.appointment_time || '—'}</td>
                    <td>{appt.doctor_name || '—'}</td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[appt.status] || 'badge-scheduled'}`}>
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

/** Returns a time-of-day greeting string */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

const styles = {
  banner: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
    color: '#fff',
    borderRadius: '16px',
    padding: '1.75rem 2rem',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1rem',
    boxShadow: '0 4px 20px rgba(37,99,235,0.3)',
  },
  bannerTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '0.25rem',
    letterSpacing: '-0.02em',
  },
  bannerSub: {
    fontSize: '0.875rem',
    color: 'rgba(255,255,255,0.7)',
  },
  bannerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  roleChip: {
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.25)',
    color: '#fff',
    padding: '0.375rem 0.875rem',
    borderRadius: '9999px',
    fontSize: '0.8125rem',
    fontWeight: 600,
    backdropFilter: 'blur(4px)',
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: 'rgba(255,255,255,0.85)',
    padding: '0.375rem 0.75rem',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  quickActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem',
    marginBottom: '0.5rem',
  },
  quickCard: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    transition: 'box-shadow 0.2s',
  },
  quickIcon: {
    width: '44px',
    height: '44px',
    background: '#f1f5f9',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  quickText: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
    fontSize: '0.8125rem',
    color: '#64748b',
    lineHeight: 1.4,
  },
  viewAll: {
    fontSize: '0.875rem',
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 600,
  },
};

export default DashboardPage;
