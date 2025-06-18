// Barrel export para el módulo UserForm
export { UserForm } from './UserForm';
export type { UserFormProps } from './UserForm';
export { useUserForm } from './hooks/useUserForm';

// Re-exportar utilidades por si se necesita usarlas externamente
export { sanitizeFormData, createInitialFormData } from './utils/formDataUtils';
export { validateForm } from './utils/validationUtils';
export { VALIDATION_MESSAGES } from './constants/validationMessages';
