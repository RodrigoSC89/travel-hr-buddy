/**
 * Safe HTML Rendering Utilities
 * PATCH: XSS Protection for AI-generated content
 */

import { escapeHtml } from "@/lib/validation/sanitize";

/**
 * Safely parse markdown-like content to HTML
 * Sanitizes input before applying formatting
 */
export function parseMarkdownSafe(content: string): string {
  // First escape all HTML to prevent XSS
  let safe = escapeHtml(content);
  
  // Then apply safe formatting transformations
  safe = safe
    // Headers (already escaped, safe to add tags)
    .replace(/^### (.*)$/gim, '<h3>$1</h3>')
    .replace(/^## (.*)$/gim, '<h2>$1</h2>')
    .replace(/^# (.*)$/gim, '<h1>$1</h1>')
    // Bold and italic (escaped content is safe)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Lists
    .replace(/\n- /g, '<br/>• ')
    // Line breaks
    .replace(/\n/g, '<br/>');
  
  return safe;
}

/**
 * Create safe HTML props for dangerouslySetInnerHTML
 */
export function createSafeHTML(content: string): { __html: string } {
  return { __html: parseMarkdownSafe(content) };
}

/**
 * Sanitize and render simple bold/newline formatting
 */
export function parseSimpleMarkdown(content: string): string {
  let safe = escapeHtml(content);
  safe = safe
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
  return safe;
}

/**
 * Create safe HTML for simple formatting
 */
export function createSimpleSafeHTML(content: string): { __html: string } {
  return { __html: parseSimpleMarkdown(content) };
}
