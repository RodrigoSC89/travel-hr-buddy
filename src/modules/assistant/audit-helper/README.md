# AI Auditing Assistant Module

**PATCH 636** - Assistente de voz + LLM para apoio a auditores em tempo real

## Overview

The AI Auditing Assistant provides real-time support for auditors through voice commands, AI-powered explanations, and intelligent question suggestions during ISM and other maritime audits.

## Features

### 🎤 Voice Command Integration
- Natural language voice commands
- Whisper integration for speech-to-text
- Continuous listening mode
- Multi-language support (EN, PT, ES, FR)

### 💬 Contextual Chat
- Real-time audit assistance
- Historical audit context
- Question-answer interface
- Audio response capability

### 📌 Smart Marking
- Voice-activated compliance marking
- Touch interface fallback
- Auto-save functionality
- Undo/redo capability

### ✅ Intelligent Suggestions
- Section-specific question recommendations
- Common finding detection
- Verification tip guidance
- Related requirement linking

### 📈 Real-time Scoring
- Live compliance score calculation
- Section-by-section progress
- Risk level assessment
- Completion tracking

### 📄 Export & Summary
- Comprehensive audit summary
- Voice-to-text transcripts
- Finding documentation
- PDF/JSON export

## Voice Commands

### Supported Commands

```
"List non-conformities" - Show all non-conformities
"Mark item compliant" - Mark current item as compliant
"Mark non-compliant" - Mark current item as non-compliant
"Add note [text]" - Add note to current item
"Next section" - Move to next audit section
"Previous section" - Go back to previous section
"Explain this requirement" - Get LLM explanation
"Suggest questions" - Get question recommendations
"Summarize audit" - Generate audit summary
"Export report" - Export current audit
```

### Wake Word
Optional wake word activation: "Hey Nautilus"

## LLM Integration

### Capabilities
- Contextual requirement explanations
- Vessel-specific guidance
- Common pitfall identification
- Verification methodology suggestions
- Risk assessment

### Context Awareness
- Vessel information (type, age, flag)
- Previous audit history
- Common findings for vessel type
- Current progress metrics

## Database Schema

### Tables
- `audit_sessions` - Active audit sessions
- `voice_commands` - Command history
- `conversation_messages` - Chat history
- `suggested_questions` - AI-generated questions
- `checklist_markings` - Compliance markings
- `voice_settings` - User preferences

## File Structure

```
src/modules/assistant/audit-helper/
├── types.ts              # Type definitions
├── voice-service.ts      # Voice recognition (to be created)
├── llm-service.ts        # AI assistant (to be created)
├── session-manager.ts    # Session management (to be created)
├── question-generator.ts # Question suggestions (to be created)
└── README.md             # This file
```

## Usage

### Starting an Audit Session

```typescript
import { AuditSession, VoiceSettings } from '@/modules/assistant/audit-helper/types';

const session: AuditSession = {
  audit_id: "audit-123",
  vessel_name: "MV Example",
  auditor_name: "John Smith",
  session_start: new Date().toISOString(),
  current_section: "safety_policy",
  voice_enabled: true,
  llm_enabled: true,
  status: "active"
};
```

### Configuring Voice Settings

```typescript
const voiceSettings: VoiceSettings = {
  enabled: true,
  language: "en-US",
  continuous_mode: true,
  auto_submit: false,
  feedback_voice: true,
  confidence_threshold: 0.8
};
```

## Voice Recognition

### Technology Stack
- **Web Speech API** - Browser-native speech recognition
- **Whisper API** - OpenAI's speech-to-text (fallback)
- **WebRTC** - Audio streaming

### Confidence Thresholds
- High (≥ 0.9): Auto-execute command
- Medium (0.7-0.89): Request confirmation
- Low (< 0.7): Reject and request repeat

## LLM Prompting

The assistant uses context-aware prompts that include:
- Current audit section
- Vessel details (type, age, operation area)
- Previous audit findings
- ISM Code references
- Common deficiencies for vessel type

## Accessibility

- Keyboard shortcuts for all voice commands
- Touch interface as fallback
- Visual feedback for voice recognition
- Customizable interface for different audit types

## Performance

- Offline mode support for basic functionality
- Local caching of common explanations
- Optimized audio processing
- Real-time transcription

## Security

- Audio data encrypted in transit
- No permanent audio storage (optional)
- User consent for voice recording
- GDPR/privacy compliance

## Integration

### ISM Audit Module (PATCH 633)
- Direct integration with ISM checklist
- Shared finding database
- Unified scoring system

### Audit Trail
- Complete command history
- Audit log generation
- Change tracking

### Evidence Ledger
- Voice notes as evidence
- Timestamped recordings
- Blockchain verification

## References

- Web Speech API Documentation
- OpenAI Whisper API
- ISM Code Audit Guidelines
- Maritime Audit Best Practices

---

**Version**: 1.0.0  
**Patch**: 636  
**Status**: 🚧 In Development  
**Last Updated**: 2025-11-04
