export default function FieldInput({ label, className = '', inputClassName = '', ...props }) {
  if (!label) {
    return <input className={inputClassName} {...props} />;
  }

  return (
    <label className={['ui-field', className].filter(Boolean).join(' ')}>
      <span className="ui-field-label">{label}</span>
      <input className={inputClassName} {...props} />
    </label>
  );
}
