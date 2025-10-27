# 🧪 PATCH 242 – Voice Assistant with Real Voice Validation

## Module Information
- **Module**: `voice-assistant`
- **Patch**: 242
- **Priority**: HIGH
- **Status**: 🟡 PENDING VALIDATION

---

## 📋 Objectives

### 1. Speech-to-Text (STT)
- [ ] Microfone captura áudio corretamente
- [ ] Áudio convertido para texto com precisão
- [ ] Suporte para múltiplos idiomas (PT-BR, EN)
- [ ] Tratamento de ruído ambiente

### 2. Text-to-Speech (TTS)
- [ ] Texto convertido para voz sintetizada
- [ ] Voz natural e compreensível
- [ ] Controle de velocidade e tom
- [ ] Suporte para múltiplos idiomas

### 3. Voice Recording & Playback
- [ ] Gravação de áudio funcional
- [ ] Reprodução de áudio gravado
- [ ] Armazenamento persistente no Supabase Storage
- [ ] Metadata de áudio salvo no banco

### 4. Wake Word Detection
- [ ] Sistema responde à palavra-chave "Nautilus"
- [ ] Detecção funciona em background
- [ ] Baixa taxa de falsos positivos
- [ ] Feedback visual quando ativado

### 5. AI Integration
- [ ] Comandos interpretados pela IA Lovable
- [ ] Respostas contextuais geradas
- [ ] Ações executadas com base em comandos
- [ ] Histórico de conversas persistido

---

## 🗄️ Required Database Schema

### Table: `voice_conversations`
```sql
CREATE TABLE IF NOT EXISTS public.voice_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  command_text TEXT NOT NULL,
  response_text TEXT,
  audio_url TEXT,
  duration_seconds DECIMAL(6,2),
  language TEXT DEFAULT 'pt-BR',
  confidence_score DECIMAL(4,3),
  action_taken TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_voice_conversations_user ON public.voice_conversations(user_id);
CREATE INDEX idx_voice_conversations_session ON public.voice_conversations(session_id);
CREATE INDEX idx_voice_conversations_created ON public.voice_conversations(created_at);
```

### Table: `voice_settings`
```sql
CREATE TABLE IF NOT EXISTS public.voice_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  wake_word_enabled BOOLEAN DEFAULT true,
  wake_word TEXT DEFAULT 'Nautilus',
  language TEXT DEFAULT 'pt-BR',
  voice_speed DECIMAL(3,2) DEFAULT 1.0 CHECK (voice_speed BETWEEN 0.5 AND 2.0),
  voice_pitch DECIMAL(3,2) DEFAULT 1.0 CHECK (voice_pitch BETWEEN 0.5 AND 2.0),
  auto_listen BOOLEAN DEFAULT false,
  noise_suppression BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### Storage Bucket: `voice-recordings`
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'voice-recordings',
  'voice-recordings',
  false,
  10485760, -- 10MB
  ARRAY['audio/wav', 'audio/mp3', 'audio/webm', 'audio/ogg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload their own voice recordings"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'voice-recordings' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their own voice recordings"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'voice-recordings' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own voice recordings"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'voice-recordings' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## 🔒 Required RLS Policies

### voice_conversations
```sql
ALTER TABLE public.voice_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own voice conversations"
  ON public.voice_conversations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own voice conversations"
  ON public.voice_conversations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own voice conversations"
  ON public.voice_conversations FOR DELETE
  USING (user_id = auth.uid());
```

### voice_settings
```sql
ALTER TABLE public.voice_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own voice settings"
  ON public.voice_settings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own voice settings"
  ON public.voice_settings FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

---

## ✅ Acceptance Criteria

| Criterion | Status | Notes |
|-----------|--------|-------|
| Áudio capturado e convertido para texto | ⏳ | STT funcional com Web Speech API ou alternativa |
| Respostas em voz sintetizadas | ⏳ | TTS funcional e natural |
| Sistema responde à palavra-chave | ⏳ | Wake word detection ativo |
| Interações gravadas no banco | ⏳ | voice_conversations populada |
| IA executa comandos básicos | ⏳ | Ex: "Mostre minhas tarefas" → abre task list |
| Performance aceitável | ⏳ | Latência < 2s do comando à resposta |

---

## 🧪 Test Scenarios

### Scenario 1: Voice Command
1. Ativar assistente de voz
2. Falar: "Nautilus, mostre meu dashboard"
3. Verificar detecção da palavra-chave
4. Verificar navegação para dashboard
5. Verificar salvamento no banco

### Scenario 2: STT Accuracy
1. Gravar comando de voz
2. Verificar transcrição no UI
3. Comparar com texto esperado
4. Testar com diferentes sotaques/ruídos

### Scenario 3: TTS Quality
1. Enviar comando de texto
2. Ouvir resposta sintetizada
3. Verificar clareza e naturalidade
4. Testar diferentes idiomas

### Scenario 4: Audio Storage
1. Gravar áudio de comando
2. Verificar upload no Supabase Storage
3. Reproduzir áudio gravado
4. Verificar metadata no banco

---

## 📁 Current Implementation Status

### ⚠️ To Implement
- Web Speech API integration (STT)
- Speech Synthesis API (TTS)
- Wake word detection library (e.g., Porcupine)
- Audio recording with MediaRecorder API
- Supabase Storage integration para áudios
- AI command parser e executor
- Voice UI components

### 🛠️ Recommended Libraries
```json
{
  "@speechly/browser-client": "^2.4.1",
  "recordrtc": "^5.6.2",
  "wavesurfer.js": "^7.7.3"
}
```

---

## 🚀 Next Steps

1. **Instalar dependências** para STT/TTS
2. **Criar tabelas** voice_conversations e voice_settings
3. **Configurar Storage Bucket** para gravações
4. **Implementar Voice UI** em `src/modules/voice-assistant/`
5. **Integrar Web Speech API** para STT
6. **Implementar TTS** com Speech Synthesis API
7. **Adicionar Wake Word Detection** (opcional)
8. **Conectar com IA** para processamento de comandos
9. **Testar em diferentes browsers** (Chrome, Safari, Firefox)

---

## 🎯 Voice Commands Examples

```javascript
const commandExamples = [
  {
    command: "Nautilus, mostre minhas tarefas",
    action: "navigate_to",
    target: "/tasks"
  },
  {
    command: "Nautilus, qual o status da frota",
    action: "query_data",
    target: "fleet_status"
  },
  {
    command: "Nautilus, crie uma nova tarefa",
    action: "open_modal",
    target: "create_task"
  },
  {
    command: "Nautilus, envie relatório para João",
    action: "send_report",
    target: "user:joao"
  }
];
```

---

## 📊 Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| STT Latency | < 1s | ⏳ |
| TTS Latency | < 1s | ⏳ |
| Wake Word Detection | < 500ms | ⏳ |
| Command Execution | < 2s | ⏳ |
| Audio Upload | < 3s | ⏳ |

---

**Status**: 🟡 Aguardando implementação completa  
**Last Updated**: 2025-10-27  
**Validation Owner**: AI System
