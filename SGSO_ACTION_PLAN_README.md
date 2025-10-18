# SGSO AI Action Plan Generator

## Overview

AI-powered action plan generator for maritime safety incidents that automatically generates corrective actions, preventive measures, and expert recommendations based on IMCA/IMO standards and ANP Resolution 43/2007.

## Key Features

### 🧠 Intelligent Analysis
- GPT-4 powered incident analysis
- Context-aware recommendations
- Standards-compliant suggestions
- Maritime safety expertise built-in

### 📝 Comprehensive Output
- **Corrective Actions**: Immediate response measures
- **Preventive Actions**: Long-term prevention strategies
- **AI Recommendations**: Expert guidance and best practices

### 🔄 Dual Operation Modes
- **Production Mode**: Real-time GPT-4 integration
- **Mock Mode**: Instant development/demo responses

### 🎨 User-Friendly Interface
- Intuitive form design
- Visual feedback and validation
- Color-coded result cards
- Quick example loading

## Quick Start

### For End Users

1. **Access the Feature**
   ```
   Dashboard → SGSO → Plano IA tab
   ```

2. **Fill the Form**
   - Enter incident description
   - Select SGSO category
   - Choose risk level
   - Describe root cause

3. **Generate Plan**
   - Click "Gerar Plano de Ação com IA"
   - Wait 2-5 seconds (or instant in mock mode)
   - Review generated action plan

4. **Use Results**
   - Review corrective actions
   - Implement preventive measures
   - Follow AI recommendations

### For Developers

```typescript
import { generateSGSOActionPlan } from "@/lib/ai/sgso";

// Generate action plan
const plan = await generateSGSOActionPlan({
  description: "Incident description here",
  sgso_category: "Erro humano",
  sgso_root_cause: "Root cause analysis",
  sgso_risk_level: "alto",
});

// Use the plan
if (plan) {
  console.log("Corrective:", plan.corrective_action);
  console.log("Preventive:", plan.preventive_action);
  console.log("Recommendation:", plan.recommendation);
}
```

## Installation

This feature is already integrated into the SGSO module. No additional installation required.

## Configuration

### Optional: OpenAI API Key

For production use with real AI analysis:

```bash
# .env or .env.local
VITE_OPENAI_API_KEY=sk-your-api-key-here
```

**Without API key**: System automatically uses mock mode (perfect for development/demos)

**With API key**: System uses GPT-4 for real-time analysis

## SGSO Categories

The system supports all 7 mandatory SGSO categories:

1. **Erro humano** - Human error incidents
2. **Falha de sistema** - System failures
3. **Problema de comunicação** - Communication issues
4. **Não conformidade com procedimento** - Procedure violations
5. **Fator externo (clima, mar, etc)** - Environmental factors
6. **Falha organizacional** - Organizational failures
7. **Ausência de manutenção preventiva** - Maintenance gaps

## Risk Levels

Four standardized risk levels:

- **Baixo** (Low): Standard recommendations
- **Moderado** (Moderate): Enhanced monitoring
- **Alto** (High): Urgent actions required
- **Crítico** (Critical): Immediate ANP notification

## Architecture

### File Structure
```
src/
├── lib/ai/sgso/
│   ├── generateActionPlan.ts    # Core logic
│   └── index.ts                 # Exports
├── components/sgso/
│   ├── SGSOActionPlanGenerator.tsx  # UI
│   ├── SgsoDashboard.tsx            # Integration
│   └── index.ts                     # Exports
└── tests/
    └── sgso-action-plan.test.ts     # Tests
```

### Technology Stack
- **Frontend**: React + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **AI**: OpenAI GPT-4
- **Testing**: Vitest
- **Type Safety**: TypeScript strict mode

## API Reference

### Function: generateSGSOActionPlan

```typescript
async function generateSGSOActionPlan(
  incident: SGSOIncident
): Promise<SGSOActionPlan | null>
```

**Parameters:**
```typescript
interface SGSOIncident {
  description: string;       // Incident description
  sgso_category: string;     // One of 7 categories
  sgso_root_cause: string;   // Root cause analysis
  sgso_risk_level: string;   // Risk level (baixo|moderado|alto|crítico)
}
```

**Returns:**
```typescript
interface SGSOActionPlan {
  corrective_action: string;    // Immediate action
  preventive_action: string;    // Long-term measure
  recommendation: string;        // AI guidance
}
```

**Returns `null` on error**

## Examples

### Example 1: Human Error

```typescript
const plan = await generateSGSOActionPlan({
  description: "Operador inseriu coordenadas erradas no DP durante manobra.",
  sgso_category: "Erro humano",
  sgso_root_cause: "Falta de dupla checagem antes da execução",
  sgso_risk_level: "alto",
});

// Result:
// {
//   corrective_action: "Treinar operador e revisar o plano...",
//   preventive_action: "Implementar checklist de dupla checagem...",
//   recommendation: "[URGENTE] Adotar simulações periódicas..."
// }
```

### Example 2: System Failure

```typescript
const plan = await generateSGSOActionPlan({
  description: "Sistema de DP apresentou falha durante operação crítica.",
  sgso_category: "Falha de sistema",
  sgso_root_cause: "Ausência de manutenção preventiva adequada",
  sgso_risk_level: "crítico",
});

// Result includes ANP notification requirement
```

### Example 3: Communication Issue

```typescript
const plan = await generateSGSOActionPlan({
  description: "Falha na comunicação entre equipe de ponte e sala de máquinas.",
  sgso_category: "Problema de comunicação",
  sgso_root_cause: "Falta de protocolo claro de comunicação",
  sgso_risk_level: "moderado",
});

// Result focuses on protocol standardization
```

## Testing

### Run All Tests
```bash
npm test
```

### Run SGSO Tests Only
```bash
npm test src/tests/sgso-action-plan.test.ts
```

### Test Coverage
- 12 unit tests
- All categories covered
- All risk levels covered
- Edge cases handled
- 100% pass rate

## Standards Compliance

### IMCA (International Marine Contractors Association)
- Safety management guidelines
- Incident investigation procedures
- Best practice recommendations

### IMO (International Maritime Organization)
- ISM Code compliance
- SOLAS requirements
- Maritime safety standards

### ANP Resolution 43/2007
- 17 mandatory SGSO practices
- Brazilian offshore regulations
- Safety management requirements

## Performance

### Mock Mode
- Response time: < 100ms
- No API calls
- No costs
- Perfect for development

### Production Mode
- Response time: 2-5 seconds
- 1 API call per generation
- ~$0.01-0.05 per call
- Real AI analysis

## Security

### Best Practices
✅ API keys in environment variables only  
✅ Never commit keys to repository  
✅ Input validation on all fields  
✅ Sanitized error messages  
✅ Rate limiting (OpenAI side)  

### Development
- Use mock mode by default
- Test with example data
- Validate before production

## Troubleshooting

### Issue: API Key Not Working
**Solution**: Check environment variable name and value
```bash
echo $VITE_OPENAI_API_KEY
```

### Issue: Slow Response
**Solution**: Normal for GPT-4 (2-5s). Check network connection.

### Issue: Mock Mode Instead of Production
**Solution**: Verify API key is set and valid.

### Issue: Validation Errors
**Solution**: Ensure all required fields are filled.

## Contributing

When contributing to this feature:

1. **Maintain Standards Compliance**: All recommendations must align with IMCA/IMO/ANP
2. **Add Tests**: Update tests for new categories or features
3. **Update Documentation**: Keep README and guides current
4. **Follow Code Style**: Use existing patterns and conventions

## Roadmap

### Planned Enhancements
- [ ] Historical incident analysis
- [ ] Multi-language support (EN, ES)
- [ ] PDF export of action plans
- [ ] Integration with incident database
- [ ] Action plan tracking dashboard
- [ ] Performance analytics
- [ ] Batch processing

## Support

### Documentation
- [Implementation Complete](./SGSO_ACTION_PLAN_IMPLEMENTATION_COMPLETE.md)
- [Quick Reference](./SGSO_ACTION_PLAN_QUICKREF.md)
- [Visual Summary](./SGSO_ACTION_PLAN_VISUAL_SUMMARY.md)

### Technical Support
- Check console logs for errors
- Review test output
- Verify configuration
- Contact development team

## License

This feature is part of the Travel HR Buddy platform and follows the same license terms.

## Acknowledgments

- IMCA for maritime safety guidelines
- IMO for international standards
- ANP for Brazilian offshore regulations
- OpenAI for GPT-4 API

---

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Status**: Production Ready ✅
