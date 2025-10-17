# ComentariosAuditoria - Quick Reference

## 🚀 Quick Start

```tsx
import { ComentariosAuditoria } from "@/components/auditoria";

<ComentariosAuditoria auditoriaId="audit-123" />
```

## 📍 Demo Page

Visit: `/demo/comentarios-auditoria`

## 🎯 Key Features

✅ Display comments with timestamps  
✅ Add new comments with validation  
✅ AI auto-response (~2 seconds)  
✅ PDF export integration  
✅ Visual distinction (user vs AI)  
✅ Loading states  
✅ Error handling  
✅ Responsive design  

## 📦 Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `auditoriaId` | string | Yes | Audit ID for comments |

## 🎨 UI Components Used

- `Button` - Action buttons
- `Textarea` - Comment input
- `ScrollArea` - Comments list
- `ExportarComentariosPDF` - PDF export
- Icons: `Loader2`, `User`, `Bot`

## 🔌 API Endpoints

**GET** `/api/auditoria/[id]/comentarios`  
Returns all comments for an audit

**POST** `/api/auditoria/[id]/comentarios`  
Creates comment + AI auto-response

```json
{
  "comentario": "Your comment text"
}
```

## 🤖 AI Integration

- **Model:** OpenAI GPT-4
- **Persona:** IMCA Auditor
- **Response Time:** ~2 seconds
- **Special user_id:** `ia-auto-responder`

## 🎨 Visual Design

**User Comments:**
- White background, gray borders
- User icon (👤)
- User ID display

**AI Comments:**
- Light blue background, blue borders
- Bot icon (🤖)
- "Auditor IA (IMCA)" label

## 📱 States

| State | UI |
|-------|-----|
| Loading | Spinner + "Carregando comentários..." |
| Empty | "Seja o primeiro a comentar! 💬" |
| Sending | "Enviando..." with spinner |
| Error | Red error message below textarea |

## 🔐 Security

✅ Supabase authentication  
✅ Row Level Security (RLS)  
✅ Input validation  
✅ XSS protection (React)  

## 📝 Data Structure

```typescript
interface Comentario {
  id: string;
  comentario: string;
  created_at: string;
  user_id: string;
}
```

## 🏗️ Architecture

```
UI Component → API → Database → OpenAI GPT-4
```

## 🧪 Testing

✅ Build: Successful  
✅ Tests: 1404 passing  
✅ Lint: No new errors  
✅ TypeScript: Strict mode  

## 📚 Files

- Component: `src/components/auditoria/ComentariosAuditoria.tsx`
- Export: `src/components/auditoria/index.ts`
- Demo: `src/pages/demo/ComentariosAuditoria.tsx`
- Route: Added to `src/App.tsx`

## 🎯 Integration Example

```tsx
import { ComentariosAuditoria } from "@/components/auditoria";

function AuditDetailPage() {
  const auditId = "audit-123";
  
  return (
    <div className="p-6">
      <h1>Detalhes da Auditoria</h1>
      <ComentariosAuditoria auditoriaId={auditId} />
    </div>
  );
}
```

## 🔧 Customization

The component uses Tailwind classes and can be customized by:
- Adjusting `ScrollArea` height (default: 400px)
- Modifying color schemes
- Changing button styles
- Customizing error messages

## 💡 Tips

1. Wait ~2.5 seconds after posting for AI response
2. Use meaningful audit IDs for better organization
3. Export to PDF before leaving the page
4. Check demo page for comprehensive examples

## 🆘 Troubleshooting

**Comments not loading?**
- Check audit ID is valid
- Verify API endpoint is accessible
- Check console for errors

**AI not responding?**
- Verify OpenAI API key is configured
- Check network tab for 500 errors
- AI failures don't affect user comments

**PDF export not working?**
- Ensure comments exist before exporting
- Check ExportarComentariosPDF component

## 📞 Related Documentation

- Full Implementation: `COMENTARIOS_AUDITORIA_COMPONENT_IMPLEMENTATION.md`
- API Documentation: `API_AUDITORIA_COMENTARIOS.md`
- PDF Export: `EXPORT_COMENTARIOS_PDF_IMPLEMENTATION.md`
