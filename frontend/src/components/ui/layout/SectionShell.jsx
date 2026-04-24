export default function SectionShell({
  as: Component = 'section',
  className = '',
  children,
  ...props
}) {
  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  );
}
