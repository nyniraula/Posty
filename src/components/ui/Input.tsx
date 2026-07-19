import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export function Input({
  label,
  helperText,
  error,
  id,
  className = '',
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-text-primary"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[
          'w-full px-3 py-1.5 text-sm',
          'bg-surface text-text-primary',
          'border rounded-[var(--radius-md)]',
          'placeholder:text-text-tertiary',
          'transition-colors duration-150',
          error
            ? 'border-danger focus:border-danger'
            : 'border-border focus:border-accent',
          'focus:outline-none focus:ring-1',
          error ? 'focus:ring-danger' : 'focus:ring-accent',
          className,
        ].join(' ')}
        {...props}
      />
      {error && (
        <p className="text-xs text-danger">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-text-tertiary">{helperText}</p>
      )}
    </div>
  );
}
