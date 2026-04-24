export default function SkeletonBlock({ className = '' }) {
  const classes = ['shimmer', className].filter(Boolean).join(' ');
  return <div className={classes} aria-hidden />;
}
