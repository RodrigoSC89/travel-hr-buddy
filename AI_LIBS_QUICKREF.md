# 🚀 Quick Reference - AI Libs & Type Safety

## New AI Library Exports

### Copilot Module (`src/lib/AI/copilot.ts`)

```typescript
import { copilotSuggest, analyzeText, generateCompletion } from '@/lib/AI/copilot';

// Get AI-powered suggestions
const suggestion = await copilotSuggest("Create vessel safety checklist");
// Returns: "💡 Sugestão de IA baseada em: ..."

// Analyze text with sentiment
const analysis = await analyzeText("The inspection was excellent...");
// Returns: { summary: "...", sentiment: "positive", keyPoints: [...] }

// Generate completions
const completion = await generateCompletion("Safety checklist for", "maritime vessel");
// Returns: AI-generated completion text
```

### Embedding Module (`src/lib/AI/embedding.ts`)

```typescript
import { 
  generateEmbedding, 
  cosineSimilarity,
  findMostSimilar,
  semanticSearch 
} from '@/lib/AI/embedding';

// Generate embedding for text
const embedding = await generateEmbedding("Safety inspection checklist");
// Returns: number[] (1536 dimensions)

// Calculate similarity between embeddings
const similarity = cosineSimilarity(embedding1, embedding2);
// Returns: number (0-1, higher = more similar)

// Find most similar items
const results = findMostSimilar(queryEmbedding, itemEmbeddings, 5);
// Returns: Array<{ similarity: number, data: T }>

// Semantic search across documents
const matches = await semanticSearch(
  "vessel safety procedures",
  documents,
  5
);
// Returns: Array<{ similarity: number, document: T }>
```

## Context Usage

All contexts are fully typed - no changes needed!

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useTenant } from '@/contexts/TenantContext';

const MyComponent = () => {
  const { user, signIn, signOut } = useAuth();
  const { currentOrganization, checkPermission } = useOrganization();
  const { currentTenant, formatCurrency } = useTenant();
  
  // All fully typed, no 'any'
};
```

## Hook Usage

All hooks return properly typed objects:

```typescript
import { useEnhancedNotifications } from '@/hooks/use-enhanced-notifications';
import { useMaritimeChecklists } from '@/hooks/use-maritime-checklists';
import { useUsers } from '@/hooks/use-users';

const MyComponent = () => {
  const { notifications, markAsRead, unreadCount } = useEnhancedNotifications();
  const { checklists, saveChecklist, templates } = useMaritimeChecklists(userId);
  const { users, updateUserRole, getRoleStats } = useUsers();
  
  // All fully typed
};
```

## Safe Lazy Import

Already implemented throughout the app:

```typescript
import { safeLazyImport } from '@/utils/safeLazyImport';

// Create lazy-loaded component with error handling and retry
const MyPage = safeLazyImport(
  () => import('@/pages/MyPage'),
  'MyPage'
);

// Use in routes
<Route path="/my-page" element={<MyPage />} />
```

## Build Commands

```bash
# Development build
npm run build:dev

# Production build
npm run build

# Preview production build
npm run preview

# TypeScript check
npx tsc --noEmit
```

## PWA Configuration

PWA is now automatically enabled only in production:

```typescript
// vite.config.ts
const enablePwa = mode === "production";
```

## Environment Variables

For full AI functionality, set:

```env
VITE_OPENAI_API_KEY=sk-...
```

Without API key, AI libs use mock implementations (safe for development).

## Success Criteria Checklist

- [x] ✅ Contexts typed (0/3 with @ts-nocheck)
- [x] ✅ Hooks typed (0/3 with @ts-nocheck)
- [x] ✅ AI libs functional (0/2 with @ts-nocheck)
- [x] ✅ Safe imports implemented
- [x] ✅ Build successful
- [x] ✅ Preview functional
- [x] ✅ TypeScript clean

**Status: Ready for production! 🎉**
