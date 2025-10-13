# 🔄 CI/CD Process Documentation - Travel HR Buddy

## 📋 Overview

Este documento descreve o processo de Integração Contínua e Entrega Contínua (CI/CD) para o projeto Travel HR Buddy.

## 🏗️ Arquitetura CI/CD

```
┌─────────────┐
│   GitHub    │
│ Repository  │
└──────┬──────┘
       │
       │ Push/PR
       ▼
┌─────────────┐
│   GitHub    │
│  Actions    │ (Build, Lint, Test)
└──────┬──────┘
       │
       │ Success
       ▼
┌─────────────┐
│   Vercel    │
│   Deploy    │ (Automatic)
└──────┬──────┘
       │
       │ Deploy Success
       ▼
┌─────────────┐
│   Sentry    │
│ Monitoring  │
└─────────────┘
```

## 🚀 Pipeline Stages

### 1. Code Quality Checks (Local)

Antes de fazer commit:

```bash
# Lint
npm run lint

# Format check
npm run format:check

# Tests
npm run test

# Build
npm run build
```

### 2. Pre-commit Hooks (Opcional)

Instalar Husky para hooks automáticos:

```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm run test"
```

### 3. Pull Request Workflow

Quando um PR é criado:

1. **Automated Checks** (via GitHub Actions - se configurado)
   - ✅ Lint code
   - ✅ Run tests
   - ✅ Build project
   - ✅ Check bundle size

2. **Code Review**
   - Manual review necessário
   - Aprovação de pelo menos 1 revisor

3. **Merge to Main**
   - Squash and merge recomendado
   - Delete branch após merge

### 4. Deployment (Automatic)

Após merge para `main`:

1. **Vercel Build**
   ```bash
   npm install
   npm run build
   ```

2. **Deploy Preview**
   - URL temporária gerada
   - Testes de smoke

3. **Production Deploy**
   - Rollout gradual
   - Health checks
   - Monitoring ativo

## 📝 Scripts Disponíveis

### Development

```bash
npm run dev              # Inicia servidor de desenvolvimento
npm run preview          # Preview do build de produção
```

### Code Quality

```bash
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix lint issues
npm run format           # Format code with Prettier
npm run format:check     # Check formatting
```

### Testing

```bash
npm run test             # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Generate coverage report
npm run test:ui          # Vitest UI
```

### Build

```bash
npm run build            # Production build
npm run build:dev        # Development build
```

### Utilities

```bash
npm run clean:logs       # Remove console.logs
npm run validate:api-keys # Validate API keys
```

## 🔧 GitHub Actions Configuration (Opcional)

Criar `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [20.x, 22.x]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Lint
      run: npm run lint
    
    - name: Test
      run: npm run test
    
    - name: Build
      run: npm run build
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/coverage-final.json
```

## 🎯 Branch Strategy

### Main Branch
- **Sempre** estável
- Deploy automático para produção
- Apenas aceita merges via PR

### Feature Branches
```bash
git checkout -b feature/nome-da-feature
git checkout -b fix/nome-do-fix
git checkout -b hotfix/nome-do-hotfix
```

### Naming Convention
- `feature/` - Nova funcionalidade
- `fix/` - Correção de bug
- `hotfix/` - Correção urgente em produção
- `refactor/` - Refatoração de código
- `docs/` - Apenas documentação
- `test/` - Apenas testes

## 📊 Quality Gates

### Métricas Mínimas

- **Test Coverage**: > 80%
- **Lint Errors**: 0
- **Build Success**: ✅
- **Bundle Size**: < 7MB
- **TypeScript Errors**: 0

### Performance Budgets

```javascript
// vite.config.ts
export default {
  build: {
    chunkSizeWarningLimit: 1700, // KB
  }
}
```

## 🔍 Monitoring e Alertas

### Sentry Integration

Erros são automaticamente reportados ao Sentry:

```typescript
// src/lib/logger.ts
if (isProduction && window.Sentry) {
  window.Sentry.captureException(error);
}
```

### Vercel Analytics

Métricas de performance automáticas:
- Real Experience Score (RES)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)

## 🚨 Incident Response

### Detecção de Problemas

1. **Sentry Alert** → Email/Slack notification
2. **Vercel Deploy Failed** → Check logs
3. **User Report** → Create issue

### Rollback Procedure

```bash
# Via Vercel Dashboard
1. Go to Deployments
2. Find previous stable deployment
3. Click "Promote to Production"

# Via CLI
vercel rollback
```

### Hotfix Procedure

```bash
# 1. Create hotfix branch from main
git checkout main
git pull
git checkout -b hotfix/critical-issue

# 2. Apply fix
# ... make changes ...

# 3. Test locally
npm run test
npm run build

# 4. Commit and push
git add .
git commit -m "hotfix: description"
git push origin hotfix/critical-issue

# 5. Create PR and merge immediately after approval
```

## 📈 Performance Tracking

### Weekly Review

- [ ] Check Sentry error trends
- [ ] Review Vercel analytics
- [ ] Monitor bundle size
- [ ] Test coverage trends
- [ ] Response time metrics

### Monthly Review

- [ ] Full performance audit
- [ ] Dependency updates
- [ ] Security scan
- [ ] Lighthouse report
- [ ] User feedback analysis

## 🔐 Security Practices

### Secret Management

```bash
# NEVER commit secrets
# Use .env.local for local development
# Use Vercel Environment Variables for production
```

### Dependency Audits

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Check outdated
npm outdated
```

### Security Headers

Configurados em `vercel.json`:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block

## 📚 Best Practices

### Commits

```bash
# Use conventional commits
feat: add new feature
fix: correct bug
docs: update documentation
style: format code
refactor: restructure code
test: add tests
chore: update dependencies
```

### Code Review Checklist

- [ ] Code follows project style guide
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console.log/console.error (use logger)
- [ ] No hardcoded credentials
- [ ] TypeScript types properly defined
- [ ] Performance considered
- [ ] Accessibility maintained

## 🆘 Troubleshooting

### Build Failures

```bash
# Clear cache
rm -rf node_modules dist .vite
npm install

# Check for TypeScript errors
npx tsc --noEmit

# Check for dependency issues
npm ls
```

### Test Failures

```bash
# Run specific test
npm run test -- path/to/test.ts

# Debug with UI
npm run test:ui

# Check coverage
npm run test:coverage
```

### Deploy Issues

1. Check Vercel deployment logs
2. Verify environment variables
3. Test build locally
4. Check Supabase connection
5. Review Sentry for runtime errors

## 📞 Support Contacts

- **DevOps**: devops@empresa.com
- **Tech Lead**: tech-lead@empresa.com
- **On-call**: oncall@empresa.com

---

**Última atualização**: 2025-10-13
**Versão**: 1.0
**Maintainer**: Development Team
