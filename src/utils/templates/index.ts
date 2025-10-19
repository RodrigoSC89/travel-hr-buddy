/**
 * Template utilities for applying variables and exporting to PDF
 */

export { 
  applyTemplate, 
  extractTemplateVariables, 
  applyTemplateWithValues 
} from './applyTemplate';

export { 
  exportToPDF, 
  exportToPDFWithOptions, 
  exportElementToPDF 
} from './exportToPDF';

export {
  generateTemplateWithAI,
  generateTemplateWithCustomPrompt
} from './generateWithAI';
