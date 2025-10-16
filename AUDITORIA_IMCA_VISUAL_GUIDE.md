# Auditoria IMCA - Visual Guide

## Component UI Overview

The Auditoria IMCA Form provides a clean, user-friendly interface for recording IMCA technical audits.

### Form Layout

```
┌─────────────────────────────────────────────────────────────┐
│  📋 Nova Auditoria Técnica IMCA                             │
│─────────────────────────────────────────────────────────────│
│                                                               │
│  Navio *                                                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Selecione                                        ▼    │  │
│  └───────────────────────────────────────────────────────┘  │
│  Options: DP Vessels Alpha, Beta, Gamma                      │
│                                                               │
│  Data *                                                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 📅 DD/MM/YYYY                                         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  Norma IMCA *                                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ IMCA M103                                        ▼    │  │
│  └───────────────────────────────────────────────────────┘  │
│  Options: M103, M117, M140, M190, M166, MSF182, M206, ...    │
│                                                               │
│  Item Auditado *                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Descreva o item auditado                              │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  Resultado *                                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Selecione                                        ▼    │  │
│  └───────────────────────────────────────────────────────┘  │
│  Options: ✅ Conforme, ❌ Não Conforme, ⚠️ Observação        │
│                                                               │
│  Comentários / Ações Corretivas                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Adicione comentários ou ações corretivas              │  │
│  │                                                         │  │
│  │                                                         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Salvar Auditoria (Green Button)             │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Form States

### Initial State
- All fields empty except "Norma IMCA" (defaults to IMCA M103)
- Submit button enabled (validation on click)
- No loading indicators

### Validation State
When clicking "Salvar Auditoria" without filling required fields:
- Toast notification appears: "Por favor, preencha todos os campos obrigatórios"
- Form remains editable
- No data submitted

### Submitting State
- Submit button shows "Salvando..."
- All form fields disabled
- User cannot interact with form during submission

### Success State
- Toast notification: "Auditoria registrada com sucesso!"
- Form resets to initial state
- User can create another audit

### Error State
- Toast notification with error message
- Form remains in current state
- User can retry submission

## Color Scheme

- **Card Background**: White with subtle shadow
- **Labels**: Default text color
- **Borders**: Light gray
- **Submit Button**: Green (#16a34a) with darker hover (#15803d)
- **Icons in Results**:
  - ✅ Green for "Conforme"
  - ❌ Red for "Não Conforme"
  - ⚠️ Yellow for "Observação"

## Responsive Design

The component is responsive and adapts to different screen sizes:
- **Desktop**: Max width 2xl (672px), centered with margin
- **Tablet**: Full width with padding
- **Mobile**: Full width with reduced padding

## Accessibility Features

- All form fields have proper labels
- Required fields marked with asterisk (*)
- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly

## User Flow

1. **Navigate** to `/auditoria-imca`
2. **Select** a vessel from dropdown
3. **Choose** audit date using date picker
4. **Select** IMCA standard (or keep default)
5. **Type** description of audited item
6. **Choose** audit result (Conforme/Não Conforme/Observação)
7. **Add** comments or corrective actions (optional)
8. **Click** "Salvar Auditoria"
9. **Receive** confirmation and form resets

## Integration Points

### Authentication
- Requires active user session
- User ID automatically attached to audit record

### Database
- Saves to `auditorias_imca` table
- Row-level security ensures users only see their audits
- Admins can view all audits

### API
- POST to `/api/auditorias/create`
- Validates required fields server-side
- Returns success/error response

## Toast Notifications

The component uses Sonner for toast notifications:

### Success Toast
```
┌────────────────────────────────┐
│ ✓ Auditoria registrada com     │
│   sucesso!                      │
└────────────────────────────────┘
```

### Error Toast
```
┌────────────────────────────────┐
│ ✗ Por favor, preencha todos    │
│   os campos obrigatórios       │
└────────────────────────────────┘
```

## Example Usage Scenario

**Maritime Safety Officer** conducting IMCA M103 audit:

1. Opens form at `/auditoria-imca`
2. Selects "DP Vessels Alpha" as vessel
3. Picks today's date
4. Keeps "IMCA M103" standard
5. Types "DP Control System - Redundancy Check"
6. Selects "✅ Conforme"
7. Adds comment: "All redundant systems operational. Next audit in 30 days."
8. Clicks "Salvar Auditoria"
9. Receives success confirmation
10. Can immediately create another audit

## Tips for Users

- **Required Fields**: Fields marked with * must be filled before submission
- **Date Format**: Use the date picker for proper date formatting
- **Comments**: Use this field to document findings and action plans
- **Multiple Audits**: Form resets after successful submission for quick entry of multiple audits
- **Authentication**: Ensure you're logged in before using the form
