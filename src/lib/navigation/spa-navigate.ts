/**
 * SPA-safe navigation for non-React contexts
 * Use this instead of window.location.href for internal routes
 * Preserves TanStack Query cache and application state
 * 
 * @see memory/engineering/navigation/spa-integrity-standard
 */

import { logger } from '@/lib/logger';

/**
 * Navigate to an internal route without full page reload
 * For React components, use useNavigate() instead
 */
export function spaNavigate(path: string): void {
  // External URLs, mailto:, tel: — use real navigation
  if (path.startsWith('http') || path.startsWith('mailto:') || path.startsWith('tel:')) {
    window.location.href = path;
    return;
  }

  try {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  } catch (error) {
    logger.warn('[spaNavigate] Fallback to full reload:', error);
    window.location.href = path;
  }
}
