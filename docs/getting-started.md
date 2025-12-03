# Guia de Início Rápido

## Pré-requisitos

- Node.js 18+
- npm ou bun
- Conta Supabase (para backend)

## Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd travel-hr-buddy

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env.development

# Inicie o servidor de desenvolvimento
npm run dev
```

## Configuração do Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Copie as credenciais para `.env.development`:
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=xxx
   ```
3. Execute as migrations em `supabase/migrations/`

## Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
├── modules/        # Módulos de funcionalidades
├── pages/          # Páginas/rotas
├── hooks/          # Custom hooks
├── services/       # Serviços e APIs
├── lib/            # Utilitários e helpers
├── types/          # TypeScript types
└── integrations/   # Integrações externas
```

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run test` | Executa testes |
| `npm run lint` | Executa linter |

## Próximos Passos

- [Entenda a arquitetura](./architecture.md)
- [Explore as APIs](./api/README.md)
- [Conheça as funcionalidades](./features/README.md)
