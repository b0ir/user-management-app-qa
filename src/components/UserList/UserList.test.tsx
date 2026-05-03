import { render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserList } from './UserList';
import { User } from '../../types/User';

// Helper function to find text that may be split across multiple elements
const getByTextContent = (text: string) => {
  return screen.getByText((_, element) => {
    return element?.textContent === text || false;
  });
};

// Helper to find text within a specific context
const getByTextInContext = (text: string, context: string) => {
  return screen.getByText((_, element) => {
    return !!(
      element?.textContent === text && element?.parentElement?.textContent?.includes(context)
    );
  });
};

const mockUser: User = {
  id: '1',
  rut: '12.345.678-5', // Format with dots as produced by formatRUT
  nombre: 'Test User',
  fechaNacimiento: '1990-01-02',
  cantidadHijos: 1,
  correoElectronico: 'test@example.com',
  telefonos: ['+56912345678'],
  direcciones: ['Test Address 123'],
  fechaCreacion: '2024-01-01T00:00:00.000Z',
  fechaActualizacion: '2024-01-02T00:00:00.000Z',
};

// User with birthday today (to test deletion restriction)
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

    expect(screen.getByText('User List')).toBeInTheDocument();
    expect(getByTextContent('0 registered users in total')).toBeInTheDocument();
    expect(screen.getByText('No registered users')).toBeInTheDocument();
    expect(screen.getByText('Add the first user to get started')).toBeInTheDocument();
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

    // Verify the loading spinner
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

    expect(screen.getByText('User List')).toBeInTheDocument();
    expect(getByTextContent('1 registered users in total')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('12.345.678-5')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('+56912345678')).toBeInTheDocument();
    expect(screen.getByText('Test Address 123')).toBeInTheDocument();

    // Verify the children section exists
    expect(screen.getByText('Children:')).toBeInTheDocument();
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

    // Verify that the correct number of children is shown
    expect(getByTextInContext('1', 'Children:')).toBeInTheDocument();
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

    // Calculate expected age (user born in 1990)
    const currentYear = new Date().getFullYear();
    const expectedAge = currentYear - 1990;

    expect(screen.getByText(new RegExp(`${expectedAge} years`))).toBeInTheDocument();
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

    const editButton = screen.getByText('Edit');
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

    const deleteButton = screen.getByText('Delete');
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

    // Verify birthday message
    expect(screen.getByText(/Today is .+'s birthday!/)).toBeInTheDocument();

    // Verify disabled delete button
    const deleteButton = screen.getByText('🎂 Cannot delete');
    expect(deleteButton).toBeDisabled();
    expect(deleteButton).toHaveAttribute('title', 'Cannot delete: user has birthday today');

    // Verify the card has birthday styling
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

    const deleteButton = screen.getByText('Delete');
    expect(deleteButton).not.toBeDisabled();
    expect(deleteButton).toHaveAttribute('title', 'Delete user');
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

    // In loading state, should only show the spinner
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    // Should not show user cards
    expect(screen.queryByTestId('user-card')).not.toBeInTheDocument();
  });

  test('formats date correctly in English locale', () => {
    render(
      <UserList
        users={[mockUser]}
        totalUsers={1}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isLoading={false}
      />
    );

    // Verify the date is formatted correctly (should be in English)
    // Since the date is '1990-01-02', it should appear as "January 2, 1990" or similar
    expect(screen.getByText(/January/i) || screen.getByText(/1990/)).toBeInTheDocument();
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

    expect(getByTextContent('2 registered users in total')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Second User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('second@example.com')).toBeInTheDocument();

    // Verify there are two user cards
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

    const deleteButton = screen.getByText('Delete');
    expect(deleteButton).toHaveAttribute('title', 'Delete user');
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
