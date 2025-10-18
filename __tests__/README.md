# 🧪 Testes Automatizados Essenciais

Este diretório contém os testes automatizados essenciais para validar os módulos core do sistema Nautilus One.

## 📁 Estrutura de Testes

```
__tests__/
├── templates.test.tsx      # Templates com IA - CRUD operations
├── forecast.test.ts        # Forecast IA - AI predictions
├── assistant.test.ts       # Assistente IA - GPT-4 interactions
├── mmi.test.ts            # MMI - Maritime Maintenance Intelligence
├── audit.test.tsx         # Auditoria Técnica - Audit system
├── system-health.test.tsx # System Health - E2E health checks
├── protected-routes.test.tsx # Protected Routes - Auth validation
└── README.md              # Este arquivo
```

## 🎯 Objetivo dos Testes

Estes testes garantem:

✅ **Estabilidade**: Validam que os módulos core estão funcionando  
✅ **Regressão Controlada**: Protegem contra quebras acidentais  
✅ **Confiança no Deploy**: Garantem que não há erros críticos  
✅ **Rotas Acessíveis**: Confirmam que as rotas estão funcionando  
✅ **IA Responde**: Validam que a IA está operacional  

## 📦 Framework & Ferramentas

- **Vitest**: Framework de testes unitários e de integração
- **@testing-library/react**: Testes de componentes React
- **Mock Services**: Mocks para OpenAI, Supabase, e outras APIs

## 🧪 Módulos Testados

### 1. Templates com IA (`templates.test.tsx`)
**Tipo**: Unit + UI  
**Cobertura**: 4 testes
- Renderização da página
- Operações de API
- Validação de estrutura de dados
- Criação de templates via API

### 2. Forecast IA (`forecast.test.ts`)
**Tipo**: Unit  
**Cobertura**: 4 testes
- Geração de forecast com contexto
- Validação de estrutura de dados
- Processamento de trend data
- Validação de resposta da IA

### 3. Assistente IA (`assistant.test.ts`)
**Tipo**: Unit  
**Cobertura**: 6 testes
- Envio de prompt e resposta GPT-4
- Validação de estrutura de mensagem
- Processamento de múltiplos prompts
- Validação de system prompt
- Validação de resposta útil
- Histórico de conversação

### 4. MMI - Maritime Maintenance Intelligence (`mmi.test.ts`)
**Tipo**: Unit  
**Cobertura**: 7 testes
- Criação de novo job
- Validação de estrutura de job
- Geração de forecast por job
- Listagem de jobs por vessel
- Validação de sistemas disponíveis
- Cálculo de métricas de jobs
- Validação de forecast

### 5. Auditoria Técnica (`audit.test.tsx`)
**Tipo**: UI  
**Cobertura**: 7 testes
- Renderização da página
- Validação de props
- Estrutura de dados de auditoria
- Cálculo de score total
- Categorias de findings
- Status de auditoria
- Listagem de auditorias

### 6. System Health (`system-health.test.tsx`)
**Tipo**: E2E Simple  
**Cobertura**: 6 testes
- Status do sistema em /admin/api-status
- Estrutura de resposta de health check
- Validação de service status
- Cálculo de overall status
- Detecção de sistema unhealthy
- Validação de response time

### 7. Protected Routes (`protected-routes.test.tsx`)
**Tipo**: E2E Simple  
**Cobertura**: 9 testes
- Usuário sem login não acessa /admin/*
- Redirecionamento para /unauthorized
- Verificação de autenticação
- Lista de rotas protegidas
- Validação de rotas públicas
- Usuário autenticado pode acessar /admin/*
- Estrutura de usuário autenticado
- Lógica de redirect para login
- Renderização de página Unauthorized

## 🚀 Como Executar

### Rodar todos os testes essenciais
```bash
npm run test -- __tests__
```

### Rodar teste específico
```bash
npm run test -- __tests__/templates.test.tsx
npm run test -- __tests__/forecast.test.ts
npm run test -- __tests__/assistant.test.ts
```

### Rodar com coverage
```bash
npm run test:coverage -- __tests__
```

### Rodar em modo watch
```bash
npm run test:watch -- __tests__
```

### Rodar com UI interativa
```bash
npm run test:ui
```

## 📊 Resultados

**Total de Testes**: 43  
**Status**: ✅ Todos passando  

Detalhamento:
- templates.test.tsx: 4 testes ✅
- forecast.test.ts: 4 testes ✅
- assistant.test.ts: 6 testes ✅
- mmi.test.ts: 7 testes ✅
- audit.test.tsx: 7 testes ✅
- system-health.test.tsx: 6 testes ✅
- protected-routes.test.tsx: 9 testes ✅

## 🎨 Padrão de Testes

Todos os testes seguem o padrão AAA (Arrange, Act, Assert):

```typescript
it("deve fazer algo específico", async () => {
  // Arrange: Configurar o ambiente de teste
  const input = { ... };
  
  // Act: Executar a ação
  const result = await functionToTest(input);
  
  // Assert: Validar o resultado
  expect(result).toBe(expectedValue);
});
```

## 🔧 Mocks

Os testes utilizam mocks para:
- **OpenAI API**: Simula respostas do GPT-4
- **Supabase**: Simula operações de banco de dados
- **Auth Context**: Simula usuário autenticado/não autenticado
- **Organization Context**: Simula contexto de organização
- **Toast Notifications**: Simula notificações

## 🚦 CI/CD

Estes testes são executados automaticamente:
- Em cada pull request
- Em cada commit na branch main
- Antes de deploy em produção

## 📝 Adicionando Novos Testes

Para adicionar novos testes neste diretório:

1. Crie um arquivo com o padrão `*.test.ts` ou `*.test.tsx`
2. Importe as ferramentas necessárias do Vitest
3. Utilize os mocks existentes como referência
4. Siga o padrão AAA (Arrange, Act, Assert)
5. Adicione documentação no topo do arquivo

## 🔗 Links Úteis

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library React](https://testing-library.com/docs/react-testing-library/intro/)
- [Guia de Testes do Projeto](../TESTING_LIBRARY_QUICKREF.md)

## ✅ Benefícios

Após implementação destes testes:
- ✅ Validação em segundos com `npm run test`
- ✅ Garantia de que módulos core continuam operacionais
- ✅ Proteção contra quebras acidentais
- ✅ Base pronta para CI/CD via GitHub Actions
- ✅ Confiança para refatorações
- ✅ Documentação viva do comportamento do sistema
