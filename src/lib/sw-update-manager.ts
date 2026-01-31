import { logger } from '@/lib/logger';

/**
 * Service Worker Update Manager v12-minimal
 * SW agora é MÍNIMO - apenas push notifications
 * NENHUM cache de fetch para evitar problemas de PWA
 */

const EXPECTED_SW_VERSION = 'v12-minimal';
const SW_VERSION_KEY = 'nautilus_sw_version';
const LAST_UPDATE_CHECK_KEY = 'nautilus_sw_last_check';
const SW_DISABLED_KEY = 'nautilus_sw_disabled';

/**
 * Verifica se o Service Worker precisa ser atualizado
 * Executa automaticamente no boot da aplicação
 */
export async function checkAndUpdateServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    logger.debug('[SW-Manager] Service Worker not supported');
    return;
  }

  try {
    const storedVersion = localStorage.getItem(SW_VERSION_KEY);
    const lastCheck = localStorage.getItem(LAST_UPDATE_CHECK_KEY);
    const now = Date.now();
    
    // Se nunca checou ou faz mais de 1 hora, forçar update
    const shouldForceCheck = !lastCheck || (now - parseInt(lastCheck, 10)) > 3600000;
    
    // Se a versão armazenada é diferente da esperada, forçar update
    const versionMismatch = storedVersion && storedVersion !== EXPECTED_SW_VERSION;
    
    if (versionMismatch || shouldForceCheck) {
      logger.debug('[SW-Manager] Checking for SW updates...', {
        storedVersion,
        expected: EXPECTED_SW_VERSION,
        shouldForceCheck
      });
      
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration) {
        // Forçar verificação de atualização
        await registration.update();
        
        // Se há um SW aguardando, ativá-lo imediatamente
        if (registration.waiting) {
          logger.debug('[SW-Manager] New SW waiting, activating...');
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        
        // Listener para quando novo SW for ativado
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                logger.debug('[SW-Manager] New SW installed, will activate on next load');
                // Não recarregar automaticamente, deixar o usuário decidir ou próximo load
              }
            });
          }
        });
      }
      
      // Atualizar timestamp do último check
      localStorage.setItem(LAST_UPDATE_CHECK_KEY, now.toString());
    }
    
    // Sempre atualizar a versão armazenada
    localStorage.setItem(SW_VERSION_KEY, EXPECTED_SW_VERSION);
    
  } catch (error) {
    logger.error('[SW-Manager] Error checking SW:', error);
  }
}

/**
 * Força limpeza completa de todos os caches e Service Workers
 * Usar quando há erros persistentes
 */
export async function forceFullCacheClear(): Promise<void> {
  logger.debug('[SW-Manager] Force clearing all caches...');
  
  try {
    // 1. Desregistrar todos os Service Workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        await registration.unregister();
      }
      logger.debug('[SW-Manager] All SWs unregistered');
    }
    
    // 2. Limpar todos os caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      logger.debug('[SW-Manager] All caches cleared');
    }
    
    // 3. Limpar storage relacionado ao SW
    localStorage.removeItem(SW_VERSION_KEY);
    localStorage.removeItem(LAST_UPDATE_CHECK_KEY);
    sessionStorage.clear();
    
    logger.debug('[SW-Manager] Cache clear complete');
    
  } catch (error) {
    logger.error('[SW-Manager] Error clearing caches:', error);
    throw error;
  }
}

/**
 * Detecta se há erro de chunk loading e tenta recuperar
 */
export function isChunkLoadError(error: Error): boolean {
  const message = error.message || '';
  return (
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Loading chunk') ||
    message.includes('ChunkLoadError') ||
    message.includes('Loading CSS chunk') ||
    message.includes('Unexpected token') // Pode indicar chunk corrompido
  );
}

/**
 * Registra o Service Worker com configuração otimizada
 * NÃO registra se SW foi desabilitado por loop detection
 */
export async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  // Verificar se SW foi desabilitado por loop detection
  if (localStorage.getItem(SW_DISABLED_KEY) === 'true') {
    logger.debug('[SW-Manager] SW disabled due to previous loop detection');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      updateViaCache: 'none',
    });
    
    logger.debug('[SW-Manager] SW registered:', registration.scope);
    
    // Verificar atualizações a cada hora
    setInterval(() => {
      registration.update().catch(() => {});
    }, 1000 * 60 * 60);
    
  } catch (error) {
    logger.error('[SW-Manager] SW registration failed:', error);
  }
}

/**
 * Reabilita o Service Worker após ter sido desabilitado
 */
export function reenableServiceWorker(): void {
  localStorage.removeItem(SW_DISABLED_KEY);
  localStorage.removeItem(SW_VERSION_KEY);
  logger.debug('[SW-Manager] SW re-enabled, will register on next reload');
}
