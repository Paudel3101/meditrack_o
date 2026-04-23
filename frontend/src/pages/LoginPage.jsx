import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * LoginPage — public page rendered at /login.
 * Uses a two-column layout: brand panel on the left,
 * form on the right. Redirects to /dashboard if already authenticated.
 */
function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Redirect authenticated users away from login page
  if (isAuthenticated) {
    navigate('/dashboard');
  }

  // Form field values
  const [formData, setFormData] = useState({ email: '', password: '' });
  // Field-level validation errors
  const [errors, setErrors] = useState({});
  // API-level error message
  const [apiError, setApiError] = useState('');
  // Controls button disabled state during request
  const [loading, setLoading] = useState(false);

  /** Clear field error on user input */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  /** Client-side validation before API call */
  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    setApiError('');
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setApiError(
        err.response?.data?.message || 'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* ── Left: Brand panel ── */}
      <div style={styles.brandPanel}>
        <div style={styles.brandContent}>
          <div style={styles.logoMark}>+</div>
          <h1 style={styles.brandTitle}>MediTrack</h1>
          <p style={styles.brandTagline}>Clinic Management System</p>

          {/* Feature bullets */}
          <ul style={styles.featureList}>
            {[
              'Manage patients & appointments',
              'Real-time dashboard analytics',
              'Secure JWT authentication',
              'Role-based access control',
            ].map((f) => (
              <li key={f} style={styles.featureItem}>
                <span style={styles.featureCheck}>✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Decorative circles */}
        <div style={styles.circle1} />
        <div style={styles.circle2} />
      </div>

      {/* ── Right: Login form ── */}
      <div style={styles.formPanel}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Welcome back</h2>
            <p style={styles.formSub}>Sign in to your account to continue</p>
          </div>

          {/* API error banner */}
          {apiError && (
            <div className="alert alert-error">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.834-2.694-.834-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                className={`form-control${errors.email ? ' error' : ''}`}
                value={formData.email}
                onChange={handleChange}
                placeholder="you@clinic.com"
                autoComplete="email"
                autoFocus
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className={`form-control${errors.password ? ' error' : ''}`}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
              style={{ marginTop: '0.75rem' }}
            >
              {loading ? (
                <>
                  <span style={styles.btnSpinner} />
                  Signing in…
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <p style={styles.registerLink}>
            Don&apos;t have an account?{' '}
            <Link to="/register" style={styles.link}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: 'calc(100vh - 62px)',
    display: 'flex',
  },

  /* Brand panel */
  brandPanel: {
    flex: '0 0 420px',
    background: 'linear-gradient(145deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 2.5rem',
    position: 'relative',
    overflow: 'hidden',
  },
  brandContent: {
    position: 'relative',
    zIndex: 1,
  },
  logoMark: {
    width: '64px',
    height: '64px',
    background: 'rgba(255,255,255,0.15)',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5rem',
    fontWeight: 900,
    marginBottom: '1.25rem',
    backdropFilter: 'blur(4px)',
  },
  brandTitle: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '-0.03em',
    marginBottom: '0.375rem',
  },
  brandTagline: {
    fontSize: '0.9375rem',
    color: 'rgba(255,255,255,0.65)',
    marginBottom: '2.5rem',
  },
  featureList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.85)',
  },
  featureCheck: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 700,
    flexShrink: 0,
  },
  /* Decorative elements */
  circle1: {
    position: 'absolute',
    top: '-80px',
    right: '-80px',
    width: '280px',
    height: '280px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  circle2: {
    position: 'absolute',
    bottom: '-60px',
    left: '-60px',
    width: '220px',
    height: '220px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
  },

  /* Form panel */
  formPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: '#f8fafc',
  },
  formCard: {
    background: '#fff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
  },
  formHeader: {
    marginBottom: '1.75rem',
  },
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#0f172a',
    letterSpacing: '-0.02em',
    marginBottom: '0.25rem',
  },
  formSub: {
    fontSize: '0.875rem',
    color: '#64748b',
  },
  registerLink: {
    textAlign: 'center',
    marginTop: '1.5rem',
    fontSize: '0.875rem',
    color: '#64748b',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 600,
  },
  btnSpinner: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255,255,255,0.4)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.75s linear infinite',
  },
};

export default LoginPage;
