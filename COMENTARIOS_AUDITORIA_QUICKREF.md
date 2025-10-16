# Exportar Comentários PDF - Referência Rápida

## 🚀 Início Rápido

### Usar o Componente

```tsx
import { ComentariosAuditoria } from "@/components/auditoria";

function MinhaAuditoria() {
  return <ComentariosAuditoria auditoriaId="audit-123" />;
}
```

### Ver Demo

Acesse: `/demo/comentarios-auditoria`

## 📁 Arquivos Criados

```
pages/api/auditoria/[auditoriaId]/comentarios.ts  # API
src/components/auditoria/
  ├── ComentariosAuditoria.tsx                    # Componente principal
  ├── ExportarComentariosPDF.tsx                  # Export PDF
  └── index.ts                                     # Exports
src/pages/demo/ComentariosAuditoriaDemo.tsx       # Demo
```

## 🎯 Funcionalidades

✅ Exibir comentários com scroll  
✅ Adicionar novos comentários  
✅ Exportar para PDF formatado  
✅ Contador de comentários  
✅ Timestamps e identificação de usuário  

## 📡 API Endpoints

- `GET /api/auditoria/[auditoriaId]/comentarios` - Listar
- `POST /api/auditoria/[auditoriaId]/comentarios` - Criar
  - Body: `{ "comentario": "Texto..." }`

## 📦 Interface

```typescript
interface Comentario {
  id: string;
  comentario: string;
  user_id: string;
  created_at: string;
}
```

## 🎨 Props do Componente

```typescript
<ComentariosAuditoria 
  auditoriaId="string"  // ID da auditoria
/>
```

## 🛠️ Build & Test

```bash
npm run lint    # ✅ Passou
npm run build   # ✅ Passou (49.30s)
```

## 📄 PDF Gerado

- Título: "Relatório de Comentários da Auditoria"
- Data de geração
- Total de comentários
- Lista completa com timestamps
- Paginação automática
- Nome do arquivo: `comentarios-auditoria-YYYY-MM-DD.pdf`

## ⚠️ Importante

**Autenticação:** Atualmente usa `user_id: "system"` estático.  
Para produção, integrar com sistema de auth real.

## 📚 Documentação Completa

Ver: `COMENTARIOS_AUDITORIA_IMPLEMENTATION.md`

---

✨ **Sistema pronto para uso!**
