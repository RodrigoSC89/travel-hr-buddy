/**
 * Service Worker Registration
 * Registra e gerencia o Service Worker para cache offline
 */

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/"
    });


    // Verificar atualizações periodicamente
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000); // A cada hora

    // Listener para novas versões
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            // Nova versão disponível
            dispatchEvent(new CustomEvent("sw-update-available"));
          }
        });
      }
    });

    // Listener para mensagens do SW
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data?.type === "SYNC_COMPLETE") {
        dispatchEvent(new CustomEvent("sw-sync-complete"));
      }
    });

    return registration;
  } catch (error) {
    console.error("[SW] Erro ao registrar:", error);
    console.error("[SW] Erro ao registrar:", error);
    return null;
  }
}

export async function requestBackgroundSync(tag: string = "sync-data"): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("sync" in window.ServiceWorkerRegistration.prototype)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await (registration as any).sync.register(tag);
    return true;
  } catch (error) {
    console.error("[SW] Erro ao solicitar sync:", error);
    console.error("[SW] Erro ao solicitar sync:", error);
    return false;
  }
}

export async function clearAllCaches(): Promise<void> {
  const keys = await caches.keys();
  await Promise.all(keys.map(key => caches.delete(key)));
}

export async function getCacheSize(): Promise<number> {
  if (!("storage" in navigator && "estimate" in navigator.storage)) {
    return 0;
  }
  const estimate = await navigator.storage.estimate();
  return estimate.usage || 0;
}
