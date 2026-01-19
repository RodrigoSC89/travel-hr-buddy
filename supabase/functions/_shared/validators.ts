/**
 * Input validation utilities for Edge Functions
 * @module _shared/validators
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validate required fields in object
 */
export function validateRequired(
  data: Record<string, unknown>,
  fields: string[]
): ValidationResult {
  const errors: ValidationError[] = [];

  for (const field of fields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors.push({ field, message: `${field} is required` });
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate UUID format
 */
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate date format (ISO 8601)
 */
export function validateDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Validate numeric value within range
 */
export function validateRange(value: number, min: number, max: number): boolean {
  return typeof value === 'number' && value >= min && value <= max;
}

/**
 * Validate string length
 */
export function validateLength(value: string, min: number, max: number): boolean {
  return typeof value === 'string' && value.length >= min && value.length <= max;
}

/**
 * Validate enum value
 */
export function validateEnum<T extends string>(value: string, allowedValues: T[]): value is T {
  return allowedValues.includes(value as T);
}

/**
 * Sanitize string input (remove dangerous chars)
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
}

/**
 * Validate phone number (international format)
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

/**
 * Validate IMO number (ship identification)
 */
export function validateIMO(imo: string): boolean {
  // IMO numbers are 7 digits starting with "IMO"
  const imoRegex = /^(IMO)?[0-9]{7}$/i;
  return imoRegex.test(imo);
}

/**
 * Validate MMSI number (maritime mobile service identity)
 */
export function validateMMSI(mmsi: string): boolean {
  // MMSI is 9 digits
  const mmsiRegex = /^[0-9]{9}$/;
  return mmsiRegex.test(mmsi);
}

/**
 * Validate coordinates (latitude, longitude)
 */
export function validateCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Build validation schema
 */
export type FieldType = 'string' | 'number' | 'boolean' | 'email' | 'uuid' | 'date' | 'array' | 'object';

export interface FieldSchema {
  type: FieldType;
  required?: boolean;
  min?: number;
  max?: number;
  enum?: string[];
  pattern?: RegExp;
}

export interface Schema {
  [field: string]: FieldSchema;
}

/**
 * Validate object against schema
 */
export function validateSchema(data: Record<string, unknown>, schema: Schema): ValidationResult {
  const errors: ValidationError[] = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    // Check required
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push({ field, message: `${field} is required` });
      continue;
    }

    if (value === undefined || value === null) continue;

    // Type validation
    switch (rules.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push({ field, message: `${field} must be a string` });
        } else {
          if (rules.min !== undefined && value.length < rules.min) {
            errors.push({ field, message: `${field} must be at least ${rules.min} characters` });
          }
          if (rules.max !== undefined && value.length > rules.max) {
            errors.push({ field, message: `${field} must be at most ${rules.max} characters` });
          }
          if (rules.pattern && !rules.pattern.test(value)) {
            errors.push({ field, message: `${field} has invalid format` });
          }
        }
        break;

      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          errors.push({ field, message: `${field} must be a number` });
        } else {
          if (rules.min !== undefined && value < rules.min) {
            errors.push({ field, message: `${field} must be at least ${rules.min}` });
          }
          if (rules.max !== undefined && value > rules.max) {
            errors.push({ field, message: `${field} must be at most ${rules.max}` });
          }
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push({ field, message: `${field} must be a boolean` });
        }
        break;

      case 'email':
        if (typeof value !== 'string' || !validateEmail(value)) {
          errors.push({ field, message: `${field} must be a valid email` });
        }
        break;

      case 'uuid':
        if (typeof value !== 'string' || !validateUUID(value)) {
          errors.push({ field, message: `${field} must be a valid UUID` });
        }
        break;

      case 'date':
        if (typeof value !== 'string' || !validateDate(value)) {
          errors.push({ field, message: `${field} must be a valid date` });
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          errors.push({ field, message: `${field} must be an array` });
        }
        break;

      case 'object':
        if (typeof value !== 'object' || Array.isArray(value)) {
          errors.push({ field, message: `${field} must be an object` });
        }
        break;
    }

    // Enum validation
    if (rules.enum && !rules.enum.includes(String(value))) {
      errors.push({ field, message: `${field} must be one of: ${rules.enum.join(', ')}` });
    }
  }

  return { valid: errors.length === 0, errors };
}
