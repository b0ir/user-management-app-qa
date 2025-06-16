import React from 'react';
import { User } from '../types/User';
import { calculateAge, isBirthday } from '../utils/validation';

interface UserListProps {
  users: User[];
  totalUsers: number;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  isLoading: boolean;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  totalUsers,
  onEdit,
  onDelete,
  isLoading,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const canDelete = (user: User) => {
    return !isBirthday(user.fechaNacimiento);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Lista de Usuarios</h2>
        <p className="text-gray-600">
          <span className="font-semibold text-blue-600">{totalUsers}</span> usuarios registrados en total
        </p>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No hay usuarios registrados</p>
          <p className="text-gray-400">Agrega el primer usuario para comenzar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => {
            const userAge = calculateAge(user.fechaNacimiento);
            const isUserBirthday = isBirthday(user.fechaNacimiento);

            return (
              <div
                key={user.id}
                className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                  isUserBirthday ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'
                }`}
              >
                {isUserBirthday && (
                  <div className="mb-3 p-2 bg-yellow-200 border border-yellow-400 rounded-md">
                    <p className="text-yellow-800 font-medium flex items-center">
                      🎉 ¡Hoy es el cumpleaños de {user.nombre.split(' ')[0]}!
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold text-gray-700">Nombre:</span>
                      <span className="ml-2 text-gray-900">{user.nombre}</span>
                    </div>

                    <div>
                      <span className="font-semibold text-gray-700">RUT:</span>
                      <span className="ml-2 text-gray-900 font-mono">{user.rut}</span>
                    </div>

                    <div>
                      <span className="font-semibold text-gray-700">Fecha de Nacimiento:</span>
                      <span className="ml-2 text-gray-900">
                        {formatDate(user.fechaNacimiento)} ({userAge} años)
                      </span>
                    </div>

                    <div>
                      <span className="font-semibold text-gray-700">Hijos:</span>
                      <span className="ml-2 text-gray-900">{user.cantidadHijos}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold text-gray-700">Email:</span>
                      <span className="ml-2 text-gray-900">{user.correoElectronico}</span>
                    </div>

                    <div>
                      <span className="font-semibold text-gray-700">Teléfonos:</span>
                      <div className="ml-2">
                        {user.telefonos.map((telefono, index) => (
                          <div key={index} className="text-gray-900 font-mono">{telefono}</div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-semibold text-gray-700">Direcciones:</span>
                      <div className="ml-2">
                        {user.direcciones.map((direccion, index) => (
                          <div key={index} className="text-gray-900">{direccion}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => onEdit(user)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    disabled={isLoading}
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => onDelete(user)}
                    disabled={!canDelete(user) || isLoading}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      canDelete(user)
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    title={
                      !canDelete(user)
                        ? 'No se puede eliminar: usuario de cumpleaños'
                        : 'Eliminar usuario'
                    }
                  >
                    {!canDelete(user) ? '🎂 No eliminar' : 'Eliminar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
