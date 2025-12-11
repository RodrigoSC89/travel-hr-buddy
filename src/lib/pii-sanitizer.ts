/**
 * PII Sanitizer for LLM Inputs
 * Removes/masks personally identifiable information before sending to AI models
 * PATCH: Audit Plan 2025 - LLM Security
 */

// PII patterns with their replacement tokens
const PII_PATTERNS: Array<{
  name: string;
  pattern: RegExp;
  replacement: string;
  sensitivity: 'high' | 'medium' | 'low';
}> = [
  // High sensitivity - always mask
  {
    name: 'CPF (Brazilian ID)',
    pattern: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g,
    replacement: '[CPF_MASKED]',
    sensitivity: 'high',
  },
  {
    name: 'CNPJ (Brazilian Company ID)',
    pattern: /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g,
    replacement: '[CNPJ_MASKED]',
    sensitivity: 'high',
  },
  {
    name: 'Credit Card',
    pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
    replacement: '[CARD_MASKED]',
    sensitivity: 'high',
  },
  {
    name: 'SSN (US)',
    pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
    replacement: '[SSN_MASKED]',
    sensitivity: 'high',
  },
  {
    name: 'Passport',
    pattern: /\b[A-Z]{1,2}\d{6,9}\b/gi,
    replacement: '[PASSPORT_MASKED]',
    sensitivity: 'high',
  },
  
  // Medium sensitivity - mask by default
  {
    name: 'Email',
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    replacement: '[EMAIL_MASKED]',
    sensitivity: 'medium',
  },
  {
    name: 'Phone (International)',
    pattern: /\b(?:\+\d{1,3}[-.\s]?)?\(?\d{2,3}\)?[-.\s]?\d{3,5}[-.\s]?\d{4}\b/g,
    replacement: '[PHONE_MASKED]',
    sensitivity: 'medium',
  },
  {
    name: 'IP Address',
    pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    replacement: '[IP_MASKED]',
    sensitivity: 'medium',
  },
  {
    name: 'Brazilian Phone',
    pattern: /\b\(?0?\d{2}\)?\s?\d{4,5}-?\d{4}\b/g,
    replacement: '[PHONE_MASKED]',
    sensitivity: 'medium',
  },
  
  // Low sensitivity - optional masking
  {
    name: 'Date of Birth Pattern',
    pattern: /\b(?:nascido em|born on|dob|data de nascimento)[:\s]+\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/gi,
    replacement: '[DOB_MASKED]',
    sensitivity: 'low',
  },
  {
    name: 'Address Pattern',
    pattern: /\b(?:rua|avenida|av\.|r\.)\s+[A-Za-zÀ-ÿ\s]+,?\s*(?:n[°º]?\s*)?\d+/gi,
    replacement: '[ADDRESS_MASKED]',
    sensitivity: 'low',
  },
];

// Name detection (simple heuristic)
const NAME_INDICATORS = [
  /\b(?:nome|name)[:\s]+([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+){1,4})\b/gi,
  /\b(?:sr\.|sra\.|dr\.|dra\.|mr\.|mrs\.|ms\.)\s+([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+){1,3})\b/gi,
];

export interface SanitizerOptions {
  // Which sensitivity levels to mask
  sensitivity?: ('high' | 'medium' | 'low')[];
  
  // Additional patterns to mask
  customPatterns?: Array<{ pattern: RegExp; replacement: string }>;
  
  // Whether to mask detected names
  maskNames?: boolean;
  
  // Whether to log what was masked (for debugging)
  verbose?: boolean;
}

export interface SanitizeResult {
  sanitized: string;
  maskedCount: number;
  maskedTypes: string[];
}

/**
 * Sanitize text by removing PII before sending to LLM
 */
export const sanitizePII = (
  text: string,
  options: SanitizerOptions = {}
): SanitizeResult => {
  const {
    sensitivity = ['high', 'medium'],
    customPatterns = [],
    maskNames = false,
    verbose = false,
  } = options;
  
  let sanitized = text;
  const maskedTypes: string[] = [];
  let maskedCount = 0;
  
  // Apply PII patterns based on sensitivity
  PII_PATTERNS.forEach(({ name, pattern, replacement, sensitivity: level }) => {
    if (sensitivity.includes(level)) {
      const matches = sanitized.match(pattern);
      if (matches) {
        maskedCount += matches.length;
        maskedTypes.push(name);
        sanitized = sanitized.replace(pattern, replacement);
        
        if (verbose) {
        }
      }
    }
  });
  
  // Apply custom patterns
  customPatterns.forEach(({ pattern, replacement }) => {
    const matches = sanitized.match(pattern);
    if (matches) {
      maskedCount += matches.length;
      maskedTypes.push('Custom');
      sanitized = sanitized.replace(pattern, replacement);
    }
  });
  
  // Optionally mask names
  if (maskNames) {
    NAME_INDICATORS.forEach(pattern => {
      const matches = sanitized.match(pattern);
      if (matches) {
        maskedCount += matches.length;
        maskedTypes.push('Name');
        sanitized = sanitized.replace(pattern, (match) => {
          return match.replace(/([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+){1,4})/, '[NAME_MASKED]');
        });
      }
    });
  }
  
  return {
    sanitized,
    maskedCount,
    maskedTypes: [...new Set(maskedTypes)],
  };
};

/**
 * Check if text contains PII without modifying it
 */
export const containsPII = (
  text: string,
  sensitivity: ('high' | 'medium' | 'low')[] = ['high', 'medium']
): { hasPII: boolean; types: string[] } => {
  const types: string[] = [];
  
  PII_PATTERNS.forEach(({ name, pattern, sensitivity: level }) => {
    if (sensitivity.includes(level) && pattern.test(text)) {
      types.push(name);
    }
  });
  
  return {
    hasPII: types.length > 0,
    types,
  };
};

/**
 * Sanitize an array of chat messages
 */
export const sanitizeMessages = (
  messages: Array<{ role: string; content: string }>,
  options: SanitizerOptions = {}
): Array<{ role: string; content: string }> => {
  return messages.map(msg => ({
    ...msg,
    content: sanitizePII(msg.content, options).sanitized,
  }));
};

/**
 * Create a sanitized prompt for LLM
 */
export const createSafePrompt = (
  userInput: string,
  systemPrompt: string,
  options: SanitizerOptions = { sensitivity: ['high', 'medium'] }
): { prompt: string; warnings: string[] } => {
  const warnings: string[] = [];
  
  // Check for PII in user input
  const piiCheck = containsPII(userInput);
  if (piiCheck.hasPII) {
    warnings.push(`User input contains PII: ${piiCheck.types.join(', ')}`);
  }
  
  // Sanitize user input
  const { sanitized, maskedCount } = sanitizePII(userInput, options);
  
  if (maskedCount > 0) {
    warnings.push(`Masked ${maskedCount} PII instances`);
  }
  
  // Add privacy instruction to system prompt
  const enhancedSystemPrompt = `${systemPrompt}

PRIVACY NOTICE: Some personal information in user messages may have been masked for privacy. Do not ask for or generate real personal information like CPF, phone numbers, addresses, or emails.`;
  
  return {
    prompt: `${enhancedSystemPrompt}\n\nUser: ${sanitized}`,
    warnings,
  };
};

// Export for testing
export const __testing = {
  PII_PATTERNS,
  NAME_INDICATORS,
};
