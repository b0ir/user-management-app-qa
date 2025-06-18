import React from 'react';

interface FormActionsProps {
  isEditMode: boolean;
  isFormValid: boolean;
  isLoading: boolean;
  onCancel: () => void;
}

export const FormActions: React.FC<FormActionsProps> = ({
  isEditMode,
  isFormValid,
  isLoading,
  onCancel,
}) => (
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
