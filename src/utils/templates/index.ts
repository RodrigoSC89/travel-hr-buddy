/**
 * Templates Utilities
 * 
 * This module provides comprehensive utilities for working with templates:
 * - Variable replacement and extraction
 * - PDF export functionality
 * - AI-powered template generation
 */

// Template Variables
export {
  extractTemplateVariables,
  applyTemplate,
  applyTemplateWithValues,
} from './applyTemplate';

// PDF Export
export {
  exportToPDF,
  exportToPDFWithOptions,
  exportElementToPDF,
  exportElementToPDFWithOptions,
  type PDFExportOptions,
} from './exportToPDF';

// AI Generation
export {
  generateTemplateWithAI,
  generateTemplateWithCustomPrompt,
  generateTemplateWithVariables,
  rewriteTemplateWithAI,
  type TemplateType,
} from './generateWithAI';
