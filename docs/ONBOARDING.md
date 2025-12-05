# 🎯 Developer Onboarding Guide

Welcome to Nautilus One! This guide will help you get started quickly.

## Day 1: Setup & Overview

### 1. Environment Setup (30 min)

```bash
# Clone repository
git clone <repo-url>
cd nautilus-one

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development
npm run dev
```

### 2. Explore the Application (30 min)

Open http://localhost:8080 and explore:
- [ ] Login/Register flow
- [ ] Dashboard
- [ ] Crew management
- [ ] Document upload
- [ ] Settings

### 3. Read Key Documentation (1 hour)

| Priority | Document | Time |
|----------|----------|------|
| 1 | [README.md](../README.md) | 10 min |
| 2 | [ARCHITECTURE.md](./ARCHITECTURE.md) | 15 min |
| 3 | [STRUCTURE.md](./STRUCTURE.md) | 10 min |
| 4 | [Developer Guide](./development/DEVELOPER_GUIDE.md) | 25 min |

## Day 2: Deep Dive

### 4. Understand the Tech Stack

| Technology | Purpose | Learn More |
|------------|---------|------------|
| React 18 | UI Framework | [React Docs](https://react.dev) |
| TypeScript | Type Safety | [TS Handbook](https://www.typescriptlang.org/docs/) |
| Tailwind CSS | Styling | [Tailwind Docs](https://tailwindcss.com/docs) |
| TanStack Query | Server State | [Query Docs](https://tanstack.com/query) |
| Supabase | Backend | [Supabase Docs](https://supabase.com/docs) |

### 5. Explore Code Structure

```
📁 Start with these files:

src/
├── App.tsx              # Routing setup
├── main.tsx             # Entry point
├── index.css            # Design tokens
│
├── pages/
│   └── Index.tsx        # Home page
│
├── components/
│   └── ui/button.tsx    # Example component
│
└── hooks/
    └── use-auth.ts      # Auth hook example
```

### 6. Make Your First Change

1. Find a small UI improvement
2. Create a branch: `git checkout -b feature/my-first-change`
3. Make the change
4. Test locally
5. Submit PR

## Day 3: Go Deeper

### 7. Understand Database

- Check `src/integrations/supabase/types.ts` for schema
- Review RLS policies in Supabase dashboard
- Understand key tables:
  - `profiles` - User data
  - `organizations` - Tenants
  - `crew_members` - Crew records

### 8. Learn the Patterns

**Component Pattern:**
```tsx
// Container component (fetches data)
const CrewPage = () => {
  const { data } = useCrewMembers();
  return <CrewList crew={data} />;
};

// Presentational component (displays data)
const CrewList = ({ crew }) => (
  <ul>{crew.map(c => <li>{c.name}</li>)}</ul>
);
```

**Service Pattern:**
```tsx
// API calls encapsulated
const crewService = {
  getAll: () => supabase.from('crew_members').select('*'),
};
```

## Week 1: Productive Contributor

### 9. Key Areas to Understand

- [ ] Authentication flow
- [ ] Data fetching with TanStack Query
- [ ] Form handling with react-hook-form
- [ ] Toast notifications
- [ ] Error handling

### 10. Common Tasks

| Task | Files to Edit |
|------|---------------|
| Add page | `src/pages/`, `App.tsx` |
| Add component | `src/components/` |
| Add API call | `src/services/` |
| Add database table | `supabase/migrations/` |
| Add Edge Function | `supabase/functions/` |

## Resources

### Internal Docs
- [API Reference](./api/API-REFERENCE.md)
- [Testing Guide](./development/TESTING-GUIDE.md)
- [Deployment Guide](./deployment/DEPLOYMENT-GUIDE.md)

### External Resources
- [React Documentation](https://react.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Questions?

1. Check existing documentation
2. Search codebase for examples
3. Ask team members
4. Open a discussion on GitHub

---

**Welcome to the team! 🚀**
