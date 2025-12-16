import type { Checklist, ChecklistItem, ValidationRule } from "../types";

/**
 * Validate a checklist item based on its validation rules
 */
export function validateItem(item: ChecklistItem): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if required item is completed
  if (item.required && item.status !== "completed") {
    errors.push(`Item "${item.title}" is required but not completed`);
  }

  // Validate based on rules
  if (item.validationRules) {
    for (const rule of item.validationRules) {
      const result = validateRule(item, rule);
      if (!result.valid) {
        if (rule.severity === "error") {
          errors.push(result.message);
        } else if (rule.severity === "warning") {
          warnings.push(result.message);
        }
      }
    }
  }

  // Type-specific validation
  if (item.type === "number" && typeof item.value === "number") {
    if (item.minValue !== undefined && item.value < item.minValue) {
      errors.push(`Value must be at least ${item.minValue}`);
    }
    if (item.maxValue !== undefined && item.value > item.maxValue) {
      errors.push(`Value must not exceed ${item.maxValue}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate a single rule
 */
function validateRule(item: ChecklistItem, rule: ValidationRule): {
  valid: boolean;
  message: string;
} {
  switch (rule.type) {
  case "range":
    if (typeof item.value === "number" && Array.isArray(rule.value)) {
      const [min, max] = rule.value;
      if (item.value < min || item.value > max) {
        return { valid: false, message: rule.message };
      }
    }
    break;

  case "regex":
    if (typeof item.value === "string" && typeof rule.value === "string") {
      const regex = new RegExp(rule.value);
      if (!regex.test(item.value)) {
        return { valid: false, message: rule.message };
      }
    }
    break;

  case "custom":
    // Custom validation logic would go here
    break;

  case "ai_validation":
    // AI validation handled separately
    break;
  }

  return { valid: true, message: "" };
}

/**
 * Calculate checklist completion percentage
 */
export function calculateProgress(items: ChecklistItem[]): number {
  if (items.length === 0) return 0;
  
  const completed = items.filter(
    item => item.status === "completed" || item.status === "na"
  ).length;
  
  return Math.round((completed / items.length) * 100);
}

/**
 * Calculate compliance score for a checklist
 */
export function calculateComplianceScore(checklist: Checklist): number {
  if (checklist.items.length === 0) return 0;

  let totalScore = 0;
  let totalWeight = 0;

  for (const item of checklist.items) {
    const weight = item.required ? 2 : 1;
    totalWeight += weight;

    if (item.status === "completed") {
      totalScore += weight;
    } else if (item.status === "na") {
      // N/A items don't count against score
      totalWeight -= weight;
    }
  }

  if (totalWeight === 0) return 100;
  return Math.round((totalScore / totalWeight) * 100);
}

/**
 * Check if checklist is complete
 */
export function isChecklistComplete(checklist: Checklist): boolean {
  return checklist.items.every(
    item => !item.required || item.status === "completed" || item.status === "na"
  );
}

/**
 * Get incomplete required items
 */
export function getIncompleteRequiredItems(checklist: Checklist): ChecklistItem[] {
  return checklist.items.filter(
    item => item.required && item.status !== "completed" && item.status !== "na"
  );
}

/**
 * Get items with validation errors
 */
export function getItemsWithErrors(checklist: Checklist): Array<{
  item: ChecklistItem;
  errors: string[];
  warnings: string[];
}> {
  const itemsWithIssues: Array<{
    item: ChecklistItem;
    errors: string[];
    warnings: string[];
  }> = [];

  for (const item of checklist.items) {
    const validation = validateItem(item);
    if (!validation.valid || validation.warnings.length > 0) {
      itemsWithIssues.push({
        item,
        errors: validation.errors,
        warnings: validation.warnings
      });
    }
  }

  return itemsWithIssues;
}

/**
 * Validate entire checklist
 */
export function validateChecklist(checklist: Checklist): {
  valid: boolean;
  errors: string[];
  warnings: string[];
  canSubmit: boolean;
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if checklist has items
  if (checklist.items.length === 0) {
    errors.push("Checklist must have at least one item");
  }

  // Check all items
  for (const item of checklist.items) {
    const itemValidation = validateItem(item);
    errors.push(...itemValidation.errors);
    warnings.push(...itemValidation.warnings);
  }

  // Check if all required items are completed
  const incompleteRequired = getIncompleteRequiredItems(checklist);
  if (incompleteRequired.length > 0) {
    warnings.push(
      `${incompleteRequired.length} required items are not completed`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    canSubmit: errors.length === 0 && incompleteRequired.length === 0
  };
}

/**
 * Sort items by order
 */
export function sortItems(items: ChecklistItem[]): ChecklistItem[] {
  return [...items].sort((a, b) => a.order - b.order);
}

/**
 * Group items by category
 */
export function groupItemsByCategory(
  items: ChecklistItem[]
): Record<string, ChecklistItem[]> {
  const groups: Record<string, ChecklistItem[]> = {};

  for (const item of items) {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
  }

  return groups;
}

/**
 * Filter items by status
 */
export function filterItemsByStatus(
  items: ChecklistItem[],
  status: ChecklistItem["status"]
): ChecklistItem[] {
  return items.filter(item => item.status === status);
}

/**
 * Calculate estimated time to complete
 */
export function estimateTimeToComplete(checklist: Checklist): number {
  const incompleteItems = checklist.items.filter(
    item => item.status === "pending"
  );
  
  // Rough estimate: 2 minutes per item
  const estimatedMinutes = incompleteItems.length * 2;
  
  return estimatedMinutes;
}
