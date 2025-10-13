# Collaborative Editor - Visual Guide

## Overview

This guide provides a visual description of the collaborative document editor interface and features.

## Page Layout

### Header Section
```
┌─────────────────────────────────────────────────────────────┐
│  Collaborative Editor                       [Back] Button   │
│  Real-time document collaboration with TipTap + Yjs         │
└─────────────────────────────────────────────────────────────┘
```

### Main Editor Card
```
┌─────────────────────────────────────────────────────────────┐
│ 📄 [Document Title Input]               👥 2 online        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Editor Area                                          │  │
│  │                                                       │  │
│  │ Start typing to collaborate in real-time...          │  │
│  │                                                       │  │
│  │ • Type here and see changes sync across users       │  │
│  │ • Cursor positions shown with user emails           │  │
│  │ • All formatting preserved in real-time             │  │
│  │                                                       │  │
│  │                                                       │  │
│  │                                                       │  │
│  │                                                       │  │
│  │ [User1@email.com's cursor here ▎]                   │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  [Clear Content]                                            │
│                                                             │
│  💡 This is a real-time collaborative editor                │
│  👥 Share the document ID with others to collaborate        │
│  🔄 Changes sync automatically across all connected users  │
└─────────────────────────────────────────────────────────────┘
```

### Usage Instructions Card
```
┌─────────────────────────────────────────────────────────────┐
│  How to use:                                                │
│  1. Open this same URL in another browser tab or share      │
│     with colleagues                                         │
│  2. Start typing - changes will appear in real-time for     │
│     all users                                               │
│  3. See cursor positions of other users as they type        │
│  4. All changes are synchronized via WebRTC peer-to-peer    │
│     connection                                              │
└─────────────────────────────────────────────────────────────┘
```

## UI Components

### 1. Document Title Input
- **Location**: Top of editor card
- **Features**:
  - Inline editable title
  - Large, bold font
  - Placeholder: "Document Title"
  - Auto-focus on page load

### 2. Connected Users Counter
- **Location**: Top right of editor card
- **Display**: `👥 N online`
- **Updates**: Real-time as users join/leave
- **Example**: "👥 3 online" when 3 users connected

### 3. Editor Area
- **Type**: Rich text WYSIWYG
- **Framework**: TipTap (ProseMirror-based)
- **Features**:
  - Clean, minimalist design
  - Bordered rounded container
  - Min height: 400px
  - Prose styling for readability

### 4. Collaboration Cursors
- **Visual**: Thin vertical line with user label
- **Colors**: Random color per user
- **Label**: User's email address
- **Position**: Follows cursor in real-time
- **Example**:
  ```
  john@example.com
  ▎
  ```

### 5. Clear Content Button
- **Style**: Outline variant, small size
- **Action**: Resets editor to initial state
- **Confirmation**: None (instant action)

### 6. Back Button
- **Location**: Top right of page
- **Action**: Navigate to `/admin/documents`
- **Style**: Outline variant with arrow icon

## Rich Text Features

### Text Formatting
```
**Bold text** renders as: Bold text
*Italic text* renders as: Italic text
~~Strikethrough~~ renders as: Strikethrough
`inline code` renders as: inline code
```

### Headings
```
# Heading 1 - Large, bold, 2em
## Heading 2 - Medium, bold, 1.5em
### Heading 3 - Regular, bold, 1.25em
```

### Lists

**Bullet List**:
```
• Item 1
• Item 2
  • Nested item
```

**Numbered List**:
```
1. First item
2. Second item
   1. Nested item
```

### Code Blocks
```javascript
function example() {
  return "Syntax highlighted";
}
```
- Dark background (#0d0d0d)
- White text
- Monospace font
- Rounded corners

### Blockquotes
```
┃ This is a blockquote
┃ Multiple lines supported
```
- Left border (3px solid)
- Left padding
- Gray border color

### Horizontal Rule
```
─────────────────────────────────
```
- 2px solid line
- Gray color (rgba)
- Margins: 2rem top/bottom

## Cursor Collaboration Visualization

### Single User
```
John typing here▎
```
- Blue cursor (example)
- "john@example.com" label above

### Multiple Users
```
Alice is here▎          Bob is here▎
```
- Alice: Red cursor (example)
- Bob: Green cursor (example)
- Each with email label

### Active Typing
```
Sarah typing...▎
```
- Cursor blinks at typing position
- Label stays visible
- Updates every keystroke

## Color Scheme

### Editor Colors
- **Background**: White (#ffffff)
- **Text**: Dark gray (#0d0d0d)
- **Border**: Light gray (#e5e7eb)
- **Code background**: Dark (#0d0d0d)
- **Code text**: White (#fff)

### Collaboration Colors
- **Cursor**: Random per user
- **Label background**: User's color
- **Label text**: Dark (#0d0d0d)
- **Border accent**: User's color

### UI Components
- **Primary button**: Blue
- **Outline button**: Gray border
- **Muted text**: Gray (#6b7280)
- **Card background**: White
- **Page background**: Light gray

## Responsive Design

### Desktop (> 1024px)
- Max width: 4xl (896px)
- Centered layout
- Full editor height
- Spacious padding

### Tablet (768px - 1024px)
- Max width: 100%
- Reduced padding
- Adjusted editor height
- Maintained readability

### Mobile (< 768px)
- Full width layout
- Stacked components
- Touch-optimized inputs
- Scrollable editor

## Accessibility Features

### Keyboard Navigation
- Tab to move between inputs
- Enter to create new lines
- Shift+Enter for hard break
- Standard editor shortcuts

### Screen Reader Support
- Proper ARIA labels
- Semantic HTML structure
- Focus indicators
- Alt text for icons

### Visual Accessibility
- High contrast text
- Clear focus states
- Readable font sizes
- Sufficient spacing

## State Indicators

### Loading State
```
┌─────────────────────┐
│  Connecting...      │
│  [Spinner]          │
└─────────────────────┘
```

### Connected State
```
┌─────────────────────┐
│  👥 2 online        │
└─────────────────────┘
```

### Error State
```
┌─────────────────────┐
│  ⚠️ Connection Lost │
│  [Retry Button]     │
└─────────────────────┘
```

## User Flow

### Initial Load
1. User navigates to `/admin/documents/edit/doc-123`
2. Page loads with empty editor
3. WebRTC connection established
4. "1 online" shown (just current user)

### Collaboration Start
1. Second user opens same URL
2. Counter updates to "2 online"
3. First user sees second user's cursor appear
4. Both can see each other's typing in real-time

### Active Collaboration
1. User A types: "Hello"
2. User B sees "Hello" appear instantly
3. User B types: " World"
4. User A sees " World" added instantly
5. Cursors show each user's position

### User Leaves
1. User closes tab or navigates away
2. Counter updates for remaining users
3. Left user's cursor disappears
4. Content remains synchronized

## Example Scenarios

### Scenario 1: Meeting Notes
```
Meeting Notes - Q4 Planning
===========================

Attendees: [Alice typing...▎]
- Alice Johnson
- Bob Smith [Bob's cursor▎]
- Carol Davis

Agenda:
1. Review Q3 results
2. [Alice and Bob collaborating here▎▎]
```

### Scenario 2: Code Documentation
```
API Documentation
=================

## Authentication

Use JWT tokens for API auth: [Carol adding code▎]

```javascript
const token = await getToken();
fetch('/api/data', {
  headers: { Authorization: `Bearer ${token}` }
});
```

[Bob reviewing above▎]
```

### Scenario 3: Project Planning
```
Project Roadmap - 2025
======================

### Q1 Goals
- Launch new feature [Alice▎]
- Improve performance
- Add mobile support [Bob▎]

### Q2 Goals
[Team discussing here▎▎▎]
```

## Technical Visualization

### Data Flow
```
User A        ←→    WebRTC    ←→    User B
  ↓                  ↕                 ↓
TipTap             Yjs              TipTap
  ↓                  ↕                 ↓
Local Doc      CRDT Sync         Local Doc
```

### Synchronization
```
User A types "H"  →  Yjs encodes  →  WebRTC sends
                                            ↓
User B sees "H"   ←  TipTap renders ← Yjs decodes
```

### Cursor Tracking
```
User A cursor moves  →  Position encoded  →  Broadcast
                                                  ↓
User B sees cursor   ←  Render at position ← Decode
```

## Performance Indicators

### Good Connection
- Green cursor colors
- Smooth typing
- Instant sync (< 100ms)
- No lag indicators

### Moderate Connection
- Yellow indicators
- Slight delay (100-500ms)
- Occasional buffering

### Poor Connection
- Red indicators
- Noticeable delay (> 500ms)
- Reconnection attempts

## Future UI Enhancements

### Planned Features
- [ ] Online users list sidebar
- [ ] User avatars instead of email
- [ ] Typing indicators ("Alice is typing...")
- [ ] Comment threads on selections
- [ ] Version history panel
- [ ] Export button toolbar
- [ ] Formatting toolbar
- [ ] Emoji picker
- [ ] @mentions autocomplete

### Mockup: Enhanced Header
```
┌────────────────────────────────────────────────────┐
│ 📄 [Document Title]  [B] [I] [H1] [•] [1.]  [Share]│
│                                                     │
│ 👥 Online: Alice, Bob, Carol          [Export ▼]  │
└────────────────────────────────────────────────────┘
```

## Conclusion

The collaborative editor provides a clean, intuitive interface for real-time document collaboration. The visual design emphasizes:

- **Clarity**: Clear indication of online users and their actions
- **Simplicity**: Minimal UI that doesn't distract from content
- **Feedback**: Real-time visual feedback for all interactions
- **Accessibility**: Keyboard navigation and screen reader support

The interface successfully balances powerful collaboration features with ease of use, making it suitable for both technical and non-technical users.

---

**For Screenshots**: Open `/admin/documents/edit/test-doc` in your browser to see the live interface.
