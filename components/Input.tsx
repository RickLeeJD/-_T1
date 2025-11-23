import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  fullWidth?: boolean;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({ label, error, fullWidth = false, required, className, id, ...props }) => {
  const uniqueId = useId();
  const inputId = id || uniqueId;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} mb-4`}>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={inputId}
        className={`w-full px-3 py-2 border ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'} rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};