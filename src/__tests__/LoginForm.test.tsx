import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../components/LoginForm';

describe('LoginForm', () => {
  it('shows error message on failed login', async () => {
    const mockLogin = jest.fn().mockResolvedValue(false);

    render(<LoginForm login={mockLogin} />);

    fireEvent.change(screen.getByTestId('username-input'), {
      target: { value: 'anyuser' },
    });
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByText(/usuario o contraseña inválidos/i)).toBeInTheDocument();
    });
  });

  it('does not show error message on successful login', async () => {
    const mockLogin = jest.fn().mockResolvedValue(true);

    render(<LoginForm login={mockLogin} />);

    fireEvent.change(screen.getByTestId('username-input'), {
      target: { value: 'validuser' },
    });
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: '1234' },
    });
    fireEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.queryByText(/usuario o contraseña inválidos/i)).not.toBeInTheDocument();
    });
  });

  it('inputs accept text and button is clickable', () => {
    const mockLogin = jest.fn();

    render(<LoginForm login={mockLogin} />);

    const usernameInput = screen.getByTestId('username-input') as HTMLInputElement;
    const passwordInput = screen.getByTestId('password-input') as HTMLInputElement;
    const loginButton = screen.getByTestId('login-button');

    fireEvent.change(usernameInput, { target: { value: 'user1' } });
    fireEvent.change(passwordInput, { target: { value: 'pass1' } });

    expect(usernameInput.value).toBe('user1');
    expect(passwordInput.value).toBe('pass1');
    expect(loginButton).toBeEnabled();
  });

  it('clears error message after successful login following a failure', async () => {
    // Setup mock to fail first, then succeed
    const mockLogin = jest
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    render(<LoginForm login={mockLogin} />);

    // First attempt: fail
    fireEvent.change(screen.getByTestId('username-input'), {
      target: { value: 'user' },
    });
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByText(/usuario o contraseña inválidos/i)).toBeInTheDocument();
    });

    // Second attempt: success
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: '1234' },
    });
    fireEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.queryByText(/usuario o contraseña inválidos/i)).not.toBeInTheDocument();
    });
  });
});
