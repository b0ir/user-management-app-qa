import {validateRUT, formatRUT, validateEmail, validatePhone, isBirthday, calculateAge,} from '../../utils/validation';

// Función helper para crear fechas sin problemas de zona horaria
const createDateString = (year: number, month: number, day: number): string => {
  const mm = (month + 1).toString().padStart(2, '0');
  const dd = day.toString().padStart(2, '0');
  return `${year}-${mm}-${dd}`;
};

describe('Validation Utils', () => {
  describe('validateRUT', () => {
    test('should validate correct RUTs', () => {
      // RUTs válidos con diferentes formatos
      expect(validateRUT('11111111-1')).toBe(true);
      expect(validateRUT('22222222-2')).toBe(true);
      expect(validateRUT('12345678-5')).toBe(true);
      expect(validateRUT('111111111')).toBe(true); // Sin formato
      expect(validateRUT('11.111.111-1')).toBe(true); // Con puntos

      // RUT con dígito verificador '0' (para cubrir remainder === 0)
      expect(validateRUT('10000004-0')).toBe(true);

      // RUT con dígito verificador 'k' (para cubrir remainder === 1)
      expect(validateRUT('10000013-k')).toBe(true);
      expect(validateRUT('10000013-K')).toBe(true); // Mayúscula también
    });

    test('should reject incorrect RUTs', () => {
      // RUTs con dígito verificador incorrecto
      expect(validateRUT('12345678-0')).toBe(false);
      expect(validateRUT('11111111-2')).toBe(false);

      // RUTs con longitud incorrecta
      expect(validateRUT('1234567')).toBe(false); // Muy corto
      expect(validateRUT('1234567890')).toBe(false); // Muy largo
      expect(validateRUT('123')).toBe(false);
      expect(validateRUT('')).toBe(false);
    });
  });

  describe('formatRUT', () => {
    test('should format RUT correctly', () => {
      expect(formatRUT('111111111')).toBe('11.111.111-1');
      expect(formatRUT('123456785')).toBe('12.345.678-5');
    });

    test('should handle already formatted or short RUT', () => {
      expect(formatRUT('11.111.111-1')).toBe('11.111.111-1');
      expect(formatRUT('1234567')).toBe('1234567'); // Muy corto para formatear
    });
  });

  describe('validateEmail', () => {
    test('should validate correct emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.org')).toBe(true);
    });

    test('should reject incorrect emails', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    test('should validate correct phone numbers', () => {
      expect(validatePhone('+56912345678')).toBe(true);
      expect(validatePhone('56912345678')).toBe(true);
      expect(validatePhone('+1234567890')).toBe(true);
      expect(validatePhone('+56 9 1234 5678')).toBe(true); // Con espacios
    });

    test('should reject incorrect phone numbers', () => {
      expect(validatePhone('123456')).toBe(false); // Muy corto
      expect(validatePhone('+0123456789')).toBe(false); // Empieza con 0
      expect(validatePhone('')).toBe(false);
      expect(validatePhone('abc123')).toBe(false);
    });
  });

  describe('isBirthday', () => {
    test('should detect birthday correctly', () => {
      const today = new Date();
      const thisYear = today.getFullYear();
      const month = today.getMonth();
      const day = today.getDate();

      const birthdayThisYear = createDateString(thisYear, month, day);
      const birthdayLastYear = createDateString(thisYear - 1, month, day);

      expect(isBirthday(birthdayThisYear)).toBe(true);
      expect(isBirthday(birthdayLastYear)).toBe(true);
    });

    test('should reject non-birthday dates and invalid formats', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const yesterdayString = createDateString(
        yesterday.getFullYear(),
        yesterday.getMonth(),
        yesterday.getDate()
      );

      expect(isBirthday(yesterdayString)).toBe(false);
      expect(isBirthday('invalid-date')).toBe(false); // Formato inválido
    });
  });

  describe('calculateAge', () => {
    test('should calculate age correctly', () => {
      const today = new Date();
      const birthYear = today.getFullYear() - 25;
      const birthday = createDateString(birthYear, today.getMonth(), today.getDate());

      expect(calculateAge(birthday)).toBe(25);
    });

    test('should handle birthday not yet occurred this year', () => {
      const today = new Date();
      const birthYear = today.getFullYear() - 25;

      // Crear cumpleaños en el futuro (próximo mes)
      let futureMonth = today.getMonth() + 1;
      if (futureMonth > 11) {
        futureMonth = 0;
      }

      const birthday = createDateString(birthYear, futureMonth, today.getDate());

      // Si el cumpleaños no ha ocurrido este año, la edad debería ser 24
      if (futureMonth > today.getMonth()) {
        expect(calculateAge(birthday)).toBe(24);
      } else {
        expect(calculateAge(birthday)).toBe(25);
      }
    });

    test('should handle empty or invalid date', () => {
      expect(() => calculateAge('')).not.toThrow();
    });
  });
});
