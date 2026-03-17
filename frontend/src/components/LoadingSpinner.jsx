function LoadingSpinner({ fullScreen = false }) {
  return (
    <div className={`spinner-overlay${fullScreen ? ' full-screen' : ''}`}>
      <div className="spinner" />
    </div>
  );
}

export default LoadingSpinner;
