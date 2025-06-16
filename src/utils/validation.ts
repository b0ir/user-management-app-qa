// Validación del RUT chileno con algoritmo de dígito verificador
export const validateRUT = (rut: string): boolean => {
  // Limpiar formato: eliminar puntos y guiones
  const cleanRut = rut.replace(/[.-]/g, '');
  if (cleanRut.length < 8 || cleanRut.length > 9) return false;

  // Separar dígitos del cuerpo y dígito verificador
  const rutDigits = cleanRut.slice(0, -1);
  const verifierDigit = cleanRut.slice(-1).toLowerCase();

  // Algoritmo de validación chileno: multiplicar por secuencia 2,3,4,5,6,7,2,3...
  let sum = 0;
  let multiplier = 2;

  for (let i = rutDigits.length - 1; i >= 0; i--) {
    sum += parseInt(rutDigits[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1; // Resetear a 2 después de 7
  }

  // Calcular dígito verificador: 11 - (suma mod 11)
  const remainder = sum % 11;
  const calculatedVerifier =
    remainder === 0 ? '0' : remainder === 1 ? 'k' : (11 - remainder).toString();

  return calculatedVerifier === verifierDigit;
};

// Formatear RUT con puntos y guión (ej: 12.345.678-9)
export const formatRUT = (rut: string): string => {
  const cleanRut = rut.replace(/[.-]/g, '');
  if (cleanRut.length < 8) return rut; // Muy corto para formatear

  const rutBody = cleanRut.slice(0, -1);
  const verifierDigit = cleanRut.slice(-1);

  // Agregar puntos cada 3 dígitos desde la derecha
  return `${rutBody.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${verifierDigit}`;
};

// Validación básica de formato de email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validación de número telefónico
export const validatePhone = (phone: string): boolean => {
  // Acepta formato internacional: mínimo 7 dígitos, máximo 15
  const phoneRegex = /^\+?[1-9]\d{6,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Verificar si hoy es el cumpleaños del usuario
export const isBirthday = (fechaNacimiento: string): boolean => {
  const today = new Date();
  const birthDateParts = fechaNacimiento.split('-'); // YYYY-MM-DD

  if (birthDateParts.length !== 3) return false;

  const birthMonth = parseInt(birthDateParts[1], 10) - 1; // Mes es 0-indexado
  const birthDay = parseInt(birthDateParts[2], 10);

  return today.getDate() === birthDay && today.getMonth() === birthMonth;
};

// Calcular edad actual
export const calculateAge = (fechaNacimiento: string): number => {
  const today = new Date();
  const birthDate = new Date(fechaNacimiento);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Si aún no ha pasado el cumpleaños este año, restar 1
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};
