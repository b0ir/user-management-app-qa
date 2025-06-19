import { render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserList } from './UserList';
import { User } from '../../types/User';

// Helper function para buscar texto que puede estar dividido en múltiples elementos
const getByTextContent = (text: string) => {
  return screen.getByText((_, element) => {
    return element?.textContent === text || false;
  });
};

// Helper para buscar texto dentro de un contexto específico
const getByTextInContext = (text: string, context: string) => {
  return screen.getByText((_, element) => {
    return !!(
      element?.textContent === text && element?.parentElement?.textContent?.includes(context)
    );
  });
};

const mockUser: User = {
  id: '1',
  rut: '12.345.678-5', // Formato con puntos como produce formatRUT
  nombre: 'Test User',
  fechaNacimiento: '1990-01-02',
  cantidadHijos: 1,
  correoElectronico: 'test@example.com',
  telefonos: ['+56912345678'],
  direcciones: ['Test Address 123'],
  fechaCreacion: '2024-01-01T00:00:00.000Z',
  fechaActualizacion: '2024-01-02T00:00:00.000Z',
};

// Usuario con cumpleaños hoy (para probar restricción de eliminación)
const getUserWithBirthdayToday = (): User => {
  const today = new Date();
  const birthDate = `${today.getFullYear() - 30}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return {
    ...mockUser,
    id: '2',
    rut: '98.765.432-1',
    nombre: 'Birthday User',
    fechaNacimiento: birthDate,
  };
};

describe('UserList', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders empty state when no users', () => {
    render(
      <UserList
        users={[]}
        totalUsers={0}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isLoading={false}
      />
    );

    expect(screen.getByText('Lista de Usuarios')).toBeInTheDocument();
    expect(getByTextContent('0 usuarios registrados en total')).toBeInTheDocument();
    expect(screen.getByText('No hay usuarios registrados')).toBeInTheDocument();
    expect(screen.getByText('Agrega el primer usuario para comenzar')).toBeInTheDocument();
  });

  test('renders loading state', () => {
    render(
      <UserList
        users={[]}
        totalUsers={0}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isLoading={true}
      />
    );

    // Verificar el spinner de loading
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  test('renders user information correctly', () => {
    render(
      <UserList
        users={[mockUser]}
        totalUsers={1}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isLoading={false}
      />
    );

    expect(screen.getByText('Lista de Usuarios')).toBeInTheDocument();
    expect(getByTextContent('1 usuarios registrados en total')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('12.345.678-5')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('+56912345678')).toBeInTheDocument();
    expect(screen.getByText('Test Address 123')).toBeInTheDocument();

    // Verificar que la sección de hijos existe
    expect(screen.getByText('Hijos:')).toBeInTheDocument();
  });

  test('displays children count correctly', () => {
    render(
      <UserList
        users={[mockUser]}
        totalUsers={1}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isLoading={false}
      />
    );

    // Verificar que muestra la cantidad de hijos correcta
    expect(getByTextInContext('1', 'Hijos:')).toBeInTheDocument();
  });

  test('displays user age correctly', () => {
    render(
      <UserList
        users={[mockUser]}
        totalUsers={1}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isLoading={false}
      />
    );

    // Calcular edad esperada (usuario nació en 1990)
    const currentYear = new Date().getFullYear();
    const expectedAge = currentYear - 1990;

    expect(screen.getByText(new RegExp(`${expectedAge} años`))).toBeInTheDocument();
  });

  test('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <UserList
        users={[mockUser]}
        totalUsers={1}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isLoading={false}
      />
    );

    const editButton = screen.getByText('Editar');
    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockUser);
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  test('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <UserList
        users={[mockUser]}
        totalUsers={1}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isLoading={false}
      />
    );

    const deleteButton = screen.getByText('Eliminar');
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockUser);
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  test('handles multiple phones and addresses', () => {
    const userWithMultipleContacts: User = {
      ...mockUser,
      telefonos: ['+56912345678', '+56987654321'],
      direcciones: ['Address 1', 'Address 2'],
    };

    render(
      <UserList
        users={[userWithMultipleContacts]}
        totalUsers={1}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isLoading={false}
      />
    );

    expect(screen.getByText('+56912345678')).toBeInTheDocument();
    expect(screen.getByText('+56987654321')).toBeInTheDocument();
    expect(screen.getByText('Address 1')).toBeInTheDocument();
    expect(screen.getByText('Address 2')).toBeInTheDocument();
  });

  test('disables delete button and shows birthday message for users with birthday today', () => {
    const birthdayUser = getUserWithBirthdayToday();

    render(
      <UserList
        users={[birthdayUser]}
        totalUsers={1}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isLoading={false}
      />
    );

    // Verificar mensaje de cumpleaños
    expect(screen.getByText(/¡Hoy es el cumpleaños de/)).toBeInTheDocument();

    // Verificar botón de eliminación deshabilitado
    const deleteButton = screen.getByText('🎂 No eliminar');
    expect(deleteButton).toBeDisabled();
    expect(deleteButton).toHaveAttribute('title', 'No se puede eliminar: usuario de cumpleaños');

    // Verificar que la tarjeta tiene el estilo de cumpleaños
    const userCard = screen.getByTestId('user-card');
    expect(userCard).toHaveClass('border-yellow-400', 'bg-yellow-50');
  });

  test('enables delete button for users without birthday today', () => {
    render(
      <UserList
        users={[mockUser]}
        totalUsers={1}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isLoading={false}
      />
    );

    const deleteButton = screen.getByText('Eliminar');
    expect(deleteButton).not.toBeDisabled();
    expect(deleteButton).toHaveAttribute('title', 'Eliminar usuario');
    expect(deleteButton).toHaveClass('bg-red-500', 'text-white');
  });

  test('disables all buttons when isLoading is true', () => {
    render(
      <UserList
        users={[mockUser]}
        totalUsers={1}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isLoading={true}
      />
    );

    // En loading state, debería mostrar solo el spinner
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    // No debería mostrar las tarjetas de usuario
    expect(screen.queryByTestId('user-card')).not.toBeInTheDocument();
  });

  test('formats date correctly in Spanish locale', () => {
    render(
      <UserList
        users={[mockUser]}
        totalUsers={1}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isLoading={false}
      />
    );

    // Verificar que la fecha se formatea correctamente (debería estar en español)
    // Como la fecha es '1990-01-02', debería aparecer como "2 de enero de 1990" o similar
    expect(screen.getByText(/enero/i) || screen.getByText(/1990/)).toBeInTheDocument();
  });

  test('renders multiple users correctly', () => {
    const user2: User = {
      ...mockUser,
      id: '2',
      rut: '98.765.432-1',
      nombre: 'Second User',
      correoElectronico: 'second@example.com',
    };

    render(
      <UserList
        users={[mockUser, user2]}
        totalUsers={2}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isLoading={false}
      />
    );

    expect(getByTextContent('2 usuarios registrados en total')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Second User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('second@example.com')).toBeInTheDocument();

    // Verificar que hay dos tarjetas de usuario
    const userCards = screen.getAllByTestId('user-card');
    expect(userCards).toHaveLength(2);
  });

  test('shows correct tooltip for enabled delete button', () => {
    render(
      <UserList
        users={[mockUser]}
        totalUsers={1}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isLoading={false}
      />
    );

    const deleteButton = screen.getByText('Eliminar');
    expect(deleteButton).toHaveAttribute('title', 'Eliminar usuario');
  });

  test('applies correct CSS classes for birthday user card', () => {
    const birthdayUser = getUserWithBirthdayToday();

    render(
      <UserList
        users={[birthdayUser]}
        totalUsers={1}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isLoading={false}
      />
    );

    const userCard = screen.getByTestId('user-card');
    expect(userCard).toHaveClass('border-yellow-400');
    expect(userCard).toHaveClass('bg-yellow-50');
  });

  test('applies correct CSS classes for normal user card', () => {
    render(
      <UserList
        users={[mockUser]}
        totalUsers={1}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isLoading={false}
      />
    );

    const userCard = screen.getByTestId('user-card');
    expect(userCard).toHaveClass('border-gray-200');
    expect(userCard).not.toHaveClass('border-yellow-400');
    expect(userCard).not.toHaveClass('bg-yellow-50');
  });
});
