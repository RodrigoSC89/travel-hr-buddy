# MMI Forecast Save - Quick Reference

## 🚀 Quick Start

### Access the Feature
Navigate to: `/mmi/forecast`

### Generate and Save a Forecast

1. **Fill the form**:
   - Vessel Name: e.g., "FPSO Alpha"
   - System Name: e.g., "Sistema hidráulico do guindaste"
   - Hourmeter: e.g., 870
   - Maintenance History: One entry per line
     ```
     12/04/2025 - troca de óleo
     20/06/2025 - verificação de pressão
     ```

2. **Generate**: Click "✨ Gerar Forecast com IA"
3. **Review**: Wait for AI-generated forecast to appear
4. **Save**: Click "💾 Salvar Forecast"

## 🎯 API Endpoints

### Save Forecast
```bash
curl -X POST http://localhost:5173/api/mmi/save-forecast \
  -H "Content-Type: application/json" \
  -d '{
    "vessel_name": "FPSO Alpha",
    "system_name": "Sistema hidráulico do guindaste",
    "hourmeter": 870,
    "last_maintenance": [
      "12/04/2025 - troca de óleo",
      "20/06/2025 - verificação de pressão"
    ],
    "forecast_text": "📌 Próxima intervenção: ..."
  }'
```

## 📊 Database Query

### View Saved Forecasts
```sql
SELECT 
  id,
  vessel_name,
  system_name,
  hourmeter,
  last_maintenance,
  forecast_text,
  created_by,
  created_at
FROM mmi_forecasts
ORDER BY created_at DESC;
```

### Count Forecasts by Vessel
```sql
SELECT 
  vessel_name,
  COUNT(*) as forecast_count
FROM mmi_forecasts
GROUP BY vessel_name
ORDER BY forecast_count DESC;
```

## 🧪 Testing

### Run Tests
```bash
# All tests
npm test

# Specific test file
npm test src/tests/mmi-save-forecast-api.test.ts
```

### Expected Results
- 15 tests for save-forecast API
- All tests should pass
- Total: 1881 tests passing

## 📁 File Structure

```
travel-hr-buddy/
├── pages/api/mmi/
│   └── save-forecast/
│       └── route.ts              # Save forecast API endpoint
├── src/
│   ├── pages/
│   │   └── MMIForecastPage.tsx   # Main UI page
│   └── tests/
│       └── mmi-save-forecast-api.test.ts  # Tests
└── docs/
    ├── MMI_FORECAST_SAVE_IMPLEMENTATION.md
    └── MMI_FORECAST_SAVE_VISUAL_SUMMARY.md
```

## 🔑 Environment Variables

Required in `.env`:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-key
VITE_OPENAI_API_KEY=sk-proj-...
```

## ⚠️ Troubleshooting

### Forecast Generation Fails
- Check `VITE_OPENAI_API_KEY` is set
- Verify OpenAI API has credits
- Check browser console for errors

### Save Forecast Fails
- Verify Supabase connection
- Check if `mmi_forecasts` table exists
- Ensure user is authenticated
- Check network tab for API response

### Page Not Found
- Verify route is added in `App.tsx`
- Check build was successful
- Clear browser cache

## 💡 Tips

1. **Multiple Maintenance Entries**: Add one per line in the textarea
2. **Streaming Response**: Forecast appears in real-time as GPT-4 generates it
3. **Save After Review**: Review the forecast before saving
4. **Toast Notifications**: Look for success/error messages at the top-right
5. **Loading States**: Buttons disable during operations to prevent duplicate requests

## 📈 Future Enhancements

- [ ] View saved forecasts list
- [ ] Edit existing forecasts
- [ ] Export to PDF
- [ ] Generate work orders from forecasts
- [ ] Analytics dashboard
- [ ] Search and filter forecasts

## 🎓 Example Use Cases

### Case 1: Regular Maintenance Planning
```
Vessel: FPSO Alpha
System: Motor principal
Hourmeter: 1500
History:
  10/01/2025 - troca de filtros
  15/03/2025 - verificação de correia
```

### Case 2: Emergency Maintenance
```
Vessel: PSV Beta
System: Sistema de resfriamento
Hourmeter: 3200
History:
  01/02/2025 - reparo emergencial
  05/02/2025 - substituição de bomba
```

### Case 3: Preventive Inspection
```
Vessel: AHTS Gamma
System: Sistema hidráulico de ancoragem
Hourmeter: 850
History:
  20/01/2025 - inspeção visual
  28/02/2025 - teste de pressão
```

## 📞 Support

For issues or questions:
1. Check the documentation files
2. Review test cases for examples
3. Check browser console for errors
4. Verify environment variables
5. Contact the development team

---

**Status**: ✅ Fully Implemented and Tested
**Last Updated**: 2025-10-19
**Version**: 1.0.0
