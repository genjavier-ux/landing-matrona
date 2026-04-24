export default function SelectField({
  label,
  options,
  className = '',
  selectClassName = '',
  ...props
}) {
  const select = (
    <select className={['ui-select', selectClassName].filter(Boolean).join(' ')} {...props}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  if (!label) return select;

  return (
    <label className={['ui-field', className].filter(Boolean).join(' ')}>
      <span className="ui-field-label">{label}</span>
      {select}
    </label>
  );
}
