# Guia de Deployment

## Ambientes

| Ambiente | URL | Branch |
|----------|-----|--------|
| Development | localhost:5173 | feature/* |
| Staging | staging.app.com | develop |
| Production | app.com | main |

## Variáveis de Ambiente

### Obrigatórias

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

### Opcionais

```env
VITE_MAPBOX_TOKEN=xxx
VITE_SENTRY_DSN=xxx
VITE_POSTHOG_KEY=xxx
```

## Deploy via Lovable

1. Clique em **Publish** no editor
2. Selecione o ambiente
3. Clique em **Update**

Frontend é deployado automaticamente. Edge Functions deployam instantaneamente.

## Deploy Manual

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

### Vercel/Netlify

1. Conecte o repositório GitHub
2. Configure build command: `npm run build`
3. Configure output directory: `dist`
4. Adicione variáveis de ambiente

## Supabase

### Migrations

```bash
# Aplicar migrations
supabase db push

# Gerar nova migration
supabase migration new nome_da_migration
```

### Edge Functions

```bash
# Deploy todas
supabase functions deploy

# Deploy específica
supabase functions deploy nome-da-funcao
```

## Checklist de Deploy

- [ ] Testes passando
- [ ] Build sem erros
- [ ] Variáveis configuradas
- [ ] Migrations aplicadas
- [ ] Edge Functions deployadas
- [ ] Monitoramento ativo

## Rollback

### Frontend

Use o histórico do Lovable ou reverta commit no GitHub.

### Database

```bash
# Ver migrations aplicadas
supabase migration list

# Reverter última
supabase db reset
```

## Monitoramento

- **Sentry**: Erros de frontend
- **Supabase Dashboard**: Logs de Edge Functions
- **PostHog**: Analytics de uso
