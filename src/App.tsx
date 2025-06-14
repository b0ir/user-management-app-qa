import React, { useState, useEffect } from 'react';
import { User } from './types/User';
import { UserService } from './services/api';

export const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadUsers();
    loadUsersCount();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await UserService.getAllUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        showMessage('error', response.message || 'Error al cargar usuarios');
      }
    } catch (error) {
      showMessage('error', 'Error inesperado al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsersCount = async () => {
    try {
      const response = await UserService.getUsersCount();
      if (response.success && response.data !== undefined) {
        setTotalUsers(response.data);
      }
    } catch (error) {
      console.error('Error loading users count:', error);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateAge = (fechaNacimiento: string): number => {
    const today = new Date();
    const birthDate = new Date(fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
              <p className="text-gray-600 mt-1">Sistema de administración de usuarios</p>
            </div>

            <button className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
              + Agregar Usuario
            </button>
          </div>
        </div>
      </header>

      {/* Message Alert */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div
            className={`p-4 rounded-md ${
              message.type === 'success'
                ? 'bg-green-100 border border-green-400 text-green-700'
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}
          >
            <div className="flex justify-between items-center">
              <span>{message.text}</span>
              <button
                onClick={() => setMessage(null)}
                className="text-lg font-bold hover:opacity-70 ml-4"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Lista de Usuarios</h2>
            <p className="text-gray-600">
              <span className="font-semibold text-blue-600">{totalUsers}</span> usuarios registrados
              en total
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

                return (
                  <div
                    key={user.id}
                    className="border rounded-lg p-4 transition-all hover:shadow-md border-gray-200"
                  >
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
                              <div key={index} className="text-gray-900 font-mono">
                                {telefono}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="font-semibold text-gray-700">Direcciones:</span>
                          <div className="ml-2">
                            {user.direcciones.map((direccion, index) => (
                              <div key={index} className="text-gray-900">
                                {direccion}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                      <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                        Editar
                      </button>

                      <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500">
            <p>App de Gestión de Usuarios</p>
            <p className="text-sm mt-1">Desarrollado por Benjamín Aros</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
