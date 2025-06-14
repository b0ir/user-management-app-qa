import React, { useState, useEffect } from 'react';
import { User } from './types/User';
import { UserService } from './services/api';
import { UserList } from './components/UserList';

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

  const handleEditUser = (user: User) => {
    showMessage('error', 'Funcionalidad de edición no implementada aún');
  };

  const handleDeleteUser = (user: User) => {
    showMessage('error', 'Funcionalidad de eliminación no implementada aún');
  };

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
        <UserList
          users={users}
          totalUsers={totalUsers}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          isLoading={isLoading}
        />
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