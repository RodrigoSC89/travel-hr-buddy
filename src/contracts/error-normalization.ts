/**
 * NAUTI ONE — Error Normalization v1.0
 * Maps Supabase / Edge Function errors to user-friendly messages
 * NEVER swallows errors silently
 */

import { logger } from '@/lib/logger';

export interface NormalizedError {
  /** User-friendly message (PT-BR) */
  message: string;
  /** Technical detail for logging */
  detail: string;
  /** Error category */
  category: 'auth' | 'network' | 'validation' | 'permission' | 'not_found' | 'conflict' | 'server' | 'unknown';
  /** HTTP-like status code */
  statusCode: number;
  /** Whether the user should retry */
  retryable: boolean;
}

const ERROR_MAP: Record<string, Partial<NormalizedError>> = {
  // Auth errors
  'Invalid login credentials': {
    message: 'Credenciais inválidas. Verifique e-mail e senha.',
    category: 'auth',
    statusCode: 401,
    retryable: true,
  },
  'Email not confirmed': {
    message: 'E-mail ainda não confirmado. Verifique sua caixa de entrada.',
    category: 'auth',
    statusCode: 403,
    retryable: false,
  },
  'JWT expired': {
    message: 'Sessão expirada. Faça login novamente.',
    category: 'auth',
    statusCode: 401,
    retryable: false,
  },
  'invalid claim: missing sub claim': {
    message: 'Sessão inválida. Faça login novamente.',
    category: 'auth',
    statusCode: 401,
    retryable: false,
  },

  // Permission errors
  'new row violates row-level security policy': {
    message: 'Sem permissão para realizar esta operação.',
    category: 'permission',
    statusCode: 403,
    retryable: false,
  },
  'permission denied': {
    message: 'Acesso negado. Contate o administrador.',
    category: 'permission',
    statusCode: 403,
    retryable: false,
  },

  // Conflict errors
  'duplicate key value violates unique constraint': {
    message: 'Registro duplicado. Já existe um item com esses dados.',
    category: 'conflict',
    statusCode: 409,
    retryable: false,
  },

  // Not found
  'PGRST116': {
    message: 'Registro não encontrado.',
    category: 'not_found',
    statusCode: 404,
    retryable: false,
  },

  // Network
  'Failed to fetch': {
    message: 'Sem conexão com o servidor. Verifique sua internet.',
    category: 'network',
    statusCode: 0,
    retryable: true,
  },
  'NetworkError': {
    message: 'Erro de rede. Tente novamente.',
    category: 'network',
    statusCode: 0,
    retryable: true,
  },
  'FetchError': {
    message: 'Falha na comunicação com o servidor.',
    category: 'network',
    statusCode: 0,
    retryable: true,
  },

  // Timeout
  'AbortError': {
    message: 'Requisição demorou demais. Tente novamente.',
    category: 'network',
    statusCode: 408,
    retryable: true,
  },
};

/**
 * Normalize any error into a user-friendly format
 */
export function normalizeError(error: unknown): NormalizedError {
  const rawMessage = extractErrorMessage(error);
  const statusCode = extractStatusCode(error);

  // Try to match known patterns
  for (const [pattern, mapped] of Object.entries(ERROR_MAP)) {
    if (rawMessage.toLowerCase().includes(pattern.toLowerCase())) {
      const normalized: NormalizedError = {
        message: mapped.message || 'Erro inesperado.',
        detail: rawMessage,
        category: mapped.category || 'unknown',
        statusCode: mapped.statusCode || statusCode || 500,
        retryable: mapped.retryable ?? false,
      };
      logger.warn(`[ErrorNorm] ${normalized.category}: ${normalized.detail}`);
      return normalized;
    }
  }

  // Status code based fallback
  if (statusCode === 401 || statusCode === 403) {
    return {
      message: 'Acesso não autorizado. Faça login novamente.',
      detail: rawMessage,
      category: 'auth',
      statusCode: statusCode,
      retryable: false,
    };
  }

  if (statusCode === 404) {
    return {
      message: 'Recurso não encontrado.',
      detail: rawMessage,
      category: 'not_found',
      statusCode: 404,
      retryable: false,
    };
  }

  if (statusCode === 409) {
    return {
      message: 'Conflito de dados. O registro pode já existir.',
      detail: rawMessage,
      category: 'conflict',
      statusCode: 409,
      retryable: false,
    };
  }

  if (statusCode === 422) {
    return {
      message: 'Dados inválidos. Verifique os campos preenchidos.',
      detail: rawMessage,
      category: 'validation',
      statusCode: 422,
      retryable: false,
    };
  }

  if (statusCode !== null && statusCode >= 500) {
    return {
      message: 'Erro interno do servidor. Tente novamente em alguns minutos.',
      detail: rawMessage,
      category: 'server',
      statusCode: statusCode,
      retryable: true,
    };
  }

  // Unknown fallback
  logger.error('[ErrorNorm] Unhandled error:', rawMessage);
  return {
    message: 'Ocorreu um erro inesperado. Tente novamente.',
    detail: rawMessage,
    category: 'unknown',
    statusCode: statusCode || 500,
    retryable: true,
  };
}

function extractErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object') {
    const obj = error as Record<string, unknown>;
    if (typeof obj.message === 'string') return obj.message;
    if (typeof obj.error === 'string') return obj.error;
    if (typeof obj.error_description === 'string') return obj.error_description;
    if (obj.error && typeof obj.error === 'object') {
      const inner = obj.error as Record<string, unknown>;
      if (typeof inner.message === 'string') return inner.message;
    }
  }
  return 'Unknown error';
}

function extractStatusCode(error: unknown): number | null {
  if (error && typeof error === 'object') {
    const obj = error as Record<string, unknown>;
    if (typeof obj.status === 'number') return obj.status;
    if (typeof obj.statusCode === 'number') return obj.statusCode;
    if (typeof obj.code === 'number') return obj.code;
  }
  return null;
}
