import { validateRUT, formatRUT, validateEmail, validatePhone, isBirthday, calculateAge } from '../src/utils/validation';

describe('Validation Utils', () => {
  describe('validateRUT', () => {
    test('should validate correct RUTs', () => {
      expect(validateRUT('12345678-9')).toBe(true);
      expect(validateRUT('11111111-1')).toBe(true);
      expect(validateRUT('22222222-2')).toBe(true);
    });

    test('should reject incorrect RUTs', () => {
      expect(validateRUT('12345678-0')).toBe(false);
      expect(validateRUT('11111111-2')).toBe(false);
      expect(validateRUT('123')).toBe(false);
      expect(validateRUT('')).toBe(false);
    });

    test('should handle RUT with and without formatting', () => {
      expect(validateRUT('123456789')).toBe(true);
      expect(validateRUT('12.345.678-9')).toBe(true);
    });
  });

  describe('formatRUT', () => {
    test('should format RUT correctly', () => {
      expect(formatRUT('123456789')).toBe('12.345.678-9');
      expect(formatRUT('111111111')).toBe('11.111.111-1');
    });

    test('should handle already formatted RUT', () => {
      expect(formatRUT('12.345.678-9')).toBe('12.345.678-9');
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
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('+0123456789')).toBe(false);
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
      const todayString = today.toISOString().split('T')[0];
      
      // Misma fecha de este año
      expect(isBirthday(todayString)).toBe(true);
      
      // Misma fecha distinto año
      const birthdayLastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()).toISOString().split('T')[0];
      expect(isBirthday(birthdayLastYear)).toBe(true);
    });

    test('should reject non-birthday dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];
      
      expect(isBirthday(yesterdayString)).toBe(false);
    });
  });

  describe('calculateAge', () => {
    test('should calculate age correctly', () => {
      const today = new Date();
      const birthYear = today.getFullYear() - 25;
      const birthday = new Date(birthYear, today.getMonth(), today.getDate()).toISOString().split('T')[0];
      
      expect(calculateAge(birthday)).toBe(25);
    });

    test('should handle birthday not yet occurred this year', () => {
      const today = new Date();
      const birthYear = today.getFullYear() - 25;
      const futureMonth = today.getMonth() + 1;
      const birthday = new Date(birthYear, futureMonth, today.getDate()).toISOString().split('T')[0];
      
      expect(calculateAge(birthday)).toBe(24);
    });
  });
});
