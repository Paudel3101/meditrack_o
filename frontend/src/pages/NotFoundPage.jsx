import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * NotFoundPage — shown for any unmatched route (404).
 * Authenticated users see a "Back to Dashboard" option;
 * guests see a "Go to Login" option.
 */
function NotFoundPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* Animated 404 number */}
      <div style={styles.number}>404</div>

      {/* Icon */}
      <div style={styles.iconWrap}>
        <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#93c5fd' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h1 style={styles.title}>Page Not Found</h1>
      <p style={styles.message}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <div style={styles.actions}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          ← Go Back
        </button>
        {isAuthenticated ? (
          <Link to="/dashboard" style={styles.homeBtn}>
            Back to Dashboard
          </Link>
        ) : (
          <Link to="/login" style={styles.homeBtn}>
            Go to Login
          </Link>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: 'calc(100vh - 60px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)',
  },
  number: {
    fontSize: '8rem',
    fontWeight: 900,
    background: 'linear-gradient(135deg, #1e40af, #7c3aed)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    lineHeight: 1,
    marginBottom: '0.5rem',
    letterSpacing: '-0.05em',
  },
  iconWrap: {
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '0.75rem',
  },
  message: {
    fontSize: '1rem',
    color: '#64748b',
    maxWidth: '400px',
    marginBottom: '2rem',
    lineHeight: 1.6,
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  backBtn: {
    padding: '0.625rem 1.5rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#374151',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'all 0.15s ease',
  },
  homeBtn: {
    padding: '0.625rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #1e40af, #2563eb)',
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'all 0.15s ease',
  },
};

export default NotFoundPage;
