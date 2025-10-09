# Sentry Integration - Quick Start

## 🚀 Implementação Completa

O Sentry está configurado e pronto para uso! Veja os detalhes abaixo.

## ⚡ Configuração Rápida (5 minutos)

### 1. Criar Conta no Sentry
- Acesse [sentry.io](https://sentry.io) e crie uma conta gratuita
- Crie um novo projeto do tipo **React**

### 2. Configurar `.env`
Crie o arquivo `.env` na raiz do projeto:

```env
VITE_SENTRY_DSN=https://sua-chave@o0.ingest.sentry.io/0
```

**Onde encontrar o DSN:**
- Dashboard do Sentry → Settings → Projects → [Seu Projeto] → Client Keys (DSN)

### 3. Testar
```typescript
import { testSentryError } from "@/utils/sentry-examples";

// Em qualquer componente
testSentryError();
```

Acesse o dashboard do Sentry e veja o erro aparecer!

## 📚 Documentação Completa

- **[SENTRY_SETUP_GUIDE.md](./SENTRY_SETUP_GUIDE.md)** - Guia completo em português
- **[SENTRY_IMPLEMENTATION_SUMMARY.md](./SENTRY_IMPLEMENTATION_SUMMARY.md)** - Resumo técnico
- **[src/utils/sentry-examples.tsx](./src/utils/sentry-examples.tsx)** - Exemplos de uso

## 🎯 O Que Foi Instalado

```json
{
  "dependencies": {
    "@sentry/react": "^10.19.0"
  },
  "devDependencies": {
    "@sentry/vite-plugin": "^4.3.0"
  }
}
```

## 📁 Arquivos Criados/Modificados

### Criados
- `sentry.client.config.ts` - Configuração do Sentry
- `SENTRY_SETUP_GUIDE.md` - Guia completo
- `src/utils/sentry-examples.tsx` - Exemplos

### Modificados
- `vite.config.ts` - Plugin do Sentry
- `src/main.tsx` - Importa configuração
- `.env.example` - Variáveis necessárias

## 🛡️ Recursos Habilitados

✅ **Error Tracking** - Captura automática de erros JavaScript
✅ **Performance Monitoring** - Rastreamento de performance
✅ **Session Replay** - Gravação de sessões com erro (privacidade preservada)
✅ **Source Maps** - Upload automático durante build
✅ **Breadcrumbs** - Rastreamento de ações do usuário
✅ **Custom Context** - Tags e contexto customizados

## 🔒 Privacidade & Segurança

- ✅ Todo texto é mascarado nas gravações
- ✅ Todas as mídias são bloqueadas
- ✅ Variáveis sensíveis não são commitadas
- ✅ Source maps só são enviados se configurado

## 💡 Exemplos de Uso Rápido

### Capturar Erro Manualmente
```typescript
import * as Sentry from "@sentry/react";

try {
  // código que pode falhar
} catch (error) {
  Sentry.captureException(error);
}
```

### Adicionar Contexto do Usuário
```typescript
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name
});
```

### Rastrear Ações
```typescript
Sentry.addBreadcrumb({
  message: "Usuário clicou no botão",
  category: "action",
  level: "info"
});
```

### ErrorBoundary em React
```tsx
import { ErrorBoundary } from "@sentry/react";

function App() {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

## 🧪 Testar a Integração

### Método 1: Usar Função de Teste
```typescript
import { testSentryError } from "@/utils/sentry-examples";
testSentryError();
```

### Método 2: Erro Manual
```typescript
throw new Error("Teste do Sentry!");
```

### Método 3: Console do Navegador
```javascript
throw new Error("Teste via console");
```

## 📊 Visualizar Erros

1. Acesse [sentry.io](https://sentry.io)
2. Navegue até seu projeto
3. Clique em **Issues** para ver erros
4. Clique em **Session Replay** para ver gravações
5. Clique em **Performance** para métricas

## ⚙️ Configuração Avançada (Opcional)

### Upload de Source Maps
Para habilitar upload automático de source maps:

```env
SENTRY_ORG=seu-org-slug
SENTRY_PROJECT=seu-projeto
SENTRY_AUTH_TOKEN=seu-token
```

### Ajustar Sample Rates
Edite `sentry.client.config.ts`:

```typescript
{
  tracesSampleRate: 0.1,  // 10% em produção
  replaysSessionSampleRate: 0.01,  // 1% em produção
}
```

## 🐛 Troubleshooting

### Erros não aparecem no Sentry
- ✓ Verifique se `VITE_SENTRY_DSN` está no `.env`
- ✓ Confirme que o DSN está correto
- ✓ Verifique console do navegador

### Build falha
- ✓ Remova `SENTRY_AUTH_TOKEN` se não configurado
- ✓ Verifique se os pacotes foram instalados corretamente

## 📞 Suporte

- [Documentação Oficial](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Guia Completo](./SENTRY_SETUP_GUIDE.md)
- [Exemplos de Código](./src/utils/sentry-examples.tsx)

## ✅ Checklist de Implementação

- [x] Instalar dependências
- [x] Criar configuração
- [x] Atualizar main.tsx
- [x] Configurar Vite
- [x] Documentar
- [ ] Criar conta Sentry (você)
- [ ] Configurar .env (você)
- [ ] Testar erro (você)
- [ ] Configurar alertas (você)

---

**Pronto para usar!** 🎉

Configure o `.env` e comece a monitorar erros imediatamente.
