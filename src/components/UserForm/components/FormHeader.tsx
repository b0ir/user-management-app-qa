import React from 'react';

interface FormHeaderProps {
  isEditMode: boolean;
}

export const FormHeader: React.FC<FormHeaderProps> = ({ isEditMode }) => (
  <h2 className="text-2xl font-bold mb-6 text-gray-800">
    {isEditMode ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}
  </h2>
);
