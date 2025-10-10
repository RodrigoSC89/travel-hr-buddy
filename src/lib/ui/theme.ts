// ✅ /lib/ui/theme.ts — Sistema unificado de tema visual (cores, fontes, espaçamento)

export const theme = {
  colors: {
    primary: '#3b82f6', // azul
    secondary: '#10b981', // verde
    accent: '#f59e0b', // laranja
    danger: '#ef4444', // vermelho
    background: '#18181b', // fundo escuro
    surface: '#27272a', // cards, containers
    text: '#f4f4f5',
    textMuted: '#a1a1aa',
    border: '#3f3f46'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  radii: {
    sm: '4px',
    md: '8px',
    lg: '16px',
  },
  font: {
    base: 'Inter, sans-serif',
    heading: 'Inter, sans-serif',
    monospace: 'Menlo, monospace'
  },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.15)',
  },
};

// Helper functions to use theme values
export const getColor = (color: keyof typeof theme.colors) => theme.colors[color];
export const getSpacing = (size: keyof typeof theme.spacing) => theme.spacing[size];
export const getRadius = (size: keyof typeof theme.radii) => theme.radii[size];
export const getFont = (type: keyof typeof theme.font) => theme.font[type];
export const getShadow = (size: keyof typeof theme.shadow) => theme.shadow[size];

// CSS custom properties for easy integration with existing system
export const generateThemeCSSVars = () => {
  return {
    '--theme-primary': theme.colors.primary,
    '--theme-secondary': theme.colors.secondary,
    '--theme-accent': theme.colors.accent,
    '--theme-danger': theme.colors.danger,
    '--theme-background': theme.colors.background,
    '--theme-surface': theme.colors.surface,
    '--theme-text': theme.colors.text,
    '--theme-text-muted': theme.colors.textMuted,
    '--theme-border': theme.colors.border,
  };
};

// Type exports for TypeScript support
export type ThemeColors = keyof typeof theme.colors;
export type ThemeSpacing = keyof typeof theme.spacing;
export type ThemeRadii = keyof typeof theme.radii;
export type ThemeFont = keyof typeof theme.font;
export type ThemeShadow = keyof typeof theme.shadow;
