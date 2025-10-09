# Centro de Ajuda Module

## Purpose / Description

The Centro de Ajuda (Help Center) module provides **comprehensive help, support, and knowledge management** for users with documentation, tutorials, FAQs, and support ticketing.

**Key Use Cases:**
- Access help documentation and guides
- Search knowledge base articles
- Submit and track support tickets
- View video tutorials and walkthroughs
- FAQ and troubleshooting guides
- Live chat support (future)
- User feedback and suggestions

## Folder Structure

```bash
src/modules/centro-ajuda/
├── components/      # Help center UI components (ArticleViewer, SearchBar, TicketForm)
├── pages/           # Help pages (Knowledge Base, Tutorials, Support)
├── hooks/           # Hooks for help content and search
├── services/        # Help services and ticket management
├── types/           # TypeScript types for articles, tickets
└── utils/           # Help utilities and search algorithms
```

## Main Components / Files

- **ArticleViewer.tsx** — Display help articles
- **SearchBar.tsx** — Search help content
- **TicketForm.tsx** — Submit support tickets
- **TutorialPlayer.tsx** — Interactive tutorial player
- **helpService.ts** — Help content service
- **ticketService.ts** — Support ticket management

## External Integrations

- **Supabase** — Knowledge base and ticket storage
- **Search API** — Full-text search for help content
- **Assistente IA Module** — AI-powered help suggestions

## Status

🟢 **Functional** — Help center operational

## TODOs / Improvements

- [ ] Add video tutorial library
- [ ] Implement live chat support
- [ ] Add community forum
- [ ] Create interactive guided tours
- [ ] Add multilingual help content
- [ ] Implement help content analytics
- [ ] Add contextual help based on user location
