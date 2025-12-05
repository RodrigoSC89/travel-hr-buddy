# Nautilus One - Guia de Integração do Sistema

## 📋 Visão Geral

Sistema corporativo marítimo completo com IA avançada, compliance e analytics em tempo real.
Otimizado para redes de **até 2 MB de velocidade**.

---

## 🚀 Inicialização Rápida

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build de produção
npm run build
```

---

## 🏗️ Arquitetura do Sistema

### Estrutura de Diretórios

```
src/
├── components/          # Componentes React
│   ├── accessibility/   # Acessibilidade (A11ySettings)
│   ├── analytics/       # Dashboards de analytics
│   ├── collaboration/   # Presença em tempo real
│   ├── i18n/            # Seletor de idioma
│   ├── notifications/   # Centro de notificações
│   ├── performance/     # Monitores de performance
│   ├── pwa/             # Indicadores PWA
│   ├── system/          # Bootstrap do sistema
│   ├── ux/              # Componentes UX avançados
│   └── voice/           # Comandos de voz
├── hooks/               # Hooks customizados (index.ts centralizado)
├── lib/                 # Bibliotecas e utilitários
│   ├── accessibility/   # Gerenciador A11y
│   ├── ai/              # Assistente IA
│   ├── analytics/       # Analytics avançado
│   ├── collaboration/   # Presença real-time
│   ├── i18n/            # Internacionalização (5 idiomas)
│   ├── monitoring/      # Web Vitals + Watchdog
│   ├── notifications/   # Sistema de notificações
│   ├── performance/     # Otimizações de baixa banda
│   ├── pwa/             # Offline-first + Cache
│   ├── system/          # Configuração unificada
│   ├── ux/              # UX preditiva
│   └── voice/           # Comandos de voz
└── pages/               # Páginas da aplicação
```

---

## 🔧 Módulos Principais

### 1. PWA & Offline-First

```typescript
// Usar sync offline
import { useOfflineSync } from '@/hooks';

const { queueSync, cacheData, getCachedData } = useOfflineSync();

// Enfileirar operação para sync quando online
await queueSync({
  action: 'create',
  table: 'vessels',
  data: { name: 'Navio X' },
  priority: 'high'
});
```

### 2. Performance para Baixa Banda

```typescript
import { useBandwidthOptimizer, useCompressedFetch } from '@/hooks';

const { connectionType, shouldPreload, imageQuality } = useBandwidthOptimizer();

// Fetch com compressão automática
const { data, loading } = useCompressedFetch('/api/data');
```

### 3. Internacionalização (5 idiomas)

```typescript
import { useTranslation } from '@/hooks';

const { t, language, changeLanguage, languages } = useTranslation();

// Usar traduções
<h1>{t('common.save')}</h1>

// Trocar idioma
changeLanguage('en-US');
```

**Idiomas suportados:**
- 🇧🇷 Português (pt-BR)
- 🇺🇸 English (en-US)
- 🇪🇸 Español (es-ES)
- 🇫🇷 Français (fr-FR)
- 🇨🇳 中文 (zh-CN)

### 4. Notificações Inteligentes

```typescript
import { useNotifications } from '@/hooks';

const { add, notifications, unreadCount } = useNotifications();

// Adicionar notificação
add({
  title: 'Manutenção Urgente',
  message: 'Motor #2 requer atenção',
  priority: 'urgent',
  category: 'maintenance',
  actionUrl: '/maintenance/123'
});
```

### 5. Analytics Avançado

```typescript
import { useAdvancedAnalytics, usePageTracking } from '@/hooks';

// Tracking automático de página
usePageTracking();

// Tracking customizado
const { track, trackInteraction, trackError } = useAdvancedAnalytics();

track('vessel_selected', 'navigation', { vesselId: '123' });
```

### 6. Acessibilidade

```typescript
import { useA11y, useReducedMotion, useHighContrast } from '@/hooks';

const { settings, updateSetting, announce } = useA11y();

// Habilitar modo alto contraste
updateSetting('highContrast', true);

// Anunciar para leitores de tela
announce('Dados carregados com sucesso');
```

### 7. Comandos de Voz

```typescript
import { useVoiceCommands } from '@/hooks';

const { startListening, stopListening, isListening, transcript } = useVoiceCommands({
  onCommand: (command) => {
    console.log('Comando:', command);
  }
});
```

### 8. Colaboração em Tempo Real

```typescript
import { usePresence, useUsersOnPage } from '@/hooks';

const { user, updateStatus } = usePresence();
const { users } = useUsersOnPage('/vessels');

// Atualizar status
updateStatus('viewing', '/vessels/123');
```

---

## ⚡ Otimizações de Performance

### Configurações Automáticas por Conexão

| Conexão | Cache | TTL | Animações | Prefetch |
|---------|-------|-----|-----------|----------|
| 2G/Slow | 100MB | 30min | Desabilitadas | Não |
| 3G | 75MB | 15min | Reduzidas | Limitado |
| 4G/WiFi | 50MB | 5min | Completas | Sim |

### Hooks de Performance

```typescript
// Virtualização para listas grandes
import { useVirtualScroll, useWindowedData } from '@/hooks';

// Debounce e throttle
import { useDebouncedValue, useThrottledCallback } from '@/hooks';

// Otimização de formulários
import { useOptimizedForm, useAutoSave } from '@/hooks';
```

---

## 🔒 Segurança

### RLS (Row Level Security)

Todas as tabelas possuem políticas RLS configuradas:

```sql
-- Exemplo: usuários só veem dados da própria organização
CREATE POLICY "org_isolation" ON vessels
  FOR ALL USING (organization_id = get_current_organization_id());
```

### Autenticação

```typescript
import { useAuth } from '@/hooks';

const { user, signIn, signOut, isAuthenticated } = useAuth();
```

---

## 📱 PWA Features

### Service Worker

```typescript
import { useServiceWorker, usePWA } from '@/hooks';

const { isOnline, isInstalled, canInstall, install } = usePWA();
```

### Manifest

O arquivo `manifest.json` está configurado para:
- Instalação em dispositivos móveis
- Ícones otimizados
- Tema escuro/claro

---

## 🛠️ Configuração de Ambiente

### Variáveis de Ambiente

```env
# Supabase (já configurado)
VITE_SUPABASE_URL=https://vnbptmixvwropvanyhdb.supabase.co
VITE_SUPABASE_ANON_KEY=...

# Opcionais
VITE_USE_HASH_ROUTER=false
VITE_ENABLE_ANALYTICS=true
```

---

## 📊 Monitoramento

### Web Vitals

```typescript
import { useWebVitals } from '@/hooks';

const { metrics, score } = useWebVitals();

// metrics = [{ name: 'LCP', value: 1200, rating: 'good' }, ...]
// score = 85 (0-100)
```

### Logs de Sistema

```typescript
import { logger } from '@/lib/logger';

logger.info('Operação concluída', { module: 'vessels' });
logger.error('Erro na API', error);
logger.warn('Conexão lenta detectada');
```

---

## 🎨 Design System

### Tokens CSS (index.css)

```css
:root {
  --primary: 199 89% 48%;
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  /* ... mais tokens */
}
```

### Uso nos Componentes

```tsx
// ✅ Correto - usar tokens
<div className="bg-primary text-primary-foreground" />

// ❌ Errado - não usar cores diretas
<div className="bg-blue-500 text-white" />
```

---

## 🧪 Testes

```bash
# Rodar testes
npm run test

# Coverage
npm run test:coverage
```

---

## 📦 Build & Deploy

```bash
# Build otimizado
npm run build

# Preview do build
npm run preview
```

### Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Build sem erros
- [ ] Service Worker registrado
- [ ] HTTPS habilitado (obrigatório para PWA)
- [ ] Supabase RLS configurado

---

## 🆘 Troubleshooting

### Erro: "Offline sync failed"

```typescript
// Verificar status da fila
const { queueStatus } = useOfflineSync();
console.log(queueStatus); // { pending: 5, failed: 1 }
```

### Performance Lenta

1. Verificar conexão: `useBandwidthOptimizer()`
2. Habilitar compressão: `useCompressedFetch()`
3. Usar virtualização para listas grandes

### Notificações não funcionam

```typescript
const { permission, requestPermission } = useNotificationPermission();
if (permission !== 'granted') {
  await requestPermission();
}
```

---

## 📞 Contato

Para dúvidas técnicas, consulte a documentação adicional em `/docs/`.

---

**Nautilus One v2.0** - Sistema Marítimo Revolucionário
