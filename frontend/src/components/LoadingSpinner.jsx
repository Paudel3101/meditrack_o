/**
 * LoadingSpinner — centered spinner with optional full-screen overlay.
 * Used while async data is being fetched or auth is being restored.
 */
function LoadingSpinner({ fullScreen = false, message = 'Loading...' }) {
  return (
    <div className={`spinner-overlay${fullScreen ? ' full-screen' : ''}`}>
      {/* Logo mark shown in full-screen mode */}
      {fullScreen && (
        <div style={styles.logo}>
          <span style={styles.logoPlus}>+</span>
        </div>
      )}
      <div className="spinner" />
      <span className="spinner-text">{message}</span>
    </div>
  );
}

const styles = {
  logo: {
    width: '56px',
    height: '56px',
    background: 'linear-gradient(135deg, #1e40af, #2563eb)',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
    boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
  },
  logoPlus: {
    color: 'white',
    fontSize: '2rem',
    fontWeight: 900,
    lineHeight: 1,
  },
};

export default LoadingSpinner;
