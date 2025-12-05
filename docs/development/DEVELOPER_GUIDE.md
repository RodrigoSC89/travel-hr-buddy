# 👨‍💻 Developer Guide

## Overview

Complete development guide for Nautilus One.

## Development Environment

### Prerequisites

- Node.js 18+
- npm or bun
- Git
- VS Code (recommended)

### Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)
- GitLens

### Setup

```bash
# Clone repository
git clone <repo-url>
cd nautilus-one

# Install dependencies
npm install

# Start development
npm run dev
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/              # Base shadcn components
│   ├── common/          # Shared components
│   └── layouts/         # Layout components
│
├── pages/               # Route pages (file-based routing)
│
├── hooks/               # Custom React hooks
│   ├── use-auth.ts      # Authentication hook
│   ├── use-query.ts     # Data fetching
│   └── index.ts         # Exports
│
├── services/            # API layer
│   ├── api.ts           # Base API client
│   ├── crew.ts          # Crew service
│   └── documents.ts     # Documents service
│
├── lib/                 # Core utilities
│   ├── utils.ts         # General utilities
│   ├── supabase.ts      # Supabase client
│   └── performance/     # Performance utils
│
├── types/               # TypeScript definitions
│
└── modules/             # Feature modules
```

## Code Standards

### TypeScript

```typescript
// ✅ Good - explicit types
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Bad - implicit any
function getUser(id) {
  // ...
}
```

### React Components

```tsx
// ✅ Good - typed props, focused component
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button = ({ 
  label, 
  onClick, 
  variant = 'primary',
  disabled = false 
}: ButtonProps) => {
  return (
    <button 
      className={cn('btn', variant)}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};
```

### Styling

```tsx
// ✅ Good - using design tokens
<div className="bg-background text-foreground">

// ❌ Bad - hardcoded colors
<div className="bg-white text-black">
```

## State Management

### Server State (TanStack Query)

```typescript
// Fetching data
const { data, isLoading } = useQuery({
  queryKey: ['crew', id],
  queryFn: () => fetchCrew(id),
});

// Mutations
const mutation = useMutation({
  mutationFn: updateCrew,
  onSuccess: () => {
    queryClient.invalidateQueries(['crew']);
  },
});
```

### Local State

```typescript
// Simple state
const [isOpen, setIsOpen] = useState(false);

// Complex state - use reducer
const [state, dispatch] = useReducer(reducer, initialState);
```

## Testing

### Unit Tests

```bash
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage
```

### E2E Tests

```bash
npm run test:e2e      # Run E2E
npm run test:e2e:ui   # Visual mode
```

## Common Tasks

### Adding a New Page

1. Create file in `src/pages/`
2. Add route in `App.tsx`
3. Create components as needed

### Adding a New Component

1. Create in `src/components/`
2. Export from index
3. Add tests
4. Update docs if needed

### Adding a New API Endpoint

1. Create Edge Function in `supabase/functions/`
2. Add types
3. Create service in `src/services/`
4. Deploy function

## Debugging

### Console Logs

Use the logger utility:

```typescript
import { logger } from '@/lib/logger';

logger.info('Message', { data });
logger.error('Error', error);
```

### React DevTools

Install React DevTools browser extension.

### Network Requests

Use browser DevTools Network tab.

## Deployment

See [Deployment Guide](../deployment/DEPLOYMENT-GUIDE.md).
