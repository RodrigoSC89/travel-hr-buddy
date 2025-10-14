# DP Intelligence Center - Quick Reference

## 🚀 Quick Start

### Access the Module
```
URL: /dp-intelligence
```

### First Time Setup
1. Ensure Supabase migration is applied
2. Set `OPENAI_API_KEY` environment variable
3. Navigate to `/dp-intelligence`
4. Sample data loads automatically

## 📊 Key Features at a Glance

| Feature | Description | Location |
|---------|-------------|----------|
| **Incident Cards** | Visual display of all DP incidents | Main grid |
| **Statistics** | Total, Critical, Analyzed, Pending counts | Top cards |
| **Filters** | DP Class, Status, Search | Filter bar |
| **AI Analysis** | GPT-4 powered technical analysis | Modal dialog |
| **IMCA References** | Standards compliance mapping | Analysis tabs |

## 🔍 Filter Options

### DP Class Filter
- All Classes (default)
- DP1
- DP2
- DP3

### Status Filter
- All Status (default)
- Pending
- Analyzing
- Analyzed
- Reviewed
- Closed

### Search
- Searches: Title, Vessel, Location
- Real-time filtering
- Case-insensitive

## 🎯 Severity Levels

| Level | Color | Meaning |
|-------|-------|---------|
| LOW | 🟢 Green | Minor issues, no operational impact |
| MEDIUM | 🟡 Yellow | Moderate issues, some impact |
| HIGH | 🟠 Orange | Serious issues, significant impact |
| CRITICAL | 🔴 Red | Severe issues, major impact |

## 📋 Status Workflow

```
pending → analyzing → analyzed → reviewed → closed
   ⚪        🔵         🟣         🟢        ⚫
```

## 🧠 AI Analysis Sections

### 1️⃣ Resumo Técnico (✅)
- Technical summary of the incident
- Key facts and timeline
- Impact assessment

### 2️⃣ Normas Relacionadas (📚)
- Applicable IMCA standards
- IMO regulations
- PEO-DP guidelines
- IMCA reference codes

### 3️⃣ Causas Adicionais (📌)
- Beyond reported root cause
- Contributing factors
- Underlying issues

### 4️⃣ Recomendações Preventivas (🧠)
- Prevention strategies
- Best practices
- System improvements

### 5️⃣ Ações Corretivas (📄)
- Immediate actions
- Long-term solutions
- Compliance measures

## 🔧 API Usage

### Edge Function Call
```typescript
const { data, error } = await supabase.functions.invoke(
  "dp-intel-analyze",
  { body: { incident: incidentData } }
);
```

### Response Structure
```typescript
{
  success: true,
  result: {
    resumo_tecnico: string,
    normas_relacionadas: string[],
    causas_adicionais: string[],
    recomendacoes_preventivas: string[],
    acoes_corretivas: string[],
    referencias_imca: string[]
  }
}
```

## 📝 Sample Data

### Incident Types Included
1. **Position Loss** - DP2, High severity
2. **Reference System Failure** - DP3, Medium severity  
3. **Drive-off** - DP2, Critical severity
4. **Power System Issue** - DP2, High severity

### IMCA References Covered
- M 103: DP system design and operation
- M 166: DP vessel design philosophy
- M 190: DP capability plots
- M 252: DP incident analysis

## 🔑 Environment Variables

```env
# Required for Edge Function
OPENAI_API_KEY=sk-proj-...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Required for Frontend
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

## 🧪 Testing

### Run Tests
```bash
npm run test -- src/tests/components/dp-intelligence/
```

### Test Coverage
- ✅ Component rendering
- ✅ Data loading
- ✅ Filtering
- ✅ Modal interactions
- ✅ AI analysis flow

## 🐛 Troubleshooting

### "Erro ao carregar incidentes"
- Check Supabase connection
- Verify table permissions
- Check RLS policies

### "Erro na análise IA"
- Verify OPENAI_API_KEY is set
- Check Edge Function logs
- Ensure GPT-4 access is enabled

### Empty incident list
- Run migration to create sample data
- Check filter settings (reset to "All")
- Verify database connection

## 📚 Related Documentation

- [Full Implementation Guide](./DP_INTELLIGENCE_CENTER_GUIDE.md)
- [Visual UI Guide](./DP_INTELLIGENCE_CENTER_VISUAL_GUIDE.md)
- [Database Schema](./supabase/migrations/20251014210000_create_dp_incidents.sql)
- [Edge Function](./supabase/functions/dp-intel-analyze/index.ts)

## 🎓 IMCA Standards Quick Reference

| Code | Title | Relevance |
|------|-------|-----------|
| M 103 | DP Operations | Core operational guidelines |
| M 166 | DP Design | Vessel design philosophy |
| M 190 | Capability Plots | Position keeping analysis |
| M 252 | Incidents | Database and analysis |

## 💡 Pro Tips

1. **Batch Analysis**: Select multiple incidents for analysis
2. **Export**: Use browser print to PDF for reports
3. **Filtering**: Combine search + class + status for precision
4. **Keyboard**: ESC to close modals
5. **Refresh**: Auto-updates on analysis completion

## 📞 Support

For issues or questions:
1. Check logs in browser console
2. Review Supabase Edge Function logs
3. Verify environment variables
4. Check test results for regression

---

**Version**: 1.0.0  
**Last Updated**: 2024-10-14  
**Module Route**: `/dp-intelligence`
