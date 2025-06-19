import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';

describe('AuthContext', () => {
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

    act(() => {
      result.current.logout();
    });
    expect(result.current.isAuthenticated).toBe(false);
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
  });
});
