/**
 * BridgeLink – Sistema de comunicação interna entre módulos Nautilus One
 */
export const BridgeLink = {
  emit: (event: string, data?: any) => {
    console.debug(`📡 Emitindo evento: ${event}`, data);
    window.dispatchEvent(new CustomEvent(event, { detail: data }));
  },
  on: (event: string, callback: (data: any) => void) => {
    const handler = (e: any) => callback(e.detail);
    window.addEventListener(event, handler);
    return () => window.removeEventListener(event, handler);
  },
};
