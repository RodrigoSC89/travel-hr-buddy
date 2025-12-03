# AI Document Generation Feature

## Overview
This feature allows users to generate professional documents using AI, save them to Supabase database, and export them as PDF files.

## Features

### 1. Document Generation
- Generate professional documents using OpenAI GPT-4o-mini
- Provide a title and prompt to create customized documents
- AI generates well-structured, professional content in Portuguese

### 2. Save to Supabase
- Save generated documents to the Supabase database
- Documents are associated with the logged-in user
- Stores title, content, and original prompt
- Prevents duplicate saves (button disabled after saving)

### 3. Export to PDF
- Export generated documents as PDF files
- Automatic text wrapping and pagination
- Professional formatting with title and content sections
- Downloads with sanitized filename based on document title

## Database Schema

### Table: `ai_generated_documents`
```sql
CREATE TABLE public.ai_generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  prompt TEXT NOT NULL,
  generated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Row Level Security (RLS)
- Users can only view their own documents
- Users can create, update, and delete their own documents
- Enforced through Supabase RLS policies

## Usage

### Frontend Component
Located at: `src/pages/admin/documents-ai.tsx`

#### Steps to Use:
1. Navigate to the Documents AI page
2. Enter a document title
3. Describe what you want the AI to generate in the prompt field
4. Click "Gerar com IA" (Generate with AI)
5. Once generated, you can:
   - Save to Supabase (button becomes disabled after saving)
   - Export as PDF (available anytime)

### Backend Function
The Supabase Edge Function at `supabase/functions/generate-document/index.ts` handles document generation using OpenAI's API.

## Technologies Used
- **OpenAI API**: GPT-4o-mini model for document generation
- **Supabase**: Database storage and authentication
- **jsPDF**: PDF generation and export
- **React**: Frontend UI
- **TypeScript**: Type safety

## Testing
Test file: `src/tests/pages/admin/documents-ai.test.tsx`

Includes tests for:
- Page rendering
- Form inputs
- Button states
- User interactions

## Future Enhancements
- Document templates
- Document history and management
- Sharing documents with other users
- Version control for documents
- Rich text editing
- Custom PDF styling options
