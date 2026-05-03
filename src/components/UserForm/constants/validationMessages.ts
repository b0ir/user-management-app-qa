export const VALIDATION_MESSAGES = {
  RUT_INVALID: 'Invalid RUT',
  NAME_REQUIRED: 'Name is required',
  BIRTH_DATE_REQUIRED: 'Date of birth is required',
  BIRTH_DATE_FUTURE: 'Date of birth cannot be in the future',
  BIRTH_DATE_INVALID: 'Invalid date of birth',
  CHILDREN_NEGATIVE: 'Number of children cannot be negative',
  EMAIL_INVALID: 'Invalid email',
  PHONE_REQUIRED: 'At least one phone number is required',
  PHONE_INVALID: 'Invalid phone number',
  ADDRESS_REQUIRED: 'At least one address is required',
  ADDRESS_INVALID: 'Invalid address',
} as const;
