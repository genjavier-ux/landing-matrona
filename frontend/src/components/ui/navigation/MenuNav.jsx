export default function MenuNav({
  items,
  activeId,
  onSelect,
  ariaLabel = 'Principal',
  className = 'clean-menu',
  buttonClassName = 'clean-menu-link'
}) {
  return (
    <nav className={className} aria-label={ariaLabel}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={activeId === item.id ? `${buttonClassName} active` : buttonClassName}
          onClick={() => onSelect(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
