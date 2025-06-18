import React from 'react';

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  type?: string;
  placeholder?: string;
  min?: string | number;
}

export const InputField: React.FC<FieldProps> = ({
  id,
  label,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  type = 'text',
  placeholder,
  min,
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={id}
      data-testid={`${id}-input`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
        error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
      } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      placeholder={placeholder}
      disabled={disabled}
      min={min}
    />
    {error && (
      <p className="text-red-500 text-sm mt-1" data-testid={`${id}-error`}>
        {error}
      </p>
    )}
  </div>
);
