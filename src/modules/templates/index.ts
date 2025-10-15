/**
 * Templates Module
 * 
 * This module re-exports template components from their actual locations
 * for easier importing and better organization.
 */

// Re-export template components
export { default as TemplateEditor } from '@/components/templates/TemplateEditor';
export { default as TemplateEditorWithRewrite } from '@/components/templates/template-editor-with-rewrite';
export { default as TemplateManager } from '@/components/templates/template-manager';

// Re-export pages
export { default as TemplatesPage } from '@/pages/Templates';
export { default as AdminTemplatesPage } from '@/pages/admin/templates';
