/**
 * Utility functions for template variable management
 * PATCH 417: Shared utilities for templates
 */

/**
 * Extracts variables from template content
 * Variables are in the format {{variable_name}}
 */
export const extractTemplateVariables = (content: string): string[] => {
  const variableMatches = content.match(/{{([^}]+)}}/g) || [];
  return variableMatches.map(v => v.replace(/{{|}}/g, ""));
};

/**
 * Escapes special regex characters in a string
 */
export const escapeRegexSpecialChars = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Replaces variables in template content with provided values
 */
export const replaceTemplateVariables = (
  content: string,
  variables: Record<string, string>
): string => {
  let result = content;
  
  Object.entries(variables).forEach(([key, value]) => {
    const escapedKey = escapeRegexSpecialChars(key);
    const regex = new RegExp(`{{${escapedKey}}}`, "g");
    result = result.replace(regex, value);
  });
  
  return result;
};
