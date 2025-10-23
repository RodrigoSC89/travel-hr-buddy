# Best Practices - Nautilus One Travel HR Buddy

**Version**: 1.0  
**Last Updated**: 2025-01-24

---

## 📚 Table of Contents

1. [Code Organization](#code-organization)
2. [Performance Optimization](#performance-optimization)
3. [Security](#security)
4. [Error Handling](#error-handling)
5. [Testing](#testing)
6. [State Management](#state-management)
7. [Component Design](#component-design)
8. [TypeScript](#typescript)

---

## Code Organization

### File Structure

```
src/
├── components/        # Reusable UI components
│   ├── ui/           # Shadcn/ui components
│   └── shared/       # Shared business components
├── modules/          # Feature modules
│   └── feature/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── types/
├── hooks/            # Global hooks
├── lib/              # Utilities and integrations
├── pages/            # Route pages
├── contexts/         # React contexts
└── types/            # Global TypeScript types
```

### Naming Conventions

```typescript
// ✅ Good
// Components: PascalCase
export function UserProfile() {}

// Hooks: camelCase with 'use' prefix
export function useUserData() {}

// Utilities: camelCase
export function formatDate() {}

// Constants: UPPER_SNAKE_CASE
export const MAX_RETRY_ATTEMPTS = 3;

// Types/Interfaces: PascalCase
export interface UserData {}

// ❌ Bad
export function user_profile() {}  // Wrong case
export function getData() {}       // Hook without 'use'
export const maxRetries = 3;       // Constant not uppercase
```

### Import Organization

```typescript
// ✅ Good - Organized imports
// 1. React imports
import { useState, useEffect } from 'react';

// 2. External libraries
import { useQuery } from '@tanstack/react-query';

// 3. Internal absolute imports
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

// 4. Relative imports
import { formatDate } from './utils';

// 5. Types
import type { User } from '@/types';

// ❌ Bad - Mixed imports
import { formatDate } from './utils';
import { useState } from 'react';
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
```

---

## Performance Optimization

### Code Splitting

```typescript
// ✅ Good - Lazy load heavy components
const HeavyChart = lazy(() => import('./HeavyChart'));

function Dashboard() {
  return (
    <Suspense fallback={<Skeleton />}>
      <HeavyChart />
    </Suspense>
  );
}

// ❌ Bad - Import everything upfront
import HeavyChart from './HeavyChart';
```

### Memoization

```typescript
// ✅ Good - Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// ✅ Good - Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// ✅ Good - Memoize components
const MemoizedComponent = memo(ExpensiveComponent);

// ❌ Bad - Recreate on every render
const value = heavyCalculation(data);
const handleClick = () => doSomething(id);
```

### List Rendering

```typescript
// ✅ Good - Use keys and virtualization
import { useVirtualizer } from '@tanstack/react-virtual';

function LargeList({ items }) {
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50
  });

  return (
    <div ref={parentRef}>
      {virtualizer.getVirtualItems().map(item => (
        <div key={items[item.index].id}>
          {items[item.index].name}
        </div>
      ))}
    </div>
  );
}

// ❌ Bad - Render thousands of items
function LargeList({ items }) {
  return items.map((item, index) => (
    <div key={index}>{item.name}</div>  // Also: index as key is bad
  ));
}
```

### Image Optimization

```typescript
// ✅ Good - Lazy loading with placeholder
<img
  src={imageUrl}
  alt="Description"
  loading="lazy"
  decoding="async"
/>

// ✅ Good - Use modern formats
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <source srcSet="image.avif" type="image/avif" />
  <img src="image.jpg" alt="Fallback" />
</picture>
```

---

## Security

### Input Validation

```typescript
// ✅ Good - Validate and sanitize
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  age: z.number().min(0).max(120),
  name: z.string().min(1).max(100)
});

function handleSubmit(data: unknown) {
  const validated = userSchema.parse(data);
  // Use validated data
}

// ❌ Bad - Trust user input
function handleSubmit(data: any) {
  database.insert(data);  // Dangerous!
}
```

### XSS Prevention

```typescript
// ✅ Good - React automatically escapes
function UserComment({ comment }) {
  return <div>{comment}</div>;  // Safe
}

// ✅ Good - Sanitize if using dangerouslySetInnerHTML
import DOMPurify from 'dompurify';

function RichContent({ html }) {
  return (
    <div dangerouslySetInnerHTML={{
      __html: DOMPurify.sanitize(html)
    }} />
  );
}

// ❌ Bad - Never trust raw HTML
function RichContent({ html }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

### Authentication

```typescript
// ✅ Good - Secure token handling
function useAuth() {
  // Store tokens securely
  const storeToken = (token: string) => {
    // Use httpOnly cookies or secure storage
    document.cookie = `token=${token}; Secure; HttpOnly; SameSite=Strict`;
  };

  return { storeToken };
}

// ❌ Bad - Expose tokens
localStorage.setItem('token', token);  // Vulnerable to XSS
```

### Environment Variables

```typescript
// ✅ Good - Never expose secrets
// .env
VITE_PUBLIC_API_URL=https://api.example.com  // Public, prefixed with VITE_
API_SECRET_KEY=xxx                            // Server-only, NOT prefixed

// ❌ Bad - Expose secrets in client
const secretKey = import.meta.env.VITE_SECRET_KEY;  // Don't do this!
```

---

## Error Handling

### Try-Catch Pattern

```typescript
// ✅ Good - Specific error handling
async function fetchUserData(id: string) {
  try {
    const response = await fetch(`/api/users/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      logger.error('Network error', error);
      throw new Error('Network connection failed');
    }
    
    logger.error('Failed to fetch user', error);
    throw error;
  }
}

// ❌ Bad - Silent failures
async function fetchUserData(id: string) {
  try {
    return await fetch(`/api/users/${id}`).then(r => r.json());
  } catch (error) {
    return null;  // Swallowing errors
  }
}
```

### Error Boundaries

```typescript
// ✅ Good - Catch render errors
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('React error boundary', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### User-Friendly Messages

```typescript
// ✅ Good - User-friendly error messages
function handleError(error: Error) {
  const userMessage = {
    NetworkError: 'Unable to connect. Please check your internet connection.',
    AuthError: 'Your session has expired. Please sign in again.',
    ValidationError: 'Please check your input and try again.'
  }[error.name] || 'Something went wrong. Please try again later.';

  toast.error(userMessage);
  logger.error('Operation failed', error);  // Technical details in logs
}

// ❌ Bad - Expose technical details
function handleError(error: Error) {
  alert(error.stack);  // Never show stack traces to users
}
```

---

## Testing

### Test Structure

```typescript
// ✅ Good - Clear test structure
describe('UserProfile', () => {
  describe('when user is authenticated', () => {
    it('should display user name', () => {
      // Arrange
      const user = createMockUser();
      
      // Act
      render(<UserProfile user={user} />);
      
      // Assert
      expect(screen.getByText(user.name)).toBeInTheDocument();
    });
  });

  describe('when user is not authenticated', () => {
    it('should redirect to login', () => {
      // Test...
    });
  });
});
```

### Mock Sparingly

```typescript
// ✅ Good - Mock external dependencies only
vi.mock('@/lib/api', () => ({
  fetchUser: vi.fn()
}));

// ❌ Bad - Mock internal logic
vi.mock('./utils', () => ({
  calculateTotal: vi.fn(() => 100)  // Don't mock your own logic
}));
```

---

## State Management

### Local vs Global State

```typescript
// ✅ Good - Keep state local when possible
function Counter() {
  const [count, setCount] = useState(0);  // Local state
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// ✅ Good - Use context for shared state
const ThemeContext = createContext<Theme>('light');

// ❌ Bad - Global state for everything
const useGlobalStore = create(set => ({
  count: 0,  // This should be local
  increment: () => set(state => ({ count: state.count + 1 }))
}));
```

### State Updates

```typescript
// ✅ Good - Functional updates
setCount(prev => prev + 1);

// ✅ Good - Batch related updates
setUser({ ...user, name, email });

// ❌ Bad - Multiple separate updates
setName(newName);
setEmail(newEmail);
setAge(newAge);
```

---

## Component Design

### Single Responsibility

```typescript
// ✅ Good - Single responsibility
function UserAvatar({ src, alt }) {
  return <img src={src} alt={alt} className="avatar" />;
}

function UserName({ name }) {
  return <h2>{name}</h2>;
}

function UserProfile({ user }) {
  return (
    <div>
      <UserAvatar src={user.avatar} alt={user.name} />
      <UserName name={user.name} />
    </div>
  );
}

// ❌ Bad - Too many responsibilities
function UserProfile({ user }) {
  return (
    <div>
      <img src={user.avatar} />
      <h2>{user.name}</h2>
      <form onSubmit={handleUpdate}>
        {/* Complex form logic */}
      </form>
      <div>
        {/* Analytics tracking */}
      </div>
    </div>
  );
}
```

### Props Design

```typescript
// ✅ Good - Explicit props
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

// ❌ Bad - Unclear props
interface ButtonProps {
  [key: string]: any;  // Too flexible
}
```

---

## TypeScript

### Type Safety

```typescript
// ✅ Good - Explicit types
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ Bad - Any types
function calculateTotal(items: any): any {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### Type Guards

```typescript
// ✅ Good - Type guards
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value
  );
}

if (isUser(data)) {
  console.log(data.email);  // TypeScript knows it's a User
}
```

---

**Last Updated**: 2025-01-24  
**Maintainer**: Nautilus One Team
