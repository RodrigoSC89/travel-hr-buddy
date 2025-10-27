# 💬 PATCH_CH – Communication Hub Validation Checklist

**Module:** `communication-hub`  
**Generated:** 2025-10-27  
**Status:** 🔶 Partial Implementation

---

## 📋 Validation Checklist

### 1. ✅ Mensagens Enviadas e Recebidas em Tempo Real (WebSocket/Supabase Realtime)

**Status:** 🔶 Partial

**Verificações:**
- [ ] Supabase Realtime configurado
- [ ] Mensagens persistidas em banco
- [ ] Updates em tempo real funcionais
- [ ] Typing indicators implementados
- [ ] Read receipts funcionais

**Schema Necessário:**
```sql
CREATE TABLE IF NOT EXISTS public.communication_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('direct', 'group', 'vessel', 'broadcast')),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  description TEXT,
  avatar_url TEXT,
  is_private BOOLEAN DEFAULT false,
  member_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.communication_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_read_at TIMESTAMPTZ,
  notification_preference TEXT DEFAULT 'all' CHECK (notification_preference IN ('all', 'mentions', 'none')),
  UNIQUE(channel_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.communication_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'file', 'image', 'system')),
  metadata JSONB,
  attachments JSONB, -- [{url, type, name, size}]
  reply_to UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

CREATE TABLE IF NOT EXISTS public.typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.communication_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '10 seconds',
  UNIQUE(channel_id, user_id)
);

-- Indices
CREATE INDEX idx_messages_channel ON public.messages(channel_id, created_at DESC);
CREATE INDEX idx_messages_user ON public.messages(user_id);
CREATE INDEX idx_channel_members_user ON public.channel_members(user_id);
CREATE INDEX idx_typing_indicators_channel ON public.typing_indicators(channel_id) WHERE expires_at > now();
```

**RLS Policies:**
```sql
ALTER TABLE public.communication_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can see channels they're members of
CREATE POLICY "Users can view their channels"
  ON public.communication_channels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.channel_members
      WHERE channel_members.channel_id = communication_channels.id
      AND channel_members.user_id = auth.uid()
    )
  );

-- Users can send messages to their channels
CREATE POLICY "Users can send messages to their channels"
  ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.channel_members
      WHERE channel_members.channel_id = messages.channel_id
      AND channel_members.user_id = auth.uid()
    )
  );

-- Users can view messages in their channels
CREATE POLICY "Users can view messages in their channels"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.channel_members
      WHERE channel_members.channel_id = messages.channel_id
      AND channel_members.user_id = auth.uid()
    )
  );
```

**Realtime Subscription:**
```typescript
// useChatRealtime.ts
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export function useChatRealtime(channelId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`chat-${channelId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${channelId}`
      }, (payload) => {
        // Add new message to cache
        queryClient.setQueryData(['messages', channelId], (old: any) => {
          return old ? [...old, payload.new] : [payload.new];
        });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${channelId}`
      }, (payload) => {
        // Update message in cache
        queryClient.setQueryData(['messages', channelId], (old: any) => {
          return old?.map((msg: any) => 
            msg.id === payload.new.id ? payload.new : msg
          );
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, queryClient]);
}
```

**Chat Component:**
```typescript
// ChatInterface.tsx
export function ChatInterface({ channelId }: { channelId: string }) {
  const { data: messages } = useQuery({
    queryKey: ['messages', channelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*, user:user_id(id, email, profiles(full_name, avatar_url))')
        .eq('channel_id', channelId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  useChatRealtime(channelId); // Enable realtime updates

  const sendMessage = async (content: string) => {
    const { error } = await supabase
      .from('messages')
      .insert({
        channel_id: channelId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        content,
        message_type: 'text'
      });
    
    if (error) throw error;
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        {messages?.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </ScrollArea>
      <ChatInput onSend={sendMessage} />
    </div>
  );
}
```

**Ações Necessárias:**
1. Criar tabelas communication schema
2. Configurar RLS policies
3. Implementar hooks realtime
4. Criar componentes UI (ChatInterface, MessageBubble)
5. Adicionar typing indicators

---

### 2. ✅ Anexos (Imagens/PDF) Funcionais

**Status:** ❌ Not Implemented

**Verificações:**
- [ ] Supabase Storage bucket configurado
- [ ] Upload de arquivos funcional
- [ ] Preview de imagens inline
- [ ] Download de PDFs funcional
- [ ] Limite de tamanho validado

**Storage Setup:**
```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', false);

-- Storage policies
CREATE POLICY "Users can upload attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'chat-attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view attachments in their channels"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'chat-attachments' AND
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.channel_members cm ON cm.channel_id = m.channel_id
      WHERE m.attachments::jsonb @> jsonb_build_array(jsonb_build_object('url', storage.objects.name))
      AND cm.user_id = auth.uid()
    )
  );
```

**Upload Hook:**
```typescript
// useFileUpload.ts
export function useFileUpload() {
  const uploadFile = async (file: File, userId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('chat-attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      name: file.name,
      type: file.type,
      size: file.size
    };
  };

  return { uploadFile };
}
```

**Attachment Component:**
```typescript
// MessageAttachment.tsx
export function MessageAttachment({ attachment }: { attachment: any }) {
  if (attachment.type.startsWith('image/')) {
    return (
      <img 
        src={attachment.url} 
        alt={attachment.name}
        className="max-w-md rounded-lg cursor-pointer"
        onClick={() => window.open(attachment.url, '_blank')}
      />
    );
  }

  if (attachment.type === 'application/pdf') {
    return (
      <a 
        href={attachment.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-2 p-2 border rounded hover:bg-accent"
      >
        <FileText className="h-5 w-5" />
        <span>{attachment.name}</span>
        <Download className="h-4 w-4 ml-auto" />
      </a>
    );
  }

  return (
    <a href={attachment.url} download>
      {attachment.name}
    </a>
  );
}
```

**Ações Necessárias:**
1. Criar bucket storage
2. Configurar policies de storage
3. Implementar upload hook
4. Criar componentes de preview
5. Validar tipos e tamanhos

---

### 3. ✅ Mensagens de Voz Gravadas e Reproduzidas com Sucesso

**Status:** ❌ Not Implemented

**Verificações:**
- [ ] Gravação de áudio funcional
- [ ] Áudio persistido em Storage
- [ ] Player de áudio implementado
- [ ] Formato de áudio otimizado (opus/webm)
- [ ] Duração máxima validada

**Voice Recording Hook:**
```typescript
// useVoiceRecording.ts
import { useState, useRef } from 'react';

export function useVoiceRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        chunks.current.push(e.data);
      };

      mediaRecorder.current.start();
      setIsRecording(true);

      // Start timer
      timerInterval.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      throw new Error('Microphone access denied');
    }
  };

  const stopRecording = async (): Promise<Blob> => {
    return new Promise((resolve) => {
      if (!mediaRecorder.current) return;

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        resolve(blob);
        
        // Cleanup
        if (timerInterval.current) clearInterval(timerInterval.current);
        setIsRecording(false);
        setDuration(0);
        chunks.current = [];
        
        // Stop all tracks
        mediaRecorder.current?.stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.stop();
    });
  };

  return {
    isRecording,
    duration,
    startRecording,
    stopRecording
  };
}
```

**Voice Message Component:**
```typescript
// VoiceMessageRecorder.tsx
export function VoiceMessageRecorder({ onSend }: { onSend: (voiceUrl: string) => void }) {
  const { isRecording, duration, startRecording, stopRecording } = useVoiceRecording();
  const { uploadFile } = useFileUpload();
  const [isUploading, setIsUploading] = useState(false);

  const handleSend = async () => {
    try {
      setIsUploading(true);
      const audioBlob = await stopRecording();
      
      // Convert blob to file
      const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, {
        type: 'audio/webm'
      });

      // Upload to storage
      const userId = (await supabase.auth.getUser()).data.user?.id!;
      const attachment = await uploadFile(audioFile, userId);

      onSend(attachment.url);
    } catch (error) {
      console.error('Failed to send voice message:', error);
      toast({ title: 'Error', description: 'Failed to send voice message', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isRecording ? (
        <>
          <Badge variant="destructive" className="animate-pulse">
            Recording {duration}s
          </Badge>
          <Button onClick={handleSend} disabled={isUploading} size="sm">
            <Send className="h-4 w-4" />
          </Button>
          <Button onClick={stopRecording} variant="outline" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <Button onClick={startRecording} variant="outline" size="icon">
          <Mic className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

// VoiceMessagePlayer.tsx
export function VoiceMessagePlayer({ url }: { url: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center gap-2 bg-secondary p-2 rounded-lg">
      <Button onClick={togglePlay} size="icon" variant="ghost">
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <Slider 
        value={[currentTime]} 
        max={duration || 100}
        onValueChange={([value]) => {
          if (audioRef.current) audioRef.current.currentTime = value;
        }}
        className="flex-1"
      />
      <span className="text-xs text-muted-foreground">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
      <audio ref={audioRef} src={url} />
    </div>
  );
}
```

**Ações Necessárias:**
1. Implementar voice recording hooks
2. Criar componentes UI (recorder, player)
3. Validar permissões de microfone
4. Otimizar formato de áudio
5. Limitar duração máxima (e.g., 5min)

---

### 4. ✅ UI Testada em Desktop e Mobile Sem Falhas Críticas

**Status:** 🔶 Needs Testing

**Verificações:**
- [ ] Responsive design validado
- [ ] Touch gestures funcionam
- [ ] Keyboard mobile funcional
- [ ] Performance em mobile aceitável
- [ ] PWA installable

**Testing Checklist:**
```markdown
## Desktop Testing (Chrome, Firefox, Safari)
- [ ] Message send/receive
- [ ] File upload
- [ ] Voice recording
- [ ] Scroll performance
- [ ] Notifications

## Mobile Testing (iOS Safari, Chrome Mobile)
- [ ] Touch interactions
- [ ] Virtual keyboard
- [ ] File picker
- [ ] Camera access
- [ ] Push notifications
- [ ] Background sync

## PWA Testing
- [ ] Install prompt appears
- [ ] Offline mode works
- [ ] Push notifications
- [ ] App icon correct
```

**Responsive Design:**
```typescript
// ChatLayout.tsx - Mobile optimized
export function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen md:h-[calc(100vh-4rem)]">
      {/* Mobile: Full screen */}
      {/* Desktop: Within container */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
```

**Ações Necessárias:**
1. Executar testes manuais em devices reais
2. Usar Chrome DevTools device emulation
3. Testar com BrowserStack/Sauce Labs
4. Validar PWA functionality
5. Performance profiling mobile

---

## 🎯 Métricas de Sucesso

| Métrica | Target | Current | Status |
|---------|--------|---------|--------|
| Realtime Messages | 100% funcional | 0% | ❌ |
| File Attachments | Funcional | 0% | ❌ |
| Voice Messages | Gravação/Player OK | 0% | ❌ |
| Mobile Testing | 0 falhas críticas | TBD | ⏳ |
| Latency | < 500ms | TBD | ⏳ |

---

## 📊 Status Geral do Módulo

**Cobertura:** 10%  
**Prioridade:** 🔴 Alta  
**Estimativa:** 40 horas

### Implementado ✅
- Módulo `communication-gateway` existe (parcial)
- Base de infrastructure

### Não Implementado ❌
- Schema completo de chat
- Realtime subscriptions
- File attachments
- Voice messages
- Mobile testing

---

## 🔧 Próximos Passos

### Fase 1: Database (6h)
1. 🔲 Criar tabelas communication
2. 🔲 Configurar RLS policies
3. 🔲 Setup Storage bucket
4. 🔲 Storage policies

### Fase 2: Realtime Chat (12h)
1. 🔲 Implementar hooks realtime
2. 🔲 Criar ChatInterface.tsx
3. 🔲 Message components
4. 🔲 Typing indicators

### Fase 3: Attachments (10h)
1. 🔲 File upload hook
2. 🔲 Image preview
3. 🔲 PDF viewer
4. 🔲 Voice recording

### Fase 4: Testing (12h)
1. 🔲 Desktop testing
2. 🔲 Mobile testing
3. 🔲 PWA validation
4. 🔲 E2E tests

---

**Última Atualização:** 2025-10-27  
**Validado por:** AI System  
**Próxima Revisão:** Após implementação Fase 1
