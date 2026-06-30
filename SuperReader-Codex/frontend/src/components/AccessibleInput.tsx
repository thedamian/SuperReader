import { type InputHTMLAttributes } from 'react';

interface AccessibleInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function AccessibleInput({ label, id, ...rest }: AccessibleInputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="form-field">
      <label htmlFor={inputId} className="form-label">
        {label}
      </label>
      <input id={inputId} className="form-input" {...rest} />
    </div>
  );
}
