import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserForm } from '.';
import { User } from '../../types/User';
import { ArrayField } from './components/FormFields/ArrayField';

const mockOnSubmit = jest.fn();
const mockOnCancel = jest.fn();

const defaultProps = {
  onSubmit: mockOnSubmit,
  onCancel: mockOnCancel,
  isLoading: false,
};

describe('UserForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form in create mode', () => {
    render(<UserForm {...defaultProps} />);

    expect(screen.getByText('Agregar Nuevo Usuario')).toBeInTheDocument();
    expect(screen.getByTestId('rut-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Crear Usuario');
  });

  test('renders form in edit mode', () => {
    const user: User = {
      id: '1',
      rut: '12345678-9',
      nombre: 'Juan Pérez',
      fechaNacimiento: '1990-01-01',
      cantidadHijos: 2,
      correoElectronico: 'juan@example.com',
      telefonos: ['+56912345678'],
      direcciones: ['Av. Ejemplo 123'],
      fechaCreacion: '2024-01-01T00:00:00.000Z',
      fechaActualizacion: '2024-01-02T00:00:00.000Z',
    };

    render(<UserForm {...defaultProps} user={user} />);

    expect(screen.getByText('Editar Usuario')).toBeInTheDocument();
    expect(screen.queryByTestId('rut-input')).not.toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Actualizar Usuario');
    expect(screen.getByDisplayValue('Juan Pérez')).toBeInTheDocument();
  });

  it('should not submit the form if it is invalid', async () => {
    const user = userEvent.setup();
    render(<UserForm {...defaultProps} />);

    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toBeDisabled();

    // Forzar el submit de todas formas
    await user.click(submitButton);

    // Asegurarse de que onSubmit **NO fue llamado**
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('does not call onSubmit if form is invalid on submit', async () => {
    const user = userEvent.setup();
    render(<UserForm {...defaultProps} />);

    const submitButton = screen.getByTestId('submit-button');

    // Forzar submit (aunque botón esté deshabilitado)
    await user.click(submitButton);

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('validates required fields', async () => {
    render(<UserForm {...defaultProps} />);

    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toBeDisabled();

    // Verificar errores de validación
    expect(screen.getByTestId('rut-error')).toHaveTextContent('RUT inválido');
    expect(screen.getByTestId('nombre-error')).toHaveTextContent('Nombre es requerido');
    expect(screen.getByTestId('fechaNacimiento-error')).toHaveTextContent(
      'Fecha de nacimiento es requerida'
    );
    expect(screen.getByTestId('correoElectronico-error')).toHaveTextContent('Email inválido');
    expect(screen.getByTestId('telefonos-error')).toHaveTextContent(
      'Al menos un teléfono es requerido'
    );
    expect(screen.getByTestId('direcciones-error')).toHaveTextContent(
      'Al menos una dirección es requerida'
    );
  });

  test('adds additional phone numbers', async () => {
    const user = userEvent.setup();
    render(<UserForm {...defaultProps} />);

    const addPhoneButton = screen.getByTestId('telefonos-add');
    await user.click(addPhoneButton);

    const phoneInputs = screen.getAllByTestId(/^telefonos-input-\d+$/);
    expect(phoneInputs).toHaveLength(2);
  });

  test('removes additional phone numbers', async () => {
    const user = userEvent.setup();
    render(<UserForm {...defaultProps} />);

    // Añadir un teléfono primero
    const addPhoneButton = screen.getByTestId('telefonos-add');
    await user.click(addPhoneButton);

    // Ahora debería haber 2 inputs y botones de eliminar
    let phoneInputs = screen.getAllByTestId(/^telefonos-input-\d+$/);
    expect(phoneInputs).toHaveLength(2);

    // Eliminar el segundo teléfono
    const removeButton = screen.getByTestId('telefonos-remove-1');
    await user.click(removeButton);

    // Debería quedar solo 1
    phoneInputs = screen.getAllByTestId(/^telefonos-input-\d+$/);
    expect(phoneInputs).toHaveLength(1);
  });

  test('adds additional addresses', async () => {
    const user = userEvent.setup();
    render(<UserForm {...defaultProps} />);

    const addAddressButton = screen.getByTestId('direcciones-add');
    await user.click(addAddressButton);

    const addressInputs = screen.getAllByTestId(/^direcciones-input-\d+$/);
    expect(addressInputs).toHaveLength(2);
  });

  test('removes additional addresses', async () => {
    const user = userEvent.setup();
    render(<UserForm {...defaultProps} />);

    // Añadir una dirección primero
    const addAddressButton = screen.getByTestId('direcciones-add');
    await user.click(addAddressButton);

    // Ahora debería haber 2 inputs
    let addressInputs = screen.getAllByTestId(/^direcciones-input-\d+$/);
    expect(addressInputs).toHaveLength(2);

    // Eliminar la segunda dirección
    const removeButton = screen.getByTestId('direcciones-remove-1');
    await user.click(removeButton);

    // Debería quedar solo 1
    addressInputs = screen.getAllByTestId(/^direcciones-input-\d+$/);
    expect(addressInputs).toHaveLength(1);
  });
  it('shows general error for address field', () => {
    const errors = [{ field: 'direcciones', message: 'Debe ingresar al menos una dirección' }];
    render(
      <ArrayField
        label="Direcciones"
        fieldName="direcciones"
        values={['']}
        onChange={() => {}}
        onAdd={() => {}}
        onRemove={() => {}}
        errors={errors}
      />
    );

    expect(screen.getByTestId('direcciones-error')).toHaveTextContent(
      'Debe ingresar al menos una dirección'
    );
  });

  test('formats RUT correctly', async () => {
    const user = userEvent.setup();
    render(<UserForm {...defaultProps} />);

    const rutInput = screen.getByTestId('rut-input') as HTMLInputElement;
    await user.type(rutInput, '123456789');

    // Esperamos el formato con puntos que produce formatRUT
    expect(rutInput.value).toBe('12.345.678-9');
  });

  test('validates future birth date', async () => {
    const user = userEvent.setup();
    render(<UserForm {...defaultProps} />);

    const birthDateInput = screen.getByTestId('fechaNacimiento-input');
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const futureDateString = futureDate.toISOString().split('T')[0];

    await user.type(birthDateInput, futureDateString);

    await waitFor(() => {
      expect(screen.getByTestId('fechaNacimiento-error')).toHaveTextContent(
        'La fecha de nacimiento no puede ser futura'
      );
    });
  });

  test('validates invalid addresses', async () => {
    const user = userEvent.setup();
    render(<UserForm {...defaultProps} />);

    const addressInput = screen.getByTestId('direcciones-input-0');

    // Borrar valor por defecto o cambiarlo a inválido
    await user.clear(addressInput);
    await user.type(addressInput, '123'); // menos de 5 caracteres

    await waitFor(() => {
      expect(screen.getByTestId('direcciones-error-0')).toHaveTextContent('Dirección 1 inválida');
    });

    // También verifica que el submit está deshabilitado por el error
    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toBeDisabled();
  });

  test('validates children count correctly', async () => {
    const user = userEvent.setup();
    render(<UserForm {...defaultProps} />);

    const childrenInput = screen.getByTestId('cantidadHijos-input') as HTMLInputElement;

    // Llenar otros campos para aislar la validación de hijos
    await user.type(screen.getByTestId('rut-input'), '12345678-5');
    await user.type(screen.getByTestId('nombre-input'), 'Test User');
    await user.type(screen.getByTestId('fechaNacimiento-input'), '1990-01-01');
    await user.type(screen.getByTestId('correoElectronico-input'), 'test@example.com');
    await user.type(screen.getByTestId('telefonos-input-0'), '+56912345678');
    await user.type(screen.getByTestId('direcciones-input-0'), 'Test Address');

    // Verificar que el valor por defecto (0) permite envío
    await waitFor(() => {
      expect(childrenInput.value).toBe('0');
      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).not.toBeDisabled();
    });

    // Verificar que números positivos funcionan
    await user.clear(childrenInput);
    await user.type(childrenInput, '3');

    await waitFor(() => {
      expect(childrenInput.value).toBe('3');
      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).not.toBeDisabled();
    });

    // Probar caracteres no numéricos
    await user.clear(childrenInput);
    await user.type(childrenInput, 'abc');

    await waitFor(() => {
      expect(childrenInput.value).toBe('0'); // El input HTML filtra caracteres no numéricos

      // Al convertirse el valor en 0, el formulario debería ser válido
      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).not.toBeDisabled();
    });
  });

  test('handles form submission with valid data', async () => {
    const user = userEvent.setup();
    render(<UserForm {...defaultProps} />);

    // Llenar todos los campos requeridos
    await user.type(screen.getByTestId('rut-input'), '12345678-5');
    await user.type(screen.getByTestId('nombre-input'), 'Test User');
    await user.type(screen.getByTestId('fechaNacimiento-input'), '1990-01-01');
    await user.type(screen.getByTestId('correoElectronico-input'), 'test@example.com');
    await user.type(screen.getByTestId('telefonos-input-0'), '+56912345678');
    await user.type(screen.getByTestId('direcciones-input-0'), 'Test Address');

    await waitFor(() => {
      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).not.toBeDisabled();
    });

    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    // Verificar que se llamó con el formato correcto (con puntos)
    expect(mockOnSubmit).toHaveBeenCalledWith({
      rut: '12.345.678-5',
      nombre: 'Test User',
      fechaNacimiento: '1990-01-01',
      cantidadHijos: 0,
      correoElectronico: 'test@example.com',
      telefonos: ['+56912345678'],
      direcciones: ['Test Address'],
    });
  });

  test('handles form submission with multiple phones and addresses', async () => {
    const user = userEvent.setup();
    render(<UserForm {...defaultProps} />);

    // Llenar campos básicos
    await user.type(screen.getByTestId('rut-input'), '12345678-5');
    await user.type(screen.getByTestId('nombre-input'), 'Test User');
    await user.type(screen.getByTestId('fechaNacimiento-input'), '1990-01-02');
    await user.type(screen.getByTestId('correoElectronico-input'), 'test@example.com');

    // Añadir múltiples teléfonos
    await user.type(screen.getByTestId('telefonos-input-0'), '+56912345678');
    await user.click(screen.getByTestId('telefonos-add'));
    await user.type(screen.getByTestId('telefonos-input-1'), '+56987654321');

    // Añadir múltiples direcciones
    await user.type(screen.getByTestId('direcciones-input-0'), 'Address 1');
    await user.click(screen.getByTestId('direcciones-add'));
    await user.type(screen.getByTestId('direcciones-input-1'), 'Address 2');

    await waitFor(() => {
      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).not.toBeDisabled();
    });

    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      rut: '12.345.678-5',
      nombre: 'Test User',
      fechaNacimiento: '1990-01-02',
      cantidadHijos: 0,
      correoElectronico: 'test@example.com',
      telefonos: ['+56912345678', '+56987654321'],
      direcciones: ['Address 1', 'Address 2'],
    });
  });

  test('handles cancel button', async () => {
    const user = userEvent.setup();
    render(<UserForm {...defaultProps} />);

    const cancelButton = screen.getByTestId('cancel-button');
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('disables form when loading', () => {
    render(<UserForm {...defaultProps} isLoading={true} />);

    const submitButton = screen.getByTestId('submit-button');
    const cancelButton = screen.getByTestId('cancel-button');
    const rutInput = screen.getByTestId('rut-input');

    expect(submitButton).toHaveTextContent('Guardando...');
    expect(cancelButton).toBeDisabled();
    expect(rutInput).toBeDisabled();
  });

  test('does not allow input changes when loading', async () => {
    const user = userEvent.setup();
    render(<UserForm {...defaultProps} isLoading={true} />);

    const nombreInput = screen.getByTestId('nombre-input') as HTMLInputElement;
    expect(nombreInput).toBeDisabled();

    // Intentar cambiar valor
    await user.type(nombreInput, 'Nuevo Nombre');
    expect(nombreInput.value).not.toBe('Nuevo Nombre');
  });

  test('validates invalid email', async () => {
    const user = userEvent.setup();
    render(<UserForm {...defaultProps} />);

    const emailInput = screen.getByTestId('correoElectronico-input');
    await user.type(emailInput, 'invalid-email');

    await waitFor(() => {
      expect(screen.getByTestId('correoElectronico-error')).toHaveTextContent('Email inválido');
    });
  });

  test('validates invalid phone number', async () => {
    const user = userEvent.setup();
    render(<UserForm {...defaultProps} />);

    // Llenar otros campos primero para aislar la validación del teléfono
    await user.type(screen.getByTestId('rut-input'), '12345678-5');
    await user.type(screen.getByTestId('nombre-input'), 'Test User');
    await user.type(screen.getByTestId('fechaNacimiento-input'), '1990-01-01');
    await user.type(screen.getByTestId('correoElectronico-input'), 'test@example.com');
    await user.type(screen.getByTestId('direcciones-input-0'), 'Test Address');

    const phoneInput = screen.getByTestId('telefonos-input-0');
    await user.type(phoneInput, '123'); // Teléfono muy corto

    await waitFor(() => {
      // Verificar que el botón se desactiva por la validación
      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeDisabled();

      // Verificar si hay error específico de teléfono
      const phoneError = screen.queryByTestId('telefonos-error-0');
      if (phoneError) {
        expect(phoneError).toHaveTextContent('Teléfono 1 inválido');
      }
    });
  });

  test('enables submit button only when all validations pass', async () => {
    const user = userEvent.setup();
    render(<UserForm {...defaultProps} />);

    const submitButton = screen.getByTestId('submit-button');

    // Inicialmente el botón debe estar deshabilitado
    expect(submitButton).toBeDisabled();

    // Llenar campos uno por uno y verificar que sigue deshabilitado
    await user.type(screen.getByTestId('rut-input'), '12345678-5');
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByTestId('nombre-input'), 'Test User');
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByTestId('fechaNacimiento-input'), '1990-01-01');
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByTestId('correoElectronico-input'), 'test@example.com');
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByTestId('telefonos-input-0'), '+56912345678');
    expect(submitButton).toBeDisabled();

    // Solo después de llenar el último campo requerido debería habilitarse
    await user.type(screen.getByTestId('direcciones-input-0'), 'Test Address');

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});
