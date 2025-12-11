/**
 * PATCH 635: Validation Registry System
 * Consolidated validation system for all patches
 */

export interface ValidationResult {
  passed: boolean;
  tests: Record<string, boolean>;
  metadata?: Record<string, any>;
  errors?: string[];
  timestamp: string;
}

export interface PatchValidatorMetadata {
  id: number;
  name: string;
  description: string;
  category: string;
  version: string;
}

export interface PatchValidator {
  metadata: PatchValidatorMetadata;
  run: () => Promise<ValidationResult>;
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
}

/**
 * Validation Registry for managing patch validators
 */
class ValidationRegistry {
  private validators: Map<number, PatchValidator> = new Map();

  register(validator: PatchValidator): void {
    if (this.validators.has(validator.metadata.id)) {
    }
    this.validators.set(validator.metadata.id, validator);
  }

  unregister(patchId: number): void {
    this.validators.delete(patchId);
  }

  get(patchId: number): PatchValidator | undefined {
    return this.validators.get(patchId);
  }

  list(): PatchValidator[] {
    return Array.from(this.validators.values());
  }

  listByCategory(category: string): PatchValidator[] {
    return this.list().filter(v => v.metadata.category === category);
  }

  async runValidator(patchId: number): Promise<ValidationResult> {
    const validator = this.get(patchId);
    
    if (!validator) {
      return {
        passed: false,
        tests: {},
        errors: [`Validator for Patch ${patchId} not found`],
        timestamp: new Date().toISOString(),
      };
    }

    try {
      if (validator.setup) {
        await validator.setup();
      }

      const result = await validator.run();

      if (validator.teardown) {
        await validator.teardown();
      }

      return result;
    } catch (error) {
      return {
        passed: false,
        tests: {},
        errors: [error instanceof Error ? error.message : "Unknown error"],
        timestamp: new Date().toISOString(),
      };
    }
  }

  async runAll(): Promise<Map<number, ValidationResult>> {
    const results = new Map<number, ValidationResult>();
    
    for (const [patchId, validator] of this.validators.entries()) {
      const result = await this.runValidator(patchId);
      results.set(patchId, result);
    }
    
    return results;
  }

  async runCategory(category: string): Promise<Map<number, ValidationResult>> {
    const results = new Map<number, ValidationResult>();
    const categoryValidators = this.listByCategory(category);
    
    for (const validator of categoryValidators) {
      const result = await this.runValidator(validator.metadata.id);
      results.set(validator.metadata.id, result);
    }
    
    return results;
  }
}

// Global validation registry instance
export const validationRegistry = new ValidationRegistry();

/**
 * Helper to create a simple validator
 */
export function createValidator(
  id: number,
  name: string,
  description: string,
  category: string,
  runFn: () => Promise<ValidationResult>
): PatchValidator {
  return {
    metadata: {
      id,
      name,
      description,
      category,
      version: "1.0.0",
    },
    run: runFn,
  };
}
