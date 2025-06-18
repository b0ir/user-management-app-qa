import React from 'react';
import { ValidationError } from '../../../../types/User';

interface ArrayFieldProps {
  label: string;
  values: string[];
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  errors: ValidationError[];
  disabled?: boolean;
  placeholder?: string;
  type?: string;
  fieldName: string;
}

export const ArrayField: React.FC<ArrayFieldProps> = ({
  label,
  values,
  onChange,
  onAdd,
  onRemove,
  errors,
  disabled = false,
  placeholder,
  type = 'text',
  fieldName,
}) => {
  const getFieldError = (index: number) => {
    let errorField;
    if (fieldName === 'telefonos') {
      errorField = `telefono_${index}`;
    } else if (fieldName === 'direcciones') {
      errorField = `direccion_${index}`;
    } else {
      errorField = `${fieldName}_${index}`;
    }
    return errors.find((error) => error.field === errorField)?.message;
  };

  const getGeneralError = () => {
    return errors.find((error) => error.field === fieldName)?.message;
  };

  const getButtonLabel = () => {
    if (label === 'Teléfonos') return 'Teléfono';
    if (label === 'Direcciones') return 'Dirección';
    return label.slice(0, -1);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      {values.map((value, index) => (
        <div key={index} className="flex gap-2 mb-2">
          <input
            type={type}
            value={value}
            data-testid={`${fieldName}-input-${index}`}
            onChange={(e) => onChange(index, e.target.value)}
            className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
              getFieldError(index)
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder={placeholder}
            disabled={disabled}
          />
          {values.length > 1 && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              data-testid={`${fieldName}-remove-${index}`}
              className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 transition-colors"
              disabled={disabled}
              aria-label={`Eliminar ${label.toLowerCase()} ${index + 1}`}
            >
              Eliminar
            </button>
          )}
          {getFieldError(index) && (
            <p className="text-red-500 text-sm mt-1" data-testid={`${fieldName}-error-${index}`}>
              {getFieldError(index)}
            </p>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        data-testid={`${fieldName}-add`}
        className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 transition-colors"
        disabled={disabled}
        aria-label={`Agregar ${label.toLowerCase()}`}
      >
        + Agregar {getButtonLabel()}
      </button>
      {getGeneralError() && (
        <p className="text-red-500 text-sm mt-1" data-testid={`${fieldName}-error`}>
          {getGeneralError()}
        </p>
      )}
    </div>
  );
};
