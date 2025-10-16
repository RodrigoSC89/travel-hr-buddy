# 📝 ComentariosAuditoria Component - Quick Reference

## 🚀 Quick Start

```tsx
import { ComentariosAuditoria } from "@/components/auditoria";

<ComentariosAuditoria auditoriaId="your-audit-id" />
```

## 📍 Access Points

- **Demo Page**: `/demo/comentarios-auditoria`
- **Component**: `src/components/auditoria/ComentariosAuditoria.tsx`
- **API Endpoint**: `/api/auditoria/[id]/comentarios`

## 🎯 Key Features

✅ Display audit comments with timestamps  
✅ Add new comments with validation  
✅ AI auto-responses in ~2 seconds  
✅ Visual distinction (👤 users / 🤖 AI)  
✅ PDF export with one click  
✅ Real-time loading states  
✅ Error handling  
✅ Responsive design  

## 🎨 Component Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `auditoriaId` | `string` | ✅ Yes | Unique ID of the audit |

## 📦 Files Created

1. `src/components/auditoria/ComentariosAuditoria.tsx` - Main component
2. `src/components/auditoria/index.ts` - Export file
3. `src/pages/demo/ComentariosAuditoria.tsx` - Demo page

## 🔌 API Integration

### GET Comments
```typescript
GET /api/auditoria/{auditoriaId}/comentarios
Response: Comentario[]
```

### POST Comment
```typescript
POST /api/auditoria/{auditoriaId}/comentarios
Body: { comentario: string }
Response: { sucesso: true, comentario: Comentario }
```

## 🎨 Visual Design

### User Comments
- **Background**: White (`bg-white`)
- **Border**: Gray (`border-gray-200`)
- **Icon**: 👤 User icon

### AI Comments
- **Background**: Light blue (`bg-blue-50`)
- **Border**: Blue (`border-blue-200`)
- **Icon**: 🤖 Bot icon
- **User ID**: `ia-auto-responder`

## 🧩 Dependencies

**UI Components** (from `@/components/ui`):
- Button
- Textarea
- ScrollArea

**Icons** (from `lucide-react`):
- Send
- MessageSquare
- User
- Bot

**Integration**:
- ExportarComentariosPDF (from `@/components/sgso`)

## ⚡ State Management

```typescript
const [comentarios, setComentarios] = useState<Comentario[]>([]);
const [novoComentario, setNovoComentario] = useState("");
const [loading, setLoading] = useState(false);
const [enviando, setEnviando] = useState(false);
const [error, setError] = useState<string | null>(null);
```

## 🔄 Lifecycle

1. **Component Mount**: Fetch comments via `useEffect`
2. **User Types**: Update `novoComentario` state
3. **User Submits**: POST to API, clear input
4. **Wait 2.5s**: Allow time for AI response
5. **Refresh**: Fetch updated comments (includes AI response)

## 📊 UI Layout

```
┌─────────────────────────────────────────┐
│ Header: Title + Comment Count + Export │
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────┐   │
│ │   ScrollArea (h-96)             │   │
│ │                                 │   │
│ │   [User Comment Card]           │   │
│ │   [AI Comment Card]             │   │
│ │   [User Comment Card]           │   │
│ │                                 │   │
│ └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│ Textarea: New comment input             │
│ Button: Send Comment                    │
└─────────────────────────────────────────┘
```

## 🧪 Testing

```bash
npm run build    # ✅ Successful (57s)
npm test         # ✅ 1437 tests passed
npm run lint     # ✅ No new errors
```

## 📱 Responsive Breakpoints

- **Mobile** (`< 768px`): Full width, stacked layout
- **Tablet** (`768px - 1024px`): Optimized spacing
- **Desktop** (`> 1024px`): Max-width container

## 🎭 User States

### Loading Comments
```tsx
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
<p>Carregando comentários...</p>
```

### Empty State
```tsx
<MessageSquare className="w-12 h-12 opacity-50" />
<p>Nenhum comentário ainda.</p>
<p>Seja o primeiro a comentar!</p>
```

### Sending Comment
```tsx
<Button disabled={enviando}>
  {enviando ? "Enviando..." : "Enviar Comentário"}
</Button>
```

## 🚨 Error Handling

```typescript
try {
  const response = await fetch(...);
  if (!response.ok) throw new Error("Erro...");
} catch (err) {
  setError(err instanceof Error ? err.message : "Erro desconhecido");
}
```

## 🎯 Demo Page Features

### Tab 1: Interactive Demo
- Live component with configurable audit ID
- Real-time testing

### Tab 2: Documentation
- Features overview
- Architecture details
- Security information

### Tab 3: Code Examples
- Basic usage
- Integration examples
- API reference

## 🔗 Related Documentation

- `COMENTARIOS_AUDITORIA_COMPONENT_IMPLEMENTATION.md` - Full implementation details
- `IMPLEMENTATION_COMPLETE_AUDITORIA_COMENTARIOS.md` - API documentation
- `API_AUDITORIA_COMENTARIOS.md` - API reference
- `EXPORT_COMENTARIOS_PDF_IMPLEMENTATION.md` - PDF export guide

## 💡 Tips

1. **Wait for AI**: Allow ~2.5s after POST for AI response
2. **Error States**: Always show user-friendly error messages
3. **Loading States**: Provide visual feedback during operations
4. **Validation**: Check for empty comments before submission
5. **Refresh**: Use auto-refresh pattern after submissions

## 🎨 Color Palette

| Element | Color | Tailwind Class |
|---------|-------|----------------|
| User Card BG | White | `bg-white` |
| User Card Border | Gray | `border-gray-200` |
| AI Card BG | Light Blue | `bg-blue-50` |
| AI Card Border | Blue | `border-blue-200` |
| Primary Button | Blue | `bg-blue-600` |
| Primary Hover | Dark Blue | `hover:bg-blue-700` |

## 📋 Checklist for Integration

- [ ] Import component: `import { ComentariosAuditoria } from "@/components/auditoria"`
- [ ] Pass audit ID prop: `<ComentariosAuditoria auditoriaId="123" />`
- [ ] Ensure user is authenticated (for POST)
- [ ] Verify audit exists in database
- [ ] Test with demo page first: `/demo/comentarios-auditoria`

## 🔐 Security Notes

- Authentication required for POST requests
- Row Level Security on database
- Input sanitization handled by React
- XSS protection via React escaping

---

**Status**: ✅ Production Ready  
**Last Updated**: 2025-10-16  
**All Tests**: Passing (1437/1437)
