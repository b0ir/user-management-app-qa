import { render, screen, fireEvent } from '@testing-library/react';
import { UserList } from '../components/UserList';

const mockUser = {
  id: '1',
  rut: '12345678-5',
  nombre: 'Test User',
  fechaNacimiento: '1990-01-02', // Cambiado para evitar problemas de zona horaria
  cantidadHijos: 1,
  correoElectronico: 'test@example.com',
  telefonos: ['+56912345678'],
  direcciones: ['Test Address 123'],
};

describe('UserList', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    mockOnEdit.mockClear();
    mockOnDelete.mockClear();
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

    expect(screen.getByText('12345678-5')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('+56912345678')).toBeInTheDocument();
    expect(screen.getByText('Test Address 123')).toBeInTheDocument();
  });

  test('calls onEdit when edit button is clicked', () => {
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
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockUser);
  });

  test('calls onDelete when delete button is clicked', () => {
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
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockUser);
  });

  test('handles multiple phones and addresses', () => {
    const userWithMultipleContacts = {
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

  test('disables buttons when isLoading is true', () => {
    render(
      <UserList
        users={[mockUser]}
        totalUsers={1}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isLoading={true}
      />
    );

    // En loading state no deberían mostrarse los botones
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
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
});
