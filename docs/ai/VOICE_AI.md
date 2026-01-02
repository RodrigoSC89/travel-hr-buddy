# 🎙️ ARIA Voice

## Visão Geral

**Nome:** ARIA (Artificial Real-time Interactive Assistant)  
**Módulo:** Voice  
**Edge Function:** `voice-assistant-chat`  
**Especialização:** Assistente de Voz Marítimo

## Capacidades

| Capacidade | Descrição |
|------------|-----------|
| `navigate` | Navegação por comandos de voz |
| `status` | Status de sistemas por voz |
| `create` | Criação de registros |
| `search` | Busca por voz |
| `hands_free` | Operação totalmente hands-free |

## Características

- **STT:** Reconhecimento de voz (PT-BR, EN, ES)
- **TTS:** Síntese de voz ElevenLabs HD
- **Tolerância:** Sotaques e ruído de fundo
- **Termos:** Reconhece vocabulário marítimo
- **Limite:** Respostas até 60 palavras

## Comandos de Voz

### Status
```
"Status" / "Como está tudo?" → Overview geral
"Combustível" → ROB atual
"Alertas" → Pending alerts
"Tempo" / "Weather" → Forecast
"Posição" → Coordenadas atuais
```

### Ações
```
"Criar work order [descrição]" → Novo WO
"Agendar [tarefa] para [data]" → Scheduling
"Notificar [pessoa] sobre [assunto]" → Messaging
"Iniciar checklist [tipo]" → Checklist
```

### Informações
```
"Onde estamos?" → Position
"Quando chegamos?" → ETA
"Quanto falta?" → Distance
"Quem está de quarto?" → Watch
```

## Exemplos de Uso

### Interação Natural
```
USER (voz): "Nautilus, bom dia"

ARIA (voz): "Bom dia Captain! Como posso ajudar?"

USER (voz): "Status geral"

ARIA (voz): 
"Tudo normal. Posição a 200 milhas de Rotterdam, 
ETA amanhã às 9h. Combustível: 180 toneladas. 
Zero alertas. Alguma coisa específica?"
```

### Criação de Work Order
```
USER (voz): "Criar work order para trocar filtro"

ARIA (voz): 
"Ok, work order criado. Número zero-um-cinco-seis. 
Atribuído à equipe de manutenção. Prazo: 7 dias. 
Quer adicionar detalhes?"
```

### Consulta Técnica
```
USER (voz): "Explica elemento 4 do PEOTRAM"

ARIA (voz):
"O Elemento 4 é Gestão de Segurança. Vale 25% 
da nota final. Cobre treinamento, procedimentos 
de emergência e competência. É um dos mais 
importantes. Quer detalhes dos itens?"
```

## Formato de Respostas

### Respostas Curtas (<10 palavras)
Para confirmações simples:
```
USER: "Criar work order para trocar filtro"
ARIA: "Ok, work order criado. Número zero um cinco seis."
```

### Respostas Médias (10-30 palavras)
Para informações padrão:
```
USER: "Quanto combustível temos?"
ARIA: "Cento e oitenta toneladas. Dá pra oito dias 
no consumo atual. Quer ver previsão detalhada?"
```

### Respostas Longas (30-60 palavras)
Para explicações:
```
USER: "Explica a escala Beaufort"
ARIA: "A escala Beaufort mede força do vento de zero 
a doze. Zero é calmaria total. Força 6 é vento forte 
com ondas de 3 metros. Acima de 8 é temporal. 
Quer saber a previsão atual?"
```

## Voice SSML Markup

Para melhor síntese de voz:

```xml
<speak>
  <emphasis level="strong">Alerta crítico</emphasis>:
  Bomba principal falhou.
  <break time="500ms"/>
  Bomba reserva ativada.
  <prosody rate="slow">Sistema operacional.</prosody>
</speak>
```

## Configuração

```typescript
{
  name: 'ARIA',
  model: 'google/gemini-2.5-flash',
  temperature: 0.7,
  maxTokens: 1000, // Menor para respostas concisas
  voiceMode: true,
  ttsProvider: 'elevenlabs',
  sttProvider: 'webspeech',
  languages: ['pt-BR', 'en-US', 'es-ES'],
}
```

## Integração

```typescript
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';

const { startListening, transcript, isListening } = useVoiceRecognition();

// Enviar para ARIA
const response = await supabase.functions.invoke('voice-assistant-chat', {
  body: { 
    text: transcript,
    module: 'general',
    language: 'pt-BR'
  }
});

// Sintetizar resposta
await speakText(response.data.message);
```

## Proatividade

ARIA pode iniciar conversa quando:
- ✅ Alerta crítico (safety, compliance)
- ✅ Milestone importante (chegada porto)
- ✅ Oportunidade urgente (preço fuel drop)

```
ARIA (iniciando): "Captain, desculpe interromper. 
Preço de combustível em Singapore caiu 10%. 
Economia de 15 mil dólares se abastecer lá. 
Quer analisar?"
```

## Limitações

ARIA NÃO usa voz para:
- ❌ Listas longas (>5 items)
- ❌ Tabelas complexas
- ❌ Dados técnicos densos

Ao invés, diz:
"Enviei as informações para sua tela."
