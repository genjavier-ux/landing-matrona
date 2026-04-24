export default function PageSkeleton({
  as: Component = 'main',
  className = '',
  children
}) {
  return <Component className={className}>{children}</Component>;
}
