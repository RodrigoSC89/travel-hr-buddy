# PR #243 - Visual Guide

## 🎨 UI Components Overview

This guide shows the visual structure and flow of the enhanced DocumentView page with version history and real-time comments.

## Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    DocumentView Page                         │
├─────────────────────────────────────────────────────────────┤
│  [← Voltar] [📋 Ver Histórico] [💬 Ver Comentários]        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📄 Document Title                                           │
│  Criado em 11 de outubro de 2025 às 10:30                  │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Conteúdo Atual                                      │    │
│  ├────────────────────────────────────────────────────┤    │
│  │                                                     │    │
│  │ Document content goes here...                      │    │
│  │                                                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  [When "Ver Histórico" clicked]                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 📋 Histórico de Versões                            │    │
│  ├────────────────────────────────────────────────────┤    │
│  │  ┌──────────────────────────────────────────────┐ │    │
│  │  │ [Versão 3] 10/10/2025 às 15:30 [↻ Restaurar]│ │    │
│  │  │ Preview of version content...                │ │    │
│  │  └──────────────────────────────────────────────┘ │    │
│  │  ┌──────────────────────────────────────────────┐ │    │
│  │  │ [Versão 2] 09/10/2025 às 10:00 [↻ Restaurar]│ │    │
│  │  │ Preview of version content...                │ │    │
│  │  └──────────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  [When "Ver Comentários" clicked] ⭐ NEW                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 💬 Comentários em Tempo Real                       │    │
│  ├────────────────────────────────────────────────────┤    │
│  │  ┌──────────────────────────────────────────────┐ │    │
│  │  │ [U] user@example.com  10/10/2025 às 16:45    │ │    │
│  │  │ Great document! Very helpful.            [🗑️]│ │    │
│  │  └──────────────────────────────────────────────┘ │    │
│  │  ┌──────────────────────────────────────────────┐ │    │
│  │  │ [A] admin@example.com  10/10/2025 às 17:00   │ │    │
│  │  │ Thanks for the feedback!                     │ │    │
│  │  └──────────────────────────────────────────────┘ │    │
│  │  ─────────────────────────────────────────────────│    │
│  │  ┌──────────────────────────────────────────────┐ │    │
│  │  │ [Adicione um comentário...]                  │ │    │
│  │  │                                              │ │    │
│  │  └──────────────────────────────────────────────┘ │    │
│  │                              [📤 Comentar]        │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Header Section
**Location**: Top of page
**Components**:
- Back button: `[← Voltar]`
- Version history button: `[📋 Ver Histórico]` / `[📋 Atualizar Versões]`
- Comments button: `[💬 Ver Comentários]` / `[💬 Atualizar Comentários]` ⭐ NEW

**States**:
- Normal: Outline buttons
- Loading: Shows spinner icon
- Active: Button text changes to "Atualizar"

### 2. Document Display Section
**Location**: Below header
**Components**:
- Document title with emoji icon
- Creation date in Portuguese
- Content card with whitespace preserved

**Format**:
```
📄 Document Title
Criado em 11 de outubro de 2025 às 10:30

┌─────────────────┐
│ Conteúdo Atual  │
├─────────────────┤
│ Document text   │
└─────────────────┘
```

### 3. Version History Section (Existing)
**Location**: Below document
**Visibility**: Shows when "Ver Histórico" clicked

**Structure**:
```
┌────────────────────────────────┐
│ 📋 Histórico de Versões        │
├────────────────────────────────┤
│ [Empty State]                  │
│ Nenhuma versão anterior...     │
│                                │
│ [OR With Versions]             │
│ ┌────────────────────────────┐ │
│ │ [Badge: Versão 1]          │ │
│ │ 10/10/2025 às 15:30        │ │
│ │ [Content Preview]          │ │
│ │              [↻ Restaurar] │ │
│ └────────────────────────────┘ │
└────────────────────────────────┘
```

**Features**:
- Version badge with number
- Date/time in Brazilian format
- Content preview (max 3 lines)
- Restore button with loading state

### 4. Comments Section ⭐ NEW
**Location**: Below version history
**Visibility**: Shows when "Ver Comentários" clicked

**Structure**:
```
┌────────────────────────────────────┐
│ 💬 Comentários em Tempo Real       │
├────────────────────────────────────┤
│ [Scrollable Area - max-h-96]      │
│                                    │
│ [Empty State]                      │
│ Nenhum comentário ainda.           │
│ Seja o primeiro a comentar!        │
│                                    │
│ [OR With Comments]                 │
│ ┌────────────────────────────────┐ │
│ │ [U] user@example.com           │ │
│ │     10/10/2025 às 16:45   [🗑️]│ │
│ │ Comment content here...        │ │
│ └────────────────────────────────┘ │
│                                    │
│ ─────────────────────────────────  │
│                                    │
│ [Add Comment Form]                 │
│ ┌────────────────────────────────┐ │
│ │ Adicione um comentário...      │ │
│ │                                │ │
│ └────────────────────────────────┘ │
│                   [📤 Comentar]    │
└────────────────────────────────────┘
```

**Comment Card Details**:
```
┌─────────────────────────────────────┐
│ [Avatar] user@example.com           │
│          10/10/2025 às 16:45  [🗑️]│
│                                     │
│ This is the comment content.        │
│ It can be multiple lines.           │
└─────────────────────────────────────┘
```

**Avatar**: First letter of email in uppercase
**Email**: Full user email
**Timestamp**: Brazilian format (dd/MM/yyyy 'às' HH:mm)
**Delete Button**: Only shown for own comments

## User Interactions

### Version History Flow
```
1. User clicks "Ver Histórico"
   ↓
2. Button shows loading spinner
   ↓
3. Versions loaded from database
   ↓
4. Version cards displayed
   ↓
5. User can click "Restaurar" on any version
   ↓
6. Confirmation toast shown
   ↓
7. Document reloaded with restored content
   ↓
8. New version created automatically
```

### Comments Flow ⭐ NEW
```
1. User clicks "Ver Comentários"
   ↓
2. Button shows loading spinner
   ↓
3. Comments loaded from database
   ↓
4. User emails fetched
   ↓
5. Comments displayed with real-time subscription
   ↓
6. [Add Comment]
   User types → Clicks "Comentar" → Toast shown → Comment appears
   ↓
7. [Delete Comment]
   User clicks trash icon → Confirmation → Comment removed
   ↓
8. [Real-Time Updates]
   Other users' comments appear instantly
```

## Visual States

### Loading States
- **Spinner Icon**: Rotating loader (Loader2)
- **Disabled Buttons**: Gray, non-interactive
- **Loading Text**: "Carregando...", "Restaurando...", "Enviando..."

### Error States
- **Toast Notification**: Red background
- **Error Message**: In Portuguese
- **No UI Disruption**: Page remains functional

### Success States
- **Toast Notification**: Green background
- **Success Message**: In Portuguese
- **UI Update**: Immediate visual feedback

### Empty States
- **Friendly Message**: Helpful text in Portuguese
- **Call to Action**: Encourages interaction
- **Icon**: Relevant icon for context

## Color Scheme

### Comments Section
- **Comment Cards**: Border with subtle background
- **Own Comments**: Highlighted (can delete)
- **Other Comments**: Standard styling
- **Avatars**: Color based on first letter
- **Delete Icon**: Red (destructive)

### Interactive Elements
- **Primary Buttons**: Outline style
- **Hover States**: Background color change
- **Active States**: Border highlight
- **Disabled States**: Reduced opacity

## Responsive Behavior

### Desktop (> 768px)
- Full width container
- Side-by-side buttons
- Comfortable spacing
- Large comment cards

### Tablet (768px - 1024px)
- Adjusted spacing
- Stacked buttons if needed
- Responsive comment cards

### Mobile (< 768px)
- Full width elements
- Stacked buttons
- Touch-friendly targets
- Scrollable comment area

## Accessibility Features

### Keyboard Navigation
- Tab through all buttons
- Enter to submit comments
- Focus indicators visible
- Skip navigation available

### Screen Readers
- Semantic HTML
- ARIA labels where needed
- Alt text for icons
- Clear button descriptions

### Visual Indicators
- High contrast text
- Clear focus states
- Loading indicators
- Error messages

## Animation & Transitions

### Comments Section ⭐ NEW
- **Fade In**: New comments appear smoothly
- **Slide Out**: Deleted comments fade away
- **Loading Spinner**: Smooth rotation
- **Button States**: Subtle hover effects

### Version History
- **Expand/Collapse**: Smooth height transition
- **Loading States**: Spinner animation
- **Restore Action**: Progress indication

## Icons Used

### Existing
- `ArrowLeft` - Back button
- `History` - Version history
- `RotateCcw` - Restore version
- `Loader2` - Loading states

### New ⭐
- `MessageSquare` - Comments section
- `Send` - Submit comment
- `Trash2` - Delete comment

## Real-Time Updates ⭐ NEW

### Subscription Behavior
```
User opens comments
    ↓
Supabase channel created
    ↓
Listening for changes
    ↓
[INSERT event] → Comment appears
[UPDATE event] → Comment updates
[DELETE event] → Comment disappears
    ↓
User closes page
    ↓
Channel unsubscribed
```

### Visual Feedback
- New comments appear at bottom
- No page refresh needed
- Smooth transitions
- Toast notifications for own actions

## Best Practices Implemented

✅ Consistent spacing (gap-4, space-y-4)
✅ Responsive design (container mx-auto)
✅ Loading states for all async operations
✅ Error handling with user feedback
✅ Semantic HTML structure
✅ Portuguese language throughout
✅ Icon usage for visual clarity
✅ Card-based layout for content
✅ Proper form validation
✅ Accessibility considerations

---

**Note**: This is a text-based visual guide. For actual screenshots, please run the application and navigate to `/admin/documents/view/:id` with valid document ID.

**Last Updated**: 2025-10-11
**Status**: Complete
**Branch**: copilot/refactor-document-version-history-3
