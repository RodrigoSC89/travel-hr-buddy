/**
 * Critical CSS Management - FASE A.4
 * 
 * Gerencia CSS crítico para otimizar o First Contentful Paint
 */

/**
 * Carrega CSS não-crítico de forma assíncrona
 */
export function loadDeferredCSS(href: string) {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = href;
  link.onload = function () {
    this.rel = 'stylesheet';
  };
  document.head.appendChild(link);
}

/**
 * Preconecta com domínios críticos
 */
export function preconnectDomains(domains: string[]) {
  domains.forEach((domain) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

/**
 * Prefetch de recursos futuros
 */
export function prefetchResource(href: string, as: string = 'fetch') {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
}

/**
 * Inicializa otimizações de CSS crítico
 */
export function initCriticalCSS() {
  // Preconectar com domínios externos
  preconnectDomains([
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://api.mapbox.com',
  ]);

  // Detectar conexão lenta e ajustar estratégia
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    const isSlowConnection = 
      connection?.effectiveType === 'slow-2g' ||
      connection?.effectiveType === '2g' ||
      connection?.effectiveType === '3g' ||
      connection?.saveData === true;

    if (isSlowConnection) {
      console.log('🐌 Conexão lenta detectada - aplicando otimizações');
      // Desabilitar recursos não essenciais
      document.documentElement.classList.add('slow-connection');
    }
  }
}
