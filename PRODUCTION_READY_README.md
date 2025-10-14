# 🚀 Travel HR Buddy - Sistema Fullstack Completo

## 📋 Status do Projeto

- ✅ **Build**: Funcional (dist: 6.5MB)
- ✅ **Tests**: 240/240 passing (100% pass rate)
- ✅ **TypeScript**: Strict mode enabled
- ✅ **Logger**: Centralizado e production-ready
- ✅ **Vercel**: Ready to deploy
- ⚠️ **Lint**: 544 errors (mostly unused vars), 3777 warnings

## 🎯 Recentes Melhorias (2025-10-13)

### ✅ Correções Críticas

1. **Erro TypeScript corrigido** em `send-chart-report/index.ts`
2. **Rotas Next.js removidas** (`pages/` e `app/` directories)
3. **Configuração TypeScript** atualizada para strict mode
4. **Console.log substituídos** por logger utility (70 arquivos)
5. **React Router** atualizado com future flags

### 📦 Arquitetura

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Deploy**: Vercel
- **Monitoring**: Sentry
- **Testing**: Vitest + React Testing Library

## 🚀 Quick Start

### Instalação

```bash
# Clone o repositório
git clone https://github.com/RodrigoSC89/travel-hr-buddy.git
cd travel-hr-buddy

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais
```

### Desenvolvimento

```bash
# Inicie o servidor de desenvolvimento
npm run dev

# Acesse http://localhost:3000
```

### Build de Produção

```bash
# Build otimizado
npm run build

# Preview do build
npm run preview
```

### Testes

```bash
# Rodar todos os testes
npm run test

# Testes com coverage
npm run test:coverage

# Testes em modo watch
npm run test:watch

# UI dos testes
npm run test:ui
```

## 📁 Estrutura do Projeto

```
travel-hr-buddy/
├── src/
│   ├── components/      # Componentes React
│   ├── pages/          # Páginas/Rotas
│   ├── contexts/       # React Contexts
│   ├── hooks/          # Custom Hooks
│   ├── lib/            # Utilities (logger, etc)
│   ├── services/       # API Services
│   └── tests/          # Test files
├── supabase/
│   └── functions/      # Edge Functions
├── scripts/            # Utility scripts
├── public/             # Assets estáticos
└── dist/              # Build output (gitignored)
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev                    # Servidor de desenvolvimento
npm run preview                # Preview do build

# Build
npm run build                  # Build de produção
npm run build:dev              # Build de desenvolvimento

# Qualidade de Código
npm run lint                   # ESLint
npm run lint:fix               # Auto-fix lint issues
npm run format                 # Format com Prettier
npm run format:check           # Check formatting

# Testes
npm run test                   # Rodar testes
npm run test:watch             # Watch mode
npm run test:coverage          # Coverage report
npm run test:ui                # Vitest UI

# Utilidades
npm run clean:logs             # Remove console.logs
npm run validate:api-keys      # Valida API keys

# Deploy
npm run deploy:vercel          # Deploy para Vercel
```

## 🔐 Variáveis de Ambiente

Ver `.env.example` para lista completa. Principais variáveis:

```bash
# Supabase (Obrigatório)
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_PROJECT_ID=

# Sentry (Recomendado)
VITE_SENTRY_DSN=

# OpenAI (Opcional)
VITE_OPENAI_API_KEY=

# Mapbox (Opcional)
VITE_MAPBOX_ACCESS_TOKEN=
```

## 📚 Documentação

- [🚀 Guia de Deploy Vercel](./VERCEL_DEPLOYMENT_GUIDE.md)
- [🔄 Processo CI/CD](./CICD_PROCESS.md)
- [🔑 Setup de API Keys](./API_KEYS_SETUP_GUIDE.md)
- [📖 Documentação Técnica Completa](./DOCUMENTACAO_TECNICA_FUNCIONAL_NAUTILUS_ONE.md)

## 🏗️ Stack Tecnológico

### Frontend
- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **TailwindCSS** - Styling
- **Radix UI** - Component Primitives
- **React Router** - Navigation
- **React Query** - Data Fetching
- **Recharts** - Visualização de Dados

### Backend
- **Supabase** - Backend as a Service
- **PostgreSQL** - Database
- **Edge Functions** - Serverless Functions
- **Row Level Security** - Authorization

### DevOps
- **Vercel** - Hosting & CI/CD
- **GitHub Actions** - CI (opcional)
- **Sentry** - Error Monitoring
- **Vitest** - Testing Framework

## 🧪 Testes

O projeto possui 240 testes automatizados:

```bash
Test Files  36 passed (36)
Tests       240 passed (240)
Duration    ~41s
```

### Adicionar Novos Testes

```typescript
// src/tests/components/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## 🔍 Debugging

### Logger Utility

Use o logger ao invés de console:

```typescript
import { logger } from '@/lib/logger';

// Development only
logger.info('Info message', { context });
logger.debug('Debug message', { context });

// Always logged
logger.warn('Warning message', { context });
logger.error('Error message', error, { context });
```

### Sentry Integration

Erros são automaticamente capturados em produção:

```typescript
try {
  // código que pode falhar
} catch (error) {
  logger.error('Operation failed', error, { userId });
  // Automaticamente enviado para Sentry em produção
}
```

## 🚀 Deploy para Vercel

### Deploy Automático

Push para `main` → Deploy automático

```bash
git add .
git commit -m "feat: new feature"
git push origin main
```

### Deploy Manual

```bash
vercel --prod
```

Ver [Guia de Deploy](./VERCEL_DEPLOYMENT_GUIDE.md) para detalhes.

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Convenção de Commits

```bash
feat: nova funcionalidade
fix: correção de bug
docs: apenas documentação
style: formatação de código
refactor: refatoração
test: adição de testes
chore: tarefas de manutenção
```

## 📊 Performance

- **Bundle Size**: ~6.5MB (gzip: ~1.2MB)
- **First Contentful Paint**: < 2s
- **Time to Interactive**: < 4s
- **Lighthouse Score**: > 80

## 🔒 Segurança

- ✅ TypeScript Strict Mode
- ✅ Row Level Security (Supabase)
- ✅ Security Headers configurados
- ✅ Sem credenciais hardcoded
- ✅ HTTPS obrigatório em produção
- ✅ Content Security Policy

## 📞 Suporte

- **Issues**: https://github.com/RodrigoSC89/travel-hr-buddy/issues
- **Discussões**: https://github.com/RodrigoSC89/travel-hr-buddy/discussions
- **Email**: (configure conforme necessário)

## 📄 Licença

Este projeto é privado. Todos os direitos reservados.

## 🙏 Agradecimentos

- Supabase pela plataforma backend
- Vercel pelo hosting
- Comunidade React/TypeScript

---

**Última atualização**: 2025-10-13
**Versão**: 2.0.0
**Status**: ✅ Production Ready
