/**
 * Apply template variables by replacing {{variable}} placeholders with user input
 * @param content - Template content with {{variable}} placeholders
 * @returns Content with variables replaced by user input
 */
export function applyTemplate(content: string): string {
  const matches = content.match(/{{(.*?)}}/g);
  if (!matches) return content;

  let filled = content;
  matches.forEach((tag) => {
    const field = tag.replace('{{', '').replace('}}', '');
    const value = prompt(`Preencha o campo: ${field}`);
    filled = filled.replaceAll(tag, value || '');
  });

  return filled;
}

/**
 * Extract variable names from template content
 * @param content - Template content with {{variable}} placeholders
 * @returns Array of variable names found in the template
 */
export function extractTemplateVariables(content: string): string[] {
  const matches = content.match(/{{(.*?)}}/g);
  if (!matches) return [];

  return matches.map(match => match.replace('{{', '').replace('}}', '').trim());
}

/**
 * Apply template with provided variable values
 * @param content - Template content with {{variable}} placeholders
 * @param variables - Object with variable names as keys and values
 * @returns Content with variables replaced by provided values
 */
export function applyTemplateWithValues(
  content: string,
  variables: Record<string, string>
): string {
  let filled = content;
  
  Object.entries(variables).forEach(([key, value]) => {
    const pattern = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    filled = filled.replace(pattern, value);
  });

  return filled;
}
