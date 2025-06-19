import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

interface LoginFormProps {
  login?: (username: string, password: string) => Promise<boolean>;
}

export const LoginForm: React.FC<LoginFormProps> = ({ login: propLogin }) => {
  const context = useContext(AuthContext);
  const login = propLogin ?? context.login;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password);
    if (!success) {
      setError('Usuario o contraseña inválidos');
    } else {
      setError(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-4 border rounded">
      <h2 className="text-xl mb-4">Iniciar Sesión</h2>
      <input
        data-testid="username-input"
        type="text"
        placeholder="Usuario"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
        required
      />
      <input
        data-testid="password-input"
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
        required
      />
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <button
        data-testid="login-button"
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded"
      >
        Entrar
      </button>
    </form>
  );
};
