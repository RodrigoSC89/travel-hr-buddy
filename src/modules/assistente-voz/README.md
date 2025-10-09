# Assistente de Voz Module

## Purpose / Description

The Assistente de Voz (Voice Assistant) module provides **voice-activated control and natural language interaction** with the system. It enables hands-free operation and voice commands for improved accessibility and convenience.

**Key Use Cases:**
- Voice commands for system navigation
- Voice-to-text transcription
- Text-to-speech for accessibility
- Voice search functionality
- Dictation for form filling
- Voice-activated alerts and notifications
- Multi-language voice support

## Folder Structure

```bash
src/modules/assistente-voz/
├── components/      # Voice UI components (VoiceButton, WaveformVisualizer, CommandList)
├── pages/           # Voice assistant settings and configuration
├── hooks/           # Hooks for voice recognition and synthesis
├── services/        # Voice processing services and API integration
├── types/           # TypeScript types for voice commands and responses
└── utils/           # Audio processing and command parsing utilities
```

## Main Components / Files

- **VoiceButton.tsx** — Microphone button with voice activation
- **WaveformVisualizer.tsx** — Visual feedback during voice input
- **CommandList.tsx** — Display available voice commands
- **VoiceSettings.tsx** — Configure voice preferences
- **voiceService.ts** — Voice recognition and synthesis service
- **commandParser.ts** — Parse and execute voice commands
- **RealtimeAudio.ts** — Real-time audio processing

## External Integrations

- **ElevenLabs API** — High-quality text-to-speech synthesis
- **Web Speech API** — Browser-native voice recognition
- **OpenAI API** — Natural language understanding

## Status

🟡 **In Progress** — Basic voice features implemented

## TODOs / Improvements

- [ ] Add custom wake word detection
- [ ] Implement speaker identification
- [ ] Add voice command training
- [ ] Support more languages and accents
- [ ] Add noise cancellation
- [ ] Implement conversation context memory
- [ ] Add voice shortcuts customization
