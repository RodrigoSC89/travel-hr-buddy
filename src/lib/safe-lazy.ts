import React from "react";

function withTimeout<T>(p: Promise<T>, ms: number, label: string) {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`[lazy-timeout] ${label} não carregou em ${ms}ms`)), ms);
    p.then(v => { clearTimeout(t); resolve(v); })
     .catch(e => { clearTimeout(t); reject(e); });
  });
}

export function lazyWithRetry<T extends React.ComponentType<any>>(
  loader: () => Promise<{ default: T }>,
  opts: { timeoutMs?: number; retries?: number; label?: string } = {}
) {
  const { timeoutMs = 15000, retries = 1, label = "módulo" } = opts;

  const load = async (attempt = 0): Promise<{ default: T }> => {
    try {
      return await withTimeout(loader(), timeoutMs, label);
    } catch (e) {
      if (attempt < retries) {
        console.warn(`[lazy-retry] ${label}: nova tentativa ${attempt + 1}/${retries}`);
        return load(attempt + 1);
      }
      throw e;
    }
  };

  return React.lazy(load);
}
