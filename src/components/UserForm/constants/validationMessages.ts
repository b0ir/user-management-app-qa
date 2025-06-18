export const VALIDATION_MESSAGES = {
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
