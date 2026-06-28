
import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  required = false,
  hint,
  className = '',
  id,
  ...props
}, ref) => {

  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`form-group ${className}`}>

      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && (
            <span className="form-required" aria-label="required"> *</span>
          )}
        </label>
      )}

      <input
        id={inputId}
        ref={ref}
        className={`form-input ${error ? 'form-input--error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${inputId}-error` :
          hint  ? `${inputId}-hint`  : undefined
        }
        {...props}
      />

      {hint && !error && (
        <p id={`${inputId}-hint`} className="form-hint">
          {hint}
        </p>
      )}

      {error && (
        <p id={`${inputId}-error`} className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;