// Input validation utilities
import DOMPurify from "isomorphic-dompurify";

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class InputValidator {
  static validateEmail(email: string): ValidationResult {
    const errors: string[] = [];

    if (!email) {
      errors.push("И-мэйл хаяг шаардлагатай");
      return { isValid: false, errors };
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      errors.push("И-мэйл хаягийн формат буруу байна");
    }

    if (email.length > 254) {
      errors.push("И-мэйл хаяг хэт урт байна");
    }

    return { isValid: errors.length === 0, errors };
  }

  static validatePassword(password: string): ValidationResult {
    const errors: string[] = [];

    if (!password) {
      errors.push("Нууц үг шаардлагатай");
      return { isValid: false, errors };
    }

    if (password.length < 8) {
      errors.push("Нууц үг дор хаяж 8 тэмдэгт байх ёстой");
    }

    if (password.length > 128) {
      errors.push("Нууц үг хэт урт байна");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Дор хаяж нэг том үсэг байх ёстой");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Дор хаяж нэг жижиг үсэг байх ёстой");
    }

    if (!/\d/.test(password)) {
      errors.push("Дор хаяж нэг тоо байх ёстой");
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Дор хаяж нэг тусгай тэмдэгт байх ёстой");
    }

    return { isValid: errors.length === 0, errors };
  }

  static validateName(name: string, fieldName: string): ValidationResult {
    const errors: string[] = [];

    if (!name || !name.trim()) {
      errors.push(`${fieldName} шаардлагатай`);
      return { isValid: false, errors };
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 5) {
      errors.push(`${fieldName} дор хаяж 5 тэмдэгт байх ёстой`);
    }

    if (trimmedName.length > 50) {
      errors.push(`${fieldName} хэт урт байна`);
    }

    // Only letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[А-ЯЁа-яё]+$/u;
    if (!nameRegex.test(trimmedName)) {
      errors.push(
        `${fieldName} зөвхөн үсэг, зай, зураас, апостроф агуулж болно`
      );
    }

    return { isValid: errors.length === 0, errors };
  }

  static validatePhone(phone: string): ValidationResult {
    const errors: string[] = [];

    if (phone && phone.trim()) {
      const phoneRegex = /^[+]?[\d\s\-\(\)]{8,15}$/;
      if (!phoneRegex.test(phone.trim())) {
        errors.push("Утасны дугаарын формат буруу байна");
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  static sanitizeInput(input: string): string {
    if (!input) return "";

    // Remove HTML tags and sanitize
    const sanitized = DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });

    // Trim whitespace
    return sanitized.trim();
  }

  static validateGeneric(
    value: string,
    rules: ValidationRule,
    fieldName: string
  ): ValidationResult {
    const errors: string[] = [];
    const trimmedValue = value?.trim() || "";

    if (rules.required && !trimmedValue) {
      errors.push(`${fieldName} шаардлагатай`);
      return { isValid: false, errors };
    }

    if (
      trimmedValue &&
      rules.minLength &&
      trimmedValue.length < rules.minLength
    ) {
      errors.push(
        `${fieldName} дор хаяж ${rules.minLength} тэмдэгт байх ёстой`
      );
    }

    if (
      trimmedValue &&
      rules.maxLength &&
      trimmedValue.length > rules.maxLength
    ) {
      errors.push(
        `${fieldName} ${rules.maxLength} тэмдэгтээс ихгүй байх ёстой`
      );
    }

    if (trimmedValue && rules.pattern && !rules.pattern.test(trimmedValue)) {
      errors.push(`${fieldName}-ий формат буруу байна`);
    }

    if (trimmedValue && rules.custom && !rules.custom(trimmedValue)) {
      errors.push(`${fieldName} буруу байна`);
    }

    return { isValid: errors.length === 0, errors };
  }
}
