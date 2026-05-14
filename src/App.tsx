import React, { useState, useEffect, useContext } from 'react';
import { User, CreateUserDTO, UpdateUserDTO } from './types/User';
import { UserService } from './services/api';
import { UserList } from './components/UserList/UserList';
import { UserForm } from './components/UserForm';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { LoginForm } from './components/LoginForm';

type ViewMode = 'list' | 'create' | 'edit';

const AppContent: React.FC = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);

  // User state and functions
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<User | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
      loadUsersCount();
    }
  }, [isAuthenticated]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await UserService.getAllUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        showMessage('error', response.message || 'Error loading users');
      }
    } catch (error) {
      showMessage('error', 'Unexpected error loading users');
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
        showMessage('success', 'User created successfully');
        await loadUsers();
        await loadUsersCount();
        setCurrentView('list');
      } else {
        // Specific handling for duplicate RUT errors
        if (
          response.message?.toLowerCase().includes('rut') &&
          (response.message?.toLowerCase().includes('existe') ||
            response.message?.toLowerCase().includes('duplicado') ||
            response.message?.toLowerCase().includes('registrado'))
        ) {
          showMessage('error', 'RUT is already registered');
        } else {
          showMessage('error', response.message || 'Error creating user');
        }
      }
    } catch (error) {
      // Also handle network/server errors that may contain duplicate RUT info
      const errorMessage =
        error instanceof Error ? error.message : 'Unexpected error creating user';

      if (
        errorMessage.toLowerCase().includes('rut') &&
        (errorMessage.toLowerCase().includes('existe') ||
          errorMessage.toLowerCase().includes('duplicado') ||
          errorMessage.toLowerCase().includes('registrado'))
      ) {
        showMessage('error', 'RUT is already registered');
      } else {
        showMessage('error', 'Unexpected error creating user');
      }
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
        showMessage('success', 'User updated successfully');
        await loadUsers();
        setCurrentView('list');
        setSelectedUser(null);
      } else {
        showMessage('error', response.message || 'Error updating user');
      }
    } catch (error) {
      showMessage('error', 'Unexpected error updating user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setCurrentView('edit');
  };

  // Function to handle user deletion
  const handleDeleteUser = (user: User) => {
    setShowDeleteConfirm(user);
  };

  // Function to confirm deletion
  const confirmDelete = async () => {
    if (!showDeleteConfirm) return;

    setIsLoading(true);
    try {
      const response = await UserService.deleteUser(showDeleteConfirm.id);
      if (response.success) {
        showMessage('success', 'User deleted successfully');
        await loadUsers();
        await loadUsersCount();
      } else {
        showMessage('error', response.message || 'Error deleting user');
      }
    } catch (error) {
      showMessage('error', 'Unexpected error deleting user');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(null);
    }
  };

  // Function to cancel deletion
  const cancelDelete = () => {
    setShowDeleteConfirm(null);
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

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">User administration system</p>
              <p className="text-sm mt-1 text-gray-500">User: {user}</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Log Out
              </button>

              {currentView === 'list' && (
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setCurrentView('create');
                  }}
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                >
                  <span className="px-8">+ Add User </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Message Alert */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div
            role="alert"
            aria-live="assertive"
            className={`p-4 rounded-md ${message.type === 'success'
                ? 'bg-green-100 border border-green-400 text-green-700'
                : 'bg-red-100 border border-red-400 text-red-700'
              }`}
          >
            <div className="flex justify-between items-center">
              <span>{message.text}</span>
              <button
                onClick={() => setMessage(null)}
                className="text-lg font-bold hover:opacity-70"
                aria-label="Dismiss message"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Breadcrumb */}
      <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <ol className="flex items-center space-x-2 text-gray-500 list-none p-0 m-0">
          <li>
            <button
              onClick={() => {
                setSelectedUser(null);
                setCurrentView('list');
              }}
              aria-current={currentView === 'list' ? 'page' : undefined}
              className={`hover:text-blue-600 ${currentView === 'list' ? 'text-blue-600 font-medium' : ''}`}
            >
              User List
            </button>
          </li>
          {currentView !== 'list' && (
            <>
              <li aria-hidden="true"><span>/</span></li>
              <li>
                <span aria-current="page" className="text-blue-600 font-medium">
                  {currentView === 'create' ? 'Add User' : 'Edit User'}
                </span>
              </li>
            </>
          )}
        </ol>
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
          >
            <h3 id="delete-dialog-title" className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{showDeleteConfirm.nombre}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500">
            <p>User Management App</p>
            <p className="text-sm mt-1">Developed by b0ir</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);
