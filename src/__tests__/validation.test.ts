import {validateRUT, formatRUT, validateEmail, validatePhone, isBirthday, calculateAge,} from '../utils/validation';

// Función helper corregida para evitar problemas de zona horaria
const createLocalDate = (year: number, month: number, day: number): Date => {
  return new Date(year, month, day);
};

// Función helper para string de fecha local
const createDateString = (year: number, month: number, day: number): string => {
  const date = createLocalDate(year, month, day);
  const yyyy = date.getFullYear();
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

describe('Validation Utils', () => {
  describe('validateRUT', () => {
    test('should validate correct RUTs', () => {
      // RUTs válidos reales
      expect(validateRUT('11111111-1')).toBe(true);
      expect(validateRUT('22222222-2')).toBe(true);
      expect(validateRUT('12345678-5')).toBe(true);
    });

    test('should reject incorrect RUTs', () => {
      expect(validateRUT('12345678-0')).toBe(false);
      expect(validateRUT('11111111-2')).toBe(false);
      expect(validateRUT('123')).toBe(false);
      expect(validateRUT('')).toBe(false);
    });

    test('should handle RUT with and without formatting', () => {
      expect(validateRUT('111111111')).toBe(true);
      expect(validateRUT('11.111.111-1')).toBe(true);
    });
  });

  describe('formatRUT', () => {
    test('should format RUT correctly', () => {
      expect(formatRUT('111111111')).toBe('11.111.111-1');
      expect(formatRUT('123456785')).toBe('12.345.678-5');
    });

    test('should handle already formatted RUT', () => {
      expect(formatRUT('11.111.111-1')).toBe('11.111.111-1');
    });

    test('should handle short RUT', () => {
      expect(formatRUT('1234567')).toBe('1234567');
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
    });

    test('should reject incorrect phone numbers', () => {
      expect(validatePhone('123456')).toBe(false); // Muy corto (6 dígitos)
      expect(validatePhone('+0123456789')).toBe(false); // Empieza con 0
      expect(validatePhone('')).toBe(false);
      expect(validatePhone('abc123')).toBe(false);
    });

    test('should handle phone with spaces', () => {
      expect(validatePhone('+56 9 1234 5678')).toBe(true);
    });
  });

  describe('isBirthday', () => {
  test('should detect birthday correctly', () => {
    const today = new Date();
    
    // Crear string de fecha manualmente SIN .toISOString()
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    
    const todayString = `${year}-${month}-${day}`;
    const lastYearString = `${year - 1}-${month}-${day}`;
    
    console.log('=== DEBUG MANUAL DATE ===');
    console.log('Today components:', today.getDate(), today.getMonth());
    console.log('Today string:', todayString);
    console.log('Parsed back:', new Date(todayString).getDate(), new Date(todayString).getMonth());
    
    expect(isBirthday(todayString)).toBe(true);
    expect(isBirthday(lastYearString)).toBe(true);
  });

  test('should reject non-birthday dates', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const year = yesterday.getFullYear();
    const month = (yesterday.getMonth() + 1).toString().padStart(2, '0');
    const day = yesterday.getDate().toString().padStart(2, '0');
    const yesterdayString = `${year}-${month}-${day}`;
    
    expect(isBirthday(yesterdayString)).toBe(false);
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
  });
});
