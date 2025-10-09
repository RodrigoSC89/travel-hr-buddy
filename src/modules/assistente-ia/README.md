# Assistente IA Module

## Purpose / Description

The Assistente IA (AI Assistant) module provides an **intelligent conversational AI assistant** that helps users navigate the system, answer questions, and perform tasks through natural language interaction.

**Key Use Cases:**
- Natural language queries and commands
- Context-aware assistance
- Task automation via chat
- Help and guidance for users
- Information retrieval from system data
- Form filling assistance
- Proactive suggestions and recommendations

## Folder Structure

```bash
src/modules/assistente-ia/
├── components/      # AI assistant UI components (ChatInterface, SuggestionCards, Avatar)
├── pages/           # AI assistant pages and settings
├── hooks/           # Hooks for AI conversation and context
├── services/        # AI assistant services and NLP
├── types/           # TypeScript types for conversations and intents
└── utils/           # AI utilities and response formatting
```

## Main Components / Files

- **ChatInterface.tsx** — Conversational chat interface
- **SuggestionCards.tsx** — Quick action suggestions
- **AssistantAvatar.tsx** — Visual assistant representation
- **ContextPanel.tsx** — Display conversation context
- **assistantService.ts** — AI conversation service
- **intentParser.ts** — Parse user intents from natural language

## External Integrations

- **OpenAI API** — GPT models for natural language understanding
- **Supabase** — Conversation history and context storage
- **All Modules** — Integration with all system modules for actions

## Status

🟢 **Functional** — AI assistant operational

## TODOs / Improvements

- [ ] Add voice interaction (speech-to-text and text-to-speech)
- [ ] Implement proactive assistance
- [ ] Add multi-turn conversation memory
- [ ] Create personalized assistant behavior
- [ ] Add integration with external knowledge bases
- [ ] Implement assistant customization
- [ ] Add multilingual support
