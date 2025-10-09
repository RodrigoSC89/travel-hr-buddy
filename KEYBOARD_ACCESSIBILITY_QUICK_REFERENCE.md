# Quick Reference: Keyboard Accessibility

## 🎹 For Users

### Global Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Open global search |
| `Ctrl + 1-6` | Navigate to specific modules |
| `Ctrl + S` | Open settings |
| `/` | Focus search (when available) |

### Universal Navigation
| Key | Action |
|-----|--------|
| `Tab` | Move to next interactive element |
| `Shift + Tab` | Move to previous interactive element |
| `Enter` or `Space` | Activate button/link |
| `Escape` | Close modal/menu |

### Menus & Dropdowns
| Key | Action |
|-----|--------|
| `Arrow Down` | Next menu item |
| `Arrow Up` | Previous menu item |
| `Home` | First menu item |
| `End` | Last menu item |
| `Enter` | Select item |
| `Escape` | Close menu |

### Modals & Dialogs
| Key | Action |
|-----|--------|
| `Tab` | Cycle through elements (trapped) |
| `Shift + Tab` | Cycle backward |
| `Escape` | Close modal |
| Focus automatically returns to trigger when closed |

### Floating Action Button (FAB)
| Key | Action |
|-----|--------|
| `Tab` | Focus FAB |
| `Enter/Space` | Toggle menu |
| `Arrow Down` | Next action |
| `Arrow Up` | Previous action |
| `Enter/Space` | Activate action |
| `Escape` | Close menu |

---

## 👨‍💻 For Developers

### Quick Checklist for New Components

#### ✅ Buttons & Links
```tsx
// ✅ Good - Native button
<button onClick={handleClick}>Click me</button>

// ✅ Good - Using UI component
<Button onClick={handleClick}>Click me</Button>

// ❌ Bad - div is not keyboard accessible
<div onClick={handleClick}>Click me</div>
```

#### ✅ Custom Modals
```tsx
import { useFocusTrap } from '@/hooks/use-focus-trap';

const MyModal = ({ isOpen, onClose }) => {
  const modalRef = useFocusTrap(isOpen);
  
  return (
    <div 
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <h2 id="modal-title">Modal Title</h2>
      {/* content */}
    </div>
  );
};
```

#### ✅ Custom Menus
```tsx
import { useArrowNavigation } from '@/hooks/use-arrow-navigation';

const MyMenu = ({ isOpen, items, onSelect, onClose }) => {
  const { getItemProps } = useArrowNavigation({
    isOpen,
    itemCount: items.length,
    onSelect,
    onClose,
    orientation: 'vertical',
  });

  return (
    <div role="menu">
      {items.map((item, index) => (
        <button {...getItemProps(index)} role="menuitem">
          {item.label}
        </button>
      ))}
    </div>
  );
};
```

#### ✅ Icon Buttons
```tsx
// ✅ Good - has aria-label
<button aria-label="Close">
  <X />
</button>

// ❌ Bad - screen readers can't identify it
<button>
  <X />
</button>
```

#### ✅ Focus Indicators
```tsx
// ✅ Good - visible focus ring
<button className="focus:ring-4 focus:ring-primary/30">
  Click me
</button>

// ❌ Bad - removes focus indicator
<button className="focus:outline-none">
  Click me
</button>
```

### Required ARIA Attributes

#### Modals
```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Title</h2>
  <p id="dialog-description">Description</p>
</div>
```

#### Menus
```tsx
<button
  aria-haspopup="menu"
  aria-expanded={isOpen}
>
  Open Menu
</button>
<div role="menu">
  <button role="menuitem">Item 1</button>
</div>
```

#### Tabs
```tsx
<div role="tablist">
  <button role="tab" aria-selected="true">Tab 1</button>
  <button role="tab" aria-selected="false">Tab 2</button>
</div>
<div role="tabpanel">Content</div>
```

### Use Radix UI When Possible
```tsx
// ✅ Preferred - built-in accessibility
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { Select, SelectContent } from '@/components/ui/select';

// These components have:
// - Automatic keyboard navigation
// - Proper ARIA attributes
// - Focus management
// - Screen reader support
```

### Testing Checklist

Before submitting:
- [ ] Can Tab to all interactive elements
- [ ] Focus indicators are visible
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals/menus
- [ ] Arrow keys work in menus
- [ ] Focus trapped in modals
- [ ] Focus returns after closing
- [ ] No keyboard traps
- [ ] Screen reader friendly

### Tools

**Hooks:**
- `use-focus-trap` - Focus trapping for modals
- `use-arrow-navigation` - Arrow key navigation
- `use-keyboard-shortcuts` - Global shortcuts

**Components:**
- All Radix UI primitives (Dialog, Dropdown, etc.)
- FloatingActionButton - keyboard accessible
- GlobalSearch - keyboard accessible

**Documentation:**
- `KEYBOARD_ACCESSIBILITY_GUIDE.md` - Full guide
- `KEYBOARD_ACCESSIBILITY_IMPLEMENTATION.md` - Technical details
- Demo components in `src/components/testing/`

---

## 🧪 Testing Commands

```bash
# Build project
npm run build

# Check for TypeScript errors
npm run lint

# Test keyboard navigation manually
# 1. Use Tab key only
# 2. Try all modals/menus
# 3. Verify focus indicators
# 4. Test Escape key
```

---

## 📚 Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Radix UI Docs](https://www.radix-ui.com/docs/primitives)
- [Keyboard Testing Guide](./KEYBOARD_ACCESSIBILITY_GUIDE.md)

---

**Need Help?** Check the demo components in `src/components/testing/` or the full guide at `KEYBOARD_ACCESSIBILITY_GUIDE.md`
