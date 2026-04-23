/**
 * StatCard — reusable metric card for the dashboard.
 * Accepts a title, numeric value, subtitle, accent color,
 * and an optional SVG icon element.
 */
function StatCard({ title, value, subtitle, color = '#2563eb', icon }) {
  return (
    <div style={{ ...styles.card, '--accent': color }}>
      {/* Colored top accent bar */}
      <div style={{ ...styles.accent, background: color }} />

      <div style={styles.body}>
        <div style={styles.topRow}>
          <div>
            <div style={styles.value}>{value ?? '—'}</div>
            <div style={styles.title}>{title}</div>
          </div>
          {/* Icon area — colored circle with SVG */}
          {icon && (
            <div style={{ ...styles.iconWrap, background: `${color}18`, color }}>
              {icon}
            </div>
          )}
        </div>
        {subtitle && <div style={styles.subtitle}>{subtitle}</div>}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    overflow: 'hidden',
    transition: 'box-shadow 0.2s, transform 0.2s',
    cursor: 'default',
  },
  accent: {
    height: '4px',
    width: '100%',
  },
  body: {
    padding: '1.25rem 1.5rem 1.25rem',
  },
  topRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '0.75rem',
    marginBottom: '0.5rem',
  },
  iconWrap: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  value: {
    fontSize: '2.25rem',
    fontWeight: 800,
    color: '#0f172a',
    lineHeight: 1,
    marginBottom: '0.25rem',
    letterSpacing: '-0.03em',
  },
  title: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#475569',
  },
  subtitle: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginTop: '0.125rem',
  },
};

export default StatCard;
