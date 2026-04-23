import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Available staff roles in the system */
const ROLES = ['Admin', 'Doctor', 'Nurse', 'Receptionist'];

/** Default form values — declared outside to avoid re-creation on each render */
const INITIAL_FORM = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'Receptionist',
  phone: '',
};

/**
 * RegisterPage — public route at /register.
 * Validates password strength client-side before calling the API.
 * On success, redirects to /login after a 2-second confirmation message.
 */
function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  /** Clear individual field error on change */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  /**
   * Client-side validation.
   * Password strength rules mirror the backend validators.js requirements.
   */
  const validate = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Minimum 8 characters required';
    else if (!/[A-Z]/.test(formData.password)) newErrors.password = 'Must include an uppercase letter';
    else if (!/[0-9]/.test(formData.password)) newErrors.password = 'Must include a number';
    else if (!/[!@#$%^&*]/.test(formData.password)) newErrors.password = 'Must include a special character (!@#$%^&*)';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.role) newErrors.role = 'Please select a role';
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
    setSuccess('');
    try {
      // Strip confirmPassword before sending; include phone only if provided
      const { confirmPassword, phone, ...submitData } = formData;
      if (phone.trim()) submitData.phone = phone.trim();
      await register(submitData);
      setSuccess('Account created successfully! Redirecting to login…');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setApiError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* ── Left: Brand panel (same as login) ── */}
      <div style={styles.brandPanel}>
        <div style={styles.brandContent}>
          <div style={styles.logoMark}>+</div>
          <h1 style={styles.brandTitle}>MediTrack</h1>
          <p style={styles.brandTagline}>Join the clinic management platform</p>

          <ul style={styles.featureList}>
            {[
              'Register as Admin, Doctor, Nurse, or Receptionist',
              'Instant access after approval',
              'Secure, HIPAA-aware design',
              'All clinic data in one place',
            ].map((f) => (
              <li key={f} style={styles.featureItem}>
                <span style={styles.featureCheck}>✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div style={styles.circle1} />
        <div style={styles.circle2} />
      </div>

      {/* ── Right: Registration form ── */}
      <div style={styles.formPanel}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Create Account</h2>
            <p style={styles.formSub}>Fill in your details to get started</p>
          </div>

          {apiError && (
            <div className="alert alert-error">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.834-2.694-.834-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {apiError}
            </div>
          )}
          {success && (
            <div className="alert alert-success">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="first_name">First Name</label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  className={`form-control${errors.first_name ? ' error' : ''}`}
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Jane"
                  autoFocus
                />
                {errors.first_name && <span className="form-error">{errors.first_name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="last_name">Last Name</label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  className={`form-control${errors.last_name ? ' error' : ''}`}
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Smith"
                />
                {errors.last_name && <span className="form-error">{errors.last_name}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`form-control${errors.email ? ' error' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@clinic.com"
                  autoComplete="email"
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="phone">Phone (optional)</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="555-0100"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                className={`form-control${errors.role ? ' error' : ''}`}
                value={formData.role}
                onChange={handleChange}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              {errors.role && <span className="form-error">{errors.role}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className={`form-control${errors.password ? ' error' : ''}`}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                />
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className={`form-control${errors.confirmPassword ? ' error' : ''}`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                />
                {errors.confirmPassword && (
                  <span className="form-error">{errors.confirmPassword}</span>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
              style={{ marginTop: '0.5rem' }}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p style={styles.loginLink}>
            Already have an account?{' '}
            <Link to="/login" style={styles.link}>Sign in</Link>
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
  brandPanel: {
    flex: '0 0 380px',
    background: 'linear-gradient(145deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 2.5rem',
    position: 'relative',
    overflow: 'hidden',
  },
  brandContent: { position: 'relative', zIndex: 1 },
  logoMark: {
    width: '56px',
    height: '56px',
    background: 'rgba(255,255,255,0.15)',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: 900,
    marginBottom: '1.25rem',
  },
  brandTitle: {
    fontSize: '1.875rem',
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '-0.03em',
    marginBottom: '0.375rem',
  },
  brandTagline: {
    fontSize: '0.875rem',
    color: 'rgba(255,255,255,0.65)',
    marginBottom: '2rem',
  },
  featureList: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.875rem' },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.875rem',
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
  circle1: {
    position: 'absolute',
    top: '-80px',
    right: '-80px',
    width: '260px',
    height: '260px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  circle2: {
    position: 'absolute',
    bottom: '-60px',
    left: '-60px',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  formPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: '#f8fafc',
    overflowY: 'auto',
  },
  formCard: {
    background: '#fff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '520px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
  },
  formHeader: { marginBottom: '1.5rem' },
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#0f172a',
    letterSpacing: '-0.02em',
    marginBottom: '0.25rem',
  },
  formSub: { fontSize: '0.875rem', color: '#64748b' },
  loginLink: {
    textAlign: 'center',
    marginTop: '1.5rem',
    fontSize: '0.875rem',
    color: '#64748b',
  },
  link: { color: '#2563eb', textDecoration: 'none', fontWeight: 600 },
};

export default RegisterPage;
