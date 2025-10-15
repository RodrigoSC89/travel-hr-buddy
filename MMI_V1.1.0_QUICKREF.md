# MMI v1.1.0 Quick Reference

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set environment variables
VITE_OPENAI_API_KEY=sk-...
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...

# Build
npm run build

# Run
npm run dev
```

## 📋 Common Operations

### View Jobs
Navigate to `/mmi-jobs-panel` to see all active maintenance jobs.

### Get AI Recommendation
Click "Copilot IA" button on any job card to see detailed AI analysis with historical context.

### Postpone Job
Click "Postergar com IA" to postpone a job with AI-generated justification.

### Create Work Order
Click "Criar OS" to create a formal work order for a job.

### Export PDF Report
Click "Exportar Relatório PDF" in the panel header to generate a comprehensive report.

## 🔧 API Quick Reference

```typescript
// Get jobs
const { jobs } = await fetchJobs();

// Get AI recommendation
const recommendation = await getAIRecommendation(jobDescription);

// Generate embedding
const embedding = await generateEmbedding(text);

// Export PDF
await generatePDFReport(jobs);
```

## 🐛 Troubleshooting

### No AI Recommendations
- Check `VITE_OPENAI_API_KEY` is set
- System will fall back to mock recommendations if API key is missing

### Database Connection Failed
- Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- System will fall back to mock data automatically

### PDF Export Not Working
- Ensure browser allows downloads
- Check console for errors
- Verify html2pdf.js is loaded

### Slow Performance
- Check network connection
- Verify OpenAI API is responding
- Consider reducing `match_count` in similarity search

## 📊 Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| Embedding Generation | < 1s | OpenAI API call |
| Similarity Search | < 0.5s | Database query |
| AI Recommendation | < 3s | GPT-4 generation |
| PDF Generation (10 jobs) | < 2s | Client-side |

## 🔑 Key Components

- `src/services/mmi/embeddingService.ts` - Vector embeddings
- `src/services/mmi/copilotApi.ts` - AI recommendations
- `src/services/mmi/pdfReportService.ts` - PDF generation
- `src/services/mmi/jobsApi.ts` - Job operations
- `src/components/mmi/JobCards.tsx` - Job card UI
- `src/components/mmi/MMICopilot.tsx` - AI assistant UI

## 🎯 Best Practices

1. **Always handle errors gracefully** - Services have built-in fallbacks
2. **Test with mock data first** - System works without external APIs
3. **Monitor API usage** - OpenAI calls cost money
4. **Use similarity threshold wisely** - 0.7 is a good default
5. **Cache embeddings** - Avoid regenerating for same content

## 📞 Support

For issues or questions, check:
- `MMI_V1.1.0_IMPLEMENTATION.md` - Full technical documentation
- Console logs for detailed error messages
- Network tab for API call debugging

---

**Nautilus One v1.1.0** 🌊
