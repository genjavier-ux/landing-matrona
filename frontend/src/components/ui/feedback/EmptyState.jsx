export default function EmptyState({
  title,
  description,
  className = '',
  action = null
}) {
  const classes = ['ui-empty-state', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
      {action}
    </div>
  );
}
