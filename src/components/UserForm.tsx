import React, { useState, useEffect } from 'react';
import { User, CreateUserDTO, UpdateUserDTO, ValidationError } from '../types/User';
import { validateRUT, formatRUT, validateEmail, validatePhone } from '../utils/validation';

interface UserFormProps {
  user?: User | null;
  onSubmit: (userData: CreateUserDTO | UpdateUserDTO) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    rut: user?.rut || '',
    nombre: user?.nombre || '',
    fechaNacimiento: user?.fechaNacimiento || '',
    cantidadHijos: user?.cantidadHijos || 0,
    correoElectronico: user?.correoElectronico || '',
    telefonos: user?.telefonos || [''],
    direcciones: user?.direcciones || [''],
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isFormValid, setIsFormValid] = useState(false);

  const isEditMode = !!user;

  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const newErrors: ValidationError[] = [];

    // Validación de RUT
    if (!isEditMode && (!formData.rut || !validateRUT(formData.rut))) {
      newErrors.push({ field: 'rut', message: 'RUT inválido' });
    }

    // Validación de nombre
    if (!formData.nombre.trim()) {
      newErrors.push({ field: 'nombre', message: 'Nombre es requerido' });
    }

    // Validación de fecha de nacimiento
    if (!formData.fechaNacimiento) {
      newErrors.push({ field: 'fechaNacimiento', message: 'Fecha de nacimiento es requerida' });
    } else {
      const birthDate = new Date(formData.fechaNacimiento);
      const today = new Date();
      if (birthDate > today) {
        newErrors.push({
          field: 'fechaNacimiento',
          message: 'La fecha de nacimiento no puede ser futura',
        });
      }
    }

    // Validación de cantidad de hijos
    if (formData.cantidadHijos < 0) {
      newErrors.push({
        field: 'cantidadHijos',
        message: 'La cantidad de hijos no puede ser negativa',
      });
    }

    // Validación de correo electrónico
    if (!formData.correoElectronico || !validateEmail(formData.correoElectronico)) {
      newErrors.push({ field: 'correoElectronico', message: 'Email inválido' });
    }

    // Validación de teléfono
    const validPhones = formData.telefonos.filter((phone) => phone.trim());
    if (validPhones.length === 0) {
      newErrors.push({ field: 'telefonos', message: 'Al menos un teléfono es requerido' });
    } else {
      validPhones.forEach((phone, index) => {
        if (!validatePhone(phone)) {
          newErrors.push({ field: `telefono_${index}`, message: `Teléfono ${index + 1} inválido` });
        }
      });
    }

    // Validación de dirección
    const validAddresses = formData.direcciones.filter((address) => address.trim());
    if (validAddresses.length === 0) {
      newErrors.push({ field: 'direcciones', message: 'Al menos una dirección es requerida' });
    }

    setErrors(newErrors);
    setIsFormValid(newErrors.length === 0);
  };

  const handleInputChange = (field: string, value: any) => {
    if (field === 'rut') {
      value = formatRUT(value);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayInputChange = (
    field: 'telefonos' | 'direcciones',
    index: number,
    value: string
  ) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData((prev) => ({
      ...prev,
      [field]: newArray,
    }));
  };

  const addArrayItem = (field: 'telefonos' | 'direcciones') => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayItem = (field: 'telefonos' | 'direcciones', index: number) => {
    if (formData[field].length > 1) {
      const newArray = formData[field].filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        [field]: newArray,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    const userData = {
      ...(isEditMode ? {} : { rut: formData.rut }),
      nombre: formData.nombre,
      fechaNacimiento: formData.fechaNacimiento,
      cantidadHijos: formData.cantidadHijos,
      correoElectronico: formData.correoElectronico,
      telefonos: formData.telefonos.filter((phone) => phone.trim()),
      direcciones: formData.direcciones.filter((address) => address.trim()),
    };

    await onSubmit(userData as CreateUserDTO | UpdateUserDTO);
  };

  const getFieldError = (field: string) => {
    return errors.find((error) => error.field === field)?.message;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {isEditMode ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isEditMode && (
          <div>
            <label htmlFor="rut" className="block text-sm font-medium text-gray-700 mb-1">
              RUT *
            </label>
            <input
              type="text"
              id="rut"
              value={formData.rut}
              onChange={(e) => handleInputChange('rut', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                getFieldError('rut') ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="12345678-9"
              disabled={isLoading}
            />
            {getFieldError('rut') && (
              <p className="text-red-500 text-sm mt-1">{getFieldError('rut')}</p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre *
          </label>
          <input
            type="text"
            id="nombre"
            value={formData.nombre}
            onChange={(e) => handleInputChange('nombre', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              getFieldError('nombre') ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {getFieldError('nombre') && (
            <p className="text-red-500 text-sm mt-1">{getFieldError('nombre')}</p>
          )}
        </div>

        <div>
          <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Nacimiento *
          </label>
          <input
            type="date"
            id="fechaNacimiento"
            value={formData.fechaNacimiento}
            onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              getFieldError('fechaNacimiento') ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {getFieldError('fechaNacimiento') && (
            <p className="text-red-500 text-sm mt-1">{getFieldError('fechaNacimiento')}</p>
          )}
        </div>

        <div>
          <label htmlFor="cantidadHijos" className="block text-sm font-medium text-gray-700 mb-1">
            Cantidad de Hijos
          </label>
          <input
            type="number"
            id="cantidadHijos"
            min="0"
            value={formData.cantidadHijos}
            onChange={(e) => handleInputChange('cantidadHijos', parseInt(e.target.value) || 0)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              getFieldError('cantidadHijos') ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {getFieldError('cantidadHijos') && (
            <p className="text-red-500 text-sm mt-1">{getFieldError('cantidadHijos')}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="correoElectronico"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Correo Electrónico *
          </label>
          <input
            type="email"
            id="correoElectronico"
            value={formData.correoElectronico}
            onChange={(e) => handleInputChange('correoElectronico', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              getFieldError('correoElectronico') ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {getFieldError('correoElectronico') && (
            <p className="text-red-500 text-sm mt-1">{getFieldError('correoElectronico')}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfonos *</label>
          {formData.telefonos.map((telefono, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="tel"
                value={telefono}
                onChange={(e) => handleArrayInputChange('telefonos', index, e.target.value)}
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  getFieldError(`telefono_${index}`) ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+56912345678"
                disabled={isLoading}
              />
              {formData.telefonos.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('telefonos', index)}
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400"
                  disabled={isLoading}
                >
                  Eliminar
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('telefonos')}
            className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400"
            disabled={isLoading}
          >
            + Agregar Teléfono
          </button>
          {getFieldError('telefonos') && (
            <p className="text-red-500 text-sm mt-1">{getFieldError('telefonos')}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Direcciones *</label>
          {formData.direcciones.map((direccion, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={direccion}
                onChange={(e) => handleArrayInputChange('direcciones', index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Av. Ejemplo 123, Ciudad"
                disabled={isLoading}
              />
              {formData.direcciones.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('direcciones', index)}
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400"
                  disabled={isLoading}
                >
                  Eliminar
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('direcciones')}
            className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400"
            disabled={isLoading}
          >
            + Agregar Dirección
          </button>
          {getFieldError('direcciones') && (
            <p className="text-red-500 text-sm mt-1">{getFieldError('direcciones')}</p>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'} Usuario
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};
