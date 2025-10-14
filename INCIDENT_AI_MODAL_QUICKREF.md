# Incident AI Modal - Quick Reference

## 📝 Quick Start

### For Users
1. Navigate to PEOTRAM Incident Manager
2. Find incident card
3. Click **"Analisar com IA"** button (🧠 Brain icon)
4. Modal opens automatically
5. Click **"Executar análise IA"**
6. Wait 10-30 seconds for analysis
7. Review comprehensive AI insights

### For Developers

#### Import and Use
```tsx
import IncidentAiModal from '@/components/dp/IncidentAiModal';

function MyComponent() {
  const analyzeIncident = (incident) => {
    localStorage.setItem('incident_to_analyze', JSON.stringify(incident));
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <>
      <Button onClick={() => analyzeIncident(myIncident)}>
        Analisar com IA
      </Button>
      <IncidentAiModal />
    </>
  );
}
```

## 🔧 Configuration

### Required Environment Variables
```bash
OPENAI_API_KEY=sk-...           # OpenAI API key
SUPABASE_URL=https://...        # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY=...  # Supabase service key
```

### Optional Database Table
```sql
CREATE TABLE incident_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id TEXT,
  incident_title TEXT NOT NULL,
  analysis_result TEXT NOT NULL,
  analysis_model TEXT DEFAULT 'gpt-4o',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 📂 Files

| File | Purpose |
|------|---------|
| `src/components/dp/IncidentAiModal.tsx` | Modal component |
| `supabase/functions/dp-intel-analyze/index.ts` | Edge Function |
| `src/components/peotram/peotram-incident-manager.tsx` | Example integration |

## 🎯 API Endpoint

**Function**: `dp-intel-analyze`

**Request**:
```json
{
  "incident": {
    "title": "Incident Title",
    "description": "Details...",
    "type": "safety",
    "severity": "high",
    "location": "Deck 1",
    ...
  }
}
```

**Response**:
```json
{
  "success": true,
  "result": "Detailed AI analysis text...",
  "message": "Análise de incidente concluída com sucesso"
}
```

## 🧪 Testing

### Manual Test
```typescript
// Store test incident
localStorage.setItem('incident_to_analyze', JSON.stringify({
  title: "Test Incident",
  description: "Test description",
  type: "safety",
  severity: "medium"
}));

// Trigger storage event
window.dispatchEvent(new Event('storage'));
```

### API Test
```bash
curl -X POST \
  https://[project].supabase.co/functions/v1/dp-intel-analyze \
  -H "Authorization: Bearer [anon-key]" \
  -H "Content-Type: application/json" \
  -d '{"incident":{"title":"Test","description":"Test"}}'
```

## 💡 Analysis Includes

1. ✅ Technical Analysis (best practices, regulations)
2. ✅ Root Cause Analysis (5 Whys, Ishikawa)
3. ✅ Related Standards (NRs, ISM, STCW, MARPOL)
4. ✅ Suggested Actions (immediate & preventive)
5. ✅ Additional Risks identification
6. ✅ Implementation Plan (timeline, resources)

## ⚡ Performance

- **Analysis Time**: 10-30 seconds
- **Token Usage**: ~1500-2500 tokens per analysis
- **Model**: GPT-4o (fast, accurate)
- **Rate Limit**: Depends on OpenAI plan

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Modal doesn't open | Check localStorage and console logs |
| Analysis fails | Verify OPENAI_API_KEY environment variable |
| Slow response | Normal for complex incidents (wait 30s) |
| Empty result | Check Edge Function logs in Supabase |
| CORS error | Verify corsHeaders in Edge Function |

## 📚 Documentation

- **Full Guide**: `INCIDENT_AI_MODAL_GUIDE.md`
- **Visual Summary**: `INCIDENT_AI_MODAL_VISUAL_SUMMARY.md`
- **This File**: `INCIDENT_AI_MODAL_QUICKREF.md`

## 🎨 UI Components Used

- Dialog (shadcn/ui)
- Button (shadcn/ui)
- Toast notifications (sonner)
- Brain icon (lucide-react)

## 🔐 Security Checklist

- [x] Authentication via Supabase
- [x] Input validation
- [x] Error handling
- [x] CORS configuration
- [x] Environment variables
- [x] TypeScript type safety

## 📈 Next Steps (Optional)

- [ ] Add caching for similar incidents
- [ ] Create analysis history view
- [ ] Export analysis as PDF
- [ ] Batch analysis support
- [ ] Custom prompt templates
- [ ] Multi-language support

## 🤝 Support

**Issues?**
1. Check Supabase logs
2. Verify environment variables
3. Test OpenAI API key
4. Review incident data structure

**Questions?**
Refer to the full documentation in `INCIDENT_AI_MODAL_GUIDE.md`

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: 2025-10-14
