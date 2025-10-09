# Keyboard Accessibility Guide

## Overview

This document outlines the keyboard accessibility features implemented across all menus, modals, and interactive components in the Travel HR Buddy application.

## Universal Keyboard Shortcuts

### Global Navigation
- `Ctrl/Cmd + K` - Open global search
- `Ctrl + 1` - Navigate to Dashboard
- `Ctrl + 2` - Navigate to Travel
- `Ctrl + 3` - Navigate to Maritime
- `Ctrl + 4` - Navigate to Human Resources
- `Ctrl + 5` - Navigate to Price Alerts
- `Ctrl + 6` - Navigate to Communication
- `Ctrl + S` - Navigate to Settings

## Component-Specific Keyboard Navigation

### Modals and Dialogs

All modal/dialog components support the following keyboard interactions:

#### Opening
- Click trigger button or press `Enter`/`Space` when focused

#### Navigation Inside Modal
- `Tab` - Move to next focusable element
- `Shift + Tab` - Move to previous focusable element
- Focus is **trapped** within the modal while open

#### Closing
- `Escape` - Close modal and return focus to trigger element
- Click close button (X) or press `Enter`/`Space` when focused on it
- Click outside overlay (if applicable)

#### ARIA Attributes
- `role="dialog"` - Identifies the modal
- `aria-modal="true"` - Indicates modal state
- `aria-labelledby` - References the dialog title
- `aria-describedby` - References the dialog description

### Dropdown Menus

All dropdown menus support:

#### Opening
- Click trigger or press `Enter`/`Space` when focused
- `aria-haspopup="menu"` indicates the presence of a popup menu

#### Navigation
- `Arrow Down` - Move to next menu item
- `Arrow Up` - Move to previous menu item
- `Home` - Move to first menu item
- `End` - Move to last menu item
- `Enter` or `Space` - Activate the focused menu item
- `Escape` - Close menu and return focus to trigger

#### Focus Management
- First item is focused when menu opens
- Visual focus indicator on current item
- Mouse hover also updates focus

### Floating Action Button (FAB)

The FAB menu supports full keyboard accessibility:

#### Main Button
- `Tab` to focus the main FAB button
- `Enter` or `Space` to toggle menu open/closed
- `aria-expanded` attribute indicates menu state
- `aria-haspopup="menu"` indicates it opens a menu

#### When Menu is Open
- `Arrow Down` - Navigate to next action (cycles to first)
- `Arrow Up` - Navigate to previous action (cycles to last)
- `Enter` or `Space` - Activate the focused action
- `Escape` - Close menu and return focus to main button
- Visual ring indicator shows focused action

### Global Search

The global search modal includes:

#### Opening
- `Ctrl/Cmd + K` from anywhere
- Click the search button

#### Search Interface
- Auto-focus on search input when opened
- `Arrow Down` - Highlight next search result
- `Arrow Up` - Highlight previous search result
- `Enter` - Navigate to highlighted result
- `Escape` - Close search modal

### Sheets/Drawers

Sheet components (side panels) support:

#### Opening
- Click trigger or press `Enter`/`Space` when focused

#### Navigation
- `Tab` - Move between focusable elements
- Focus trapped within sheet

#### Closing
- `Escape` - Close sheet
- Click close button
- Click outside overlay

### Select Components

Select dropdowns support:

#### Opening
- Click or press `Enter`/`Space` when focused

#### Navigation
- `Arrow Down` - Next option
- `Arrow Up` - Previous option
- `Enter` or `Space` - Select current option
- `Escape` - Close without selecting

## Focus Management

### Focus Trapping
Modals, dialogs, and sheets implement focus trapping:
- Focus stays within the component while open
- `Tab` cycles through focusable elements
- `Shift + Tab` cycles backward
- First focusable element receives focus on open
- Focus returns to trigger element on close

### Focus Indicators
All interactive elements have visible focus indicators:
- Keyboard focus shows a focus ring (typically blue)
- Focus ring uses `focus:ring-4` and `focus:ring-primary/30`
- Focus indicators meet WCAG 2.1 contrast requirements

### Skip Links
- Skip to main content link for screen readers
- Becomes visible on keyboard focus
- Located at the top of the page

## Screen Reader Support

### ARIA Labels
All interactive elements without visible text include `aria-label`:
- Icon buttons: `aria-label="Descriptive action name"`
- FAB actions: Individual labels for each action

### ARIA States
Dynamic components use appropriate ARIA states:
- `aria-expanded` - Indicates if expandable content is open
- `aria-haspopup` - Indicates popup menu/dialog
- `aria-selected` - Indicates selected state
- `aria-checked` - Indicates checkbox state

### Semantic HTML
- Use native HTML elements when possible (`<button>`, `<a>`, etc.)
- Proper heading hierarchy (`<h1>`, `<h2>`, etc.)
- Lists use `<ul>` and `<li>` elements
- Forms use `<form>`, `<label>`, and proper input types

## Testing Keyboard Accessibility

### Manual Testing Checklist
1. Navigate using only `Tab` and `Shift+Tab`
2. Activate components using `Enter` and `Space`
3. Close modals/menus using `Escape`
4. Navigate lists/menus using arrow keys
5. Verify focus is visible at all times
6. Verify focus doesn't escape modals
7. Verify focus returns to trigger after closing

### Automated Testing
- Components use Radix UI primitives with built-in accessibility
- ARIA attributes are automatically managed
- Focus management is handled by the library

## Best Practices for Developers

### When Adding New Components

1. **Use Radix UI primitives** when available (Dialog, Dropdown, Select, etc.)
2. **Add proper ARIA labels** to icon buttons and non-obvious controls
3. **Implement keyboard handlers** for custom interactions
4. **Test with keyboard only** before considering it complete
5. **Verify focus states** are visible and meet contrast requirements

### Custom Keyboard Interactions

When implementing custom keyboard navigation:

```tsx
import { useArrowNavigation } from '@/hooks/use-arrow-navigation';

const MyMenu = ({ isOpen, items, onSelect, onClose }) => {
  const { focusedIndex, getItemProps } = useArrowNavigation({
    isOpen,
    itemCount: items.length,
    onSelect,
    onClose,
    orientation: 'vertical',
    loop: true,
  });

  return (
    <ul>
      {items.map((item, index) => (
        <li {...getItemProps(index)} key={item.id}>
          {item.label}
        </li>
      ))}
    </ul>
  );
};
```

### Focus Trapping

For custom modals:

```tsx
import { useFocusTrap } from '@/hooks/use-focus-trap';

const MyModal = ({ isOpen }) => {
  const containerRef = useFocusTrap(isOpen);

  return (
    <div ref={containerRef}>
      {/* Modal content */}
    </div>
  );
};
```

## Accessibility Hooks

### Available Hooks

1. **`use-focus-trap.ts`** - Trap focus within a container
2. **`use-arrow-navigation.ts`** - Arrow key navigation for lists/menus
3. **`use-keyboard-shortcuts.ts`** - Global keyboard shortcuts

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Radix UI Accessibility](https://www.radix-ui.com/docs/primitives/overview/accessibility)

## Support

For questions or issues related to keyboard accessibility, please contact the development team or open an issue in the repository.
