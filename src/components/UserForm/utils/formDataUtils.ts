import { User } from '../../../types/User';

export const createInitialFormData = (user?: User | null) => ({
  rut: user?.rut || '',
  nombre: user?.nombre || '',
  fechaNacimiento: user?.fechaNacimiento || '',
  cantidadHijos: user?.cantidadHijos || 0,
  correoElectronico: user?.correoElectronico || '',
  telefonos: user?.telefonos || [''],
  direcciones: user?.direcciones || [''],
});

export const getIsEditMode = (user?: User | null): boolean => !!user;

export const sanitizeFormData = (formData: any, isEditMode: boolean) => {
  const cleanData = {
    ...(isEditMode ? {} : { rut: formData.rut }),
    nombre: formData.nombre.trim(),
    fechaNacimiento: formData.fechaNacimiento,
    cantidadHijos: formData.cantidadHijos,
    correoElectronico: formData.correoElectronico.trim(),
    telefonos: formData.telefonos.filter((phone: string) => phone.trim()),
    direcciones: formData.direcciones.filter((address: string) => address.trim()),
  };

  return cleanData;
};
