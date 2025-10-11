# PR #257 Visual Guide - Document View with Comments

## 🎨 UI Architecture

### Page Structure

```
DocumentView Page
├── Header Actions
│   ├── Back Button ("← Voltar")
│   └── Comments Button ("💬 Ver Comentários")
│
├── Document Information
│   ├── Title with Emoji
│   ├── Creation Date
│   └── Author Information (name/email)
│
├── Document Content Card
│   └── Current content display
│
├── Version History Section
│   └── <DocumentVersionHistory /> Component
│       ├── Version list with restore buttons
│       └── Dialog confirmation for restore
│
└── Comments Section (when opened)
    ├── Comments List (scrollable)
    │   └── Comment Cards
    │       ├── Avatar
    │       ├── User email + timestamp
    │       ├── Comment content
    │       └── Delete button (own comments only)
    │
    └── Add Comment Form
        ├── Textarea
        └── Submit button
```

## 📱 UI Components

### 1. Header Section

```
┌─────────────────────────────────────────────────────────┐
│  [← Voltar]  [💬 Ver Comentários]                      │
└─────────────────────────────────────────────────────────┘
```

**Components:**
- `Button` (outline, small) - Back navigation
- `Button` (outline, small) - Toggle comments

**States:**
- Normal: Outline style
- Loading: Shows spinner icon
- Active: Text changes to "Atualizar Comentários"

### 2. Document Display

```
┌─────────────────────────────────────────────────────────┐
│  📄 Travel Policy Document                              │
│                                                          │
│  Criado em 11 de outubro de 2025 às 10:30              │
│  Autor: João Silva (joao@example.com)                   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Conteúdo Atual                                   │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ This is the current document content...          │  │
│  │ It can be multiple paragraphs...                 │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Components:**
- `h1` - Document title with emoji
- `p` - Creation date in Brazilian format
- `p` - Author information (conditional)
- `Card` - Content container with whitespace-pre-wrap

### 3. Version History Section

```
┌─────────────────────────────────────────────────────────┐
│  📋 Histórico de Versões                                │
│                                                          │
│  2 versão(ões) anterior(es) disponível(is)             │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ [Mais recente] 11/10/2025 às 16:45              │  │
│  │ This is the most recent version...               │  │
│  │ 150 caracteres                                   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ [Versão 1] 10/10/2025 às 10:00  [🔄 Restaurar]  │  │
│  │ This is an older version...                      │  │
│  │ 142 caracteres                                   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Component:** `<DocumentVersionHistory />`
- Automatically loads on page load
- Shows all versions with timestamps
- Restore button opens Dialog confirmation
- Most recent version highlighted
- Character count displayed

### 4. Comments Section ⭐ NEW

#### 4.1 Comments List

```
┌─────────────────────────────────────────────────────────┐
│  💬 Comentários em Tempo Real                           │
├─────────────────────────────────────────────────────────┤
│  [Scrollable Area - max-height: 384px]                 │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  [M]  maria@example.com                          │  │
│  │       10/10/2025 às 16:45                   [🗑️] │  │
│  │                                                   │  │
│  │  Excelente documento! Muito útil para nosso     │  │
│  │  time de RH.                                     │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  [J]  joao@example.com                           │  │
│  │       10/10/2025 às 17:10                        │  │
│  │                                                   │  │
│  │  Obrigado Maria! Vou fazer algumas atualizações │  │
│  │  baseadas no seu feedback.                       │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Adicione um comentário...                        │  │
│  │                                                   │  │
│  │                                                   │  │
│  └──────────────────────────────────────────────────┘  │
│                                     [📤 Comentar]       │
└─────────────────────────────────────────────────────────┘
```

**Components:**
- `Card` - Main comments container
- `CardHeader` with `MessageSquare` icon
- `CardContent` with scrollable comment list
- Individual `Card` for each comment
- `Avatar` with fallback (first letter of email)
- `Textarea` for new comment input
- `Button` for submit

#### 4.2 Empty State

```
┌─────────────────────────────────────────────────────────┐
│  💬 Comentários em Tempo Real                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Nenhum comentário ainda.                               │
│  Seja o primeiro a comentar!                            │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Adicione um comentário...                        │  │
│  │                                                   │  │
│  └──────────────────────────────────────────────────┘  │
│                                     [📤 Comentar]       │
└─────────────────────────────────────────────────────────┘
```

#### 4.3 Comment Card Detail

```
┌───────────────────────────────────────────────────────┐
│  ┌──┐                                                  │
│  │ M │  maria@example.com                              │
│  └──┘  10/10/2025 às 16:45                        [🗑️]│
│                                                         │
│  Este documento está muito claro e objetivo.           │
│  Parabéns pelo trabalho!                               │
└───────────────────────────────────────────────────────┘
```

**Elements:**
- `Avatar` (32x32px) with first letter
- Email in medium font
- Timestamp in small muted font
- Delete button (ghost, only for own comments)
- Comment content with preserved line breaks

## 🎯 User Interactions

### 1. Opening Comments

```
User clicks "Ver Comentários"
    ↓
Button shows loading spinner
    ↓
loadComments() fetches from database
    ↓
User emails fetched from profiles table
    ↓
Comments displayed with user info
    ↓
Real-time subscription activated
    ↓
Button text changes to "Atualizar Comentários"
```

### 2. Adding Comment

```
User types in textarea
    ↓
User clicks "Comentar"
    ↓
Button disabled, shows "Enviando..."
    ↓
addComment() validates & submits
    ↓
Comment inserted to database
    ↓
Real-time subscription receives INSERT event
    ↓
Comment appears in list
    ↓
Toast notification: "Comentário adicionado"
    ↓
Textarea cleared
    ↓
Button re-enabled
```

### 3. Deleting Comment

```
User clicks trash icon on own comment
    ↓
Delete button shows spinner
    ↓
deleteComment() called
    ↓
Comment deleted from database
    ↓
Real-time subscription receives DELETE event
    ↓
Comment removed from list
    ↓
Toast notification: "Comentário excluído"
    ↓
Button re-enabled
```

### 4. Real-Time Updates

```
Another user adds/deletes comment
    ↓
Database change occurs
    ↓
Supabase broadcast via WebSocket
    ↓
subscribeToComments() receives event
    ↓
User email fetched if needed
    ↓
Comment added/removed from local state
    ↓
UI updates automatically
    ↓
No page refresh needed
```

## 🎨 Visual States

### Loading States

**Comments Loading:**
```
[💬 Comentários] → [⏳ Ver Comentários]
                   (spinner spinning)
```

**Adding Comment:**
```
[📤 Comentar] → [⏳ Enviando...]
                (button disabled, spinner spinning)
```

**Deleting Comment:**
```
[🗑️] → [⏳]
       (spinner in button)
```

### Error States

**Error Toast:**
```
┌─────────────────────────────────┐
│ ❌ Erro ao carregar comentários │
│ Não foi possível carregar os    │
│ comentários.                     │
└─────────────────────────────────┘
```

### Success States

**Success Toast:**
```
┌─────────────────────────────────┐
│ ✅ Comentário adicionado         │
│ Seu comentário foi adicionado    │
│ com sucesso.                     │
└─────────────────────────────────┘
```

## 📱 Responsive Behavior

### Desktop (> 768px)
- Full width container with max-width
- Comments cards with comfortable padding
- Side-by-side display where appropriate

### Tablet (768px - 1024px)
- Adjusted container width
- Comments stack vertically
- Touch-friendly button sizes

### Mobile (< 768px)
- Full width layout
- Stacked elements
- Larger touch targets
- Reduced padding for efficiency

## 🎨 Color Scheme

### Comments
- **Own Comments**: Can show delete button
- **Other Comments**: No delete button
- **Avatar**: Random color based on first letter
- **Delete Icon**: Red (destructive color)

### Interactive Elements
- **Primary Buttons**: Outline style with hover
- **Active States**: Border highlight
- **Disabled States**: Reduced opacity (0.5)
- **Loading**: Spinner animation

## ♿ Accessibility

### Keyboard Navigation
- Tab through all interactive elements
- Enter to submit comments
- Focus indicators visible
- Skip links available

### Screen Readers
- Semantic HTML structure
- ARIA labels where appropriate
- Alt text for icons
- Clear button descriptions

### Visual
- High contrast text
- Clear focus states
- Loading indicators
- Error messages announced

## 🔄 Real-Time Features

### Supabase Channel

```typescript
Channel: `document_comments:${documentId}`

Events Listened:
- INSERT: New comment added
- UPDATE: Comment modified
- DELETE: Comment removed

Filter: document_id=eq.{documentId}

Subscription: Auto-cleanup on unmount
```

### Update Flow

```
Event Type: INSERT
    ↓
Fetch user email from profiles
    ↓
Add to comments array
    ↓
React re-renders
    ↓
Smooth fade-in animation

Event Type: DELETE
    ↓
Remove from comments array
    ↓
React re-renders
    ↓
Smooth fade-out animation
```

## 📐 Layout Measurements

```
Comments Section:
- Max height: 384px (24rem)
- Scrollable: overflow-y-auto

Textarea:
- Min height: 80px (20rem)
- Auto-resize: no
- Max length: unlimited

Avatar:
- Size: 32x32px (8rem)
- Border radius: 50%

Comment Card:
- Padding: 16px (4rem)
- Gap: 12px (3rem)
- Border: 1px solid

Buttons:
- Height: auto (small size)
- Padding: 8px 12px
- Gap: 8px (icon + text)
```

## 🎭 Icons Used

| Icon | Component | Usage |
|------|-----------|-------|
| `MessageSquare` | Comments button | Indicates comments feature |
| `Send` | Submit button | Send/submit comment |
| `Trash2` | Delete button | Delete own comment |
| `Loader2` | Loading state | All async operations |
| `ArrowLeft` | Back button | Navigate back |

---

**Status**: ✅ Complete  
**Date**: 2025-10-11  
**Branch**: copilot/refactor-document-version-history-c87809cf-82a1-4592-bb79-0e227341033b
