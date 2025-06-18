export interface User {
  id: string;
  rut: string;
  nombre: string;
  fechaNacimiento: string;
  cantidadHijos: number;
  correoElectronico: string;
  telefonos: string[];
  direcciones: string[];
  fechaCreacion: string;
  fechaActualizacion?: string;
}

export interface CreateUserDTO {
  rut: string;
  nombre: string;
  fechaNacimiento: string;
  cantidadHijos: number;
  correoElectronico: string;
  telefonos: string[];
  direcciones: string[];
}

export interface UpdateUserDTO {
  nombre: string;
  fechaNacimiento: string;
  cantidadHijos: number;
  correoElectronico: string;
  telefonos: string[];
  direcciones: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}
