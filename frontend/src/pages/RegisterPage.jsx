import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = ['Admin', 'Doctor', 'Nurse', 'Receptionist'];

const INITIAL_FORM = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'Receptionist',
  phone: '',
};

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Min 8 characters';
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
      const { confirmPassword, phone, ...submitData } = formData;
      if (phone) submitData.phone = phone;
      await register(submitData);
      setSuccess('Account created successfully! Redirecting to login...');
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
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoArea}>
          <div style={styles.logoIcon}>+</div>
          <h1 style={styles.logoText}>MediTrack</h1>
        </div>

        <h2 style={styles.heading}>Create Account</h2>

        {apiError && <div className="alert alert-error">{apiError}</div>}
        {success && <div className="alert alert-success">{success}</div>}

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
                placeholder="Min. 6 characters"
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.loginLink}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: 'calc(100vh - 60px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '520px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
  },
  logoArea: { textAlign: 'center', marginBottom: '1.5rem' },
  logoIcon: {
    width: '48px',
    height: '48px',
    background: '#1e40af',
    color: 'white',
    borderRadius: '10px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.75rem',
    fontWeight: 900,
    marginBottom: '0.5rem',
  },
  logoText: { fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  heading: { fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.25rem', color: '#1e293b' },
  loginLink: { textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' },
  link: { color: '#2563eb', textDecoration: 'none', fontWeight: 500 },
};

export default RegisterPage;
