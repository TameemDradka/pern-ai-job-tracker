import React from 'react';

/**
 * Reusable form field with label + error text.
 * Props: { id, label, type, value, onChange, error, required, autoComplete }
 */
export default function FormField({ id, label, type = 'text', value, onChange, error, required, autoComplete, children, ...rest }) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500">*</span>}
      </label>
      {children ? (
        children
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full rounded-md border ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'} px-3 py-2 text-sm shadow-sm outline-none transition`}
          {...rest}
        />
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
