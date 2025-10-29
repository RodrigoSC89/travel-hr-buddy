# PATCHES 591-595 Quick Reference

## 🚀 Quick Start

```typescript
import {
  socioCognitiveLayer,      // PATCH 591
  empathyCore,               // PATCH 592
  neuroHumanAdapter,         // PATCH 593
  adaptiveJointDecision,     // PATCH 594
  feedbackResponder          // PATCH 595
} from '@/ai';
```

---

## 📋 PATCH 591 - SocioCognitive Layer

### Basic Usage
```typescript
// Interpret command
const interpretation = socioCognitiveLayer.interpretCommand({
  text: 'Urgente! Preciso de ajuda',
  timestamp: new Date()
});

// Adapt response
const response = socioCognitiveLayer.adaptResponse(
  interpretation, 
  'Base response'
);

// Set load
socioCognitiveLayer.setOperationalLoad('high');
```

### Key Methods
| Method | Description |
|--------|-------------|
| `interpretCommand()` | Analisa urgência, tom e intenção |
| `adaptResponse()` | Adapta resposta à carga operacional |
| `setOperationalLoad()` | Define carga: `minimal`, `normal`, `high`, `overload` |
| `getContextLog()` | Retorna histórico de contexto social |

---

## 💙 PATCH 592 - Empathy Core

### Basic Usage
```typescript
// Mock biometrics
const bio = empathyCore.generateMockBiometrics('high');

// Integrate
const context = empathyCore.integrateBiometrics(bio);

// Adjust response
const response = empathyCore.adjustResponse('Message', 'Feedback');

// Get relief actions
const actions = empathyCore.provideCognitiveRelief();
```

### Key Methods
| Method | Description |
|--------|-------------|
| `integrateBiometrics()` | Processa dados biométricos |
| `generateMockBiometrics()` | Gera dados mock: `normal`, `moderate`, `high` |
| `adjustResponse()` | Ajusta tom baseado em emoção |
| `provideCognitiveRelief()` | Sugere ações de alívio |

---

## 🧠 PATCH 593 - Neuro-Human Adapter

### Basic Usage
```typescript
// Process input
const reaction = neuroHumanAdapter.processAdaptiveInput({
  type: 'text',
  content: 'Delete file',
  timestamp: new Date()
});

// Confirm critical
if (reaction.requiresConfirmation) {
  neuroHumanAdapter.confirmCriticalAction(true);
}
```

### Key Methods
| Method | Description |
|--------|-------------|
| `processAdaptiveInput()` | Detecta hesitação e adapta |
| `confirmCriticalAction()` | Confirma ação crítica |
| `getHumanContext()` | Retorna estado de interação |
| `getAdaptationLog()` | Histórico de adaptações |

### Reactions
- `suggest` - Oferece opções
- `confirm` - Requer confirmação
- `wait` - Aguarda input completo
- `clarify` - Esclarece dúvidas
- `execute` - Executa diretamente

---

## 🤝 PATCH 594 - Adaptive Joint Decision

### Basic Usage
```typescript
// Propose
const proposal = adaptiveJointDecision.proposeDecision(
  'tactical',
  'Context',
  [{
    description: 'Option A',
    pros: ['Pro 1'],
    cons: ['Con 1'],
    riskLevel: 'low',
    estimatedImpact: 0.8,
    recommendedBy: 'ai'
  }]
);

// Review
const review = adaptiveJointDecision.reviewDecision(
  proposal,
  'accepted',
  'operator1',
  proposal.options[0].id
);
```

### Key Methods
| Method | Description |
|--------|-------------|
| `proposeDecision()` | Propõe decisão com opções |
| `reviewDecision()` | Operador revisa/aceita |
| `executeDecision()` | Inicia execução |
| `completeDecision()` | Finaliza com outcome |
| `getConfidenceLevel()` | Nível de confiança da IA |

### Decision Types
- `strategic` - Estratégico
- `tactical` - Tático
- `operational` - Operacional
- `critical` - Crítico (sempre requer aprovação)

---

## 😊 PATCH 595 - Emotion-Aware Feedback

### Basic Usage
```typescript
// Register feedback
const feedback = feedbackResponder.registerFeedback(
  'Estou frustrado',
  'text'
);

// Adjust response
const response = feedbackResponder.adjustResponse(
  'Original message',
  'User input'
);

// Get stats
const stats = feedbackResponder.getEmotionStats();
```

### Key Methods
| Method | Description |
|--------|-------------|
| `registerFeedback()` | Detecta emoção do input |
| `adjustResponse()` | Adapta resposta à emoção |
| `getEmotionStats()` | Estatísticas de emoções |
| `validateAccuracy()` | Testa acurácia (80%+) |

### Emotions (8 types)
| Emotion | Keywords |
|---------|----------|
| `frustration` | frustrado, difícil, problema |
| `relief` | aliviado, finalmente, resolvido |
| `stress` | estressado, urgente, sobrecarregado |
| `joy` | feliz, ótimo, excelente |
| `confusion` | confuso, dúvida, não entendi |
| `satisfaction` | satisfeito, bom, correto |
| `anger` | irritado, péssimo, raiva |
| `anxiety` | ansioso, preocupado, nervoso |

---

## 🔗 Integration Example

```typescript
// Complete workflow
const userInput = 'Urgente! Problema crítico!';

// 1. Neuro adapter
const reaction = neuroHumanAdapter.processAdaptiveInput({
  type: 'text',
  content: userInput,
  timestamp: new Date()
});

// 2. Sociocognitive
const interpretation = socioCognitiveLayer.interpretCommand({
  text: userInput,
  timestamp: new Date()
});

// 3. Empathy
const bio = empathyCore.generateMockBiometrics('high');
empathyCore.integrateBiometrics(bio);

// 4. Emotion detection
const emotional = feedbackResponder.adjustResponse(
  'Processing...',
  userInput
);

// 5. Joint decision (if critical)
if (interpretation.urgency === 'critical') {
  const proposal = adaptiveJointDecision.proposeDecision(
    'critical',
    interpretation.context,
    [/* options */]
  );
}
```

---

## 🧪 Testing

```bash
# Run tests
npm run test __tests__/patches-591-595.test.ts

# Type check
npm run type-check
```

---

## 📊 Acceptance Criteria Status

| PATCH | Criteria | Status |
|-------|----------|--------|
| 591 | 3+ commands logged | ✅ |
| 591 | Response adapts to load | ✅ |
| 591 | High tension optimized | ✅ |
| 592 | Feedback modifies AI | ✅ |
| 592 | Emotional state logged | ✅ |
| 592 | Alerts adapt to stress | ✅ |
| 593 | Detects pauses/hesitation | ✅ |
| 593 | Human context logged | ✅ |
| 593 | Critical confirmation | ✅ |
| 594 | Real-time joint decision | ✅ |
| 594 | AI changes when rejected | ✅ |
| 594 | Confirmation interface | ✅ |
| 595 | 80%+ emotion accuracy | ✅ |
| 595 | Real-time adjustment | ✅ |
| 595 | 8 emotion types | ✅ |

**Overall: 15/15 ✅ (100%)**

---

## 📁 Files

```
src/ai/interface/sociocognitive-layer.ts
src/ai/emotion/empathy-core.ts
src/ai/interface/neuro-adapter.ts
src/ai/decision/adaptive-joint-decision.ts
src/ai/emotion/feedback-responder.ts
__tests__/patches-591-595.test.ts
```

---

## 🎯 Key Features

✅ Real-time emotion detection  
✅ Adaptive response system  
✅ Joint human-AI decisions  
✅ Hesitation detection  
✅ Cognitive relief system  
✅ Operational load awareness  
✅ 80%+ emotion accuracy  
✅ 8 emotion types recognized  
✅ Critical action confirmation  
✅ Comprehensive logging  

---

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Tests:** ✅ Passing  
**Type-check:** ✅ Passing
