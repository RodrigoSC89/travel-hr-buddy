# DP Incident Cards - Visual Design

## Component Visual Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DP INCIDENT INTELLIGENCE FEED                             │
│              Base de conhecimento de incidentes DP com análise por IA       │
│                                                                              │
│  [Shield Badge: IMCA Database] [File Badge: Relatórios] [Chart: Análise IA]│
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────┬────────────────────────────────────┐
│ ╔════════════════════════════════════╗ │ ╔══════════════════════════════╗ │
│ ║ Perda de posição durante...   15/09║ │ ║ Falha de redundância...  22/08║ │
│ ╠════════════════════════════════════╣ │ ╠══════════════════════════════╣ │
│ ║ Embarcação perdeu posicionamento   ║ │ ║ Sistema de redundância não   ║ │
│ ║ durante operação crítica devido a  ║ │ ║ operou conforme esperado...  ║ │
│ ║ falha no sistema de propulsão...   ║ │ ║                              ║ │
│ ║                                    ║ │ ║                              ║ │
│ ║ [Classe: DP3] [Embarcação: ...]   ║ │ ║ [Classe: DP2] [Embarcação...║ │
│ ║ [Local: Golfo do México]           ║ │ ║ [Local: Mar do Norte]        ║ │
│ ║ [Propulsion] [Critical] [Weather]  ║ │ ║ [Config] [Redundancy] [High] ║ │
│ ║                                    ║ │ ║                              ║ │
│ ║ [Ver relatório] [Analisar com IA]  ║ │ ║ [Ver relatório] [Analisar...]║ │
│ ╚════════════════════════════════════╝ │ ╚══════════════════════════════╝ │
├────────────────────────────────────────┼────────────────────────────────────┤
│ ╔════════════════════════════════════╗ │ ╔══════════════════════════════╗ │
│ ║ Perda temporária de...        10/07║ │ ║ Falha em teste FMEA      05/06║ │
│ ╠════════════════════════════════════╣ │ ╠══════════════════════════════╣ │
│ ║ Sistema perdeu referência por 45s  ║ │ ║ Teste revelou lacunas em     ║ │
│ ║ devido a interferência EMI de      ║ │ ║ procedimentos operacionais   ║ │
│ ║ equipamento de soldagem submarino  ║ │ ║ e necessidade de treinamento ║ │
│ ║                                    ║ │ ║                              ║ │
│ ║ [Classe: DP2] [Embarcação: ...]   ║ │ ║ [Classe: DP1] [Embarcação...║ │
│ ║ [Local: Bacia de Campos]           ║ │ ║ [Local: Mar Cáspio]          ║ │
│ ║ [Sensors] [Medium] [EMI]           ║ │ ║ [Testing] [FMEA] [Low]       ║ │
│ ║                                    ║ │ ║                              ║ │
│ ║ [Ver relatório] [Analisar com IA]  ║ │ ║ [Ver relatório] [Analisar...]║ │
│ ╚════════════════════════════════════╝ │ ╚══════════════════════════════╝ │
└────────────────────────────────────────┴────────────────────────────────────┘
```

## Color Scheme

### Card Styling
- **Border-left**: Blue-600 (4px thick accent)
- **Title**: Blue-800 (font-semibold)
- **Date**: Gray-500 (text-sm)
- **Summary**: Gray-700 (text-sm)
- **Background**: White with shadow-sm

### Badges
- **Outline Badges**: Border-border, text-foreground
  - Used for: Classe, Embarcação, Local
- **Secondary Badges**: bg-secondary, text-secondary-foreground
  - Used for: Custom tags (Propulsion, Critical, Weather, etc.)

### Buttons
- **Ver relatório**: Outline variant (border-2, hover:bg-primary)
- **Analisar com IA**: Default variant (bg-primary, shadow-lg)

## Responsive Behavior

### Mobile (< 768px)
```
┌─────────────────────────────────────┐
│ ╔═══════════════════════════════╗   │
│ ║ Incident Card 1                ║   │
│ ╚═══════════════════════════════╝   │
│ ╔═══════════════════════════════╗   │
│ ║ Incident Card 2                ║   │
│ ╚═══════════════════════════════╝   │
│ ╔═══════════════════════════════╗   │
│ ║ Incident Card 3                ║   │
│ ╚═══════════════════════════════╝   │
│ ╔═══════════════════════════════╗   │
│ ║ Incident Card 4                ║   │
│ ╚═══════════════════════════════╝   │
└─────────────────────────────────────┘
```

### Desktop (≥ 768px)
```
┌───────────────────────────────────────────────────────────┐
│ ╔══════════════════╗    ╔══════════════════╗            │
│ ║ Incident Card 1  ║    ║ Incident Card 2  ║            │
│ ╚══════════════════╝    ╚══════════════════╝            │
│ ╔══════════════════╗    ╔══════════════════╗            │
│ ║ Incident Card 3  ║    ║ Incident Card 4  ║            │
│ ╚══════════════════╝    ╚══════════════════╝            │
└───────────────────────────────────────────────────────────┘
```

## Card Content Structure

Each card contains:

1. **Header Row** (flex justify-between)
   - Left: Title (h3, font-semibold, text-blue-800)
   - Right: Date (span, text-sm, text-gray-500)

2. **Summary** (p, text-sm, text-gray-700)
   - Brief description of the incident

3. **Badge Row** (flex flex-wrap, gap-1, text-xs)
   - First 3 badges: Outline variant
     - Classe: {class_dp}
     - Embarcação: {vessel}
     - Local: {location}
   - Remaining badges: Secondary variant
     - Custom tags from incident.tags array

4. **Action Row** (flex gap-2, pt-2)
   - Ver relatório button (outline, size-sm, external link)
   - Analisar com IA button (default, size-sm, localStorage)

## Interaction Behaviors

### "Ver relatório" Button
- Opens IMCA incident report in new tab
- Attributes: `target="_blank"` and `rel="noopener noreferrer"`
- External link to: `https://www.imca-int.com/incident-reports`

### "Analisar com IA" Button
- Saves full incident object to localStorage
- Key: `"incident_to_analyze"`
- Value: JSON.stringify(incident)
- Enables AI analysis in other parts of the application

## Accessibility

- Semantic HTML structure
- Proper link attributes for external navigation
- Keyboard navigable buttons
- Screen reader friendly badge labels
- Color contrast compliant (WCAG AA)

## Grid Layout

- Container: `grid grid-cols-1 md:grid-cols-2 gap-4`
- Mobile: 1 column layout
- Tablet/Desktop: 2 column layout at md breakpoint (768px)
- Gap: 1rem (16px) between cards
