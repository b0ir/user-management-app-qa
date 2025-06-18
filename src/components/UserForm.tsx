import { useState, useEffect, useCallback, FormEvent } from 'react';
import { User, CreateUserDTO, UpdateUserDTO, ValidationError } from '../types/User';
import { validateRUT, formatRUT, validateEmail, validatePhone } from '../utils/validation';

interface UserFormProps {
  user?: User | null;
  onSubmit: (userData: CreateUserDTO | UpdateUserDTO) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

// Constantes para mensajes de validación
const VALIDATION_MESSAGES = {
  RUT_INVALID: 'RUT inválido',
  NAME_REQUIRED: 'Nombre es requerido',
  BIRTH_DATE_REQUIRED: 'Fecha de nacimiento es requerida',
  BIRTH_DATE_FUTURE: 'La fecha de nacimiento no puede ser futura',
  BIRTH_DATE_INVALID: 'Fecha de nacimiento inválida',
  CHILDREN_NEGATIVE: 'La cantidad de hijos no puede ser negativa',
  EMAIL_INVALID: 'Email inválido',
  PHONE_REQUIRED: 'Al menos un teléfono es requerido',
  PHONE_INVALID: 'Teléfono inválido',
  ADDRESS_REQUIRED: 'Al menos una dirección es requerida',
  ADDRESS_INVALID: 'Dirección inválida',
} as const;

// Inicializar form data
const createInitialFormData = (user?: User | null) => ({
  rut: user?.rut || '',
  nombre: user?.nombre || '',
  fechaNacimiento: user?.fechaNacimiento || '',
  cantidadHijos: user?.cantidadHijos || 0,
  correoElectronico: user?.correoElectronico || '',
  telefonos: user?.telefonos || [''],
  direcciones: user?.direcciones || [''],
});

// Determina si el formulario está en modo edición
const getIsEditMode = (user?: User | null): boolean => !!user;

// Sanitizar datos del formulario
const sanitizeFormData = (formData: any, isEditMode: boolean) => {
  const cleanData = {
    ...(isEditMode ? {} : { rut: formData.rut }),
    nombre: formData.nombre.trim(),
    fechaNacimiento: formData.fechaNacimiento,
    cantidadHijos: formData.cantidadHijos,
    correoElectronico: formData.correoElectronico.trim(),
    telefonos: formData.telefonos.filter((phone: string) => phone.trim()),
    direcciones: formData.direcciones.filter((address: string) => address.trim()),
  };

  return cleanData;
};

// Hook personalizado para manejar el formulario
const useUserForm = (user?: User | null) => {
  const [formData, setFormData] = useState(createInitialFormData(user));
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isFormValid, setIsFormValid] = useState(false);

  const isEditMode = getIsEditMode(user);

  const validateForm = useCallback(() => {
    const newErrors: ValidationError[] = [];

    // Validación de RUT (solo en modo creación)
    if (!isEditMode && (!formData.rut || !validateRUT(formData.rut))) {
      newErrors.push({ field: 'rut', message: VALIDATION_MESSAGES.RUT_INVALID });
    }

    // Validación de nombre
    if (!formData.nombre.trim()) {
      newErrors.push({ field: 'nombre', message: VALIDATION_MESSAGES.NAME_REQUIRED });
    }

    // Validación de fecha de nacimiento
    if (!formData.fechaNacimiento) {
      newErrors.push({
        field: 'fechaNacimiento',
        message: VALIDATION_MESSAGES.BIRTH_DATE_REQUIRED,
      });
    } else {
      const birthDate = new Date(formData.fechaNacimiento);
      const today = new Date();
      const minDate = new Date('1900-01-01'); // Fecha mínima razonable

      if (birthDate > today) {
        newErrors.push({
          field: 'fechaNacimiento',
          message: VALIDATION_MESSAGES.BIRTH_DATE_FUTURE,
        });
      } else if (birthDate < minDate || isNaN(birthDate.getTime())) {
        newErrors.push({
          field: 'fechaNacimiento',
          message: VALIDATION_MESSAGES.BIRTH_DATE_INVALID,
        });
      }
    }

    // Validación de cantidad de hijos
    if (formData.cantidadHijos < 0) {
      newErrors.push({
        field: 'cantidadHijos',
        message: VALIDATION_MESSAGES.CHILDREN_NEGATIVE,
      });
    }

    // Validación de correo electrónico
    if (!formData.correoElectronico || !validateEmail(formData.correoElectronico)) {
      newErrors.push({ field: 'correoElectronico', message: VALIDATION_MESSAGES.EMAIL_INVALID });
    }

    // Validación de teléfonos
    const validPhones = formData.telefonos.filter((phone: string) => phone.trim());
    if (validPhones.length === 0) {
      newErrors.push({ field: 'telefonos', message: VALIDATION_MESSAGES.PHONE_REQUIRED });
    } else {
      validPhones.forEach((phone: string, index: number) => {
        if (!validatePhone(phone)) {
          newErrors.push({
            field: `telefono_${index}`,
            message: `Teléfono ${index + 1} inválido`,
          });
        }
      });
    }

    // Validación de direcciones
    const validAddresses = formData.direcciones.filter((address: string) => address.trim());
    if (validAddresses.length === 0) {
      newErrors.push({ field: 'direcciones', message: VALIDATION_MESSAGES.ADDRESS_REQUIRED });
    } else {
      validAddresses.forEach((address: string, index: number) => {
        const trimmedAddress = address.trim();

        // Validar que la dirección tenga formato mínimo válido
        if (
          trimmedAddress.length < 5 ||
          /^\d+$/.test(trimmedAddress) || // Solo números
          !/[a-zA-Z]/.test(trimmedAddress)
        ) {
          // Sin letras
          newErrors.push({
            field: `direccion_${index}`,
            message: `Dirección ${index + 1} inválida`,
          });
        }
      });
    }

    setErrors(newErrors);
    setIsFormValid(newErrors.length === 0);
  }, [formData, isEditMode]);

  const handleInputChange = useCallback((field: string, value: any) => {
    if (field === 'rut') {
      value = formatRUT(value);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleArrayInputChange = useCallback(
    (field: 'telefonos' | 'direcciones', index: number, value: string) => {
      setFormData((prev) => {
        const newArray = [...prev[field]];
        newArray[index] = value;
        return {
          ...prev,
          [field]: newArray,
        };
      });
    },
    []
  );

  const addArrayItem = useCallback((field: 'telefonos' | 'direcciones') => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  }, []);

  const removeArrayItem = useCallback(
    (field: 'telefonos' | 'direcciones', index: number) => {
      if (formData[field].length > 1) {
        setFormData((prev) => {
          const newArray = prev[field].filter((_, i) => i !== index);
          return {
            ...prev,
            [field]: newArray,
          };
        });
      }
    },
    [formData]
  );

  const getFieldError = useCallback(
    (field: string) => {
      return errors.find((error) => error.field === field)?.message;
    },
    [errors]
  );

  useEffect(() => {
    validateForm();
  }, [validateForm]);

  return {
    formData,
    errors,
    isFormValid,
    isEditMode,
    handleInputChange,
    handleArrayInputChange,
    addArrayItem,
    removeArrayItem,
    getFieldError,
  };
};

// Componentes auxiliares para mejor organización
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

const InputField = ({
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
}: FieldProps) => (
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

const NumberField = (props: Omit<FieldProps, 'type'> & { min?: number }) => (
  <InputField {...props} type="number" />
);

const EmailField = (props: Omit<FieldProps, 'type'>) => <InputField {...props} type="email" />;

const DateField = (props: Omit<FieldProps, 'type'>) => <InputField {...props} type="date" />;

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

const ArrayField = ({
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
}: ArrayFieldProps) => {
  const getFieldError = (index: number) => {
    // Para teléfonos usar "telefono", para direcciones usar "direccion"
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
        + Agregar{' '}
        {label === 'Teléfonos'
          ? 'Teléfono'
          : label === 'Direcciones'
            ? 'Dirección'
            : label.slice(0, -1)}
      </button>
      {getGeneralError() && (
        <p className="text-red-500 text-sm mt-1" data-testid={`${fieldName}-error`}>
          {getGeneralError()}
        </p>
      )}
    </div>
  );
};

const FormHeader = ({ isEditMode }: { isEditMode: boolean }) => (
  <h2 className="text-2xl font-bold mb-6 text-gray-800">
    {isEditMode ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}
  </h2>
);

interface FormActionsProps {
  isEditMode: boolean;
  isFormValid: boolean;
  isLoading: boolean;
  onCancel: () => void;
}

const FormActions = ({ isEditMode, isFormValid, isLoading, onCancel }: FormActionsProps) => (
  <div className="flex gap-4 pt-4">
    <button
      type="submit"
      disabled={!isFormValid || isLoading}
      data-testid="submit-button"
      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      aria-label={`${isLoading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'} Usuario`}
    >
      {isLoading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'} Usuario
    </button>
    <button
      type="button"
      onClick={onCancel}
      disabled={isLoading}
      data-testid="cancel-button"
      className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-400 transition-colors font-medium"
    >
      Cancelar
    </button>
  </div>
);

// Componente principal
export const UserForm = ({ user, onSubmit, onCancel, isLoading }: UserFormProps) => {
  const {
    formData,
    errors,
    isFormValid,
    isEditMode,
    handleInputChange,
    handleArrayInputChange,
    addArrayItem,
    removeArrayItem,
    getFieldError,
  } = useUserForm(user);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    const userData = sanitizeFormData(formData, isEditMode);
    await onSubmit(userData as CreateUserDTO | UpdateUserDTO);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <FormHeader isEditMode={isEditMode} />

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isEditMode && (
          <InputField
            id="rut"
            label="RUT"
            value={formData.rut}
            onChange={(value) => handleInputChange('rut', value)}
            error={getFieldError('rut')}
            disabled={isLoading}
            required
            placeholder="12345678-9"
          />
        )}

        <InputField
          id="nombre"
          label="Nombre"
          value={formData.nombre}
          onChange={(value) => handleInputChange('nombre', value)}
          error={getFieldError('nombre')}
          disabled={isLoading}
          required
          placeholder="Ingrese el nombre completo"
        />

        <DateField
          id="fechaNacimiento"
          label="Fecha de Nacimiento"
          value={formData.fechaNacimiento}
          onChange={(value) => handleInputChange('fechaNacimiento', value)}
          error={getFieldError('fechaNacimiento')}
          disabled={isLoading}
          required
        />

        <NumberField
          id="cantidadHijos"
          label="Cantidad de Hijos"
          value={formData.cantidadHijos.toString()}
          onChange={(value) => {
            const numValue = parseInt(value);
            // Solo convertir a 0 si el valor es NaN, no si es negativo
            handleInputChange('cantidadHijos', isNaN(numValue) ? 0 : numValue);
          }}
          error={getFieldError('cantidadHijos')}
          disabled={isLoading}
        />

        <EmailField
          id="correoElectronico"
          label="Correo Electrónico"
          value={formData.correoElectronico}
          onChange={(value) => handleInputChange('correoElectronico', value)}
          error={getFieldError('correoElectronico')}
          disabled={isLoading}
          required
          placeholder="ejemplo@correo.com"
        />

        <ArrayField
          label="Teléfonos"
          values={formData.telefonos}
          onChange={(index, value) => handleArrayInputChange('telefonos', index, value)}
          onAdd={() => addArrayItem('telefonos')}
          onRemove={(index) => removeArrayItem('telefonos', index)}
          errors={errors}
          disabled={isLoading}
          placeholder="+56912345678"
          type="tel"
          fieldName="telefonos"
        />

        <ArrayField
          label="Direcciones"
          values={formData.direcciones}
          onChange={(index, value) => handleArrayInputChange('direcciones', index, value)}
          onAdd={() => addArrayItem('direcciones')}
          onRemove={(index) => removeArrayItem('direcciones', index)}
          errors={errors}
          disabled={isLoading}
          placeholder="Av. Ejemplo 123, Ciudad"
          fieldName="direcciones"
        />

        <FormActions
          isEditMode={isEditMode}
          isFormValid={isFormValid}
          isLoading={isLoading}
          onCancel={onCancel}
        />
      </form>
    </div>
  );
};
