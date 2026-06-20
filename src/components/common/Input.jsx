// ============================================================
// src/components/common/Input.jsx
//
// A reusable form input with built-in label, error message,
// and accessibility features.
//
// WHY BUILD THIS?
// A plain <input> doesn't include a label, error message,
// or accessible connection between them. This component
// bundles all three together consistently.
//
// PROPS:
// - label:       text shown above the input
// - error:       error message shown below (from form validation)
// - required:    adds a * indicator
// - hint:        optional helper text below the input
// - ...props:    passed to the <input> (type, placeholder, etc.)
// ============================================================

import { forwardRef } from 'react';

// forwardRef lets parent components access the input's DOM node.
// react-hook-form needs this to register inputs correctly.
const Input = forwardRef(({
  label,
  error,
  required = false,
  hint,
  className = '',
  id,
  ...props
}, ref) => {

  // Generate a unique ID if one isn't provided.
  // This links the <label> to the <input> for accessibility.
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`form-group ${className}`}>

      {/* Label — clicking it focuses the input (accessibility) */}
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && (
            <span className="form-required" aria-label="required"> *</span>
          )}
        </label>
      )}

      {/* The actual input field */}
      <input
        id={inputId}
        ref={ref}                          // needed by react-hook-form
        className={`form-input ${error ? 'form-input--error' : ''}`}
        aria-invalid={!!error}             // accessibility: announces error to screen readers
        aria-describedby={
          error ? `${inputId}-error` :
          hint  ? `${inputId}-hint`  : undefined
        }
        {...props}
      />

      {/* Hint text (only shown when no error) */}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="form-hint">
          {hint}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p id={`${inputId}-error`} className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

// Display name for React DevTools — makes debugging easier
Input.displayName = 'Input';

export default Input;