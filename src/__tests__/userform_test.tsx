import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserForm } from '../components/UserForm';

const mockUser = {
  id: '1',
  rut: '12345678-5',
  nombre: 'Test User',
  fechaNacimiento: '1990-01-02',
  cantidadHijos: 1,
  correoElectronico: 'test@example.com',
  telefonos: ['+56912345678'],
  direcciones: ['Test Address 123'],
};

describe('UserForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  test('renders create mode correctly', () => {
    render(
      <UserForm user={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />
    );

    expect(screen.getByText('Agregar Nuevo Usuario')).toBeInTheDocument();
    expect(screen.getByLabelText('RUT *')).toBeInTheDocument();
    expect(screen.getByText('Crear Usuario')).toBeInTheDocument();
  });

  test('renders edit mode correctly', () => {
    render(
      <UserForm user={mockUser} onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />
    );

    expect(screen.getByText('Editar Usuario')).toBeInTheDocument();
    expect(screen.queryByLabelText('RUT *')).not.toBeInTheDocument();
    expect(screen.getByText('Actualizar Usuario')).toBeInTheDocument();
  });

  test('pre-populates form with user data in edit mode', () => {
    render(
      <UserForm user={mockUser} onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />
    );

    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1990-01-02')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('+56912345678')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Address 123')).toBeInTheDocument();
  });

  test('shows validation errors for empty required fields', async () => {
    render(
      <UserForm user={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />
    );

    await waitFor(() => {
      expect(screen.getByText('RUT inválido')).toBeInTheDocument();
      expect(screen.getByText('Nombre es requerido')).toBeInTheDocument();
      expect(screen.getByText('Fecha de nacimiento es requerida')).toBeInTheDocument();
      expect(screen.getByText('Email inválido')).toBeInTheDocument();
      expect(screen.getByText('Al menos un teléfono es requerido')).toBeInTheDocument();
      expect(screen.getByText('Al menos una dirección es requerida')).toBeInTheDocument();
    });
  });

  test('validates RUT format', async () => {
    const user = userEvent.setup();

    render(
      <UserForm user={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />
    );

    const rutInput = screen.getByLabelText('RUT *');
    await user.type(rutInput, 'invalid-rut');

    await waitFor(() => {
      expect(screen.getByText('RUT inválido')).toBeInTheDocument();
    });
  });

  test('validates email format', async () => {
    const user = userEvent.setup();

    render(
      <UserForm user={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />
    );

    const emailInput = screen.getByLabelText('Correo Electrónico *');
    await user.type(emailInput, 'invalid-email');

    await waitFor(() => {
      expect(screen.getByText('Email inválido')).toBeInTheDocument();
    });
  });

  test('validates future birth date', async () => {
    const user = userEvent.setup();

    render(
      <UserForm user={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />
    );

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const futureDate = tomorrow.toISOString().split('T')[0];

    const dateInput = screen.getByLabelText('Fecha de Nacimiento *');
    await user.type(dateInput, futureDate);

    await waitFor(() => {
      expect(screen.getByText('La fecha de nacimiento no puede ser futura')).toBeInTheDocument();
    });
  });

  test('adds additional phone numbers', async () => {
    const user = userEvent.setup();

    render(
      <UserForm user={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />
    );

    const addPhoneButton = screen.getByText('+ Agregar Teléfono');
    await user.click(addPhoneButton);

    const phoneInputs = screen.getAllByPlaceholderText('+56912345678');
    expect(phoneInputs).toHaveLength(2);
  });

  test('removes additional phone numbers', async () => {
    const user = userEvent.setup();

    render(
      <UserForm user={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />
    );

    // Añadir un teléfono primero
    const addPhoneButton = screen.getByText('+ Agregar Teléfono');
    await user.click(addPhoneButton);

    // Eliminarlo usando getAllByText y hacer clic en el primero
    const removeButtons = screen.getAllByText('Eliminar');
    await user.click(removeButtons[0]);

    const phoneInputs = screen.getAllByPlaceholderText('+56912345678');
    expect(phoneInputs).toHaveLength(1);
  });

  test('adds additional addresses', async () => {
    const user = userEvent.setup();

    render(
      <UserForm user={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />
    );

    const addAddressButton = screen.getByText('+ Agregar Dirección');
    await user.click(addAddressButton);

    const addressInputs = screen.getAllByPlaceholderText('Av. Ejemplo 123, Ciudad');
    expect(addressInputs).toHaveLength(2);
  });

  test('removes additional addresses', async () => {
    const user = userEvent.setup();

    render(
      <UserForm user={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />
    );

    // Añadir una dirección primero
    const addAddressButton = screen.getByText('+ Agregar Dirección');
    await user.click(addAddressButton);

    // Eliminarlo
    const removeButtons = screen.getAllByText('Eliminar');
    await user.click(removeButtons[removeButtons.length - 1]); // Clickear el último botón de eliminar

    const addressInputs = screen.getAllByPlaceholderText('Av. Ejemplo 123, Ciudad');
    expect(addressInputs).toHaveLength(1);
  });

  test('formats RUT input automatically', async () => {
    const user = userEvent.setup();

    render(
      <UserForm user={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />
    );

    const rutInput = screen.getByLabelText('RUT *');
    await user.type(rutInput, '123456785');

    // El formatRUT agrega puntos, así que esperamos el formato con puntos
    expect(rutInput).toHaveValue('12.345.678-5');
  });

  test('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <UserForm user={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />
    );

    const cancelButton = screen.getByText('Cancelar');
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('submits valid form data', async () => {
    const user = userEvent.setup();

    render(
      <UserForm user={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />
    );

    // Rellenar campos obligatorios
    await user.type(screen.getByLabelText('RUT *'), '123456785');
    await user.type(screen.getByLabelText('Nombre *'), 'Test User');
    await user.type(screen.getByLabelText('Fecha de Nacimiento *'), '1990-01-02');
    await user.type(screen.getByLabelText('Correo Electrónico *'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('+56912345678'), '+56912345678');
    await user.type(screen.getByPlaceholderText('Av. Ejemplo 123, Ciudad'), 'Test Address');

    // Esperar a que el botón de enviar esté habilitado
    await waitFor(() => {
      const submitButton = screen.getByText('Crear Usuario');
      expect(submitButton).not.toBeDisabled();
    });

    const submitButton = screen.getByText('Crear Usuario');
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      rut: '12.345.678-5', // formatRUT agrega puntos
      nombre: 'Test User',
      fechaNacimiento: '1990-01-02',
      cantidadHijos: 0,
      correoElectronico: 'test@example.com',
      telefonos: ['+56912345678'],
      direcciones: ['Test Address'],
    });
  });

  test('disables form when loading', () => {
    render(
      <UserForm user={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={true} />
    );

    expect(screen.getByLabelText('RUT *')).toBeDisabled();
    expect(screen.getByLabelText('Nombre *')).toBeDisabled();
  });

  test('prevents form submission when invalid', async () => {
    const user = userEvent.setup();

    render(
      <UserForm user={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />
    );

    const submitButton = screen.getByText('Crear Usuario');
    expect(submitButton).toBeDisabled();

    await user.click(submitButton);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('handles form submission with multiple phones and addresses', async () => {
    const user = userEvent.setup();

    render(
      <UserForm user={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={false} />
    );

    // Rellenar campos obligatorios
    await user.type(screen.getByLabelText('RUT *'), '123456785');
    await user.type(screen.getByLabelText('Nombre *'), 'Test User');
    await user.type(screen.getByLabelText('Fecha de Nacimiento *'), '1990-01-02');
    await user.type(screen.getByLabelText('Correo Electrónico *'), 'test@example.com');

    // Añadir multiple teléfonos
    await user.type(screen.getByPlaceholderText('+56912345678'), '+56912345678');
    await user.click(screen.getByText('+ Agregar Teléfono'));
    const phoneInputs = screen.getAllByPlaceholderText('+56912345678');
    await user.type(phoneInputs[1], '+56987654321');

    // Añadir multiples direcciones
    await user.type(screen.getByPlaceholderText('Av. Ejemplo 123, Ciudad'), 'Address 1');
    await user.click(screen.getByText('+ Agregar Dirección'));
    const addressInputs = screen.getAllByPlaceholderText('Av. Ejemplo 123, Ciudad');
    await user.type(addressInputs[1], 'Address 2');

    await waitFor(() => {
      const submitButton = screen.getByText('Crear Usuario');
      expect(submitButton).not.toBeDisabled();
    });

    const submitButton = screen.getByText('Crear Usuario');
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      rut: '12.345.678-5', // formatRUT agrega puntos
      nombre: 'Test User',
      fechaNacimiento: '1990-01-02',
      cantidadHijos: 0,
      correoElectronico: 'test@example.com',
      telefonos: ['+56912345678', '+56987654321'],
      direcciones: ['Address 1', 'Address 2'],
    });
  });
});
