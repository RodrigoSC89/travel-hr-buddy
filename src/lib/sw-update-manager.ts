/**
 * Service Worker Update Manager v9
 * Força atualização do SW quando detecta versão antiga ou erros de chunk
 * CRITICAL: Atualizado para v9 com limpeza mais agressiva
 */

const EXPECTED_SW_VERSION = 'v9';
const SW_VERSION_KEY = 'nautilus_sw_version';
const LAST_UPDATE_CHECK_KEY = 'nautilus_sw_last_check';

/**
 * Verifica se o Service Worker precisa ser atualizado
 * Executa automaticamente no boot da aplicação
 */
export async function checkAndUpdateServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    console.log('[SW-Manager] Service Worker not supported');
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
      console.log('[SW-Manager] Checking for SW updates...', {
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
          console.log('[SW-Manager] New SW waiting, activating...');
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        
        // Listener para quando novo SW for ativado
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[SW-Manager] New SW installed, will activate on next load');
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
    console.error('[SW-Manager] Error checking SW:', error);
  }
}

/**
 * Força limpeza completa de todos os caches e Service Workers
 * Usar quando há erros persistentes
 */
export async function forceFullCacheClear(): Promise<void> {
  console.log('[SW-Manager] Force clearing all caches...');
  
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
      console.log('[SW-Manager] All SWs unregistered');
    }
    
    // 2. Limpar todos os caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('[SW-Manager] All caches cleared');
    }
    
    // 3. Limpar storage relacionado ao SW
    localStorage.removeItem(SW_VERSION_KEY);
    localStorage.removeItem(LAST_UPDATE_CHECK_KEY);
    sessionStorage.clear();
    
    console.log('[SW-Manager] Cache clear complete');
    
  } catch (error) {
    console.error('[SW-Manager] Error clearing caches:', error);
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
 */
export async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      updateViaCache: 'none', // Sempre verificar atualizações
    });
    
    console.log('[SW-Manager] SW registered:', registration.scope);
    
    // Verificar atualizações periodicamente
    setInterval(() => {
      registration.update().catch(() => {});
    }, 1000 * 60 * 30); // A cada 30 minutos
    
  } catch (error) {
    console.error('[SW-Manager] SW registration failed:', error);
  }
}
