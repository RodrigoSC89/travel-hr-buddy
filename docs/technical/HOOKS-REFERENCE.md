# 🪝 Hooks Reference - Nautilus One

> **Última Atualização:** 2025-12-09  
> **Total de Hooks:** 100+  

---

## 📋 Índice por Categoria

### Core Hooks
- [useAuth](#useauth)
- [useProfile](#useprofile)
- [useOrganization](#useorganization)
- [usePermissions](#usepermissions)

### Data Hooks
- [useOptimizedQuery](#useoptimizedquery)
- [useOfflineStorage](#useofflinestorage)
- [useRealtimeSync](#userealtimesync)

### AI Hooks
- [useNautilusAI](#usenautilusai)
- [useAIAssistant](#useaiassistant)
- [useAIMemory](#useaimemory)

### Performance Hooks
- [usePerformanceMonitor](#useperformancemonitor)
- [useNetworkStatus](#usenetworkstatus)
- [useConnectionResilience](#useconnectionresilience)

---

## 🔐 Core Hooks

### useAuth
**Arquivo:** `src/hooks/use-auth.ts`

**Descrição:**  
Hook principal de autenticação usando Supabase Auth.

```typescript
const { 
  user,           // User | null
  session,        // Session | null
  loading,        // boolean
  signIn,         // (email, password) => Promise
  signUp,         // (email, password) => Promise
  signOut,        // () => Promise
  resetPassword,  // (email) => Promise
} = useAuth();
```

**Exemplo:**
```tsx
function LoginForm() {
  const { signIn, loading } = useAuth();
  
  const handleSubmit = async (data) => {
    await signIn(data.email, data.password);
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

### useProfile
**Arquivo:** `src/hooks/use-profile.ts`

**Descrição:**  
Gerencia perfil do usuário logado.

```typescript
const {
  profile,        // Profile | null
  loading,        // boolean
  updateProfile,  // (updates) => Promise
  uploadAvatar,   // (file) => Promise
  refetch,        // () => void
} = useProfile();
```

---

### useOrganization
**Arquivo:** `src/hooks/use-organization.ts`

**Descrição:**  
Contexto da organização atual do usuário.

```typescript
const {
  organization,     // Organization | null
  organizations,    // Organization[]
  currentRole,      // string
  switchOrg,        // (orgId) => Promise
  isAdmin,          // boolean
  canManage,        // boolean
} = useOrganization();
```

---

### usePermissions
**Arquivo:** `src/hooks/use-permissions.ts`

**Descrição:**  
Verificação de permissões granulares.

```typescript
const {
  hasPermission,    // (permission, type?) => boolean
  hasRole,          // (role) => boolean
  canRead,          // (resource) => boolean
  canWrite,         // (resource) => boolean
  canDelete,        // (resource) => boolean
  canManage,        // (resource) => boolean
} = usePermissions();
```

**Exemplo:**
```tsx
function AdminPanel() {
  const { hasRole } = usePermissions();
  
  if (!hasRole('admin')) {
    return <AccessDenied />;
  }
  
  return <AdminDashboard />;
}
```

---

## 📊 Data Hooks

### useOptimizedQuery
**Arquivo:** `src/hooks/use-optimized-query.ts`

**Descrição:**  
Query otimizada com cache, retry e offline support.

```typescript
const {
  data,           // T | undefined
  isLoading,      // boolean
  error,          // Error | null
  refetch,        // () => void
  isFetching,     // boolean
  isStale,        // boolean
} = useOptimizedQuery<T>({
  queryKey: ['vessels'],
  queryFn: fetchVessels,
  staleTime: 5 * 60 * 1000,    // 5 minutes
  cacheTime: 30 * 60 * 1000,   // 30 minutes
  offlineSupport: true,
});
```

---

### useOfflineStorage
**Arquivo:** `src/hooks/use-offline-storage.ts`

**Descrição:**  
Storage local com IndexedDB para modo offline.

```typescript
const {
  get,            // (key) => Promise<T>
  set,            // (key, value) => Promise
  remove,         // (key) => Promise
  clear,          // () => Promise
  keys,           // () => Promise<string[]>
} = useOfflineStorage('store-name');
```

---

### useRealtimeSync
**Arquivo:** `src/hooks/useRealtimeSync.ts`

**Descrição:**  
Sincronização em tempo real com Supabase Realtime.

```typescript
const {
  data,           // T[]
  isConnected,    // boolean
  subscribe,      // (table, callback) => void
  unsubscribe,    // () => void
} = useRealtimeSync<T>({
  table: 'vessels',
  filter: { organization_id: orgId },
  onInsert: (record) => { ... },
  onUpdate: (record) => { ... },
  onDelete: (record) => { ... },
});
```

---

## 🤖 AI Hooks

### useNautilusAI
**Arquivo:** `src/hooks/useNautilusAI.ts`

**Descrição:**  
Interface principal com o Nautilus Brain.

```typescript
const {
  ask,            // (question) => Promise<Response>
  isProcessing,   // boolean
  lastResponse,   // Response | null
  history,        // Message[]
  clearHistory,   // () => void
} = useNautilusAI();
```

**Exemplo:**
```tsx
function AIChat() {
  const { ask, isProcessing, lastResponse } = useNautilusAI();
  
  const handleAsk = async (question) => {
    const response = await ask(question);
    console.log(response);
  };
  
  return (
    <div>
      <input onSubmit={handleAsk} disabled={isProcessing} />
      {lastResponse && <p>{lastResponse.text}</p>}
    </div>
  );
}
```

---

### useAIAssistant
**Arquivo:** `src/hooks/use-ai-assistant.ts`

**Descrição:**  
Assistente de IA contextual para módulos específicos.

```typescript
const {
  suggest,        // (context) => Promise<Suggestion[]>
  analyze,        // (data) => Promise<Analysis>
  summarize,      // (text) => Promise<string>
  isThinking,     // boolean
} = useAIAssistant('maintenance');
```

---

### useAIMemory
**Arquivo:** `src/hooks/use-ai-memory.ts`

**Descrição:**  
Memória persistente do contexto de IA.

```typescript
const {
  remember,       // (key, value) => void
  recall,         // (key) => T | undefined
  forget,         // (key) => void
  clearAll,       // () => void
  context,        // Record<string, any>
} = useAIMemory();
```

---

## ⚡ Performance Hooks

### usePerformanceMonitor
**Arquivo:** `src/hooks/use-performance-monitor.ts`

**Descrição:**  
Monitoramento de performance em tempo real.

```typescript
const {
  metrics,        // PerformanceMetrics
  isSlowDevice,   // boolean
  connectionType, // string
  recordMetric,   // (name, value) => void
} = usePerformanceMonitor();
```

---

### useNetworkStatus
**Arquivo:** `src/hooks/use-network-status.ts`

**Descrição:**  
Status de conectividade de rede.

```typescript
const {
  isOnline,       // boolean
  isSlowConnection, // boolean
  connectionType, // 'wifi' | '4g' | '3g' | 'slow-2g' | 'unknown'
  effectiveType,  // string
  rtt,            // number (round-trip time)
  downlink,       // number (Mbps)
} = useNetworkStatus();
```

---

### useConnectionResilience
**Arquivo:** `src/hooks/use-connection-resilience.ts`

**Descrição:**  
Resiliência de conexão com retry automático.

```typescript
const {
  execute,        // (fn) => Promise<T>
  isRetrying,     // boolean
  retryCount,     // number
  lastError,      // Error | null
} = useConnectionResilience({
  maxRetries: 3,
  retryDelay: 1000,
  exponentialBackoff: true,
});
```

---

## 🎨 UI Hooks

### useToast
**Arquivo:** `src/hooks/use-toast.ts`

**Descrição:**  
Sistema de notificações toast.

```typescript
const { toast } = useToast();

toast({
  title: "Sucesso!",
  description: "Operação concluída.",
  variant: "default" | "destructive",
});
```

---

### useAccessibility
**Arquivo:** `src/hooks/useAccessibility.ts`

**Descrição:**  
Funcionalidades de acessibilidade.

```typescript
const {
  isHighContrast,     // boolean
  isReducedMotion,    // boolean
  fontSize,           // number
  toggleHighContrast, // () => void
  setFontSize,        // (size) => void
} = useAccessibility();
```

---

## 📱 Mobile Hooks

### useMobile
**Arquivo:** `src/hooks/use-mobile.tsx`

**Descrição:**  
Detecção e funcionalidades mobile.

```typescript
const {
  isMobile,       // boolean
  isTablet,       // boolean
  isDesktop,      // boolean
  orientation,    // 'portrait' | 'landscape'
  platform,       // 'ios' | 'android' | 'web'
} = useMobile();
```

---

## 📚 Best Practices

### Composição de Hooks
```typescript
// ✅ Correto: Hook composto
function useCrewManagement() {
  const { organization } = useOrganization();
  const { hasPermission } = usePermissions();
  const query = useOptimizedQuery({
    queryKey: ['crew', organization?.id],
    queryFn: () => fetchCrew(organization?.id),
    enabled: !!organization?.id,
  });
  
  return {
    ...query,
    canEdit: hasPermission('crew', 'write'),
  };
}
```

### Tratamento de Erros
```typescript
// ✅ Correto: Com error boundary
const { data, error } = useOptimizedQuery(...);

if (error) {
  return <ErrorFallback error={error} />;
}
```

---

*Documentação gerada automaticamente dos Hooks.*
