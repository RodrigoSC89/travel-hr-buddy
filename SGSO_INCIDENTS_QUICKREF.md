# SGSO Incidents UI - Quick Reference 🚀

## 📍 Access
Navigate to: **`/admin/sgso`** → **"Incidentes"** tab

## 🎯 Key Features

### ✅ Create Incident
1. Click **"Novo Incidente"** button
2. Fill required fields: Type, Description, Severity, Date
3. Add optional corrective action
4. Click **"Criar"**

### ✏️ Edit Incident
1. Click **"Editar"** on incident card
2. Modify fields
3. Click **"Atualizar"**

### 🗑️ Delete Incident
1. Click **"Excluir"** on incident card
2. Confirm in dialog
3. Incident removed

### 🔍 Filter Incidents
- **By Type**: Select from dropdown
- **By Severity**: Baixa, Média, Alta, Crítica
- **By Status**: Aberto, Em Investigação, Resolvido, Fechado
- **Clear all**: Click "Limpar Filtros"

### 📥 Export Data
Click **"Exportar CSV"** to download filtered incidents

## 🎨 Severity Colors
- 🔴 **Crítica** (Red)
- 🟠 **Alta** (Orange)  
- 🟡 **Média** (Yellow)
- 🟢 **Baixa** (Green)

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/sgso/incidents` | List all incidents |
| POST | `/api/sgso/incidents` | Create incident |
| PUT | `/api/sgso/incidents/:id` | Update incident |
| DELETE | `/api/sgso/incidents/:id` | Delete incident |

## 📦 Components

```
src/components/sgso/
├── SGSOIncidentList.tsx    # Main list view (365 lines)
├── SGSOIncidentForm.tsx    # Create/Edit form (224 lines)
└── SGSOAiAnalysis.tsx      # AI placeholder (54 lines)
```

## 🧪 Tests

```bash
# Run all tests
npm test

# Run SGSO tests only
npm test src/tests/components/sgso/
```

**Test Results**: ✅ 1789/1789 passing

## 🗄️ Database Schema

```sql
sgso_incidents
├── id (UUID, PK)
├── vessel_id (UUID, FK → vessels)
├── type (TEXT)
├── description (TEXT)
├── reported_at (TIMESTAMP)
├── severity (TEXT)
├── status (TEXT)
├── corrective_action (TEXT)
├── created_at (TIMESTAMP)
└── created_by (UUID, FK → auth.users)
```

## 📚 Incident Types
1. Falha de sistema
2. Erro humano
3. Não conformidade com procedimento
4. Problema de comunicação
5. Fator externo (clima, mar, etc)
6. Falha organizacional
7. Ausência de manutenção preventiva

## 🔮 Future Features (Placeholders)
- 🧠 AI Analysis (tab ready)
- 📄 PDF Export
- 📧 Email Notifications
- 📊 Advanced Analytics

## 📝 Form Fields

### Required (*)
- **Type**: Dropdown selection
- **Description**: Text area
- **Severity**: Dropdown (Baixa/Média/Alta/Crítica)
- **Date/Time**: Datetime picker

### Optional
- **Status**: Dropdown (default: "open")
- **Corrective Action**: Text area

## 🚦 Status Flow
```
open (Aberto)
  ↓
investigating (Em Investigação)
  ↓
resolved (Resolvido)
  ↓
closed (Fechado)
```

## 💡 Pro Tips

1. **Quick Filter**: Use keyboard to navigate dropdowns
2. **Bulk Actions**: Filter first, then export CSV
3. **Data Validation**: Required fields prevent empty submissions
4. **Auto-refresh**: List updates automatically after create/edit/delete
5. **Responsive**: Works on mobile and desktop

## 🐛 Troubleshooting

### Incidents not loading?
- Check API endpoint `/api/sgso/incidents`
- Verify Supabase connection
- Check browser console for errors

### Can't create incident?
- Ensure all required fields filled
- Check form validation errors
- Verify API POST endpoint

### Filters not working?
- Clear filters and try again
- Check if incidents exist matching filter criteria
- Refresh page if state seems stuck

## 📊 Performance

- **Build time**: ~59 seconds
- **Bundle size**: Optimized with code splitting
- **Load time**: Fast initial render
- **API calls**: Minimized (fetch on mount only)

## 🔗 Related Documentation

- Full implementation: `SGSO_INCIDENTS_UI_IMPLEMENTATION.md`
- Visual guide: `SGSO_INCIDENTS_VISUAL_GUIDE.md`
- API docs: `API_ADMIN_SGSO.md`

## ✅ Production Checklist

- [x] All tests passing
- [x] Build successful
- [x] TypeScript types correct
- [x] API integration working
- [x] UI responsive
- [x] Error handling implemented
- [x] Documentation complete

## 🎉 Status

**PRODUCTION READY** ✅

Last updated: 2025-10-18
Version: 1.0.0
