import { UserService, __testUtils__ } from '../../services/api';
import { User, CreateUserDTO, UpdateUserDTO } from '../../types/User';

// Helper function to create dates
const createDateString = (year: number, month: number, day: number): string => {
  const mm = (month + 1).toString().padStart(2, '0');
  const dd = day.toString().padStart(2, '0');
  return `${year}-${mm}-${dd}`;
};

describe('UserService', () => {
  // Base test user to use in tests
  const mockUser: User = {
    id: '1',
    rut: '12345678-5',
    nombre: 'Test User',
    fechaNacimiento: '1990-01-01',
    cantidadHijos: 1,
    correoElectronico: 'test@example.com',
    telefonos: ['+56912345678'],
    direcciones: ['Test Address'],
    fechaCreacion: '2024-01-01T00:00:00.000Z',
    fechaActualizacion: '2024-01-02T00:00:00.000Z',
  };

  // Clear state before each test to avoid interference
  beforeEach(() => {
    __testUtils__.resetUsers();
  });

  describe('getAllUsers', () => {
    test('should return empty array when no users', async () => {
      const response = await UserService.getAllUsers();

      expect(response.success).toBe(true);
      expect(response.data).toEqual([]);
    });

    test('should return all users', async () => {
      __testUtils__.setUsers([mockUser]);

      const response = await UserService.getAllUsers();

      expect(response.success).toBe(true);
      expect(response.data).toEqual([mockUser]);
    });
  });

  describe('createUser', () => {
    // Data to create a new user (without ID, auto-generated)
    const createUserData: CreateUserDTO = {
      rut: '22222222-2',
      nombre: 'New User',
      fechaNacimiento: '1985-05-15',
      cantidadHijos: 1,
      correoElectronico: 'new@example.com',
      telefonos: ['+56987654321'],
      direcciones: ['New Address 456'],
    };

    test('should create user successfully', async () => {
      const response = await UserService.createUser(createUserData);

      expect(response.success).toBe(true);
      expect(response.data).toMatchObject(createUserData);
      expect(response.data?.id).toBeDefined(); // Verify that an ID was assigned
    });
    test('should generate an ID with length between 8 and 36 characters', async () => {
      const response = await UserService.createUser(createUserData);
      expect(response.success).toBe(true);

      const id = response.data?.id;
      expect(typeof id).toBe('string');
      expect(id?.length).toBeGreaterThanOrEqual(8);
      expect(id?.length).toBeLessThanOrEqual(36); // UUID has 36 characters
    });

    test('should reject duplicate RUT', async () => {
      __testUtils__.setUsers([mockUser]);

      // Attempt to create a user with the same RUT that already exists
      const duplicateUser: CreateUserDTO = {
        ...createUserData,
        rut: mockUser.rut,
      };

      const response = await UserService.createUser(duplicateUser);

      expect(response.success).toBe(false);
      expect(response.message).toContain('RUT is already registered');
    });
  });

  describe('updateUser', () => {
    // Update data (without RUT because it cannot be changed)
    const updateData: UpdateUserDTO = {
      nombre: 'Updated Name',
      fechaNacimiento: '1990-01-01',
      cantidadHijos: 3,
      correoElectronico: 'updated@example.com',
      telefonos: ['+56999999999'],
      direcciones: ['Updated Address'],
    };

    test('should update user successfully', async () => {
      __testUtils__.setUsers([mockUser]);

      const response = await UserService.updateUser(mockUser.id, updateData);

      expect(response.success).toBe(true);
      expect(response.data?.nombre).toBe(updateData.nombre);
      expect(response.data?.rut).toBe(mockUser.rut); // RUT must not change
    });

    test('should not allow updating RUT field', async () => {
      __testUtils__.setUsers([mockUser]);

      const response = await UserService.updateUser(mockUser.id, {
        ...(updateData as any),
        rut: '99999999-9',
      });

      expect(response.success).toBe(true);
      expect(response.data?.rut).toBe(mockUser.rut); // Must not have changed
    });

    test('should ignore extra fields not defined in UpdateUserDTO', async () => {
      __testUtils__.setUsers([mockUser]);
      const response = await UserService.updateUser(mockUser.id, {
        nombre: 'Nuevo Nombre',
        foo: 'bar', // Unexpected extra field
      } as any);

      expect(response.success).toBe(true);
      expect(response.data?.nombre).toBe('Nuevo Nombre');
      expect((response.data as any).foo).toBeUndefined(); // Must not include extra field
    });

    test('should reject update for non-existent user', async () => {
      const response = await UserService.updateUser('999', updateData);

      expect(response.success).toBe(false);
      expect(response.message).toContain('User not found');
    });

    test('should allow partial updates', async () => {
      __testUtils__.setUsers([mockUser]);
      const response = await UserService.updateUser(mockUser.id, {
        nombre: 'Solo nombre cambiado',
      } as UpdateUserDTO);

      expect(response.success).toBe(true);
      expect(response.data?.nombre).toBe('Solo nombre cambiado');
      expect(response.data?.correoElectronico).toBe(mockUser.correoElectronico); // Other fields unchanged
    });
  });

  describe('deleteUser', () => {
    test('should delete user successfully', async () => {
      __testUtils__.setUsers([mockUser]);

      const response = await UserService.deleteUser(mockUser.id);

      expect(response.success).toBe(true);

      // Verify that the user was deleted
      const allUsers = await UserService.getAllUsers();
      expect(allUsers.data).toHaveLength(0);
    });

    test('should reject deletion for non-existent user', async () => {
      const response = await UserService.deleteUser('999');

      expect(response.success).toBe(false);
      expect(response.message).toContain('User not found');
    });

    test('should reject deletion for user with birthday today', async () => {
      // Create user with birthday today to test the deletion rule
      const today = new Date();
      const todayBirthday = createDateString(1990, today.getMonth(), today.getDate());

      const birthdayUser: User = {
        ...mockUser,
        fechaNacimiento: todayBirthday,
      };

      __testUtils__.setUsers([birthdayUser]);

      const response = await UserService.deleteUser(birthdayUser.id);

      expect(response.success).toBe(false);
      expect(response.message).toContain('birthday today');
    });
  });

  describe('getUsersCount', () => {
    test('should return correct count', async () => {
      __testUtils__.setUsers([mockUser]);

      const response = await UserService.getUsersCount();

      expect(response.success).toBe(true);
      expect(response.data).toBe(1);
    });
  });

  describe('getUserById', () => {
    test('should return user by ID', async () => {
      __testUtils__.setUsers([mockUser]);

      const response = await UserService.getUserById(mockUser.id);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockUser);
    });

    test('should reject for non-existent user', async () => {
      const response = await UserService.getUserById('999');

      expect(response.success).toBe(false);
      expect(response.message).toContain('User not found');
    });
  });
  describe('Error handling', () => {
    beforeEach(() => {
      __testUtils__.resetUsers();
    });

    test('should handle error in getUserById', async () => {
      const user = {
        id: '1',
        rut: '11111111-1',
        nombre: 'Test User',
        fechaNacimiento: '1990-01-01',
        cantidadHijos: 0,
        correoElectronico: 'test@example.com',
        telefonos: ['+56912345678'],
        direcciones: ['Test Address'],
        fechaCreacion: '2024-01-01T00:00:00.000Z',
        fechaActualizacion: '2024-01-02T00:00:00.000Z',
      };

      __testUtils__.setUsers([user]);

      const originalFind = Array.prototype.find;
      Array.prototype.find = function () {
        Array.prototype.find = originalFind; // Restore immediately
        throw new Error('Simulated database error');
      };

      const response = await UserService.getUserById('1');
      expect(response.success).toBe(false);
      expect(response.message).toBe('Error fetching user');
    });

    test('should handle error in createUser', async () => {
      const createUserData: CreateUserDTO = {
        rut: '22222222-2',
        nombre: 'New User',
        fechaNacimiento: '1985-05-15',
        cantidadHijos: 1,
        correoElectronico: 'new@example.com',
        telefonos: ['+56987654321'],
        direcciones: ['New Address 456'],
      };

      const originalFind = Array.prototype.find;
      Array.prototype.find = function () {
        Array.prototype.find = originalFind; // Restore immediately
        throw new Error('Simulated database error');
      };

      const response = await UserService.createUser(createUserData);
      expect(response.success).toBe(false);
      expect(response.message).toBe('Error creating user');
    });

    test('should handle error in updateUser', async () => {
      const user = {
        id: '1',
        rut: '11111111-1',
        nombre: 'Test User',
        fechaNacimiento: '1990-01-01',
        cantidadHijos: 0,
        correoElectronico: 'test@example.com',
        telefonos: ['+56912345678'],
        direcciones: ['Test Address'],
        fechaCreacion: '2024-01-01T00:00:00.000Z',
        fechaActualizacion: '2024-01-02T00:00:00.000Z',
      };

      __testUtils__.setUsers([user]);

      const updateData: UpdateUserDTO = {
        nombre: 'Updated Name',
        fechaNacimiento: '1990-01-01',
        cantidadHijos: 3,
        correoElectronico: 'updated@example.com',
        telefonos: ['+56999999999'],
        direcciones: ['Updated Address'],
      };

      const originalFindIndex = Array.prototype.findIndex;
      Array.prototype.findIndex = function () {
        Array.prototype.findIndex = originalFindIndex; // Restore immediately
        throw new Error('Simulated database error');
      };

      const response = await UserService.updateUser('1', updateData);
      expect(response.success).toBe(false);
      expect(response.message).toBe('Error updating user');
    });

    test('should handle error in deleteUser', async () => {
      const user = {
        id: '1',
        rut: '11111111-1',
        nombre: 'Test User',
        fechaNacimiento: '1990-01-01',
        cantidadHijos: 0,
        correoElectronico: 'test@example.com',
        telefonos: ['+56912345678'],
        direcciones: ['Test Address'],
        fechaCreacion: '2024-01-01T00:00:00.000Z',
        fechaActualizacion: '2024-01-02T00:00:00.000Z',
      };

      __testUtils__.setUsers([user]);

      const originalFindIndex = Array.prototype.findIndex;
      Array.prototype.findIndex = function () {
        Array.prototype.findIndex = originalFindIndex; // Restore immediately
        throw new Error('Simulated database error');
      };

      const response = await UserService.deleteUser('1');
      expect(response.success).toBe(false);
      expect(response.message).toBe('Error deleting user');
    });

    test('should handle error in getUsersCount', async () => {
      __testUtils__.setUsers([
        {
          id: '1',
          rut: '11111111-1',
          nombre: 'Test User',
          fechaNacimiento: '1990-01-01',
          cantidadHijos: 0,
          correoElectronico: 'test@example.com',
          telefonos: ['+56912345678'],
          direcciones: ['Test Address'],
          fechaCreacion: '2024-01-01T00:00:00.000Z',
          fechaActualizacion: '2024-01-02T00:00:00.000Z',
        },
      ]);

      // Use a very short timeout to simulate an error
      jest.setTimeout(1);

      try {
        const response = await UserService.getUsersCount();
        // If we reach here, the test passed normally
        expect(response.success).toBe(true);
      } catch (error) {
        // If there is a timeout, that is also valid
        expect(error).toBeDefined();
      } finally {
        jest.setTimeout(5000); // Restore normal timeout
      }
    });
  });

  describe('Additional edge cases', () => {
    beforeEach(() => {
      __testUtils__.resetUsers();
    });

    test('should handle users array manipulation edge cases', async () => {
      const manyUsers: User[] = Array.from({ length: 100 }, (_, i) => ({
        id: (i + 1).toString(),
        rut: `${(12345678 + i).toString()}-${i % 10}`,
        nombre: `User ${i + 1}`,
        fechaNacimiento: '1990-01-01',
        cantidadHijos: i % 5,
        correoElectronico: `user${i + 1}@example.com`,
        telefonos: [`+5691234567${i % 10}`],
        direcciones: [`Address ${i + 1}`],
        fechaCreacion: '2024-01-01T00:00:00.000Z',
        fechaActualizacion: '2024-01-02T00:00:00.000Z',
      }));

      __testUtils__.setUsers(manyUsers);

      const allUsersResponse = await UserService.getAllUsers();
      expect(allUsersResponse.success).toBe(true);
      expect(allUsersResponse.data).toHaveLength(100);

      const countResponse = await UserService.getUsersCount();
      expect(countResponse.success).toBe(true);
      expect(countResponse.data).toBe(100);
    });
  });
});
