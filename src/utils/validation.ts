export const validateRUT = (rut: string): boolean => {
  const cleanRut = rut.replace(/[.-]/g, '');
  if (cleanRut.length < 8 || cleanRut.length > 9) return false;
  
  const rutDigits = cleanRut.slice(0, -1);
  const verifierDigit = cleanRut.slice(-1).toLowerCase();
  
  let sum = 0;
  let multiplier = 2;
  
  for (let i = rutDigits.length - 1; i >= 0; i--) {
    sum += parseInt(rutDigits[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const remainder = sum % 11;
  const calculatedVerifier = remainder === 0 ? '0' : remainder === 1 ? 'k' : (11 - remainder).toString();
  
  return calculatedVerifier === verifierDigit;
};

export const formatRUT = (rut: string): string => {
  const cleanRut = rut.replace(/[.-]/g, '');
  if (cleanRut.length < 8) return rut;
  
  const rutBody = cleanRut.slice(0, -1);
  const verifierDigit = cleanRut.slice(-1);
  
  return `${rutBody.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${verifierDigit}`;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const isBirthday = (fechaNacimiento: string): boolean => {
  const today = new Date();
  const birthday = new Date(fechaNacimiento);
  
  return (
    today.getDate() === birthday.getDate() &&
    today.getMonth() === birthday.getMonth()
  );
};

export const calculateAge = (fechaNacimiento: string): number => {
  const today = new Date();
  const birthDate = new Date(fechaNacimiento);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};
