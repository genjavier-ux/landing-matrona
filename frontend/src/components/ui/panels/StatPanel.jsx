export default function StatPanel({ value, label, className = '' }) {
  const classes = ['admin-summary', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
