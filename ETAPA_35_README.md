# ETAPA 35: Quick Start Guide

## What's New? 🎉

ETAPA 35 adds three powerful features to Nautilus One:

1. **Automated Testing** - 68 E2E tests + 30 unit tests
2. **Certification Viewer** - Secure external auditor access
3. **AI Quiz System** - Compliance assessment with certificates

## Quick Start

### Running Tests

```bash
# Unit tests (30 tests for SGSO AI helpers)
npm run test:unit

# E2E tests (68 tests for critical flows)
npm run test:e2e

# All tests
npm run test:all
```

### Using SGSO AI Helpers

```typescript
import { 
  classifyIncidentWithAI,
  forecastRisk,
  generateCorrectiveAction 
} from '@/lib/sgso-ai-helpers';

// Classify an incident
const result = await classifyIncidentWithAI({
  description: 'Worker injury during operations',
  type: 'Safety'
});
// Returns: { severity: 'high', confidence: 0.85, reasoning: '...' }

// Forecast risk
const forecast = await forecastRisk(incidents, 30);
// Returns: { trend, confidence, predictedIncidents, recommendations, riskLevel }

// Generate corrective action
const action = await generateCorrectiveAction(incident);
// Returns: { priority, actions[], timeline, responsible, expectedOutcome }
```

### Creating Certification Tokens

```typescript
// As an admin/manager
const { data } = await supabase.rpc('create_cert_token', {
  p_vessel_id: 'vessel-uuid',
  p_organization_id: 'org-uuid',
  p_expires_in_days: 7 // optional, default 7
});

// Share link: https://your-domain.com/cert/{token}
```

### Taking a Quiz

1. Navigate to `/admin/quiz`
2. Select standard (SGSO, IMCA, ISO, etc.)
3. Choose difficulty (Basic, Intermediate, Advanced)
4. Complete 10 questions
5. View results and get certificate if passed (≥70%)

## File Structure

```
├── e2e/                              # Playwright E2E tests
│   ├── login.spec.ts                # Authentication tests
│   ├── documents.spec.ts            # Document management
│   ├── sgso.spec.ts                 # SGSO system
│   ├── audit.spec.ts                # Audit workflows
│   └── templates.spec.ts            # Template operations
├── src/
│   ├── lib/
│   │   └── sgso-ai-helpers.ts       # AI helper functions
│   ├── pages/
│   │   ├── cert/
│   │   │   └── CertViewer.tsx       # External viewer
│   │   └── admin/
│   │       └── quiz/
│   │           └── QuizPage.tsx     # Quiz interface
│   └── tests/
│       └── sgso-ai-helpers.test.ts  # Unit tests
├── supabase/
│   ├── functions/
│   │   └── generate-quiz/
│   │       └── index.ts             # AI quiz generator
│   └── migrations/
│       ├── ..._cert_tokens.sql      # Certification viewer
│       └── ..._quiz_system.sql      # Quiz database
└── playwright.config.ts              # E2E test config
```

## Key Features

### Automated Testing
- ✅ 68 E2E tests covering all critical flows
- ✅ 30 unit tests for SGSO AI functions
- ✅ 100% test pass rate
- ✅ Playwright + Vitest integration

### Certification Viewer
- 🔐 Token-based secure access
- ⏰ Time-limited (default 7 days)
- 📊 Granular permissions (audits, documents, metrics)
- 🔍 Read-only access with audit trail
- 📱 No login required for external auditors

### AI Quiz System
- 🤖 GPT-4 powered question generation
- 📚 6 maritime standards supported
- 🎓 3 difficulty levels
- 📜 Automatic certificate generation
- 📊 Comprehensive statistics

## Test Coverage

| Category | Tests | Status |
|----------|-------|--------|
| Authentication | 11 | ✅ |
| Documents | 12 | ✅ |
| SGSO | 13 | ✅ |
| Audits | 16 | ✅ |
| Templates | 16 | ✅ |
| AI Helpers | 30 | ✅ |
| **Total** | **98** | **✅** |

## Supported Standards

1. **SGSO** - Sistema de Gestão de Segurança Operacional
2. **IMCA** - International Marine Contractors Association
3. **ISO** - International Standards Organization
4. **ANP** - Agência Nacional do Petróleo
5. **ISM Code** - International Safety Management Code
6. **ISPS Code** - International Ship and Port Facility Security Code

## Requirements

- Node.js 22.x
- npm ≥8.0.0
- Supabase project
- OpenAI API key (for quiz generation)

## Environment Variables

```env
OPENAI_API_KEY=your-key-here
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Common Commands

```bash
# Development
npm run dev                    # Start dev server

# Testing
npm run test                   # Run unit tests
npm run test:unit              # Run unit tests
npm run test:e2e               # Run E2E tests
npm run test:e2e:ui            # Run E2E with UI
npm run test:all               # Run all tests
npm run test:coverage          # With coverage

# Build
npm run build                  # Production build

# Deploy
supabase functions deploy generate-quiz
```

## Troubleshooting

**Playwright tests not running?**
```bash
npx playwright install chromium
```

**Quiz generation failing?**
- Check `OPENAI_API_KEY` is set
- System will fallback to templates automatically

**Token validation errors?**
- Verify token hasn't expired
- Check if token was revoked
- Ensure vessel/org exist

## Next Steps

1. Run tests: `npm run test:all`
2. Try certification viewer: Create token and visit `/cert/:token`
3. Take a quiz: Navigate to `/admin/quiz`
4. Review documentation: `ETAPA_35_IMPLEMENTATION.md`

## Support

For detailed implementation information, see:
- `ETAPA_35_IMPLEMENTATION.md` - Complete implementation guide
- `ETAPA_35_VISUAL_SUMMARY.md` - Visual overview
- Test files in `e2e/` and `src/tests/` - Code examples

## License

Part of the Nautilus One System
