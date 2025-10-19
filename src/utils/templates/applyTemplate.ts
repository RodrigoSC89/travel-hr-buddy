/**
 * Template Variables Utility
 * Provides functions for working with dynamic template variables using {{variable_name}} syntax
 */

/**
 * Extracts all variables from a template string
 * @param content - Template content with {{variable_name}} syntax
 * @returns Array of variable names found in the template
 * @example
 * const vars = extractTemplateVariables("Hello {{name}}!");
 * // Returns: ['name']
 */
export function extractTemplateVariables(content: string): string[] {
  const matches = content.match(/{{(.*?)}}/g);
  if (!matches) return [];

  return matches.map((match) => match.replace('{{', '').replace('}}', '').trim());
}

/**
 * Applies template variables interactively by prompting the user for each variable
 * @param content - Template content with {{variable_name}} syntax
 * @returns Template with all variables replaced by user input
 * @example
 * const filled = applyTemplate("Hello {{name}}!");
 * // User will be prompted: "Preencha o campo: name"
 */
export function applyTemplate(content: string): string {
  const matches = content.match(/{{(.*?)}}/g);
  if (!matches) return content;

  let filled = content;
  matches.forEach((tag) => {
    const field = tag.replace('{{', '').replace('}}', '').trim();
    const value = prompt(`Preencha o campo: ${field}`);
    filled = filled.replaceAll(tag, value || '');
  });

  return filled;
}

/**
 * Applies template variables programmatically using provided values
 * @param content - Template content with {{variable_name}} syntax
 * @param values - Object with variable names as keys and replacement values
 * @returns Template with all variables replaced by provided values
 * @example
 * const result = applyTemplateWithValues(
 *   "Hello {{name}}, your order {{order_id}} is ready!",
 *   { name: 'John', order_id: '#12345' }
 * );
 * // Returns: "Hello John, your order #12345 is ready!"
 */
export function applyTemplateWithValues(
  content: string,
  values: Record<string, string>
): string {
  let result = content;

  Object.entries(values).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, value);
  });

  return result;
}
