# Sentry Setup Guide

## 📦 Configuração do Sentry para Monitoramento de Erros

Este projeto está configurado com Sentry para captura e monitoramento de erros tanto no frontend (navegador) quanto durante o build.

### ✅ Arquivos Configurados

| Arquivo | Função |
|---------|--------|
| `sentry.client.config.ts` | Captura erros no navegador/frontend |
| `vite.config.ts` | Integração com Vite para upload de source maps |
| `.env.example` | Variáveis de ambiente necessárias |

### 🔧 Configuração Inicial

#### 1. Criar Conta no Sentry

1. Acesse [Sentry.io](https://sentry.io) e crie uma conta gratuita
2. Crie um novo projeto do tipo "React"
3. Copie o DSN fornecido

#### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Sentry Configuration
VITE_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
SENTRY_ORG=your-organization-slug
SENTRY_PROJECT=your-project-name
SENTRY_AUTH_TOKEN=your-auth-token
```

**Onde encontrar cada valor:**

- **VITE_SENTRY_DSN**: No dashboard do Sentry, vá em Settings > Projects > [Seu Projeto] > Client Keys (DSN)
- **SENTRY_ORG**: Slug da sua organização (visível na URL do Sentry)
- **SENTRY_PROJECT**: Nome do seu projeto no Sentry
- **SENTRY_AUTH_TOKEN**: Crie em Settings > Developer Settings > Auth Tokens
  - Permissões necessárias: `project:read`, `project:releases`, `org:read`

#### 3. Atualizar .env.example

O arquivo `.env.example` já está atualizado com as variáveis necessárias. Certifique-se de não commitar o arquivo `.env` com suas credenciais reais.

### 🧪 Testar a Integração

Para testar se o Sentry está capturando erros corretamente:

1. **Erro Forçado em Qualquer Página**

   Adicione temporariamente em qualquer componente React:

   ```tsx
   throw new Error("Sentry test error - Frontend");
   ```

2. **Através do Console do Navegador**

   ```javascript
   throw new Error("Teste de erro do Sentry via console");
   ```

3. **Erro de API**

   ```tsx
   fetch('/api/inexistente')
     .catch(error => {
       throw new Error("Erro de API capturado pelo Sentry");
     });
   ```

### 📊 Funcionalidades Habilitadas

#### Performance Monitoring
- **tracesSampleRate**: 100% das transações são capturadas
- Rastreamento de navegação e requisições HTTP

#### Session Replay
- **replaysSessionSampleRate**: 10% das sessões são gravadas
- **replaysOnErrorSampleRate**: 100% das sessões com erro são gravadas
- Privacidade: Textos e mídias são mascarados por padrão

### 🔒 Segurança e Privacidade

O Sentry está configurado para proteger dados sensíveis:

```typescript
replayIntegration({
  maskAllText: true,      // Mascara todo texto
  blockAllMedia: true,    // Bloqueia todas as mídias
})
```

### 🚀 Build e Deploy

#### Desenvolvimento
```bash
npm run dev
```
O Sentry funcionará normalmente, mas não enviará source maps.

#### Build de Produção
```bash
npm run build
```
Durante o build:
- Source maps são gerados (`sourcemap: true` no vite.config.ts)
- Se `SENTRY_AUTH_TOKEN` estiver configurado, os source maps são enviados automaticamente ao Sentry
- Isso permite que você veja o código original nos stack traces de erro

### 📈 Visualizar Erros no Sentry

1. Acesse o dashboard do Sentry
2. Navegue até seu projeto
3. Veja os erros em tempo real em "Issues"
4. Assista replays de sessões com erro em "Session Replay"
5. Analise performance em "Performance"

### 🔍 Filtros e Ambiente

Os erros são automaticamente taggeados com:
- **environment**: `development`, `staging`, ou `production`
- **release**: Versão do build (quando configurado)

### ⚙️ Ajustes de Configuração

#### Reduzir Sample Rate em Produção

Edite `sentry.client.config.ts`:

```typescript
tracesSampleRate: 0.1,  // 10% em vez de 100%
replaysSessionSampleRate: 0.01,  // 1% em vez de 10%
```

#### Adicionar Contexto Customizado

```typescript
import * as Sentry from "@sentry/react";

// Adicionar usuário
Sentry.setUser({ 
  id: user.id, 
  email: user.email,
  username: user.name 
});

// Adicionar tags
Sentry.setTag("organization", "my-org");

// Adicionar contexto
Sentry.setContext("business", {
  plan: "premium",
  feature: "advanced"
});
```

### 🐛 Troubleshooting

#### Erros não aparecem no Sentry
1. Verifique se `VITE_SENTRY_DSN` está configurado corretamente
2. Verifique se o DSN começa com `https://`
3. Confirme que a conta Sentry está ativa
4. Verifique o console do navegador para mensagens de erro do Sentry

#### Source maps não são enviados
1. Verifique se `SENTRY_AUTH_TOKEN` está configurado
2. Confirme as permissões do token
3. Verifique se `SENTRY_ORG` e `SENTRY_PROJECT` estão corretos
4. Execute `npm run build` e observe os logs do Sentry plugin

### 📚 Recursos Adicionais

- [Documentação Oficial do Sentry para React](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Sentry Vite Plugin](https://docs.sentry.io/platforms/javascript/sourcemaps/uploading/vite/)
- [Session Replay](https://docs.sentry.io/platforms/javascript/session-replay/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)

### 🎯 Próximos Passos Recomendados

1. ✅ Criar conta gratuita no Sentry.io
2. ✅ Configurar variáveis de ambiente
3. ✅ Testar com erro forçado
4. ⬜ Configurar alertas por email/Slack
5. ⬜ Integrar com CI/CD para releases automáticas
6. ⬜ Configurar ownership de código para notificações direcionadas
