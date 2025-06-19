import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AuthContext', () => {
  beforeEach(() => {
    // Limpiar todos los mocks antes de cada test
    jest.clearAllMocks();
  });

  it('logs in and logs out correctly', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);

    // login es async, esperar resultado
    let loginResult: boolean = false;
    await act(async () => {
      loginResult = await result.current.login('testuser', '1234');
    });

    expect(loginResult).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBe('testuser');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('user', 'testuser');

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
  });

  it('does not log in with incorrect password', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });

    let loginResult: boolean = true;
    await act(async () => {
      loginResult = await result.current.login('testuser', 'wrongpass');
    });

    expect(loginResult).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  // Test: cuando el usuario regresa y ya estaba logueado previamente
  it('restores user from localStorage on initialization', () => {
    localStorageMock.getItem.mockReturnValue('storedUser');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
    expect(result.current.user).toBe('storedUser');
    expect(result.current.isAuthenticated).toBe(true);
  });


  // Test: cuando es la primera vez que el usuario visita la app
  it('does not restore user when localStorage is empty', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
  });
});
