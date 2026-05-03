// Chilean RUT validation using the check digit algorithm
export const validateRUT = (rut: string): boolean => {
  // Clean format: remove dots and dashes
  const cleanRut = rut.replace(/[.-]/g, '');
  if (cleanRut.length < 8 || cleanRut.length > 9) return false;

  // Separate body digits from the check digit
  const rutDigits = cleanRut.slice(0, -1);
  const verifierDigit = cleanRut.slice(-1).toLowerCase();

  // Chilean validation algorithm: multiply by sequence 2,3,4,5,6,7,2,3...
  let sum = 0;
  let multiplier = 2;

  for (let i = rutDigits.length - 1; i >= 0; i--) {
    sum += parseInt(rutDigits[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1; // Reset to 2 after 7
  }

  // Calculate check digit: 11 - (sum mod 11)
  const remainder = sum % 11;
  const calculatedVerifier =
    remainder === 0 ? '0' : remainder === 1 ? 'k' : (11 - remainder).toString();

  return calculatedVerifier === verifierDigit;
};

// Format RUT with dots and dash (e.g. 12.345.678-9)
export const formatRUT = (rut: string): string => {
  const cleanRut = rut.replace(/[.-]/g, '');
  if (cleanRut.length < 8) return rut; // Too short to format

  const rutBody = cleanRut.slice(0, -1);
  const verifierDigit = cleanRut.slice(-1);

  // Add dots every 3 digits from the right
  return `${rutBody.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${verifierDigit}`;
};

// Basic email format validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation
export const validatePhone = (phone: string): boolean => {
  // Accepts international format: minimum 7 digits, maximum 15
  const phoneRegex = /^\+?[1-9]\d{6,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Check if today is the user's birthday
export const isBirthday = (fechaNacimiento: string): boolean => {
  const today = new Date();
  const birthDateParts = fechaNacimiento.split('-'); // YYYY-MM-DD

  if (birthDateParts.length !== 3) return false;

  const birthMonth = parseInt(birthDateParts[1], 10) - 1; // Month is 0-indexed
  const birthDay = parseInt(birthDateParts[2], 10);

  return today.getDate() === birthDay && today.getMonth() === birthMonth;
};

// Calculate current age
export const calculateAge = (fechaNacimiento: string): number => {
  const today = new Date();
  const birthDate = new Date(fechaNacimiento);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // If the birthday hasn't occurred yet this year, subtract 1
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};
