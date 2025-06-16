import React, { useState, useEffect } from 'react';
import { User, CreateUserDTO, UpdateUserDTO } from './types/User';
import { UserService } from './services/api';
import { UserList } from './components/UserList';
import { UserForm } from './components/UserForm';

type ViewMode = 'list' | 'create' | 'edit';

export const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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

  const handleCreateUser = async (userData: CreateUserDTO) => {
    setIsLoading(true);
    try {
      const response = await UserService.createUser(userData);
      if (response.success) {
        showMessage('success', 'Usuario creado exitosamente');
        await loadUsers();
        await loadUsersCount();
        setCurrentView('list');
      } else {
        showMessage('error', response.message || 'Error al crear usuario');
      }
    } catch (error) {
      showMessage('error', 'Error inesperado al crear usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (userData: UpdateUserDTO) => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      const response = await UserService.updateUser(selectedUser.id, userData);
      if (response.success) {
        showMessage('success', 'Usuario actualizado exitosamente');
        await loadUsers();
        setCurrentView('list');
        setSelectedUser(null);
      } else {
        showMessage('error', response.message || 'Error al actualizar usuario');
      }
    } catch (error) {
      showMessage('error', 'Error inesperado al actualizar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setCurrentView('edit');
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar a ${user.nombre}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await UserService.deleteUser(user.id);
      if (response.success) {
        showMessage('success', 'Usuario eliminado exitosamente');
        await loadUsers();
        await loadUsersCount();
      } else {
        showMessage('error', response.message || 'Error al eliminar usuario');
      }
    } catch (error) {
      showMessage('error', 'Error inesperado al eliminar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentView('list');
    setSelectedUser(null);
  };

  const handleFormSubmit = async (userData: CreateUserDTO | UpdateUserDTO) => {
    if (currentView === 'create') {
      await handleCreateUser(userData as CreateUserDTO);
    } else if (currentView === 'edit') {
      await handleUpdateUser(userData as UpdateUserDTO);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
              <p className="text-gray-600 mt-1">Sistema de administración de usuarios</p>
            </div>

            {currentView === 'list' && (
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setCurrentView('create');
                }}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400"
              >
                <span className="px-8">+ Agregar Usuario </span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Message Alert */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
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
                className="text-lg font-bold hover:opacity-70"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Breadcrumb */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="flex items-center space-x-2 text-gray-500">
          <button
            onClick={() => {
              setSelectedUser(null);
              setCurrentView('list');
            }}
            className={`hover:text-blue-600 ${currentView === 'list' ? 'text-blue-600 font-medium' : ''}`}
          >
            Lista de Usuarios
          </button>
          {currentView !== 'list' && (
            <>
              <span>/</span>
              <span className="text-blue-600 font-medium">
                {currentView === 'create' ? 'Agregar Usuario' : 'Editar Usuario'}
              </span>
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'list' && (
          <UserList
            users={users}
            totalUsers={totalUsers}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            isLoading={isLoading}
          />
        )}

        {(currentView === 'create' || currentView === 'edit') && (
          <UserForm
            user={selectedUser}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        )}
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
