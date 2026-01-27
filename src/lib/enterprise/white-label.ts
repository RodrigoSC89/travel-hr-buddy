/**
 * White-Label Configuration System
 * NAUTI ONE v4.0 - Phase 12: Enterprise Features
 * 
 * Allows complete brand customization for enterprise clients
 */

import { logger } from '@/lib/logger';

export interface WhiteLabelBranding {
  // Logo & Identity
  logo_url: string;
  logo_dark_url?: string;
  favicon_url?: string;
  
  // Colors (HSL format for theme compatibility)
  primary_color: string;
  primary_foreground: string;
  secondary_color: string;
  accent_color: string;
  background_color?: string;
  
  // Typography
  font_family?: string;
  heading_font?: string;
  
  // Custom CSS
  custom_css?: string;
}

export interface WhiteLabelConfig {
  id: string;
  organization_id: string;
  
  // Branding
  branding: WhiteLabelBranding;
  
  // Custom Domain
  domain?: string;
  subdomain?: string;
  
  // Features
  features: {
    modules_enabled: string[];
    custom_modules?: Array<{
      id: string;
      name: string;
      route: string;
      icon: string;
    }>;
    hide_powered_by: boolean;
  };
  
  // Integrations
  integrations?: {
    erp_system?: 'sap' | 'oracle' | 'dynamics' | 'custom';
    hr_system?: 'workday' | 'bamboohr' | 'adp' | 'custom';
    custom_webhooks?: string[];
  };
  
  // Localization
  localization?: {
    default_language: string;
    supported_languages: string[];
    custom_translations?: Record<string, Record<string, string>>;
  };
  
  // Status
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Default NAUTI ONE branding
const DEFAULT_BRANDING: WhiteLabelBranding = {
  logo_url: '/logo.svg',
  primary_color: '217 91% 60%',
  primary_foreground: '0 0% 100%',
  secondary_color: '217 32% 17%',
  accent_color: '47 96% 53%',
  font_family: 'Inter, system-ui, sans-serif'
};

// Cache for active configuration
let activeConfig: WhiteLabelConfig | null = null;

/**
 * Get white-label configuration for current organization
 */
export async function getWhiteLabelConfig(organizationId?: string): Promise<WhiteLabelConfig | null> {
  if (activeConfig && (!organizationId || activeConfig.organization_id === organizationId)) {
    return activeConfig;
  }
  
  // Check for custom domain
  const currentDomain = window.location.hostname;
  
  // In production, fetch from database based on domain or organization
  // For now, return null (use default branding)
  return null;
}

/**
 * Apply white-label branding to the application
 */
export function applyWhiteLabelBranding(branding: Partial<WhiteLabelBranding>): void {
  const root = document.documentElement;
  const mergedBranding = { ...DEFAULT_BRANDING, ...branding };
  
  // Apply colors as CSS variables
  if (mergedBranding.primary_color) {
    root.style.setProperty('--primary', mergedBranding.primary_color);
  }
  if (mergedBranding.primary_foreground) {
    root.style.setProperty('--primary-foreground', mergedBranding.primary_foreground);
  }
  if (mergedBranding.secondary_color) {
    root.style.setProperty('--secondary', mergedBranding.secondary_color);
  }
  if (mergedBranding.accent_color) {
    root.style.setProperty('--accent', mergedBranding.accent_color);
  }
  if (mergedBranding.background_color) {
    root.style.setProperty('--background', mergedBranding.background_color);
  }
  
  // Apply font family
  if (mergedBranding.font_family) {
    root.style.setProperty('--font-sans', mergedBranding.font_family);
    document.body.style.fontFamily = mergedBranding.font_family;
  }
  
  // Apply custom CSS if provided
  if (mergedBranding.custom_css) {
    let styleElement = document.getElementById('white-label-styles');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'white-label-styles';
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = mergedBranding.custom_css;
  }
  
  // Update favicon if provided
  if (mergedBranding.favicon_url) {
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon) {
      favicon.href = mergedBranding.favicon_url;
    }
  }
  
  logger.info('[White-Label] Branding applied');
}

/**
 * Reset to default NAUTI ONE branding
 */
export function resetToDefaultBranding(): void {
  applyWhiteLabelBranding(DEFAULT_BRANDING);
  
  // Remove custom styles
  const customStyles = document.getElementById('white-label-styles');
  if (customStyles) {
    customStyles.remove();
  }
  
  logger.info('[White-Label] Reset to default branding');
}

/**
 * Save white-label configuration (admin only)
 */
export async function saveWhiteLabelConfig(
  organizationId: string,
  config: Partial<WhiteLabelConfig>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate branding colors (must be HSL format)
    if (config.branding) {
      const hslRegex = /^\d{1,3}\s+\d{1,3}%\s+\d{1,3}%$/;
      const { primary_color, secondary_color, accent_color } = config.branding;
      
      if (primary_color && !hslRegex.test(primary_color)) {
        return { success: false, error: 'Primary color must be in HSL format (e.g., "217 91% 60%")' };
      }
      if (secondary_color && !hslRegex.test(secondary_color)) {
        return { success: false, error: 'Secondary color must be in HSL format' };
      }
      if (accent_color && !hslRegex.test(accent_color)) {
        return { success: false, error: 'Accent color must be in HSL format' };
      }
    }
    
    // Validate domain
    if (config.domain) {
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
      if (!domainRegex.test(config.domain)) {
        return { success: false, error: 'Invalid domain format' };
      }
    }
    
    // In production, save to database
    logger.info('[White-Label] Saving configuration', { organizationId });
    
    // Apply branding immediately
    if (config.branding) {
      applyWhiteLabelBranding(config.branding);
    }
    
    return { success: true };
  } catch (error) {
    logger.error('[White-Label] Save error:', error);
    return { success: false, error: 'Failed to save white-label configuration' };
  }
}

/**
 * Preview white-label configuration without saving
 */
export function previewBranding(branding: Partial<WhiteLabelBranding>): () => void {
  // Store current values
  const root = document.documentElement;
  const previousValues: Record<string, string> = {};
  
  const properties = ['--primary', '--primary-foreground', '--secondary', '--accent', '--background'];
  properties.forEach(prop => {
    previousValues[prop] = root.style.getPropertyValue(prop);
  });
  
  // Apply preview
  applyWhiteLabelBranding(branding);
  
  // Return cleanup function
  return () => {
    properties.forEach(prop => {
      if (previousValues[prop]) {
        root.style.setProperty(prop, previousValues[prop]);
      } else {
        root.style.removeProperty(prop);
      }
    });
    logger.debug('[White-Label] Preview reverted');
  };
}

/**
 * Generate CSS export for white-label configuration
 */
export function exportBrandingCSS(branding: WhiteLabelBranding): string {
  return `:root {
  /* White-Label Colors */
  --primary: ${branding.primary_color};
  --primary-foreground: ${branding.primary_foreground};
  --secondary: ${branding.secondary_color};
  --accent: ${branding.accent_color};
  ${branding.background_color ? `--background: ${branding.background_color};` : ''}
  
  /* Typography */
  --font-sans: ${branding.font_family || 'Inter, system-ui, sans-serif'};
  ${branding.heading_font ? `--font-heading: ${branding.heading_font};` : ''}
}

${branding.custom_css || ''}`;
}

export default {
  getWhiteLabelConfig,
  applyWhiteLabelBranding,
  resetToDefaultBranding,
  saveWhiteLabelConfig,
  previewBranding,
  exportBrandingCSS,
  DEFAULT_BRANDING
};
