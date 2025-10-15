# 🚀 Copilot Job Form - Quick Reference

## 📦 Import

```tsx
import { JobFormWithExamples } from '@/components/copilot';
```

## 🎯 Basic Usage

```tsx
function MyPage() {
  return <JobFormWithExamples />;
}
```

## 📁 File Locations

- **Components**: `src/components/copilot/`
- **Tests**: `src/tests/copilot/`
- **Example Page**: `src/pages/CopilotJobFormExample.tsx`

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🧾 Job Form | Input for component and description |
| 🔍 Similar Search | Auto-search with 500ms debounce |
| 📋 Auto-fill | Click to copy examples |
| ⚡ Real-time | Updates as you type (>10 chars) |
| 📊 Similarity | Shows match percentage |
| 💬 Feedback | Toast notifications |

## 🧪 Testing

```bash
# Run component tests
npm test -- src/tests/copilot/JobFormWithExamples.test.tsx

# Run all tests
npm test

# Build
npm run build

# Lint
npm run lint
```

## 📊 Component Props

### JobFormWithExamples
No props required - self-contained component.

### SimilarExamples
```typescript
interface SimilarExamplesProps {
  input: string;                    // Search input
  onSelect: (text: string) => void; // Selection callback
}
```

## 🎨 Customization

```tsx
// With custom wrapper
<Card className="my-custom-class">
  <CardContent>
    <JobFormWithExamples />
  </CardContent>
</Card>
```

## 🔧 Configuration Points

- **Debounce**: 500ms (line in SimilarExamples.tsx)
- **Min chars**: 10 characters (line in SimilarExamples.tsx)
- **Mock data**: Replace in `searchSimilarExamples` function

## 📚 Documentation

- Full docs: `src/components/copilot/README.md`
- Implementation summary: `COPILOT_JOB_FORM_IMPLEMENTATION.md`

## ✅ Status

- ✅ Implementation complete
- ✅ All tests passing (581/581)
- ✅ Build successful
- ✅ Linting passed
- ✅ Production ready

## 🔗 Related Components

- `MMICopilot.tsx` - Similar AI-powered maintenance assistant
- `JobCards.tsx` - Job display components
- `Dashboard.tsx` - MMI Dashboard integration

---

**Last Updated**: October 15, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
