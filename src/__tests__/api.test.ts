import { UserService, __testUtils__ } from '../services/api';
import { User, CreateUserDTO, UpdateUserDTO } from '../types/User';

// Función helper para crear fechas
const createDateString = (year: number, month: number, day: number): string => {
  const mm = (month + 1).toString().padStart(2, '0');
  const dd = day.toString().padStart(2, '0');
  return `${year}-${mm}-${dd}`;
};

describe('UserService', () => {
  // Usuario de prueba base para usar en los tests
  const mockUser: User = {
    id: '1',
    rut: '11111111-1',
    nombre: 'Test User',
    fechaNacimiento: '1990-01-01',
    cantidadHijos: 2,
    correoElectronico: 'test@example.com',
    telefonos: ['+56912345678'],
    direcciones: ['Test Address 123'],
  };

  // Limpiar el estado antes de cada test para evitar interferencias
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
    // Datos para crear un nuevo usuario (sin ID, se genera automáticamente)
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
      expect(response.data?.id).toBeDefined(); // Verifica que se asignó un ID
    });

    test('should reject duplicate RUT', async () => {
      __testUtils__.setUsers([mockUser]);

      // Intentar crear usuario con el mismo RUT que ya existe
      const duplicateUser: CreateUserDTO = {
        ...createUserData,
        rut: mockUser.rut,
      };

      const response = await UserService.createUser(duplicateUser);

      expect(response.success).toBe(false);
      expect(response.message).toContain('RUT ya está registrado');
    });
  });

  describe('updateUser', () => {
    // Datos de actualización (sin RUT porque no se puede cambiar)
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
      expect(response.data?.rut).toBe(mockUser.rut); // El RUT no debe cambiar
    });

    test('should reject update for non-existent user', async () => {
      const response = await UserService.updateUser('999', updateData);

      expect(response.success).toBe(false);
      expect(response.message).toContain('Usuario no encontrado');
    });
  });

  describe('deleteUser', () => {
    test('should delete user successfully', async () => {
      __testUtils__.setUsers([mockUser]);

      const response = await UserService.deleteUser(mockUser.id);

      expect(response.success).toBe(true);

      // Verificar que el usuario fue eliminado
      const allUsers = await UserService.getAllUsers();
      expect(allUsers.data).toHaveLength(0);
    });

    test('should reject deletion for non-existent user', async () => {
      const response = await UserService.deleteUser('999');

      expect(response.success).toBe(false);
      expect(response.message).toContain('Usuario no encontrado');
    });

    test('should reject deletion for user with birthday today', async () => {
      // Crear usuario con cumpleaños hoy para probar la regla de negocio
      const today = new Date();
      const todayBirthday = createDateString(1990, today.getMonth(), today.getDate());

      const birthdayUser: User = {
        ...mockUser,
        fechaNacimiento: todayBirthday,
      };

      __testUtils__.setUsers([birthdayUser]);

      const response = await UserService.deleteUser(birthdayUser.id);

      expect(response.success).toBe(false);
      expect(response.message).toContain('cumpleaños hoy');
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
      expect(response.message).toContain('Usuario no encontrado');
    });
  });
});
