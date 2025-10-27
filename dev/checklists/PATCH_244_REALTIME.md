# 🟡 PATCH 244 – Ativar Supabase Realtime e WebSocket

**Data:** 2025-10-27  
**Status:** PENDENTE  
**Prioridade:** MÉDIA 🟡  
**Módulo:** Real-time Communication

---

## 📋 Objetivo

Habilitar Supabase Realtime e WebSocket para comunicação em tempo real, permitindo atualizações automáticas em notificações, comunicação da tripulação e sistema de tarefas colaborativas.

---

## 🎯 Resultados Esperados

- ✅ Supabase Realtime habilitado no projeto
- ✅ Subscriptions configuradas para tabelas críticas
- ✅ Notifications Center com updates em tempo real
- ✅ Crew Communications com chat realtime
- ✅ Joint Tasking System com sync automático
- ✅ Broadcast channels para context_mesh
- ✅ Presence tracking para usuários online
- ✅ Reconnection automática

---

## 🔧 Habilitação do Realtime no Supabase

### Passo 1: Habilitar Realtime no Dashboard

1. Acessar Supabase Dashboard
2. Ir em **Database > Replication**
3. Habilitar replicação para as tabelas:
   - `notifications`
   - `crew_messages`
   - `tasks`
   - `context_mesh`
   - `vessel_telemetry`
   - `alerts`

### Passo 2: Configurar RLS para Realtime

```sql
-- Permitir leitura realtime de notificações
ALTER TABLE notifications REPLICA IDENTITY FULL;

CREATE POLICY "Users can receive own notifications in realtime"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

-- Permitir mensagens de crew em realtime
ALTER TABLE crew_messages REPLICA IDENTITY FULL;

CREATE POLICY "Crew can receive messages in realtime"
ON crew_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM crew_members
    WHERE user_id = auth.uid()
    AND vessel_id = crew_messages.vessel_id
  )
);

-- Tasks
ALTER TABLE tasks REPLICA IDENTITY FULL;

CREATE POLICY "Team can receive task updates in realtime"
ON tasks FOR SELECT
USING (
  assigned_to = auth.uid() OR
  created_by = auth.uid()
);
```

---

## 🛠️ Implementação por Módulo

### Módulo 1: Notifications Center

**Arquivo:** `src/modules/notifications/NotificationCenter.tsx`

```typescript
// hooks/useRealtimeNotifications.ts
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export function useRealtimeNotifications(userId: string) {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('New notification:', payload)
          
          // Invalidate queries to refetch
          queryClient.invalidateQueries({ queryKey: ['notifications'] })
          
          // Show toast
          toast({
            title: payload.new.title,
            description: payload.new.message,
          })
          
          // Play sound
          playNotificationSound()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] })
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, queryClient])
}

// Component
export function NotificationCenter() {
  const { data: user } = useUser()
  const { data: notifications } = useNotifications()
  
  // Enable realtime updates
  useRealtimeNotifications(user?.id)
  
  return (
    <div className="notification-center">
      {notifications?.map(notification => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  )
}
```

### Módulo 2: Crew Communications (Chat)

**Arquivo:** `src/modules/crew/CrewCommunications.tsx`

```typescript
// hooks/useCrewChat.ts
export function useCrewChat(vesselId: string) {
  const queryClient = useQueryClient()
  const { data: user } = useUser()
  
  // Fetch messages
  const { data: messages, isLoading } = useQuery({
    queryKey: ['crew-messages', vesselId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crew_messages')
        .select(`
          *,
          sender:users(id, full_name, avatar_url)
        `)
        .eq('vessel_id', vesselId)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data
    }
  })
  
  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`crew-chat:${vesselId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'crew_messages',
          filter: `vessel_id=eq.${vesselId}`
        },
        (payload) => {
          queryClient.setQueryData(
            ['crew-messages', vesselId],
            (old: any) => [...(old || []), payload.new]
          )
          
          // Scroll to bottom
          scrollToBottom()
          
          // Play sound if not from current user
          if (payload.new.sender_id !== user?.id) {
            playMessageSound()
          }
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [vesselId, queryClient, user])
  
  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase
        .from('crew_messages')
        .insert({
          vessel_id: vesselId,
          sender_id: user?.id,
          content,
          message_type: 'text'
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  })
  
  return {
    messages,
    isLoading,
    sendMessage: sendMessage.mutate
  }
}

// Component
export function CrewCommunications({ vesselId }: { vesselId: string }) {
  const { messages, isLoading, sendMessage } = useCrewChat(vesselId)
  const [input, setInput] = useState('')
  
  const handleSend = () => {
    if (!input.trim()) return
    sendMessage(input)
    setInput('')
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages?.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
      </div>
      
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
          />
          <Button onClick={handleSend}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### Módulo 3: Joint Tasking System

**Arquivo:** `src/modules/tasks/JointTasking.tsx`

```typescript
// hooks/useRealtimeTasks.ts
export function useRealtimeTasks(filters?: TaskFilters) {
  const queryClient = useQueryClient()
  const { data: user } = useUser()
  
  // Fetch tasks
  const { data: tasks } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          assignee:users!assigned_to(*),
          creator:users!created_by(*)
        `)
      
      if (filters?.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data
    }
  })
  
  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('tasks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: user ? `assigned_to=eq.${user.id}` : undefined
        },
        (payload) => {
          console.log('Task update:', payload)
          
          if (payload.eventType === 'INSERT') {
            queryClient.setQueryData(['tasks', filters], (old: any) => 
              [...(old || []), payload.new]
            )
            
            toast({
              title: 'New Task Assigned',
              description: payload.new.title
            })
          } else if (payload.eventType === 'UPDATE') {
            queryClient.setQueryData(['tasks', filters], (old: any) =>
              old?.map((task: any) => 
                task.id === payload.new.id ? payload.new : task
              )
            )
          } else if (payload.eventType === 'DELETE') {
            queryClient.setQueryData(['tasks', filters], (old: any) =>
              old?.filter((task: any) => task.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, filters, queryClient])
  
  return { tasks }
}
```

### Módulo 4: Broadcast Context (context_mesh)

**Arquivo:** `src/contexts/ContextMeshProvider.tsx`

```typescript
// Context for sharing state across users
export function ContextMeshProvider({ children }: { children: ReactNode }) {
  const [contextState, setContextState] = useState<any>({})
  const { data: user } = useUser()
  
  useEffect(() => {
    const channel = supabase.channel('context_mesh')
    
    // Subscribe to broadcast messages
    channel
      .on('broadcast', { event: 'state_update' }, (payload) => {
        console.log('Received state update:', payload)
        setContextState(payload.state)
      })
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
  
  // Function to broadcast state changes
  const broadcastState = useCallback(async (state: any) => {
    const channel = supabase.channel('context_mesh')
    await channel.send({
      type: 'broadcast',
      event: 'state_update',
      state
    })
  }, [])
  
  return (
    <ContextMeshContext.Provider value={{ contextState, broadcastState }}>
      {children}
    </ContextMeshContext.Provider>
  )
}
```

### Módulo 5: Presence Tracking (Online Users)

**Arquivo:** `src/hooks/usePresence.ts`

```typescript
export function usePresence(channelName: string) {
  const [onlineUsers, setOnlineUsers] = useState<any[]>([])
  const { data: user } = useUser()
  
  useEffect(() => {
    if (!user) return
    
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: user.id,
        },
      },
    })
    
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const users = Object.values(state).flat()
        setOnlineUsers(users)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          })
        }
      })
    
    return () => {
      channel.untrack()
      supabase.removeChannel(channel)
    }
  }, [channelName, user])
  
  return { onlineUsers }
}

// Usage in component
export function OnlineUsersList() {
  const { onlineUsers } = usePresence('vessel:main')
  
  return (
    <div>
      <h3>Online Now ({onlineUsers.length})</h3>
      {onlineUsers.map(user => (
        <div key={user.user_id}>
          <Avatar src={user.avatar_url} />
          <span>{user.full_name}</span>
          <Badge>Online</Badge>
        </div>
      ))}
    </div>
  )
}
```

---

## 🔄 Reconnection Strategy

```typescript
// hooks/useRealtimeConnection.ts
export function useRealtimeConnection() {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected')
  
  useEffect(() => {
    const handleOnline = () => {
      setStatus('reconnecting')
      // Resubscribe to all channels
      setTimeout(() => {
        setStatus('connected')
      }, 1000)
    }
    
    const handleOffline = () => {
      setStatus('disconnected')
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  return { status }
}

// Connection status indicator
export function ConnectionStatus() {
  const { status } = useRealtimeConnection()
  
  if (status === 'connected') return null
  
  return (
    <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
      {status === 'disconnected' && (
        <>
          <WifiOff className="inline mr-2" />
          Connection lost
        </>
      )}
      {status === 'reconnecting' && (
        <>
          <Loader2 className="inline mr-2 animate-spin" />
          Reconnecting...
        </>
      )}
    </div>
  )
}
```

---

## ✅ Checklist de Validação

### Configuração
- [ ] Realtime habilitado no Supabase Dashboard
- [ ] Tabelas com REPLICA IDENTITY FULL
- [ ] RLS policies configuradas para realtime
- [ ] WebSocket connection estabelecida

### Funcionalidades
- [ ] Notifications Center recebe updates em tempo real
- [ ] Crew Chat funcional com mensagens instantâneas
- [ ] Tasks sincronizam automaticamente
- [ ] Context mesh compartilha estado
- [ ] Presence tracking mostra usuários online

### Performance
- [ ] Subscriptions limpas no unmount
- [ ] Reconnection automática funcional
- [ ] Sem memory leaks
- [ ] Latência < 100ms para mensagens

### UX
- [ ] Status de conexão visível
- [ ] Toast notifications para eventos
- [ ] Loading states durante reconnection
- [ ] Offline fallback

---

## 📊 Métricas de Sucesso

| Métrica | Alvo |
|---------|------|
| Message Latency | < 100ms |
| Connection Uptime | > 99% |
| Reconnection Time | < 2s |
| Concurrent Users | 100+ |

---

**STATUS:** 🟡 AGUARDANDO IMPLEMENTAÇÃO  
**PRÓXIMO PATCH:** PATCH 245 – Voice Assistant Real
