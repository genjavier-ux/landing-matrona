export default function Panel({ as: Component = 'section', className = '', children, ...props }) {
  const classes = ['card', className].filter(Boolean).join(' ');

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
