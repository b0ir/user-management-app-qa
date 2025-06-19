import { User, CreateUserDTO, UpdateUserDTO, ApiResponse } from '../types/User';
import { isBirthday } from '../utils/validation';

// Utilidad para generar un ID único
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback para ambientes que no soportan crypto.randomUUID
  return Math.random().toString(36).substring(2, 11);
};

// Mock database
let users: User[] = [
  {
    id: '1',
    rut: '12.345.678-5',
    nombre: 'Juan Pérez',
    fechaNacimiento: '1990-05-14',
    cantidadHijos: 2,
    correoElectronico: 'juan.perez@email.com',
    telefonos: ['+56912345678'],
    direcciones: ['Av. Las Condes 1234, Santiago'],
    fechaCreacion: '2024-01-01T00:00:00.000Z',
    fechaActualizacion: '2024-01-02T00:00:00.000Z',
  },
  {
    id: '2',
    rut: '15.234.567-4',
    nombre: 'María González',
    fechaNacimiento: '1985-03-21',
    cantidadHijos: 1,
    correoElectronico: 'maria.gonzalez@email.com',
    telefonos: ['+56987654321', '+56223456789'],
    direcciones: ['Calle Principal 567, Valparaíso', 'Av. Libertad 890, Viña del Mar'],
    fechaCreacion: '2024-01-01T00:00:00.000Z',
    fechaActualizacion: '2024-01-02T00:00:00.000Z',
  },
];

// Simualar un delay en la respuesta de la API
const simulateDelay = (ms: number = 500): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export class UserService {
  static async getAllUsers(): Promise<ApiResponse<User[]>> {
    await simulateDelay();

    try {
      return {
        success: true,
        data: [...users],
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener usuarios',
      };
    }
  }

  static async getUserById(id: string): Promise<ApiResponse<User>> {
    await simulateDelay();

    try {
      const user = users.find((u) => u.id === id);
      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado',
        };
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener usuario',
      };
    }
  }

  static async createUser(userData: CreateUserDTO): Promise<ApiResponse<User>> {
    await simulateDelay();

    try {
      // Normalizar RUT quitando puntos y guiones para comparar
      const normalizeRut = (rut: string) => rut.replace(/[.-]/g, '').toLowerCase();

      const newRutNormalized = normalizeRut(userData.rut);

      const existingUser = users.find((u) => normalizeRut(u.rut) === newRutNormalized);
      if (existingUser) {
        return {
          success: false,
          message: 'El RUT ya está registrado',
        };
      }

      const newUser: User = {
        ...userData,
        id: generateId(),
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
      };

      users.push(newUser);

      return {
        success: true,
        data: newUser,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al crear usuario',
      };
    }
  }

  static async updateUser(id: string, userData: UpdateUserDTO): Promise<ApiResponse<User>> {
    await simulateDelay();

    try {
      const userIndex = users.findIndex((u) => u.id === id);
      if (userIndex === -1) {
        return {
          success: false,
          message: 'Usuario no encontrado',
        };
      }

      const currentUser = users[userIndex];

      const allowedFields = [
        'nombre',
        'fechaNacimiento',
        'cantidadHijos',
        'correoElectronico',
        'telefonos',
        'direcciones',
      ] as const;

      const filteredUserData = allowedFields.reduce((acc, key) => {
        if (key in userData) {
          (acc as any)[key] = (userData as any)[key];
        }
        return acc;
      }, {} as Partial<UpdateUserDTO>);

      const updatedUser: User = {
        ...currentUser,
        ...filteredUserData,
        rut: currentUser.rut,
        fechaActualizacion: new Date().toISOString(),
      };

      users[userIndex] = updatedUser;

      return {
        success: true,
        data: updatedUser,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al actualizar usuario',
      };
    }
  }

  static async deleteUser(id: string): Promise<ApiResponse<void>> {
    await simulateDelay();

    try {
      const userIndex = users.findIndex((u) => u.id === id);
      if (userIndex === -1) {
        return {
          success: false,
          message: 'Usuario no encontrado',
        };
      }

      const user = users[userIndex];

      // Checkeamos si el usuario está de cumpleaños hoy
      if (isBirthday(user.fechaNacimiento)) {
        return {
          success: false,
          message: 'No se puede eliminar un usuario que está de cumpleaños hoy',
        };
      }

      users.splice(userIndex, 1);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al eliminar usuario',
      };
    }
  }

  static async getUsersCount(): Promise<ApiResponse<number>> {
    await simulateDelay(200);

    try {
      return {
        success: true,
        data: users.length,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener conteo de usuarios',
      };
    }
  }
}

// Exportar para testing
export const __testUtils__ = {
  resetUsers: () => {
    users = [];
  },
  setUsers: (newUsers: User[]) => {
    users = [...newUsers];
  },
  getUsers: () => [...users],
};
