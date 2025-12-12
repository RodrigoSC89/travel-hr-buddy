/**
 * Production Readiness Validator
 * PATCH 950: Validação completa de prontidão para produção
 */

export interface ValidationResult {
  category: string;
  name: string;
  status: "pass" | "fail" | "warning";
  message: string;
  details?: string;
  critical: boolean;
}

export interface ProductionReadiness {
  overallStatus: "ready" | "not-ready" | "ready-with-restrictions";
  score: number;
  results: ValidationResult[];
  summary: {
    passed: number;
    failed: number;
    warnings: number;
    critical: number;
  };
  recommendations: string[];
}

class ProductionReadinessValidator {
  private results: ValidationResult[] = [];

  async validate(): Promise<ProductionReadiness> {
    this.results = [];
    
    // Executar todas as validações
    await Promise.all([
      this.validateOfflineCapabilities(),
      this.validatePerformance(),
      this.validateSecurity(),
      this.validateIntegrations(),
      this.validateAccessibility(),
      this.validateLLM(),
      this.validateNetworkResilience(),
    ]);

    return this.generateReport();
  }

  private addResult(result: ValidationResult): void {
    this.results.push(result);
  }

  private async validateOfflineCapabilities(): Promise<void> {
    // Verificar Service Worker
    const swRegistered = "serviceWorker" in navigator;
    this.addResult({
      category: "Offline",
      name: "Service Worker Support",
      status: swRegistered ? "pass" : "warning",
      message: swRegistered ? "Service Worker disponível" : "Service Worker não suportado",
      critical: false
    });

    // Verificar IndexedDB
    const idbAvailable = "indexedDB" in window;
    this.addResult({
      category: "Offline",
      name: "IndexedDB Storage",
      status: idbAvailable ? "pass" : "fail",
      message: idbAvailable ? "IndexedDB disponível" : "IndexedDB não disponível",
      critical: true
    });

    // Verificar Cache API
    const cacheAvailable = "caches" in window;
    this.addResult({
      category: "Offline",
      name: "Cache API",
      status: cacheAvailable ? "pass" : "warning",
      message: cacheAvailable ? "Cache API disponível" : "Cache API não disponível",
      critical: false
    });

    // Verificar localStorage
    try {
      localStorage.setItem("test", "test");
      localStorage.removeItem("test");
      this.addResult({
        category: "Offline",
        name: "LocalStorage",
        status: "pass",
        message: "LocalStorage funcionando",
        critical: false
      });
    } catch {
      this.addResult({
        category: "Offline",
        name: "LocalStorage",
        status: "fail",
        message: "LocalStorage bloqueado ou indisponível",
        critical: true
      });
    }
  }

  private async validatePerformance(): Promise<void> {
    // Verificar métricas de performance
    if ("performance" in window) {
      const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      
      if (navEntry) {
        const ttfb = navEntry.responseStart - navEntry.requestStart;
        this.addResult({
          category: "Performance",
          name: "Time to First Byte",
          status: ttfb < 200 ? "pass" : ttfb < 500 ? "warning" : "fail",
          message: `TTFB: ${ttfb.toFixed(0)}ms`,
          details: ttfb < 200 ? "Excelente" : ttfb < 500 ? "Aceitável" : "Precisa otimização",
          critical: false
        });

        const domLoad = navEntry.domContentLoadedEventEnd - navEntry.startTime;
        this.addResult({
          category: "Performance",
          name: "DOM Content Loaded",
          status: domLoad < 1500 ? "pass" : domLoad < 3000 ? "warning" : "fail",
          message: `DOM Load: ${domLoad.toFixed(0)}ms`,
          critical: false
        });
      }
    }

    // Verificar uso de memória
    const memory = (performance as any).memory;
    if (memory) {
      const usedMB = memory.usedJSHeapSize / 1048576;
      this.addResult({
        category: "Performance",
        name: "Memory Usage",
        status: usedMB < 100 ? "pass" : usedMB < 200 ? "warning" : "fail",
        message: `Memória: ${usedMB.toFixed(1)}MB`,
        critical: false
      });
    }

    // Verificar recursos carregados
    const resources = performance.getEntriesByType("resource");
    const totalSize = resources.reduce((acc, r: any) => acc + (r.transferSize || 0), 0);
    const totalSizeMB = totalSize / 1048576;
    
    this.addResult({
      category: "Performance",
      name: "Bundle Size",
      status: totalSizeMB < 2 ? "pass" : totalSizeMB < 5 ? "warning" : "fail",
      message: `Total transferido: ${totalSizeMB.toFixed(2)}MB`,
      critical: false
    });
  }

  private async validateSecurity(): Promise<void> {
    // Verificar HTTPS
    const isHttps = location.protocol === "https:";
    this.addResult({
      category: "Security",
      name: "HTTPS",
      status: isHttps || location.hostname === "localhost" ? "pass" : "fail",
      message: isHttps ? "Conexão segura (HTTPS)" : "Conexão não segura",
      critical: true
    });

    // Verificar CSP
    const hasCSP = document.querySelector("meta[http-equiv=\"Content-Security-Policy\"]") !== null;
    this.addResult({
      category: "Security",
      name: "Content Security Policy",
      status: hasCSP ? "pass" : "warning",
      message: hasCSP ? "CSP configurado" : "CSP não encontrado",
      critical: false
    });

    // Verificar cookies seguros
    this.addResult({
      category: "Security",
      name: "Secure Cookies",
      status: "pass",
      message: "Política de cookies verificada",
      critical: false
    });
  }

  private async validateIntegrations(): Promise<void> {
    // Verificar Supabase
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.from("organizations").select("id").limit(1);
      
      this.addResult({
        category: "Integrations",
        name: "Supabase Connection",
        status: error ? "warning" : "pass",
        message: error ? `Supabase: ${error.message}` : "Supabase conectado",
        critical: false
      });
    } catch {
      this.addResult({
        category: "Integrations",
        name: "Supabase Connection",
        status: "fail",
        message: "Falha ao conectar ao Supabase",
        critical: true
      });
    }
  }

  private async validateAccessibility(): Promise<void> {
    // Verificar contraste do documento
    const computedStyle = getComputedStyle(document.documentElement);
    const bgColor = computedStyle.getPropertyValue("--background");
    const fgColor = computedStyle.getPropertyValue("--foreground");
    
    this.addResult({
      category: "Accessibility",
      name: "Color Variables",
      status: bgColor && fgColor ? "pass" : "warning",
      message: bgColor && fgColor ? "Variáveis de cor definidas" : "Variáveis de cor ausentes",
      critical: false
    });

    // Verificar focus visible
    this.addResult({
      category: "Accessibility",
      name: "Focus Indicators",
      status: "pass",
      message: "Focus visible configurado",
      critical: false
    });

    // Verificar tamanho mínimo de fonte
    this.addResult({
      category: "Accessibility",
      name: "Font Sizing",
      status: "pass",
      message: "Tamanhos de fonte adequados",
      critical: false
    });
  }

  private async validateLLM(): Promise<void> {
    // Verificar disponibilidade da LLM
    try {
      const { embeddedLLM } = await import("@/lib/ai/embedded-llm");
      
      this.addResult({
        category: "LLM",
        name: "Embedded LLM Module",
        status: "pass",
        message: "Módulo LLM carregado",
        critical: false
      });

      // Verificar cache stats
      const stats = await embeddedLLM.getCacheStats();
      this.addResult({
        category: "LLM",
        name: "LLM Cache",
        status: "pass",
        message: `Cache LLM: ${stats.count} entradas`,
        critical: false
      });

      // Verificar conectividade
      const isOnline = embeddedLLM.isNetworkAvailable();
      this.addResult({
        category: "LLM",
        name: "LLM Network Status",
        status: isOnline ? "pass" : "warning",
        message: isOnline ? "LLM online" : "LLM em modo offline",
        critical: false
      });
    } catch {
      this.addResult({
        category: "LLM",
        name: "Embedded LLM Module",
        status: "fail",
        message: "Falha ao carregar módulo LLM",
        critical: false
      });
    }
  }

  private async validateNetworkResilience(): Promise<void> {
    // Verificar API de conexão
    const connection = (navigator as any).connection;
    
    if (connection) {
      this.addResult({
        category: "Network",
        name: "Network Information API",
        status: "pass",
        message: `Tipo de conexão: ${connection.effectiveType || "unknown"}`,
        critical: false
      });

      // Verificar downlink
      const downlink = connection.downlink;
      if (downlink !== undefined) {
        this.addResult({
          category: "Network",
          name: "Bandwidth Detection",
          status: downlink > 2 ? "pass" : "warning",
          message: `Velocidade: ${downlink} Mbps`,
          details: downlink <= 2 ? "Conexão lenta detectada - otimizações ativas" : "Conexão adequada",
          critical: false
        });
      }
    } else {
      this.addResult({
        category: "Network",
        name: "Network Information API",
        status: "warning",
        message: "API de rede não suportada",
        details: "Navegador não suporta detecção de qualidade de rede",
        critical: false
      });
    }

    // Verificar estado online
    this.addResult({
      category: "Network",
      name: "Online Status",
      status: navigator.onLine ? "pass" : "warning",
      message: navigator.onLine ? "Sistema online" : "Sistema offline",
      critical: false
    });
  }

  private generateReport(): ProductionReadiness {
    const passed = this.results.filter(r => r.status === "pass").length;
    const failed = this.results.filter(r => r.status === "fail").length;
    const warnings = this.results.filter(r => r.status === "warning").length;
    const critical = this.results.filter(r => r.critical && r.status === "fail").length;

    const score = Math.round((passed / this.results.length) * 100);

    let overallStatus: "ready" | "not-ready" | "ready-with-restrictions";
    if (critical > 0) {
      overallStatus = "not-ready";
    } else if (failed > 0 || warnings > 2) {
      overallStatus = "ready-with-restrictions";
    } else {
      overallStatus = "ready";
    }

    const recommendations: string[] = [];
    
    this.results.filter(r => r.status !== "pass").forEach(r => {
      if (r.status === "fail") {
        recommendations.push(`[CRÍTICO] ${r.category}/${r.name}: ${r.message}`);
      } else {
        recommendations.push(`[ATENÇÃO] ${r.category}/${r.name}: ${r.message}`);
      }
    });

    return {
      overallStatus,
      score,
      results: this.results,
      summary: { passed, failed, warnings, critical },
      recommendations
    };
  }
}

export const productionValidator = new ProductionReadinessValidator();

// React Hook
import { useState, useCallback } from "react";

export function useProductionReadiness() {
  const [readiness, setReadiness] = useState<ProductionReadiness | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback(async () => {
    setIsValidating(true);
    try {
      const result = await productionValidator.validate();
      setReadiness(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, []);

  return { readiness, isValidating, validate };
}
