export default function FieldTextarea({ label, className = '', textareaClassName = '', ...props }) {
  if (!label) {
    return <textarea className={textareaClassName} {...props} />;
  }

  return (
    <label className={['ui-field', className].filter(Boolean).join(' ')}>
      <span className="ui-field-label">{label}</span>
      <textarea className={textareaClassName} {...props} />
    </label>
  );
}
