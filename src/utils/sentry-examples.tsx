import * as Sentry from "@sentry/react";

/**
 * Exemplo de uso do Sentry para captura de erros
 * 
 * Este arquivo demonstra diferentes formas de usar o Sentry
 * em componentes React e funções JavaScript/TypeScript.
 */

// ============================================
// 1. CAPTURA MANUAL DE ERROS
// ============================================

/**
 * Capturar um erro manualmente
 */
export function captureManualError() {
  try {
    // Código que pode gerar erro
    throw new Error("Exemplo de erro manual");
  } catch (error) {
    Sentry.captureException(error);
  }
}

/**
 * Capturar uma mensagem (não é um erro, apenas um log)
 */
export function captureMessage() {
  Sentry.captureMessage("Algo importante aconteceu", "info");
}

// ============================================
// 2. ADICIONAR CONTEXTO AOS ERROS
// ============================================

/**
 * Adicionar informações do usuário
 */
export function setUserContext(user: { id: string; email: string; name: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name,
  });
}

/**
 * Remover informações do usuário (ex: ao fazer logout)
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Adicionar tags customizadas
 */
export function addCustomTags() {
  Sentry.setTag("organization", "my-org");
  Sentry.setTag("feature", "travel-booking");
  Sentry.setTag("plan", "premium");
}

/**
 * Adicionar contexto adicional
 */
export function addCustomContext() {
  Sentry.setContext("business", {
    plan: "premium",
    subscription_end: "2024-12-31",
    features: ["ai-assistant", "advanced-analytics"],
  });
}

// ============================================
// 3. INTEGRAÇÃO COM REACT
// ============================================

/**
 * ErrorBoundary com Sentry
 * 
 * Exemplo de como envolver componentes com ErrorBoundary
 * para captura automática de erros em componentes React:
 * 
 * ```tsx
 * import { ErrorBoundary } from "@sentry/react";
 * 
 * function MyApp() {
 *   return (
 *     <ErrorBoundary fallback={<ErrorFallback />}>
 *       <YourComponent />
 *     </ErrorBoundary>
 *   );
 * }
 * ```
 */

/**
 * Componente de fallback para ErrorBoundary
 */
export function ErrorFallback({ error }: { error: Error }) {
  return (
    <div role="alert">
      <h2>Ocorreu um erro</h2>
      <p>Desculpe, algo deu errado. Nossa equipe foi notificada.</p>
      <pre>{error.message}</pre>
    </div>
  );
}

// ============================================
// 4. CAPTURA DE ERROS EM ASYNC/AWAIT
// ============================================

/**
 * Capturar erros em funções assíncronas
 */
export async function fetchDataWithSentry() {
  try {
    const response = await fetch("/api/data");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        api: "data-fetch",
        endpoint: "/api/data",
      },
      extra: {
        timestamp: new Date().toISOString(),
      },
    });
    throw error; // Re-throw se quiser propagar o erro
  }
}

// ============================================
// 5. BREADCRUMBS (RASTRO DE AÇÕES)
// ============================================

/**
 * Adicionar breadcrumbs para rastrear ações do usuário
 */
export function trackUserAction(action: string, data?: Record<string, unknown>) {
  Sentry.addBreadcrumb({
    category: "user-action",
    message: action,
    level: "info",
    data,
  });
}

/**
 * Exemplo de uso de breadcrumbs em um fluxo
 */
export function bookingFlow() {
  trackUserAction("Iniciou busca de voo", { destination: "São Paulo" });
  trackUserAction("Selecionou voo", { flightId: "123" });
  trackUserAction("Adicionou passageiros", { count: 2 });
  trackUserAction("Finalizou reserva", { bookingId: "456" });
}

// ============================================
// 6. PERFORMANCE MONITORING
// ============================================

/**
 * Medir performance de uma operação
 */
export async function measurePerformance() {
  const transaction = Sentry.startTransaction({
    name: "Operação Complexa",
    op: "complex-operation",
  });

  const span = transaction.startChild({
    op: "database-query",
    description: "Buscar dados do usuário",
  });

  try {
    // Operação que você quer medir
    await new Promise(resolve => setTimeout(resolve, 100));
  } finally {
    span.finish();
    transaction.finish();
  }
}

// ============================================
// 7. EXEMPLO COMPLETO EM UM COMPONENTE
// ============================================

/**
 * Exemplo de componente React com Sentry integrado
 * 
 * ```tsx
 * import React, { useEffect } from 'react';
 * import * as Sentry from '@sentry/react';
 * 
 * const MyComponent: React.FC = () => {
 *   useEffect(() => {
 *     // Adicionar breadcrumb quando o componente montar
 *     Sentry.addBreadcrumb({
 *       category: 'navigation',
 *       message: 'Usuário acessou MyComponent',
 *       level: 'info',
 *     });
 *   }, []);
 * 
 *   const handleClick = async () => {
 *     try {
 *       // Adicionar contexto antes de uma operação importante
 *       Sentry.setContext('button-click', {
 *         buttonId: 'submit-form',
 *         timestamp: new Date().toISOString(),
 *       });
 * 
 *       await someAsyncOperation();
 *     } catch (error) {
 *       // Capturar o erro com contexto adicional
 *       Sentry.captureException(error, {
 *         tags: { component: 'MyComponent' },
 *       });
 *     }
 *   };
 * 
 *   return (
 *     <button onClick={handleClick}>
 *       Executar Operação
 *     </button>
 *   );
 * };
 * 
 * export default MyComponent;
 * ```
 */

// ============================================
// 8. TESTE DE ERRO FORÇADO
// ============================================

/**
 * Função para testar se o Sentry está funcionando
 * APENAS PARA TESTES - REMOVER EM PRODUÇÃO
 */
export function testSentryError() {
  // Adicionar contexto antes do erro
  Sentry.setContext("test", {
    purpose: "Verificar integração do Sentry",
    timestamp: new Date().toISOString(),
  });

  // Adicionar breadcrumb
  Sentry.addBreadcrumb({
    category: "test",
    message: "Iniciando teste do Sentry",
    level: "info",
  });

  // Gerar erro de teste
  throw new Error("🧪 Erro de teste do Sentry - Pode ignorar!");
}

/**
 * Teste de erro com delay
 */
export function testSentryErrorAsync() {
  setTimeout(() => {
    throw new Error("🧪 Erro assíncrono de teste do Sentry - Pode ignorar!");
  }, 1000);
}

/**
 * Teste de erro capturado manualmente
 */
export function testSentryManualCapture() {
  Sentry.captureMessage("🧪 Mensagem de teste do Sentry", "warning");
}
