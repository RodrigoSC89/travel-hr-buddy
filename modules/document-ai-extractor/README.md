# Document AI Extractor

**PATCH 661** - LLM to interpret regulatory documents (ISM, SOLAS, MLC)

## Overview

LLM to interpret regulatory documents (ISM, SOLAS, MLC)

## Features

- PDF query
- Checklist extraction
- Audit summary generation
- Regulation interpretation

## Usage

```typescript
import DocumentAiExtractor from "@/modules/document-ai-extractor";

// In your route configuration
<Route path="/ai/document-reader" element={<DocumentAiExtractor />} />
```

## Technical Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Database**: Supabase
- **UI Components**: shadcn/ui

## Status

🚧 Implementation in progress - PATCH 661

## Future Enhancements

- [ ] Complete core functionality
- [ ] Add comprehensive tests
- [ ] Integrate with existing modules
- [ ] Add real-time updates
- [ ] Enhance AI capabilities
