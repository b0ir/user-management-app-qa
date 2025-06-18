import { useState, useEffect, useCallback } from 'react';
import { User, ValidationError } from '../../../types/User';
import { formatRUT } from '../../../utils/validation';
import { createInitialFormData, getIsEditMode } from '../utils/formDataUtils';
import { validateForm } from '../utils/validationUtils';

export const useUserForm = (user?: User | null) => {
  const [formData, setFormData] = useState(createInitialFormData(user));
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isFormValid, setIsFormValid] = useState(false);

  const isEditMode = getIsEditMode(user);

  const validateFormData = useCallback(() => {
    const allErrors = validateForm(formData, isEditMode);
    setErrors(allErrors);
    setIsFormValid(allErrors.length === 0);
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
    validateFormData();
  }, [validateFormData]);

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