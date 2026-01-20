# Fase IA.1: AI Agents Validation Plan

**Data:** 2026-01-20
**Status:** 🔄 EM PROGRESSO
**Responsável:** ML Engineering Team

---

## 📋 Agentes a Validar (7 total)

| # | Agente | Edge Function | Modelo Primário | Status |
|---|--------|---------------|-----------------|--------|
| 1 | Nauti Brain | `nauti-brain` | Gemini 3.0 Flash | ⏳ Pendente |
| 2 | MLC Assistant | `mlc-assistant` | GPT-5 Mini | ⏳ Pendente |
| 3 | PEOTRAM AI | `peotram-ai-chat` | Gemini 2.5 Pro | ⏳ Pendente |
| 4 | Crew Optimizer | `crew-optimizer` | Gemini 3.0 Flash | ⏳ Pendente |
| 5 | Predictive Maintenance | `ai-predictive-maintenance` | Custom ONNX | ⏳ Pendente |
| 6 | Voice Assistant | `voice-assistant-chat` | Whisper + ElevenLabs | ⏳ Pendente |
| 7 | Document OCR | `document-ocr` | GPT-4o Vision | ⏳ Pendente |

---

## ✅ Critérios de Validação (aplicável a todos)

### A. Integração Funcional
- [ ] API Key configurada e válida
- [ ] Edge Function responde (status 200)
- [ ] UI carrega sem erros
- [ ] End-to-end funciona

### B. Performance
- [ ] P95 Latency < 1000ms (exceto Vision: < 5000ms)
- [ ] Uptime > 99%
- [ ] Error rate < 0.5%
- [ ] Confidence distribution normal

### C. Fallback Strategy
- [ ] Circuit breaker funciona
- [ ] Fallback para modelo secundário
- [ ] Graceful degradation se ambos falharem

### D. Decision Logging
- [ ] Tabela `ai_decisions` popula
- [ ] Campos completos e corretos
- [ ] User feedback loop funciona

### E. Integration Points
- [ ] Dashboard widget funciona
- [ ] Module-specific integration
- [ ] Cross-module communication

### F. Documentação
- [ ] docs/ai/[AGENT].md existe
- [ ] API docs atualizados
- [ ] Troubleshooting guide

### G. Testes Automatizados
- [ ] E2E tests passam
- [ ] Coverage > 80%

---

## 📅 Timeline

| Dia | Atividade |
|-----|-----------|
| 1-2 | Nauti Brain + MLC Assistant |
| 3-4 | PEOTRAM AI + Crew Optimizer |
| 5-6 | Predictive Maintenance + Voice Assistant |
| 7 | Document OCR + Consolidação |

---

## 📊 Métricas de Sucesso

- **7/7 agentes validados** com status ✅
- **Todos os testes E2E passando**
- **P95 latency dentro do target**
- **Error rate < 0.5% para cada agente**
- **Documentação 100% completa**
- **Sign-off de 4 stakeholders**

---

## 📁 Entregáveis

1. `IA1_VALIDATION_PLAN.md` ← (este arquivo)
2. `NAUTI_BRAIN_VALIDATION_REPORT.md`
3. `MLC_ASSISTANT_VALIDATION_REPORT.md`
4. `PEOTRAM_VALIDATION_REPORT.md`
5. `CREW_OPTIMIZER_VALIDATION_REPORT.md`
6. `PREDICTIVE_MAINT_VALIDATION_REPORT.md`
7. `VOICE_ASSISTANT_VALIDATION_REPORT.md`
8. `DOCUMENT_OCR_VALIDATION_REPORT.md`
9. `IA1_VALIDATION_SUMMARY.md`
10. `tests/e2e/ai-agents-*.spec.ts` (7 test files)
11. `docs/deployment/IA_DEPLOYMENT_CHECKLIST.md`
