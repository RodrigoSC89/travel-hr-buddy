// Service Worker Nauti One v19 - PATCH v27 PRODUCTION FIX
// ESTRATÉGIA: SW MÍNIMO - Apenas notificações push
// NENHUM cache, nenhuma interceptação de fetch
// Isso garante que TODAS as requisições vão direto para a rede

const SW_VERSION = 'v19-production-jan2026';

// Instalação instantânea - sem precache
self.addEventListener('install', (event) => {
  console.log(`[SW ${SW_VERSION}] Installing - Zero cache mode`);
  // Forçar ativação imediata sem esperar tabs fecharem
  self.skipWaiting();
});

// Ativação - limpar TODOS os caches antigos IMEDIATAMENTE
self.addEventListener('activate', (event) => {
  console.log(`[SW ${SW_VERSION}] Activating - Purging ALL caches`);
  event.waitUntil(
    (async () => {
      // Limpar todos os caches sem exceção
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => {
        console.log(`[SW ${SW_VERSION}] Deleting cache: ${k}`);
        return caches.delete(k);
      }));
      
      // Tomar controle imediato de todas as abas
      await self.clients.claim();
      
      // Notificar todas as abas para atualizar
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(client => {
        client.postMessage({ 
          type: 'SW_UPDATED', 
          version: SW_VERSION,
          action: 'RELOAD_RECOMMENDED',
          timestamp: Date.now()
        });
      });
      
      console.log(`[SW ${SW_VERSION}] Activated - All caches cleared, clients claimed`);
    })()
  );
});

// CRÍTICO: NÃO interceptar NENHUM fetch
// Deixar o browser fazer todas as requisições normalmente
// Isso elimina QUALQUER possibilidade de interferência do SW
// NÃO usar navigator.onLine - não é confiável no iOS PWA

// ====== MESSAGE HANDLERS ======

self.addEventListener('message', (event) => {
  const { type } = event.data || {};
  
  if (type === 'SKIP_WAITING') {
    console.log(`[SW ${SW_VERSION}] Skip waiting requested`);
    self.skipWaiting();
  }
  
  if (type === 'CLEAR_CACHE' || type === 'CLEAR_ALL_CACHES') {
    console.log(`[SW ${SW_VERSION}] Clearing all caches`);
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => {
        console.log(`[SW ${SW_VERSION}] All caches cleared`);
        event.ports[0]?.postMessage({ success: true, version: SW_VERSION });
      })
      .catch((err) => {
        console.error(`[SW ${SW_VERSION}] Cache clear failed:`, err);
        event.ports[0]?.postMessage({ success: false, error: err.message });
      });
  }
  
  if (type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: SW_VERSION });
  }
  
  if (type === 'UNREGISTER') {
    console.log(`[SW ${SW_VERSION}] Unregister requested`);
    self.registration.unregister()
      .then(() => {
        console.log(`[SW ${SW_VERSION}] Unregistered successfully`);
        event.ports[0]?.postMessage({ success: true });
      })
      .catch((err) => {
        console.error(`[SW ${SW_VERSION}] Unregister failed:`, err);
        event.ports[0]?.postMessage({ success: false, error: err.message });
      });
  }
  
  if (type === 'FORCE_UPDATE') {
    console.log(`[SW ${SW_VERSION}] Force update requested`);
    self.registration.update()
      .then(() => event.ports[0]?.postMessage({ success: true }))
      .catch(() => event.ports[0]?.postMessage({ success: false }));
  }
  
  if (type === 'CHECK_UPDATE') {
    console.log(`[SW ${SW_VERSION}] Check update requested`);
    self.registration.update()
      .then(() => {
        event.ports[0]?.postMessage({ 
          success: true, 
          currentVersion: SW_VERSION 
        });
      })
      .catch((err) => {
        event.ports[0]?.postMessage({ success: false, error: err.message });
      });
  }
  
  if (type === 'HEALTH_CHECK') {
    event.ports[0]?.postMessage({ 
      healthy: true, 
      version: SW_VERSION,
      timestamp: Date.now(),
      cacheEnabled: false,
      fetchInterceptionEnabled: false
    });
  }
});

// ====== PUSH NOTIFICATIONS (único propósito do SW agora) ======

self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Nauti One', {
      body: data.body || 'Nova notificação',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [100, 50, 100],
      data: { url: data.url || '/' },
      tag: data.tag || 'default',
      requireInteraction: data.requireInteraction || false
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' })
      .then((clients) => {
        for (const client of clients) {
          if ('focus' in client) {
            client.navigate(event.notification.data?.url || '/');
            return client.focus();
          }
        }
        return self.clients.openWindow(event.notification.data?.url || '/');
      })
  );
});

console.log(`[SW ${SW_VERSION}] Minimal Service Worker loaded - Push notifications only, NO fetch interception, NO caching, NO navigator.onLine checks`);
