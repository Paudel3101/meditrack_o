import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * NAV_LINKS — static list of authenticated nav items with their SVG icons.
 * Keeping this outside the component avoids re-creating the array each render.
 */
const NAV_LINKS = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    path: '/patients',
    label: 'Patients',
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    path: '/appointments',
    label: 'Appointments',
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
];

/**
 * Navbar — sticky top navigation bar.
 * Shows brand, nav links (authenticated only), and user info / logout.
 * Active route is highlighted with a pill indicator.
 */
function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Brand mark */}
        <Link to="/" style={styles.brand}>
          <div style={styles.brandIcon}>
            <span style={styles.brandPlus}>+</span>
          </div>
          <span style={styles.brandName}>MediTrack</span>
        </Link>

        {/* Primary nav links — only visible when logged in */}
        {isAuthenticated && (
          <div style={styles.links}>
            {NAV_LINKS.map(({ path, label, icon }) => {
              const active = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  style={{ ...styles.link, ...(active ? styles.linkActive : {}) }}
                >
                  {icon}
                  {label}
                </Link>
              );
            })}
          </div>
        )}

        {/* User info / logout section */}
        {isAuthenticated ? (
          <div style={styles.userArea}>
            {/* Avatar circle with user initials */}
            <div style={styles.avatar}>
              {user?.first_name?.[0]?.toUpperCase() || 'U'}
              {user?.last_name?.[0]?.toUpperCase() || ''}
            </div>
            <div style={styles.userInfo}>
              <span style={styles.userName}>
                {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.email}
              </span>
              <span style={styles.userRole}>{user?.role}</span>
            </div>
            <button onClick={handleLogout} style={styles.logoutBtn} title="Sign out">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        ) : (
          <div style={styles.links}>
            <Link to="/login" style={styles.link}>Login</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1e40af 100%)',
    color: '#fff',
    boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  inner: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 2rem',
    height: '62px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    color: '#fff',
    textDecoration: 'none',
  },
  brandIcon: {
    width: '32px',
    height: '32px',
    background: 'rgba(255,255,255,0.15)',
    border: '1.5px solid rgba(255,255,255,0.3)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
  },
  brandPlus: {
    color: '#fff',
    fontSize: '1.25rem',
    fontWeight: 900,
    lineHeight: 1,
  },
  brandName: {
    fontWeight: 700,
    fontSize: '1.125rem',
    letterSpacing: '-0.015em',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.125rem',
  },
  link: {
    color: 'rgba(255,255,255,0.75)',
    textDecoration: 'none',
    padding: '0.4375rem 0.75rem',
    borderRadius: '7px',
    fontSize: '0.875rem',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    transition: 'all 0.15s ease',
  },
  linkActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: '#fff',
    fontWeight: 600,
    backdropFilter: 'blur(4px)',
  },
  userArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: '2px solid rgba(255,255,255,0.25)',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.2,
  },
  userName: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: '#fff',
  },
  userRole: {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'capitalize',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: 'rgba(255,255,255,0.85)',
    padding: '0.375rem 0.75rem',
    borderRadius: '7px',
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
};

export default Navbar;
