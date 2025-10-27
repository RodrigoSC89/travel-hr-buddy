# 🟢 PATCH 245 – Voice Assistant Real

**Data:** 2025-10-27  
**Status:** PENDENTE  
**Prioridade:** MÉDIA 🟢  
**Módulo:** Voice Assistant / AI Interaction

---

## 📋 Objetivo

Tornar o Voice Assistant funcional com IA real, implementando Speech-to-Text (STT), Text-to-Speech (TTS), detecção de wake word e salvamento de histórico de conversas.

---

## 🎯 Resultados Esperados

- ✅ Speech-to-Text funcional (Web Speech API)
- ✅ Text-to-Speech com voz de resposta
- ✅ Detecção de wake word ("Nautilus" ou customizado)
- ✅ Histórico de conversas salvo no banco
- ✅ Integração com IA (OpenAI/Anthropic)
- ✅ Comandos de voz reconhecidos
- ✅ Interface visual responsiva
- ✅ Feedback sonoro e visual

---

## 🗄️ Tabela de Banco de Dados

```sql
-- voice_conversations table
CREATE TABLE voice_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  session_id UUID NOT NULL,
  input_text TEXT NOT NULL,
  input_audio_url TEXT,
  response_text TEXT NOT NULL,
  response_audio_url TEXT,
  command_detected TEXT,
  intent TEXT,
  confidence DECIMAL(3,2),
  processing_time_ms INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_voice_conversations_user ON voice_conversations(user_id);
CREATE INDEX idx_voice_conversations_session ON voice_conversations(session_id);
CREATE INDEX idx_voice_conversations_created ON voice_conversations(created_at DESC);

-- voice_commands table (predefined commands)
CREATE TABLE voice_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  command TEXT UNIQUE NOT NULL,
  intent TEXT NOT NULL,
  description TEXT,
  example_phrases TEXT[],
  action_type TEXT NOT NULL, -- 'navigation', 'query', 'action'
  action_params JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default commands
INSERT INTO voice_commands (command, intent, description, example_phrases, action_type) VALUES
('show dashboard', 'navigate_dashboard', 'Navigate to dashboard', ARRAY['show dashboard', 'go to dashboard', 'open dashboard'], 'navigation'),
('show fleet', 'navigate_fleet', 'Navigate to fleet management', ARRAY['show fleet', 'show vessels', 'fleet status'], 'navigation'),
('create task', 'create_task', 'Create a new task', ARRAY['create task', 'new task', 'add task'], 'action'),
('weather report', 'query_weather', 'Get weather information', ARRAY['weather', 'weather report', 'what is the weather'], 'query'),
('vessel status', 'query_vessel', 'Get vessel status', ARRAY['vessel status', 'ship status', 'how are the vessels'], 'query');
```

---

## 🛠️ Implementação

### Módulo 1: Speech Recognition (STT)

**Arquivo:** `src/services/voice/speechRecognition.ts`

```typescript
export class SpeechRecognitionService {
  private recognition: any
  private isListening = false
  private onResultCallback?: (transcript: string) => void
  
  constructor() {
    // Check browser support
    const SpeechRecognition = 
      window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      throw new Error('Speech recognition not supported')
    }
    
    this.recognition = new SpeechRecognition()
    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.lang = 'en-US'
    
    this.setupEventListeners()
  }
  
  private setupEventListeners() {
    this.recognition.onresult = (event: any) => {
      const results = Array.from(event.results)
      const transcript = results
        .map((result: any) => result[0].transcript)
        .join('')
      
      if (this.onResultCallback) {
        this.onResultCallback(transcript)
      }
    }
    
    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
    }
    
    this.recognition.onend = () => {
      if (this.isListening) {
        // Restart if still supposed to be listening
        this.recognition.start()
      }
    }
  }
  
  start(onResult: (transcript: string) => void) {
    this.onResultCallback = onResult
    this.isListening = true
    this.recognition.start()
  }
  
  stop() {
    this.isListening = false
    this.recognition.stop()
  }
  
  isActive() {
    return this.isListening
  }
}
```

### Módulo 2: Text-to-Speech (TTS)

**Arquivo:** `src/services/voice/textToSpeech.ts`

```typescript
export class TextToSpeechService {
  private synth: SpeechSynthesis
  private voice: SpeechSynthesisVoice | null = null
  
  constructor() {
    this.synth = window.speechSynthesis
    this.loadVoices()
  }
  
  private loadVoices() {
    const voices = this.synth.getVoices()
    
    // Prefer English female voice for "Nautilus"
    this.voice = voices.find(voice => 
      voice.lang.startsWith('en') && voice.name.includes('Female')
    ) || voices[0]
    
    // Load voices when they become available
    if (voices.length === 0) {
      this.synth.onvoiceschanged = () => {
        this.loadVoices()
      }
    }
  }
  
  speak(text: string, options?: {
    rate?: number
    pitch?: number
    volume?: number
  }) {
    // Cancel any ongoing speech
    this.synth.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    
    if (this.voice) {
      utterance.voice = this.voice
    }
    
    utterance.rate = options?.rate || 1.0
    utterance.pitch = options?.pitch || 1.0
    utterance.volume = options?.volume || 1.0
    
    return new Promise<void>((resolve, reject) => {
      utterance.onend = () => resolve()
      utterance.onerror = (error) => reject(error)
      
      this.synth.speak(utterance)
    })
  }
  
  stop() {
    this.synth.cancel()
  }
  
  isSpeaking() {
    return this.synth.speaking
  }
}
```

### Módulo 3: Wake Word Detection

**Arquivo:** `src/services/voice/wakeWordDetector.ts`

```typescript
export class WakeWordDetector {
  private wakeWords = ['nautilus', 'hey nautilus', 'ok nautilus']
  private threshold = 0.8 // similarity threshold
  
  detect(transcript: string): boolean {
    const normalizedTranscript = transcript.toLowerCase().trim()
    
    return this.wakeWords.some(wakeWord => {
      const similarity = this.calculateSimilarity(normalizedTranscript, wakeWord)
      return similarity >= this.threshold
    })
  }
  
  private calculateSimilarity(str1: string, str2: string): number {
    // Levenshtein distance for fuzzy matching
    if (str1.includes(str2) || str2.includes(str1)) {
      return 1.0
    }
    
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    const editDistance = this.levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }
  
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }
}
```

### Módulo 4: AI Integration

**Arquivo:** `src/services/voice/aiProcessor.ts`

```typescript
import OpenAI from 'openai'

export class VoiceAIProcessor {
  private openai: OpenAI
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true // Only for demo, use backend in production
    })
  }
  
  async process(input: string, context?: any): Promise<{
    response: string
    intent: string
    confidence: number
    command?: string
  }> {
    const startTime = Date.now()
    
    // Detect command
    const command = await this.detectCommand(input)
    
    // Generate response
    const response = await this.generateResponse(input, context)
    
    const processingTime = Date.now() - startTime
    
    return {
      response: response.text,
      intent: response.intent,
      confidence: response.confidence,
      command,
      processingTime
    }
  }
  
  private async detectCommand(input: string): Promise<string | undefined> {
    const { data: commands } = await supabase
      .from('voice_commands')
      .select('*')
      .eq('is_active', true)
    
    // Match input against known commands
    const normalizedInput = input.toLowerCase()
    
    for (const cmd of commands || []) {
      if (cmd.example_phrases.some((phrase: string) => 
        normalizedInput.includes(phrase.toLowerCase())
      )) {
        return cmd.command
      }
    }
    
    return undefined
  }
  
  private async generateResponse(input: string, context?: any) {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are Nautilus, an intelligent voice assistant for maritime operations.
          You help crew members with vessel management, navigation, crew coordination, and operational tasks.
          Be concise, professional, and helpful. If you don't know something, say so clearly.`
        },
        {
          role: 'user',
          content: input
        }
      ],
      temperature: 0.7,
      max_tokens: 150
    })
    
    const responseText = completion.choices[0].message.content || ''
    
    // Simple intent detection (can be improved with classification model)
    const intent = this.classifyIntent(input)
    
    return {
      text: responseText,
      intent,
      confidence: 0.85 // Placeholder, would come from classification model
    }
  }
  
  private classifyIntent(input: string): string {
    const normalizedInput = input.toLowerCase()
    
    if (normalizedInput.includes('weather')) return 'query_weather'
    if (normalizedInput.includes('vessel') || normalizedInput.includes('ship')) return 'query_vessel'
    if (normalizedInput.includes('task')) return 'manage_task'
    if (normalizedInput.includes('crew')) return 'manage_crew'
    if (normalizedInput.includes('navigate') || normalizedInput.includes('go to')) return 'navigation'
    
    return 'general_query'
  }
}
```

### Módulo 5: Voice Assistant Component

**Arquivo:** `src/components/VoiceAssistant.tsx`

```typescript
import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react'
import { SpeechRecognitionService } from '@/services/voice/speechRecognition'
import { TextToSpeechService } from '@/services/voice/textToSpeech'
import { WakeWordDetector } from '@/services/voice/wakeWordDetector'
import { VoiceAIProcessor } from '@/services/voice/aiProcessor'

export function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [sessionId] = useState(() => crypto.randomUUID())
  
  const stt = useRef<SpeechRecognitionService>()
  const tts = useRef<TextToSpeechService>()
  const wakeWord = useRef<WakeWordDetector>()
  const ai = useRef<VoiceAIProcessor>()
  
  useEffect(() => {
    try {
      stt.current = new SpeechRecognitionService()
      tts.current = new TextToSpeechService()
      wakeWord.current = new WakeWordDetector()
      ai.current = new VoiceAIProcessor()
    } catch (error) {
      console.error('Voice services initialization failed:', error)
      toast.error('Voice assistant not supported in this browser')
    }
    
    return () => {
      stt.current?.stop()
      tts.current?.stop()
    }
  }, [])
  
  const startListening = () => {
    if (!stt.current) return
    
    stt.current.start((transcript) => {
      setTranscript(transcript)
      
      // Check for wake word
      if (wakeWord.current?.detect(transcript)) {
        handleVoiceCommand(transcript)
      }
    })
    
    setIsListening(true)
    playStartSound()
  }
  
  const stopListening = () => {
    stt.current?.stop()
    setIsListening(false)
    playStopSound()
  }
  
  const handleVoiceCommand = async (input: string) => {
    setIsProcessing(true)
    
    try {
      const result = await ai.current!.process(input)
      
      // Save to database
      await supabase.from('voice_conversations').insert({
        user_id: user.id,
        session_id: sessionId,
        input_text: input,
        response_text: result.response,
        command_detected: result.command,
        intent: result.intent,
        confidence: result.confidence,
        processing_time_ms: result.processingTime
      })
      
      // Speak response
      setResponse(result.response)
      await tts.current!.speak(result.response)
      
      // Execute command if detected
      if (result.command) {
        executeCommand(result.command)
      }
    } catch (error) {
      console.error('Voice command failed:', error)
      const errorMsg = 'Sorry, I could not process that command.'
      setResponse(errorMsg)
      await tts.current!.speak(errorMsg)
    } finally {
      setIsProcessing(false)
    }
  }
  
  const executeCommand = (command: string) => {
    switch (command) {
      case 'show dashboard':
        navigate('/')
        break
      case 'show fleet':
        navigate('/fleet')
        break
      case 'create task':
        // Open task creation modal
        break
      // Add more commands
    }
  }
  
  const playStartSound = () => {
    const audio = new Audio('/sounds/start.mp3')
    audio.play()
  }
  
  const playStopSound = () => {
    const audio = new Audio('/sounds/stop.mp3')
    audio.play()
  }
  
  return (
    <div className="voice-assistant">
      <Button
        size="lg"
        variant={isListening ? 'destructive' : 'default'}
        onClick={isListening ? stopListening : startListening}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : isListening ? (
          <MicOff className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </Button>
      
      {transcript && (
        <div className="mt-4 p-4 bg-secondary rounded-lg">
          <p className="text-sm text-muted-foreground">You said:</p>
          <p className="font-medium">{transcript}</p>
        </div>
      )}
      
      {response && (
        <div className="mt-4 p-4 bg-primary/10 rounded-lg">
          <p className="text-sm text-muted-foreground">Nautilus:</p>
          <p className="font-medium">{response}</p>
          <Volume2 className="inline h-4 w-4 ml-2" />
        </div>
      )}
    </div>
  )
}
```

---

## ✅ Checklist de Validação

### Core Functionality
- [ ] Speech-to-Text funcional
- [ ] Text-to-Speech funcional
- [ ] Wake word detection funcional
- [ ] AI responses coerentes
- [ ] Histórico salvo no banco

### Commands
- [ ] Navigation commands funcionam
- [ ] Query commands retornam dados
- [ ] Action commands executam
- [ ] Custom commands podem ser adicionados

### UX
- [ ] Interface responsiva
- [ ] Feedback visual de estado
- [ ] Feedback sonoro
- [ ] Error handling gracioso

### Performance
- [ ] Latência < 2s para resposta
- [ ] Reconhecimento acurado (>80%)
- [ ] TTS natural e clara

---

**STATUS:** 🟢 AGUARDANDO IMPLEMENTAÇÃO  
**PRÓXIMO PATCH:** PATCH 246 – Mission Control Total
