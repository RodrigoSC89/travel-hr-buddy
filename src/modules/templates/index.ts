/**
 * Templates Module
 * 
 * This module provides template management functionality.
 * The actual implementations are located in:
 * - Components: src/components/templates/
 * - Pages: src/pages/admin/templates/
 * 
 * For more information, see README.md in this directory.
 */

// Re-export template components
export { default as TemplateEditor } from '@/components/templates/TemplateEditor';
export { default as TemplateEditorWithRewrite } from '@/components/templates/template-editor-with-rewrite';
export { default as TemplateManager } from '@/components/templates/template-manager';

// Re-export template pages
export { default as TemplatesPage } from '@/pages/admin/templates';
export { default as TemplateEditorPage } from '@/pages/admin/templates/editor';
export { default as AITemplatesPage } from '@/pages/admin/documents/ai-templates';
