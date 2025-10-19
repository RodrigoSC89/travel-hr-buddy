import { logger } from "@/lib/logger";

/**
 * Wrapper para queries do Supabase com timeout automático
 * Previne travamentos em caso de problemas de rede
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 5000,
  errorMessage: string = "Operação excedeu o tempo limite"
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
  );

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Type guard para verificar se um valor é um objeto (não array)
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Converte Json do Supabase para Record<string, unknown> de forma segura
 */
export function jsonToRecord(json: unknown): Record<string, unknown> {
  if (isRecord(json)) {
    return json;
  }
  return {};
}

/**
 * Converte Json do Supabase para array de forma segura
 */
export function jsonToArray<T = unknown>(json: unknown): T[] {
  if (Array.isArray(json)) {
    return json as T[];
  }
  return [];
}

/**
 * Converte dados para formato Json aceito pelo Supabase
 */
export function toSupabaseJson(data: unknown): unknown {
  return JSON.parse(JSON.stringify(data));
}

/**
 * Executa query do Supabase com timeout e tratamento de erros
 */
export async function executeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: unknown }>,
  options: {
    timeout?: number;
    errorMessage?: string;
    fallback?: T;
  } = {}
): Promise<{ data: T | null; error: unknown }> {
  const { timeout = 5000, errorMessage = "Query timeout", fallback = null } = options;

  try {
    const result = await withTimeout(queryFn(), timeout, errorMessage);
    return result;
  } catch (error) {
    logger.error("Query error:", error);
    return { data: fallback, error };
  }
}

/**
 * Valida se o status de um módulo é válido
 */
export function isValidModuleStatus(status: string): status is "functional" | "pending" | "disabled" {
  return ["functional", "pending", "disabled"].includes(status);
}

/**
 * Valida se o tipo de conteúdo é válido
 */
export function isValidContentType(type: string): type is "tutorial" | "faq" | "guide" | "video" {
  return ["tutorial", "faq", "guide", "video"].includes(type);
}

/**
 * Valida se a dificuldade é válida
 */
export function isValidDifficulty(difficulty: string): difficulty is "beginner" | "intermediate" | "advanced" {
  return ["beginner", "intermediate", "advanced"].includes(difficulty);
}
