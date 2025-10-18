# SGSO AI Action Plan - Quick Reference Guide

## 🚀 Quick Start

### 1. Access the Feature
Navigate to: **SGSO Module → Plano IA Tab**

### 2. Fill the Form
```
✅ Incident Description (Required)
✅ SGSO Category (Required)
✅ Risk Level (Required)
✅ Root Cause (Required)
```

### 3. Generate Plan
Click: **"🧠 Gerar Plano de Ação com IA"**

### 4. View Results
Three cards appear:
- 🔴 **Corrective Action** (Immediate response)
- 🔵 **Preventive Action** (Long-term prevention)
- 🟣 **AI Recommendation** (IMCA standards)

## 📋 Categories Available

- Erro humano
- Falha de equipamento
- Ambiental
- Procedimento inadequado
- Comunicação
- Treinamento insuficiente
- Outro

## 🎯 Risk Levels

- 🔴 Crítico
- 🟠 Alto
- 🟡 Médio
- 🟢 Baixo

## 🧪 Test Example

**Load Example Button** provides:
```
Description: "Operador inseriu coordenadas erradas no DP durante manobra."
Category: "Erro humano"
Root Cause: "Falta de dupla checagem antes da execução"
Risk Level: "alto"
```

Expected result:
```
✅ Corrective: Train operator and review procedure
🔁 Preventive: Implement double-check checklist
🧠 Recommendation: Adopt periodic simulations with AI
```

## 💻 API Usage

```typescript
import { generateSGSOActionPlan } from "@/lib/ai/sgso";

const plan = await generateSGSOActionPlan({
  description: "Your incident description",
  sgso_category: "Erro humano",
  sgso_root_cause: "Lack of training",
  sgso_risk_level: "alto",
});

// Returns:
// {
//   corrective_action: "...",
//   preventive_action: "...",
//   recommendation: "..."
// }
```

## 🔧 Configuration

Set environment variable:
```bash
VITE_OPENAI_API_KEY=your_key_here
```

Without API key? System uses **mock mode** automatically!

## 📊 Integration Points

### In SGSO Dashboard
- Tab position: Between "NCs" and "Métricas"
- Icon: 🧠 Brain icon
- Tab name: "Plano IA"

### Files Structure
```
src/
├── lib/ai/sgso/
│   ├── generateActionPlan.ts  # Core AI function
│   └── index.ts               # Exports
├── components/sgso/
│   ├── SGSOActionPlanGenerator.tsx  # UI Component
│   ├── SgsoDashboard.tsx           # Integration
│   └── index.ts                    # Exports
└── tests/
    └── sgso-action-plan.test.ts    # Unit tests
```

## ⚡ Key Features

1. **One-Click Generation**: Single button generates all three actions
2. **Visual Feedback**: Loading states and toast notifications
3. **Mock Mode**: Works without API key for demos
4. **Example Data**: Quick load button for testing
5. **Clean Interface**: Modern, responsive design
6. **Form Validation**: Required field checking
7. **Error Handling**: Graceful degradation

## 🎨 UI Elements

### Input Form
- `<Textarea>` for incident description
- `<Select>` dropdowns for category and risk level
- `<Input>` for root cause
- Action buttons: Load Example, Clear, Generate

### Output Display
- Conditional rendering (only shows when data available)
- Color-coded cards per action type
- Icons for visual identification
- Scrollable content areas

## 📈 Success Metrics

| Metric | Value |
|--------|-------|
| Response Time | ~2-3 seconds with API |
| Mock Mode Speed | Instant |
| Test Coverage | 4 unit tests |
| Build Size Impact | ~12KB gzipped |

## 🔒 Security Notes

- ✅ API key in environment variables only
- ✅ No sensitive data stored client-side
- ✅ Input sanitization
- ✅ Error messages don't leak data

## 🐛 Troubleshooting

### Issue: Button doesn't work
**Solution**: Check all required fields are filled

### Issue: Error generating plan
**Solution**: Verify API key configuration or use mock mode

### Issue: No results shown
**Solution**: Check browser console for errors, plan may be null

### Issue: Slow response
**Solution**: Normal for GPT-4 calls (2-5 seconds)

## 📞 Support

- Check logs: Browser DevTools Console
- Review: `SGSO_AI_ACTION_PLAN_README.md`
- Tests: `npm test -- sgso-action-plan`

## 🎯 Best Practices

1. **Be Specific**: Detailed descriptions yield better plans
2. **Accurate Category**: Choose the most appropriate category
3. **Honest Risk Assessment**: Use correct risk level
4. **Root Cause Analysis**: Identify the true root cause

## 📝 Sample Outputs

### Erro Humano
```
✅ Treinar equipe e revisar procedimentos
🔁 Implementar checklist de verificação dupla
🧠 Simulações periódicas com feedback
```

### Falha de Equipamento
```
✅ Isolar equipamento e realizar manutenção
🔁 Programa de manutenção preventiva
🧠 Monitoramento contínuo com IoT
```

### Ambiental
```
✅ Contenção imediata e limpeza
🔁 Procedimentos de resposta a emergências
🧠 Auditorias ambientais regulares
```

---

**Last Updated**: October 2025  
**Version**: 1.0.0  
**Component**: SGSO AI Action Plan Generator
