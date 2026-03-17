import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/patients', label: 'Patients' },
  { path: '/appointments', label: 'Appointments' },
];

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
        {/* Brand */}
        <Link to="/" style={styles.brand}>
          <span style={styles.brandIcon}>+</span>
          <span>MediTrack</span>
        </Link>

        {/* Nav links (only when authenticated) */}
        {isAuthenticated && (
          <div style={styles.links}>
            {NAV_LINKS.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                style={{
                  ...styles.link,
                  ...(location.pathname === path ? styles.linkActive : {}),
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* User area */}
        {isAuthenticated ? (
          <div style={styles.userArea}>
            <span style={styles.userName}>
              {user?.name || user?.email}
            </span>
            <span style={styles.userRole}>{user?.role}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>
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
    backgroundColor: '#1e40af',
    color: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  inner: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'white',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '1.125rem',
  },
  brandIcon: {
    background: 'white',
    color: '#1e40af',
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    fontSize: '1.125rem',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  link: {
    color: 'rgba(255,255,255,0.85)',
    textDecoration: 'none',
    padding: '0.375rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'background 0.15s',
  },
  linkActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: 'white',
  },
  userArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  userName: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'white',
  },
  userRole: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.7)',
    background: 'rgba(255,255,255,0.15)',
    padding: '0.125rem 0.5rem',
    borderRadius: '9999px',
  },
  logoutBtn: {
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.3)',
    color: 'white',
    padding: '0.375rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
};

export default Navbar;
