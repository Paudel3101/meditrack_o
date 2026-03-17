function StatCard({ title, value, subtitle, color = '#2563eb' }) {
  return (
    <div style={styles.card}>
      <div style={{ ...styles.dot, backgroundColor: color }} />
      <div style={styles.value}>{value ?? '—'}</div>
      <div style={styles.title}>{title}</div>
      {subtitle && <div style={styles.subtitle}>{subtitle}</div>}
    </div>
  );
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '1.25rem 1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    position: 'relative',
    overflow: 'hidden',
  },
  dot: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '4px',
    height: '100%',
    borderRadius: '4px 0 0 4px',
  },
  value: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#1e293b',
    lineHeight: 1,
    marginBottom: '0.375rem',
  },
  title: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#64748b',
  },
  subtitle: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginTop: '0.25rem',
  },
};

export default StatCard;
