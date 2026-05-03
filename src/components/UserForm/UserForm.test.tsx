import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserForm } from '.'
import { User } from '../../types/User';
import { ArrayField } from './components/FormFields/ArrayField';

const mockOnSubmit = jest.fn();
const mockOnCancel = jest.fn();

const defaultProps = {
  onSubmit: mockOnSubmit,
  onCancel: mockOnCancel,
  isLoading: false,
};

// Helper to fill the complete form
const fillCompleteForm = async (user: any, rut = '12345678-5') => {
  await user.type(screen.getByTestId('rut-input'), rut);
  await user.type(screen.getByTestId('nombre-input'), 'Test User');
  await user.type(screen.getByTestId('fechaNacimiento-input'), '1990-01-01');
  await user.type(screen.getByTestId('correoElectronico-input'), 'test@example.com');
  await user.type(screen.getByTestId('telefonos-input-0'), '+56912345678');
  await user.type(screen.getByTestId('direcciones-input-0'), 'Test Address');
};

describe('UserForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Form modes', () => {
    test('renders form in create mode', () => {
      render(<UserForm {...defaultProps} />);

      expect(screen.getByText('Add New User')).toBeInTheDocument();
      expect(screen.getByTestId('rut-input')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Create User');
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

      expect(screen.getByText('Edit User')).toBeInTheDocument();
      expect(screen.queryByTestId('rut-input')).not.toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Update User');
      expect(screen.getByDisplayValue('Juan Pérez')).toBeInTheDocument();
    });
  });

  describe('Form validation', () => {
    test('does not submit invalid form and shows validation errors', async () => {
      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeDisabled();

      // Force submit (even though button is disabled)
      await user.click(submitButton);
      expect(mockOnSubmit).not.toHaveBeenCalled();

      // Verify validation errors
      expect(screen.getByTestId('rut-error')).toHaveTextContent('Invalid RUT');
      expect(screen.getByTestId('nombre-error')).toHaveTextContent('Name is required');
      expect(screen.getByTestId('fechaNacimiento-error')).toHaveTextContent(
        'Date of birth is required'
      );
      expect(screen.getByTestId('correoElectronico-error')).toHaveTextContent('Invalid email');
      expect(screen.getByTestId('telefonos-error')).toHaveTextContent(
        'At least one phone number is required'
      );
      expect(screen.getByTestId('direcciones-error')).toHaveTextContent(
        'At least one address is required'
      );
    });

    test('formats RUT correctly', async () => {
      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);

      const rutInput = screen.getByTestId('rut-input') as HTMLInputElement;
      await user.type(rutInput, '123456789');

      // Expect the format with dots produced by formatRUT
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
          'Date of birth cannot be in the future'
        );
      });
    });

    test('validates invalid email', async () => {
      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);

      const emailInput = screen.getByTestId('correoElectronico-input');
      await user.type(emailInput, 'invalid-email');

      await waitFor(() => {
        expect(screen.getByTestId('correoElectronico-error')).toHaveTextContent('Invalid email');
      });
    });

    test('validates invalid phone number', async () => {
      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);

      // Fill other fields first to isolate phone validation
      await user.type(screen.getByTestId('rut-input'), '12345678-5');
      await user.type(screen.getByTestId('nombre-input'), 'Test User');
      await user.type(screen.getByTestId('fechaNacimiento-input'), '1990-01-01');
      await user.type(screen.getByTestId('correoElectronico-input'), 'test@example.com');
      await user.type(screen.getByTestId('direcciones-input-0'), 'Test Address');

      const phoneInput = screen.getByTestId('telefonos-input-0');
      await user.type(phoneInput, '123'); // Phone too short

      await waitFor(() => {
        const submitButton = screen.getByTestId('submit-button');
        expect(submitButton).toBeDisabled();

        const phoneError = screen.queryByTestId('telefonos-error-0');
        if (phoneError) {
          expect(phoneError).toHaveTextContent('Phone 1 invalid');
        }
      });
    });

    test('validates invalid addresses', async () => {
      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);

      const addressInput = screen.getByTestId('direcciones-input-0');

      // Clear the default value or change it to invalid
      await user.clear(addressInput);
      await user.type(addressInput, '123'); // less than 5 characters

      await waitFor(() => {
        expect(screen.getByTestId('direcciones-error-0')).toHaveTextContent('Address 1 invalid');
        const submitButton = screen.getByTestId('submit-button');
        expect(submitButton).toBeDisabled();
      });
    });

    test('enables submit button only when all validations pass', async () => {
      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeDisabled();

      // Fill fields one by one and verify button stays disabled until the last one
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

      // Only after filling the last required field should it become enabled
      await user.type(screen.getByTestId('direcciones-input-0'), 'Test Address');

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Children count validation', () => {
    test('validates children count correctly and has min attribute', async () => {
      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);

      const childrenInput = screen.getByTestId('cantidadHijos-input') as HTMLInputElement;

      // Verify input attributes
      expect(childrenInput).toHaveAttribute('min', '0');
      expect(childrenInput).toHaveAttribute('type', 'number');

      // Fill other fields to isolate children validation
      await fillCompleteForm(user);

      // Verify that the default value (0) allows submission
      await waitFor(() => {
        expect(childrenInput.value).toBe('0');
        const submitButton = screen.getByTestId('submit-button');
        expect(submitButton).not.toBeDisabled();
      });

      // Verify that positive numbers work
      await user.clear(childrenInput);
      await user.type(childrenInput, '3');

      await waitFor(() => {
        expect(childrenInput.value).toBe('3');
        const submitButton = screen.getByTestId('submit-button');
        expect(submitButton).not.toBeDisabled();
      });

      // Test negative values
      await user.clear(childrenInput);
      await user.type(childrenInput, '-5');

      await waitFor(() => {
        const currentValue = parseInt(childrenInput.value) || 0;
        expect(currentValue).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Array field management', () => {
    test('adds and removes phone numbers', async () => {
      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);

      // Add phone
      const addPhoneButton = screen.getByTestId('telefonos-add');
      await user.click(addPhoneButton);

      let phoneInputs = screen.getAllByTestId(/^telefonos-input-\d+$/);
      expect(phoneInputs).toHaveLength(2);

      // Remove second phone
      const removeButton = screen.getByTestId('telefonos-remove-1');
      await user.click(removeButton);

      phoneInputs = screen.getAllByTestId(/^telefonos-input-\d+$/);
      expect(phoneInputs).toHaveLength(1);
    });

    test('adds and removes addresses', async () => {
      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);

      // Add address
      const addAddressButton = screen.getByTestId('direcciones-add');
      await user.click(addAddressButton);

      let addressInputs = screen.getAllByTestId(/^direcciones-input-\d+$/);
      expect(addressInputs).toHaveLength(2);

      // Remove second address
      const removeButton = screen.getByTestId('direcciones-remove-1');
      await user.click(removeButton);

      addressInputs = screen.getAllByTestId(/^direcciones-input-\d+$/);
      expect(addressInputs).toHaveLength(1);
    });

    test('shows general error for address field', () => {
      const errors = [{ field: 'direcciones', message: 'At least one address is required' }];
      render(
        <ArrayField
          label="Addresses"
          fieldName="direcciones"
          values={['']}
          onChange={() => {}}
          onAdd={() => {}}
          onRemove={() => {}}
          errors={errors}
        />
      );

      expect(screen.getByTestId('direcciones-error')).toHaveTextContent(
        'At least one address is required'
      );
    });
  });

  describe('Form submission', () => {
    test('handles form submission with valid data', async () => {
      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);

      await fillCompleteForm(user);

      await waitFor(() => {
        const submitButton = screen.getByTestId('submit-button');
        expect(submitButton).not.toBeDisabled();
      });

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Verify it was called with the correct format (with dots)
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

    test('handles form submission in edit mode (excludes RUT)', async () => {
      const user = userEvent.setup();
      const existingUser: User = {
        id: '1',
        rut: '12.345.678-5',
        nombre: 'Juan Pérez',
        fechaNacimiento: '1990-01-01',
        cantidadHijos: 2,
        correoElectronico: 'juan@example.com',
        telefonos: ['+56912345678'],
        direcciones: ['Av. Ejemplo 123'],
        fechaCreacion: '2024-01-01T00:00:00.000Z',
        fechaActualizacion: '2024-01-02T00:00:00.000Z',
      };

      render(<UserForm {...defaultProps} user={existingUser} />);

      // Modify some fields
      const nombreInput = screen.getByTestId('nombre-input');
      await user.clear(nombreInput);
      await user.type(nombreInput, 'Juan Pérez Actualizado');

      await waitFor(() => {
        const submitButton = screen.getByTestId('submit-button');
        expect(submitButton).not.toBeDisabled();
      });

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Verify that RUT is NOT included in edit mode
      expect(mockOnSubmit).toHaveBeenCalledWith({
        // RUT should not be present in edit mode
        nombre: 'Juan Pérez Actualizado',
        fechaNacimiento: '1990-01-01',
        cantidadHijos: 2,
        correoElectronico: 'juan@example.com',
        telefonos: ['+56912345678'],
        direcciones: ['Av. Ejemplo 123'],
      });

      // Explicitly verify RUT was not sent
      const callArgs = mockOnSubmit.mock.calls[0][0];
      expect(callArgs).not.toHaveProperty('rut');
    });

    test('handles form submission with multiple phones and addresses', async () => {
      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);

      // Fill basic fields
      await user.type(screen.getByTestId('rut-input'), '12345678-5');
      await user.type(screen.getByTestId('nombre-input'), 'Test User');
      await user.type(screen.getByTestId('fechaNacimiento-input'), '1990-01-02');
      await user.type(screen.getByTestId('correoElectronico-input'), 'test@example.com');

      // Add multiple phones and addresses
      await user.type(screen.getByTestId('telefonos-input-0'), '+56912345678');
      await user.click(screen.getByTestId('telefonos-add'));
      await user.type(screen.getByTestId('telefonos-input-1'), '+56987654321');

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
  });

  describe('Loading state', () => {
    test('disables form when loading and prevents input changes', async () => {
      const user = userEvent.setup();
      render(<UserForm {...defaultProps} isLoading={true} />);

      const submitButton = screen.getByTestId('submit-button');
      const cancelButton = screen.getByTestId('cancel-button');
      const rutInput = screen.getByTestId('rut-input');
      const nombreInput = screen.getByTestId('nombre-input') as HTMLInputElement;

      expect(submitButton).toHaveTextContent('Saving...');
      expect(cancelButton).toBeDisabled();
      expect(rutInput).toBeDisabled();
      expect(nombreInput).toBeDisabled();

      // Try to change value
      await user.type(nombreInput, 'New Name');
      expect(nombreInput.value).not.toBe('New Name');
    });
  });
});
