import React, { useId } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { label: string; value: string | number }[];
  error?: string;
  fullWidth?: boolean;
  required?: boolean;
}

export const Select: React.FC<SelectProps> = ({ label, options, error, fullWidth = false, required, className, id, ...props }) => {
  const uniqueId = useId();
  const selectId = id || uniqueId;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} mb-4`}>
      <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={selectId}
        className={`w-full px-3 py-2 border ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'} rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors bg-white ${className}`}
        {...props}
      >
        <option value="" disabled>請選擇</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};