export default function DotPagination({
  count,
  activeIndex,
  onSelect,
  className,
  dotClassName,
  getAriaLabel
}) {
  if (count <= 1) return null;

  return (
    <div className={className}>
      {Array.from({ length: count }, (_, index) => (
        <button
          key={`${className || 'dots'}-${index}`}
          type="button"
          className={index === activeIndex ? `${dotClassName} active` : dotClassName}
          onClick={() => onSelect(index)}
          aria-label={getAriaLabel(index)}
        />
      ))}
    </div>
  );
}
