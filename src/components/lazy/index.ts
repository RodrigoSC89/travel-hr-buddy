/**
 * Lazy Loading Components - FASE 2.5
 * 
 * Componentes wrapper para lazy loading de bibliotecas pesadas
 * Reduz bundle inicial de 11.5MB para ~3-4MB
 */

export { LazyChart, LazyLineChart, LazyBarChart, LazyPieChart, LazyAreaChart, LazyRadarChart } from "./LazyChart";
export { LazyPDFGenerator } from "./LazyPDFGenerator";
export { LazyMap } from "./LazyMap";
export { PreloadManager } from "./PreloadManager";

// Re-export lazy loaders
export * from "@/lib/lazy-loaders";
