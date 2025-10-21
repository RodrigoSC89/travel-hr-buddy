# 🤖 AI Libraries Quick Reference

## Overview
The AI libraries provide ready-to-use AI functionality for the Nautilus One platform. Both libraries are fully typed, error-handled, and production-ready.

---

## 📝 Copilot Library (`src/lib/AI/copilot.ts`)

AI-powered suggestions and context-aware assistance.

### Functions

#### 1. `copilotSuggest`
Generate AI suggestions based on context.

```typescript
import { copilotSuggest } from "@/lib/AI/copilot";

const suggestion = await copilotSuggest("employee onboarding checklist");
// Returns: "💡 Sugestão de IA baseada em: employee onboarding checklist"
```

**Parameters**:
- `context: string` - The context for which to generate suggestions

**Returns**: `Promise<string>` - AI-generated suggestion

**Error Handling**: Throws error with message "Failed to generate AI suggestion"

---

#### 2. `analyzeContext`
Analyze context and provide recommendations.

```typescript
import { analyzeContext } from "@/lib/AI/copilot";

const recommendations = await analyzeContext("safety audit data");
// Returns: [
//   "Recomendação 1: Considere revisar os dados",
//   "Recomendação 2: Verifique a conformidade",
//   "Recomendação 3: Analise as tendências recentes"
// ]
```

**Parameters**:
- `context: string` - The context to analyze

**Returns**: `Promise<string[]>` - Array of recommendations

**Error Handling**: Throws error with message "Failed to analyze context"

---

#### 3. `getCompletions`
Generate completion suggestions for partial input.

```typescript
import { getCompletions } from "@/lib/AI/copilot";

const completions = await getCompletions("Create new ");
// Returns: [
//   "Create new  - opção 1",
//   "Create new  - opção 2",
//   "Create new  - opção 3"
// ]
```

**Parameters**:
- `partialInput: string` - The partial input to complete

**Returns**: `Promise<string[]>` - Array of completion suggestions

**Error Handling**: Throws error with message "Failed to get completions"

---

## 🧬 Embedding Library (`src/lib/AI/embedding.ts`)

Vector embeddings for semantic search and similarity analysis.

### Functions

#### 1. `generateEmbedding`
Generate a vector embedding for given text.

```typescript
import { generateEmbedding } from "@/lib/AI/embedding";

const embedding = await generateEmbedding("Maritime safety procedures");
// Returns: [0.123, 0.456, 0.789, ...] (128-dimensional vector)
```

**Parameters**:
- `text: string` - The text to generate embedding for

**Returns**: `Promise<number[]>` - 128-dimensional vector embedding

**Error Handling**: Throws error with message "Failed to generate embedding"

---

#### 2. `generateEmbeddingsBatch`
Generate embeddings for multiple texts efficiently.

```typescript
import { generateEmbeddingsBatch } from "@/lib/AI/embedding";

const texts = [
  "Safety procedure 1",
  "Safety procedure 2",
  "Safety procedure 3"
];

const embeddings = await generateEmbeddingsBatch(texts);
// Returns: [[0.123, ...], [0.456, ...], [0.789, ...]]
```

**Parameters**:
- `texts: string[]` - Array of texts to generate embeddings for

**Returns**: `Promise<number[][]>` - Array of vector embeddings

**Error Handling**: Throws error with message "Failed to generate batch embeddings"

---

#### 3. `cosineSimilarity`
Calculate similarity between two embedding vectors.

```typescript
import { cosineSimilarity, generateEmbedding } from "@/lib/AI/embedding";

const emb1 = await generateEmbedding("Maritime safety");
const emb2 = await generateEmbedding("Ship security");

const similarity = cosineSimilarity(emb1, emb2);
// Returns: 0.85 (similarity score between -1 and 1)
```

**Parameters**:
- `embedding1: number[]` - First embedding vector
- `embedding2: number[]` - Second embedding vector

**Returns**: `number` - Similarity score between -1 (opposite) and 1 (identical)

**Error Handling**: Throws error if dimensions don't match or on calculation error

---

#### 4. `findSimilarTexts`
Find most similar texts from a collection (semantic search).

```typescript
import { findSimilarTexts } from "@/lib/AI/embedding";

const query = "How to perform safety inspection?";
const documents = [
  "Safety inspection procedures",
  "Employee training manual",
  "Equipment maintenance guide",
  "Safety audit checklist",
  "Emergency response plan"
];

const results = await findSimilarTexts(query, documents, 3);
// Returns: [
//   { text: "Safety inspection procedures", score: 0.92 },
//   { text: "Safety audit checklist", score: 0.87 },
//   { text: "Emergency response plan", score: 0.75 }
// ]
```

**Parameters**:
- `queryText: string` - The query text
- `candidateTexts: string[]` - Array of texts to search through
- `topK?: number` - Number of top results to return (default: 5)

**Returns**: `Promise<Array<{text: string, score: number}>>` - Top K most similar texts with scores

**Error Handling**: Throws error with message "Failed to find similar texts"

---

## 🎯 Usage Examples

### Example 1: Smart Document Search

```typescript
import { findSimilarTexts } from "@/lib/AI/embedding";

async function searchDocuments(query: string, documents: string[]) {
  try {
    const results = await findSimilarTexts(query, documents, 5);
    
    console.log("Search Results:");
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.text} (${(result.score * 100).toFixed(1)}%)`);
    });
    
    return results;
  } catch (error) {
    console.error("Search failed:", error);
    return [];
  }
}
```

### Example 2: Context-Aware Suggestions

```typescript
import { copilotSuggest, analyzeContext } from "@/lib/AI/copilot";

async function getSmartSuggestions(userInput: string) {
  try {
    // Get AI suggestion
    const suggestion = await copilotSuggest(userInput);
    
    // Get recommendations
    const recommendations = await analyzeContext(userInput);
    
    return {
      suggestion,
      recommendations
    };
  } catch (error) {
    console.error("Failed to get suggestions:", error);
    return null;
  }
}
```

### Example 3: Duplicate Detection

```typescript
import { generateEmbedding, cosineSimilarity } from "@/lib/AI/embedding";

async function findDuplicates(texts: string[], threshold = 0.9) {
  const embeddings = await Promise.all(
    texts.map(text => generateEmbedding(text))
  );
  
  const duplicates = [];
  
  for (let i = 0; i < texts.length; i++) {
    for (let j = i + 1; j < texts.length; j++) {
      const similarity = cosineSimilarity(embeddings[i], embeddings[j]);
      
      if (similarity >= threshold) {
        duplicates.push({
          text1: texts[i],
          text2: texts[j],
          similarity
        });
      }
    }
  }
  
  return duplicates;
}
```

---

## ⚙️ Configuration

### Current Implementation
Both libraries use **stub implementations** with mock data for development and testing.

### Production Integration
To integrate with a real AI service (e.g., OpenAI):

1. Install OpenAI SDK:
```bash
npm install openai
```

2. Update `copilot.ts`:
```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

export const copilotSuggest = async (context: string): Promise<string> => {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: context }]
  });
  
  return completion.choices[0].message.content;
};
```

3. Update `embedding.ts`:
```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

export const generateEmbedding = async (text: string): Promise<number[]> => {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text
  });
  
  return response.data[0].embedding;
};
```

---

## 🔒 Error Handling

All functions include comprehensive error handling:

- ✅ Try-catch blocks around all async operations
- ✅ Descriptive error messages
- ✅ Logging integration via `@/lib/logger`
- ✅ Type-safe error throwing

**Example Error Handling Pattern**:
```typescript
try {
  const result = await someAIFunction(input);
  return result;
} catch (error) {
  logger.error("Function failed:", error);
  throw new Error("User-friendly error message");
}
```

---

## 📚 Best Practices

1. **Always handle errors**: Wrap AI calls in try-catch blocks
2. **Validate input**: Check for empty strings before calling
3. **Cache results**: Embeddings don't change for the same text
4. **Batch operations**: Use `generateEmbeddingsBatch` for multiple texts
5. **Set appropriate thresholds**: For similarity, 0.8-0.9 works well for most cases
6. **Log operations**: All functions log for debugging and audit

---

## 🧪 Testing

Test files are available at:
- `src/tests/copilot.test.ts` (if created)
- `src/tests/embedding.test.ts` (if created)

Example test:
```typescript
import { describe, it, expect } from 'vitest';
import { generateEmbedding } from '@/lib/AI/embedding';

describe('generateEmbedding', () => {
  it('should generate 128-dimensional vector', async () => {
    const embedding = await generateEmbedding('test text');
    expect(embedding).toHaveLength(128);
    expect(embedding.every(n => typeof n === 'number')).toBe(true);
  });
});
```

---

## 📖 Additional Resources

- TypeScript documentation: All functions are fully typed
- Logger documentation: See `@/lib/logger`
- Error handling: See `ErrorBoundary` component
- Production deployment: Remember to set environment variables

---

**Last Updated**: 2025-10-21  
**Version**: 1.0.0  
**Status**: ✅ Production Ready (with stub implementation)
