import React, { FormEvent } from 'react';
import { User, CreateUserDTO, UpdateUserDTO } from '../../types/User';
import { useUserForm } from './hooks/useUserForm';
import { sanitizeFormData } from './utils/formDataUtils';
import { FormHeader } from './components/FormHeader';
import { FormActions } from './components/FormActions';
import {
  InputField,
  ArrayField,
  NumberField,
  EmailField,
  DateField,
} from './components/FormFields';

export interface UserFormProps {
  user?: User | null;
  onSubmit: (userData: CreateUserDTO | UpdateUserDTO) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel, isLoading }) => {
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
            handleInputChange('cantidadHijos', isNaN(numValue) ? 0 : numValue);
          }}
          error={getFieldError('cantidadHijos')}
          disabled={isLoading}
          min={0}
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
