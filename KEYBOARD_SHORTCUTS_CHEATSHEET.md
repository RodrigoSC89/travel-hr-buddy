# Keyboard Shortcuts Cheat Sheet

## 🎹 Complete Keyboard Shortcuts Reference

### Global Navigation Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `Ctrl/Cmd + K` | Open global search | Anywhere |
| `Ctrl + 1` | Go to Dashboard | Anywhere |
| `Ctrl + 2` | Go to Travel | Anywhere |
| `Ctrl + 3` | Go to Maritime | Anywhere |
| `Ctrl + 4` | Go to Human Resources | Anywhere |
| `Ctrl + 5` | Go to Price Alerts | Anywhere |
| `Ctrl + 6` | Go to Communication | Anywhere |
| `Ctrl + S` | Go to Settings | Anywhere |

### Universal Keyboard Controls

| Key | Action | Where |
|-----|--------|-------|
| `Tab` | Move to next focusable element | All pages |
| `Shift + Tab` | Move to previous focusable element | All pages |
| `Enter` | Activate button/link | All interactive elements |
| `Space` | Activate button | All buttons |
| `Escape` | Close modal/menu/overlay | All overlays |

### Dropdown Menu Navigation

| Key | Action |
|-----|--------|
| `Enter` or `Space` | Open dropdown menu |
| `↓` Arrow Down | Move to next menu item |
| `↑` Arrow Up | Move to previous menu item |
| `Home` | Jump to first menu item |
| `End` | Jump to last menu item |
| `Enter` or `Space` | Select current item |
| `Escape` | Close menu |

### Modal/Dialog Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move to next element (focus trapped inside) |
| `Shift + Tab` | Move to previous element |
| `Escape` | Close modal and return focus |
| `Enter` | Activate default/primary button |

### Select Dropdown

| Key | Action |
|-----|--------|
| `Enter` or `Space` | Open select dropdown |
| `↓` Arrow Down | Next option |
| `↑` Arrow Up | Previous option |
| `Home` | First option |
| `End` | Last option |
| `Enter` or `Space` | Select option |
| `Escape` | Close without selecting |
| Type letters | Jump to matching option |

### Global Search Modal

| Key | Action |
|-----|--------|
| `Ctrl/Cmd + K` | Open search |
| Type | Filter results |
| `↓` Arrow Down | Highlight next result |
| `↑` Arrow Up | Highlight previous result |
| `Enter` | Navigate to selected result |
| `Escape` | Close search |

### Floating Action Button (FAB)

| Key | Action |
|-----|--------|
| `Tab` | Focus FAB main button |
| `Enter` or `Space` | Toggle menu open/closed |
| `↓` Arrow Down | Navigate to next action (cycles) |
| `↑` Arrow Up | Navigate to previous action (cycles) |
| `Enter` or `Space` | Activate focused action |
| `Escape` | Close menu and return focus |

### Sheet/Drawer (Side Panel)

| Key | Action |
|-----|--------|
| `Enter` or `Space` | Open sheet |
| `Tab` | Cycle through elements (trapped) |
| `Shift + Tab` | Cycle backward |
| `Escape` | Close sheet |

### Form Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move to next form field |
| `Shift + Tab` | Move to previous form field |
| `Space` | Toggle checkbox/radio button |
| `Enter` | Submit form (when on submit button) |
| `↓`/`↑` | Navigate select options |

### Tab Navigation

| Key | Action |
|-----|--------|
| `Arrow Left` | Previous tab |
| `Arrow Right` | Next tab |
| `Home` | First tab |
| `End` | Last tab |

---

## 📱 Component-Specific Shortcuts

### Sidebar Navigation
- `Tab` to navigate through menu items
- `Enter` to expand collapsible sections
- `Arrow Down/Up` to navigate within expanded sections

### User Menu (Top Right)
- `Tab` to focus avatar button
- `Enter` or `Space` to open menu
- `Arrow Down/Up` to navigate options
- `Enter` to select option
- `Escape` to close

### Data Tables
- `Tab` through table controls
- `Enter` on row to view details
- Arrow keys to navigate cells (if enabled)

---

## 🎯 Focus Indicators

All interactive elements show a **visible focus ring** when keyboard-focused:
- Blue ring (`focus:ring-4 focus:ring-primary/30`)
- High contrast for visibility
- Consistent across all components
- Meets WCAG 2.1 contrast requirements

---

## ♿ Accessibility Features

### Screen Reader Support
- All icon buttons have `aria-label`
- Modals have `role="dialog"` and `aria-modal="true"`
- Menus have `role="menu"` and `role="menuitem"`
- States announced with `aria-expanded`, `aria-selected`

### Focus Management
- Focus trapped in modals (can't tab outside)
- Focus returns to trigger after closing
- First element auto-focused in modals
- Logical tab order throughout app

### Semantic HTML
- Native `<button>` elements for actions
- Native `<a>` elements for links
- Proper form labels with `<label>`
- Heading hierarchy maintained

---

## 🧪 Testing Your Keyboard Navigation

1. **Tab Test**: Use only Tab/Shift+Tab to navigate
2. **Focus Test**: Verify focus indicator is always visible
3. **Activation Test**: Use Enter/Space to activate all elements
4. **Modal Test**: Verify focus trap and Escape key
5. **Menu Test**: Use arrows to navigate menus
6. **Return Test**: Verify focus returns after closing

---

## 📚 Developer Resources

- **Full Guide**: [KEYBOARD_ACCESSIBILITY_GUIDE.md](./KEYBOARD_ACCESSIBILITY_GUIDE.md)
- **Implementation Details**: [KEYBOARD_ACCESSIBILITY_IMPLEMENTATION.md](./KEYBOARD_ACCESSIBILITY_IMPLEMENTATION.md)
- **Quick Reference**: [KEYBOARD_ACCESSIBILITY_QUICK_REFERENCE.md](./KEYBOARD_ACCESSIBILITY_QUICK_REFERENCE.md)
- **Demo Components**: `src/components/testing/`

---

## 🎓 Tips for Users

1. **Start with Tab**: Press Tab to see all interactive elements
2. **Use Escape liberally**: It closes most overlays
3. **Try arrow keys**: They work in most menus
4. **Check for shortcuts**: Press `?` or look for hints
5. **Explore with keyboard**: Everything should be accessible!

---

**Last Updated**: 2024
**Status**: ✅ All components keyboard accessible
**Compliance**: WCAG 2.1 Level AA
