// Service Worker Nautilus One v14 - iOS PWA FINAL FIX
// ESTRATÉGIA: SW MÍNIMO - Apenas notificações push
// NENHUM cache, nenhuma interceptação de fetch
// Isso garante que TODAS as requisições vão direto para a rede

const SW_VERSION = 'v14-pwa-fix';

// Instalação instantânea - sem precache
self.addEventListener('install', (event) => {
  console.log(`[SW ${SW_VERSION}] Installing - No caching mode`);
  self.skipWaiting();
});

// Ativação - limpar TODOS os caches antigos IMEDIATAMENTE
self.addEventListener('activate', (event) => {
  console.log(`[SW ${SW_VERSION}] Activating - Purging ALL caches`);
  event.waitUntil(
    (async () => {
      // Limpar todos os caches
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => {
        console.log(`[SW ${SW_VERSION}] Deleting cache: ${k}`);
        return caches.delete(k);
      }));
      
      // Tomar controle imediato de todas as abas
      await self.clients.claim();
      
      // Notificar todas as abas para reload
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(client => {
        client.postMessage({ type: 'SW_UPDATED', version: SW_VERSION });
      });
    })()
  );
});

// CRÍTICO: NÃO interceptar NENHUM fetch
// Deixar o browser fazer todas as requisições normalmente
// Isso elimina QUALQUER possibilidade de interferência do SW

// ====== MESSAGE HANDLERS ======

self.addEventListener('message', (event) => {
  const { type } = event.data || {};
  
  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (type === 'CLEAR_CACHE') {
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => event.ports[0]?.postMessage({ success: true }))
      .catch(() => event.ports[0]?.postMessage({ success: false }));
  }
  
  if (type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: SW_VERSION });
  }
  
  if (type === 'UNREGISTER') {
    self.registration.unregister()
      .then(() => event.ports[0]?.postMessage({ success: true }))
      .catch(() => event.ports[0]?.postMessage({ success: false }));
  }
});

// ====== PUSH NOTIFICATIONS (único propósito do SW agora) ======

self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Nautilus One', {
      body: data.body || 'Nova notificação',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [100, 50, 100],
      data: { url: data.url || '/' }
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

console.log(`[SW ${SW_VERSION}] Minimal Service Worker loaded - Push notifications only, NO fetch interception`);
