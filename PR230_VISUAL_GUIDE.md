# Visual Guide: DocumentView with Version History & Comments

## 🎨 UI Layout Overview

This guide shows the visual structure of the enhanced DocumentView page.

---

## 📱 Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [← Voltar]                                                 │
│                                                               │
│  📄 Document Title                                           │
│  Criado em 11 de outubro de 2025 às 14:43                   │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ [Documento] [Histórico (3)] [Comentários (5)]        │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │                                                         │  │
│  │  [Current Tab Content - See Below]                     │  │
│  │                                                         │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Tab 1: Documento (Document)

```
┌─────────────────────────────────────────────────────────────┐
│  [Documento] [Histórico (3)] [Comentários (5)]              │
│  ▔▔▔▔▔▔▔▔▔▔                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                         │  │
│  │  Document content displayed here...                     │  │
│  │  This is the main content of the document with          │  │
│  │  proper whitespace formatting preserved.                │  │
│  │                                                         │  │
│  │  Multiple paragraphs are shown exactly as stored        │  │
│  │  in the database.                                       │  │
│  │                                                         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Shows the current document content
- Preserves whitespace and line breaks (whitespace-pre-wrap)
- Clean card layout with padding

---

## Tab 2: Histórico de Versões (Version History)

```
┌─────────────────────────────────────────────────────────────┐
│  [Documento] [Histórico (3)] [Comentários (5)]              │
│               ▔▔▔▔▔▔▔▔▔▔▔▔▔▔                                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Histórico de Versões                                        │
│  ────────────────────────────────────────────────────────   │
│                                                               │
│  ┌─ Scrollable Area (500px) ──────────────────────────┐    │
│  │                                                       │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │ [Versão Atual]  11/10/2025 às 14:43          │  │    │
│  │  │ ─────────────────────────────────────────────  │  │    │
│  │  │ This is the current version of the           │  │    │
│  │  │ document. Updated content appears here...    │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  │                                                       │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │ [Versão 2]  11/10/2025 às 12:30  [Restaurar] │  │    │
│  │  │ ─────────────────────────────────────────────  │  │    │
│  │  │ Previous version content preview shown       │  │    │
│  │  │ here. First 300 characters displayed...      │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  │                                                       │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │ [Versão 1]  10/10/2025 às 09:15  [Restaurar] │  │    │
│  │  │ ─────────────────────────────────────────────  │  │    │
│  │  │ Original version content preview appears     │  │    │
│  │  │ in this section. Text is truncated...        │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  │                                                       │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Shows all versions in reverse chronological order
- Current version has blue "Versão Atual" badge
- Previous versions numbered (Versão 2, Versão 1, etc.)
- Each version shows:
  - Badge with version number
  - Formatted timestamp (dd/MM/yyyy 'às' HH:mm)
  - Content preview (first 300 characters)
  - "Restaurar" button (except for current version)
- Scrollable area for many versions
- Click "Restaurar" to restore any previous version

**Icons Used:**
- 🔄 History icon in tab
- ↻ RotateCcw icon in Restaurar button

---

## Tab 3: Comentários (Comments)

```
┌─────────────────────────────────────────────────────────────┐
│  [Documento] [Histórico (3)] [Comentários (5)]              │
│                              ▔▔▔▔▔▔▔▔▔▔▔▔▔                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Adicionar Comentário                                        │
│  ────────────────────────────────────────────────────────   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                         │  │
│  │  Escreva seu comentário aqui...                        │  │
│  │                                                         │  │
│  │                                                         │  │
│  └───────────────────────────────────────────────────────┘  │
│  [✉ Enviar Comentário]                                      │
│                                                               │
│  Comentários (5)                                             │
│  ────────────────────────────────────────────────────────   │
│                                                               │
│  ┌─ Scrollable Area (400px) ──────────────────────────┐    │
│  │                                                       │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │ [Você]  11/10/2025 às 14:45                   │  │    │
│  │  │                                                │  │    │
│  │  │ This is my comment on the document. I think   │  │    │
│  │  │ this version looks great!                     │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  │                                                       │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │ [Usuário]  11/10/2025 às 13:20                │  │    │
│  │  │                                                │  │    │
│  │  │ Another user's comment appears here.          │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  │                                                       │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │ [Você]  11/10/2025 às 12:00                   │  │    │
│  │  │                                                │  │    │
│  │  │ Earlier comment from me.                      │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  │                                                       │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                               │
│  💡 Real-time updates - new comments appear automatically!   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Features:**

**Add Comment Section:**
- Textarea for writing new comments (4 rows)
- "Enviar Comentário" button with Send icon
- Button shows loading state: "⟳ Enviando..." while submitting
- Button disabled when textarea is empty
- Toast notification on success/error

**Comments List:**
- Shows all comments in reverse chronological order
- Each comment displays:
  - Badge: "Você" (you) or "Usuário" (other user)
  - Formatted timestamp
  - Full comment text with preserved line breaks
- Scrollable area for many comments
- Updates in real-time when new comments are added

**Real-Time Updates:**
- New comments appear automatically without page refresh
- Uses Supabase real-time subscriptions
- Handles INSERT, UPDATE, and DELETE events
- No polling - instant updates

**Icons Used:**
- 💬 MessageSquare icon in tab
- ✉ Send icon in submit button

---

## 🎨 Color Scheme & Styling

### Badges
- **Versão Atual**: Primary blue background (default variant)
- **Versão N**: Secondary gray background (secondary variant)
- **Você**: Outline badge
- **Usuário**: Outline badge

### Cards
- White background with subtle border
- Rounded corners (rounded-lg)
- Proper padding (p-4 for content, p-6 for main card)
- Shadow for depth

### Buttons
- **Voltar**: Outline variant with gray border
- **Restaurar**: Outline variant with hover effect
- **Enviar Comentário**: Primary blue variant
- Icons aligned with text (mr-2)

### Tabs
- Full width with 3 equal columns
- Active tab has underline indicator
- Icons in tab labels
- Badge counts displayed

### ScrollAreas
- Custom height (500px for versions, 400px for comments)
- Right padding (pr-4) for scrollbar space
- Smooth scrolling behavior

---

## 📱 Responsive Design

The layout is responsive and works on:
- ✅ Desktop (optimal experience)
- ✅ Tablet (horizontal scrolling if needed)
- ✅ Mobile (tabs stack vertically, scrollable content)

All components use flexbox and grid for responsive behavior.

---

## ♿ Accessibility

- **RoleBasedAccess**: Only admin and hr_manager can view
- **Semantic HTML**: Proper heading structure
- **ARIA labels**: Provided by shadcn/ui components
- **Keyboard navigation**: Tab, Enter, Space keys work
- **Screen reader friendly**: Proper labels and descriptions

---

## 🎯 User Flow

### Viewing Version History
1. User clicks "Histórico" tab
2. List of all versions loads automatically
3. User scrolls through versions
4. User clicks "Restaurar" on desired version
5. Toast notification confirms restoration
6. Page reloads with restored content

### Adding Comment
1. User clicks "Comentários" tab
2. User types in textarea
3. User clicks "Enviar Comentário"
4. Button shows loading state
5. Comment appears at top of list
6. Toast notification confirms success
7. Input clears for next comment

### Real-Time Experience
1. User A opens document
2. User B adds comment in another window
3. User A sees new comment appear instantly
4. No refresh needed
5. Works across multiple users simultaneously

---

## 🔔 Toast Notifications

Toast messages appear in the corner for:
- ✅ "Comentário adicionado" - Comment added successfully
- ❌ "Erro ao adicionar comentário" - Error adding comment
- ✅ "Versão restaurada" - Version restored successfully
- ❌ "Erro ao restaurar versão" - Error restoring version
- ❌ "Erro ao carregar documento" - Error loading document

---

## 📊 Loading States

### Document Loading
```
┌─────────────────────────────────┐
│  ⟳ Carregando documento...     │
└─────────────────────────────────┘
```

### Submitting Comment
```
┌─────────────────────────────────┐
│  [⟳ Enviando...]               │
└─────────────────────────────────┘
```

### Empty States

**No Versions:**
```
Nenhuma versão anterior disponível.
```

**No Comments:**
```
Nenhum comentário ainda. Seja o primeiro a comentar!
```

---

## 🎉 Summary

The enhanced DocumentView page provides a complete document collaboration experience with:
- 📄 Clean document viewing
- 📚 Full version history with restore
- 💬 Real-time commenting system
- 🎨 Beautiful, responsive UI
- ♿ Accessible design
- 🔔 User-friendly notifications

All features are integrated seamlessly into a tabbed interface that keeps the user experience simple and intuitive.
