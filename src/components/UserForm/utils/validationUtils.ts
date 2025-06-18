import { ValidationError } from '../../../types/User';
import { validateRUT, validateEmail, validatePhone } from '../../../utils/validation';
import { VALIDATION_MESSAGES } from '../constants/validationMessages';

export const validateRutField = (formData: any, isEditMode: boolean): ValidationError[] => {
  const errors: ValidationError[] = [];
  if (!isEditMode && (!formData.rut || !validateRUT(formData.rut))) {
    errors.push({ field: 'rut', message: VALIDATION_MESSAGES.RUT_INVALID });
  }
  return errors;
};

export const validateNameField = (formData: any): ValidationError[] => {
  const errors: ValidationError[] = [];
  if (!formData.nombre.trim()) {
    errors.push({ field: 'nombre', message: VALIDATION_MESSAGES.NAME_REQUIRED });
  }
  return errors;
};

export const validateBirthDateField = (formData: any): ValidationError[] => {
  const errors: ValidationError[] = [];
  if (!formData.fechaNacimiento) {
    errors.push({
      field: 'fechaNacimiento',
      message: VALIDATION_MESSAGES.BIRTH_DATE_REQUIRED,
    });
  } else {
    const birthDate = new Date(formData.fechaNacimiento);
    const today = new Date();
    const minDate = new Date('1900-01-01');

    if (birthDate > today) {
      errors.push({
        field: 'fechaNacimiento',
        message: VALIDATION_MESSAGES.BIRTH_DATE_FUTURE,
      });
    } else if (birthDate < minDate || isNaN(birthDate.getTime())) {
      errors.push({
        field: 'fechaNacimiento',
        message: VALIDATION_MESSAGES.BIRTH_DATE_INVALID,
      });
    }
  }
  return errors;
};

export const validateChildrenField = (formData: any): ValidationError[] => {
  const errors: ValidationError[] = [];
  if (formData.cantidadHijos < 0) {
    errors.push({
      field: 'cantidadHijos',
      message: VALIDATION_MESSAGES.CHILDREN_NEGATIVE,
    });
  }
  return errors;
};

export const validateEmailField = (formData: any): ValidationError[] => {
  const errors: ValidationError[] = [];
  if (!formData.correoElectronico || !validateEmail(formData.correoElectronico)) {
    errors.push({ field: 'correoElectronico', message: VALIDATION_MESSAGES.EMAIL_INVALID });
  }
  return errors;
};

export const validatePhonesField = (formData: any): ValidationError[] => {
  const errors: ValidationError[] = [];
  const validPhones = formData.telefonos.filter((phone: string) => phone.trim());

  if (validPhones.length === 0) {
    errors.push({ field: 'telefonos', message: VALIDATION_MESSAGES.PHONE_REQUIRED });
  } else {
    validPhones.forEach((phone: string, index: number) => {
      if (!validatePhone(phone)) {
        errors.push({
          field: `telefono_${index}`,
          message: `Teléfono ${index + 1} inválido`,
        });
      }
    });
  }
  return errors;
};

export const validateAddressesField = (formData: any): ValidationError[] => {
  const errors: ValidationError[] = [];
  const validAddresses = formData.direcciones.filter((address: string) => address.trim());

  if (validAddresses.length === 0) {
    errors.push({ field: 'direcciones', message: VALIDATION_MESSAGES.ADDRESS_REQUIRED });
  } else {
    validAddresses.forEach((address: string, index: number) => {
      const trimmedAddress = address.trim();

      if (
        trimmedAddress.length < 5 ||
        /^\d+$/.test(trimmedAddress) ||
        !/[a-zA-Z]/.test(trimmedAddress)
      ) {
        errors.push({
          field: `direccion_${index}`,
          message: `Dirección ${index + 1} inválida`,
        });
      }
    });
  }
  return errors;
};

export const validateForm = (formData: any, isEditMode: boolean): ValidationError[] => {
  return [
    ...validateRutField(formData, isEditMode),
    ...validateNameField(formData),
    ...validateBirthDateField(formData),
    ...validateChildrenField(formData),
    ...validateEmailField(formData),
    ...validatePhonesField(formData),
    ...validateAddressesField(formData),
  ];
};
