# ❓ Frequently Asked Questions

## Development

### How do I start the development server?

```bash
npm run dev
```

Open http://localhost:8080

### How do I add a new page?

1. Create file in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`
3. Add navigation link if needed

### How do I add a new component?

1. Create in `src/components/`
2. Export from index file
3. Import where needed

### How do I fetch data?

Use TanStack Query:

```tsx
const { data, isLoading } = useQuery({
  queryKey: ['items'],
  queryFn: () => supabase.from('items').select('*'),
});
```

### How do I add a database table?

Create a migration in Lovable or Supabase dashboard.

### How do I add an Edge Function?

1. Create folder in `supabase/functions/`
2. Add `index.ts` with handler
3. Deploy via Lovable

## Troubleshooting

### Build fails with memory error

```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### TypeScript errors after pulling

```bash
npm install
```

### Supabase connection fails

1. Check `.env` file
2. Verify Supabase URL and key
3. Check if Supabase project is running

### Tests fail

```bash
# Clear cache and run again
npm run test -- --clearCache
```

## Architecture

### Why TanStack Query instead of Redux?

- Server state management is simpler
- Built-in caching and refetching
- Less boilerplate
- Better DevTools

### Why Supabase?

- PostgreSQL with RLS
- Built-in authentication
- Real-time subscriptions
- Edge Functions
- Storage

### Why Tailwind CSS?

- Utility-first approach
- No CSS files to maintain
- Design system via tokens
- Great DX with IntelliSense

## Deployment

### How do I deploy?

Click "Publish" in Lovable editor.

### How do I rollback?

Use Lovable's version history.

### Where are environment variables set?

In Lovable project settings or `.env` file locally.

## Still have questions?

1. Search the [documentation](./README.md)
2. Check the [codebase](../src/)
3. Ask the team
