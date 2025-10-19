/**
 * Templates API module
 * Centralized exports for template management
 */

export {
  fetchTemplates,
  fetchTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  toggleFavorite,
  togglePrivate,
  generateTemplateWithAI,
  rewriteTemplateWithAI,
  suggestTitle,
  type Template,
  type CreateTemplateData,
  type UpdateTemplateData,
} from './api';
