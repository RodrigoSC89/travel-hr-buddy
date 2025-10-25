/**
 * PATCH 131.0 - Module Context Manager
 * Manages temporary context memory per module
 * 
 * Each module maintains its own context including:
 * - Active state
 * - Recent actions
 * - User permissions
 * - Historical patterns
 */

export interface ModuleContext {
  moduleName: string;
  userId?: string;
  sessionId?: string;
  state?: Record<string, any>;
  history?: ContextHistoryEntry[];
  permissions?: string[];
  metadata?: Record<string, any>;
}

export interface ContextHistoryEntry {
  action: string;
  timestamp: string;
  result?: string;
  metadata?: Record<string, any>;
}

// In-memory context store (per session)
const contextStore = new Map<string, ModuleContext>();

/**
 * Get or create module context
 */
export const getModuleContext = (moduleName: string, userId?: string): ModuleContext => {
  const contextKey = `${moduleName}:${userId || "anonymous"}`;
  
  let context = contextStore.get(contextKey);
  
  if (!context) {
    context = {
      moduleName,
      userId,
      sessionId: generateSessionId(),
      state: {},
      history: [],
      permissions: [],
      metadata: {
        createdAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString()
      }
    };
    contextStore.set(contextKey, context);
  } else {
    // Update last accessed time
    if (context.metadata) {
      context.metadata.lastAccessed = new Date().toISOString();
    }
  }
  
  return context;
};

/**
 * Update module context state
 */
export const updateModuleContext = (
  moduleName: string, 
  userId: string | undefined, 
  updates: Partial<ModuleContext>
): ModuleContext => {
  const contextKey = `${moduleName}:${userId || "anonymous"}`;
  const context = getModuleContext(moduleName, userId);
  
  const updatedContext = {
    ...context,
    ...updates,
    state: { ...context.state, ...updates.state },
    metadata: {
      ...context.metadata,
      lastUpdated: new Date().toISOString()
    }
  };
  
  contextStore.set(contextKey, updatedContext);
  return updatedContext;
};

/**
 * Add history entry to module context
 */
export const addContextHistory = (
  moduleName: string,
  userId: string | undefined,
  entry: ContextHistoryEntry
): void => {
  const context = getModuleContext(moduleName, userId);
  
  if (!context.history) {
    context.history = [];
  }
  
  // Keep last 50 entries
  context.history.push(entry);
  if (context.history.length > 50) {
    context.history.shift();
  }
  
  updateModuleContext(moduleName, userId, { history: context.history });
};

/**
 * Clear module context
 */
export const clearModuleContext = (moduleName: string, userId?: string): void => {
  const contextKey = `${moduleName}:${userId || "anonymous"}`;
  contextStore.delete(contextKey);
};

/**
 * Get all active contexts (for debugging)
 */
export const getAllContexts = (): Map<string, ModuleContext> => {
  return new Map(contextStore);
};

/**
 * Generate unique session ID
 */
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Clean up old contexts (older than 1 hour)
 */
export const cleanupOldContexts = (): void => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  
  contextStore.forEach((context, key) => {
    const lastAccessed = context.metadata?.lastAccessed;
    if (lastAccessed && new Date(lastAccessed).getTime() < oneHourAgo) {
      contextStore.delete(key);
    }
  });
};

// Cleanup old contexts every 30 minutes
if (typeof window !== "undefined") {
  setInterval(cleanupOldContexts, 30 * 60 * 1000);
}
