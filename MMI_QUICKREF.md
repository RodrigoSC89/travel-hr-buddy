# 📘 MMI Quick Reference Guide

## 🚀 Quick Start

### Access MMI Module
- **Component:** Import `MaintenanceCopilot` from `@/components/mmi/MaintenanceCopilot`
- **Global Assistant:** Use MMI commands in `/admin/assistant`
- **Documentation:** See `mmi-readme.md` for complete technical specs

---

## 💬 Command Examples

### Creating Jobs
```
"Criar job de troca de óleo no gerador BB"
"Registrar job de inspeção visual no motor STBD"
"Novo job: manutenção do sistema hidráulico"
```

### Postponement Evaluation
```
"O job 2493 pode ser postergado?"
"Postergar job #2445"
"Avaliar risco de postergar manutenção do motor"
```

### Work Order Management
```
"Criar OS para o job 2494"
"Listar OS críticas para a docagem"
"Status das ordens de serviço urgentes"
```

### Status Queries
```
"Quantos jobs críticos estão pendentes para a embarcação Atlas?"
"Histórico do motor principal"
"Status de manutenção da frota"
```

---

## 🎯 Quick Command Reference

| Command Pattern | Result |
|----------------|--------|
| `criar job de [descrição]` | Create new maintenance job |
| `postergar job #[número]` | AI-powered postponement evaluation |
| `listar os críticas` | List critical work orders |
| `status da [embarcação]` | Vessel maintenance status |
| `histórico do [componente]` | Component maintenance history |
| `criar os para job [número]` | Generate work order from job |

---

## 🏗️ Component Usage

### Import MaintenanceCopilot
```tsx
import { MaintenanceCopilot } from "@/components/mmi/MaintenanceCopilot";

function MMIPage() {
  return (
    <div>
      <MaintenanceCopilot />
    </div>
  );
}
```

### Component Features
- ✅ AI-powered chat interface
- ✅ Quick command buttons
- ✅ Contextual action buttons
- ✅ Metadata badges (job numbers, risk levels)
- ✅ Real-time Supabase integration
- ✅ Error handling with helpful guidance

---

## 🗄️ Database Tables

### Core Tables
1. **mmi_assets** - Equipment and vessels
2. **mmi_components** - Technical components
3. **mmi_jobs** - Maintenance jobs
4. **mmi_os** - Work orders
5. **mmi_history** - Technical event log
6. **mmi_hours** - Hour meter readings

See `mmi-readme.md` for complete schema.

---

## 🔌 API Routes

### Planned Routes
- `POST /api/mmi/jobs/:id/postpone` - AI postponement evaluation
- `POST /api/mmi/os/create` - Create work order

---

## ✅ Implementation Status

### Completed
- ✅ Technical documentation (mmi-readme.md)
- ✅ MaintenanceCopilot component
- ✅ Global assistant integration
- ✅ Command patterns
- ✅ Build validation

### Next Steps
- [ ] API route implementation
- [ ] Database migrations
- [ ] JobCards component
- [ ] Route configuration
- [ ] Integration tests

---

## 📚 Related Documentation
- `mmi-readme.md` - Complete technical documentation
- `MMI_IMPLEMENTATION_COMPLETE.md` - Implementation summary
- `supabase/functions/assistant-query/index.ts` - Assistant integration

---

**Version:** 1.0.0  
**Last Updated:** October 2025  
**Status:** ✅ Core Implementation Complete
