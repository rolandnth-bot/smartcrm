import { memo } from 'react';

/**
 * Újrahasznosítható form mez komponens
 * Támogatja a label-t, error üzeneteket, required jelölést, és help text-et
 */
const FormField = memo(({
  label,
  htmlFor,
  required = false,
  error = null,
  helpText = null,
  children,
  className = '',
  labelClassName = '',
  ...props
}) => {
  return (
    <div className={`space-y-1 ${className}`} {...props}>
      {label && (
        <label
          htmlFor={htmlFor}
          className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${labelClassName}`}
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="kötelez mez">
              *
            </span>
          )}
        </label>
      )}
      <div className="relative">
        {children}
        {error && (
          <div
            id={htmlFor ? `${htmlFor}-error` : undefined}
            className="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}
        {helpText && !error && (
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {helpText}
          </div>
        )}
      </div>
    </div>
  );
});

FormField.displayName = 'FormField';

export default FormField;
