/**
 * PATCH 652 - Input Validator
 * Security validation for user inputs
 */

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Common validation patterns
 */
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  
  // Security patterns
  NO_SCRIPT_TAGS: /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  NO_SQL_INJECTION: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)|(-{2}|\/\*|\*\/)/gi,
  NO_XSS: /[<>\"'`]/g,
} as const;

/**
 * String validation
 */
export const validateString = {
  /**
   * Check if string is not empty
   */
  notEmpty(value: string, fieldName = "Field"): string {
    if (!value || value.trim().length === 0) {
      throw new ValidationError(`${fieldName} cannot be empty`, fieldName);
    }
    return value.trim();
  },

  /**
   * Check string length
   */
  length(value: string, min: number, max: number, fieldName = "Field"): string {
    const trimmed = value.trim();
    if (trimmed.length < min || trimmed.length > max) {
      throw new ValidationError(
        `${fieldName} must be between ${min} and ${max} characters`,
        fieldName
      );
    }
    return trimmed;
  },

  /**
   * Validate email format
   */
  email(value: string, fieldName = "Email"): string {
    const trimmed = value.trim();
    if (!VALIDATION_PATTERNS.EMAIL.test(trimmed)) {
      throw new ValidationError(`${fieldName} must be a valid email address`, fieldName);
    }
    return trimmed.toLowerCase();
  },

  /**
   * Validate URL format
   */
  url(value: string, fieldName = "URL"): string {
    const trimmed = value.trim();
    if (!VALIDATION_PATTERNS.URL.test(trimmed)) {
      throw new ValidationError(`${fieldName} must be a valid URL`, fieldName);
    }
    return trimmed;
  },

  /**
   * Validate UUID format
   */
  uuid(value: string, fieldName = "ID"): string {
    const trimmed = value.trim();
    if (!VALIDATION_PATTERNS.UUID.test(trimmed)) {
      throw new ValidationError(`${fieldName} must be a valid UUID`, fieldName);
    }
    return trimmed;
  },

  /**
   * Sanitize string to prevent XSS
   */
  sanitize(value: string): string {
    return value
      .replace(VALIDATION_PATTERNS.NO_SCRIPT_TAGS, "")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  },

  /**
   * Check for SQL injection attempts
   */
  noSqlInjection(value: string, fieldName = "Field"): string {
    if (VALIDATION_PATTERNS.NO_SQL_INJECTION.test(value)) {
      throw new ValidationError(`${fieldName} contains invalid characters`, fieldName);
    }
    return value;
  },

  /**
   * Alphanumeric only
   */
  alphanumeric(value: string, fieldName = "Field"): string {
    const trimmed = value.trim();
    if (!/^[a-zA-Z0-9]+$/.test(trimmed)) {
      throw new ValidationError(`${fieldName} must contain only letters and numbers`, fieldName);
    }
    return trimmed;
  },
};

/**
 * Number validation
 */
export const validateNumber = {
  /**
   * Check if value is a valid number
   */
  isNumber(value: any, fieldName = "Field"): number {
    const num = Number(value);
    if (isNaN(num)) {
      throw new ValidationError(`${fieldName} must be a valid number`, fieldName);
    }
    return num;
  },

  /**
   * Check number range
   */
  range(value: number, min: number, max: number, fieldName = "Field"): number {
    if (value < min || value > max) {
      throw new ValidationError(
        `${fieldName} must be between ${min} and ${max}`,
        fieldName
      );
    }
    return value;
  },

  /**
   * Check if positive
   */
  positive(value: number, fieldName = "Field"): number {
    if (value <= 0) {
      throw new ValidationError(`${fieldName} must be positive`, fieldName);
    }
    return value;
  },

  /**
   * Check if integer
   */
  integer(value: number, fieldName = "Field"): number {
    if (!Number.isInteger(value)) {
      throw new ValidationError(`${fieldName} must be an integer`, fieldName);
    }
    return value;
  },
};

/**
 * Array validation
 */
export const validateArray = {
  /**
   * Check if not empty
   */
  notEmpty<T>(value: T[], fieldName = "Field"): T[] {
    if (!Array.isArray(value) || value.length === 0) {
      throw new ValidationError(`${fieldName} cannot be empty`, fieldName);
    }
    return value;
  },

  /**
   * Check array length
   */
  length<T>(value: T[], min: number, max: number, fieldName = "Field"): T[] {
    if (!Array.isArray(value)) {
      throw new ValidationError(`${fieldName} must be an array`, fieldName);
    }
    if (value.length < min || value.length > max) {
      throw new ValidationError(
        `${fieldName} must have between ${min} and ${max} items`,
        fieldName
      );
    }
    return value;
  },

  /**
   * Validate each item
   */
  each<T>(
    value: T[],
    validator: (item: T, index: number) => void,
    fieldName = "Field"
  ): T[] {
    if (!Array.isArray(value)) {
      throw new ValidationError(`${fieldName} must be an array`, fieldName);
    }
    value.forEach((item, index) => validator(item, index));
    return value;
  },
};

/**
 * Object validation
 */
export const validateObject = {
  /**
   * Check required fields
   */
  requiredFields<T extends Record<string, any>>(
    obj: T,
    fields: (keyof T)[],
    objectName = "Object"
  ): T {
    const missing = fields.filter(field => !(field in obj) || obj[field] === undefined || obj[field] === null);
    if (missing.length > 0) {
      throw new ValidationError(
        `${objectName} is missing required fields: ${missing.join(", ")}`,
        objectName
      );
    }
    return obj;
  },

  /**
   * Validate shape
   */
  shape<T extends Record<string, any>>(
    obj: T,
    validators: { [K in keyof T]?: (value: T[K]) => void },
    objectName = "Object"
  ): T {
    Object.entries(validators).forEach(([key, validator]) => {
      if (key in obj && validator) {
        try {
          validator(obj[key as keyof T]);
        } catch (error) {
          if (error instanceof ValidationError) {
            throw new ValidationError(`${objectName}.${key}: ${error.message}`, key);
          }
          throw error;
        }
      }
    });
    return obj;
  },
};

/**
 * Composite validator for complex forms
 */
export function createValidator<T extends Record<string, any>>(
  schema: { [K in keyof T]: (value: T[K]) => T[K] }
) {
  return (data: T): T => {
    const validated = {} as T;
    
    for (const key in schema) {
      try {
        validated[key] = schema[key](data[key]);
      } catch (error) {
        if (error instanceof ValidationError) {
          error.field = key;
        }
        throw error;
      }
    }
    
    return validated;
  };
}

// Export for debugging
if (typeof window !== "undefined") {
  (window as any).__NAUTILUS_VALIDATOR__ = {
    validateString,
    validateNumber,
    validateArray,
    validateObject,
  };
}
