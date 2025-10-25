# 🔔 PATCH 138 - Push Notifications (FCM)

**Status:** ⚠️ Parcialmente Implementado  
**Prioridade:** Alta  
**Módulo:** Firebase Cloud Messaging  
**Data:** 2025-10-25

---

## 📋 Resumo

Implementação de notificações push usando Firebase Cloud Messaging (FCM) para web e mobile, permitindo comunicação em tempo real com usuários mesmo quando o app está em background.

---

## ✅ Funcionalidades Implementadas

### 1. Firebase Configuration
- ✅ Firebase SDK instalado (`firebase` v12.4.0)
- ✅ Arquivo de configuração `src/lib/firebase.ts` criado
- ✅ Service Worker para background messages criado
- ⚠️ Credenciais Firebase precisam ser configuradas

### 2. Service Worker
**Arquivo:** `public/firebase-messaging-sw.js`
- ✅ Background message handler
- ✅ Notification click handler
- ✅ Ícones e badges configurados
- ⚠️ Placeholders para API keys precisam ser substituídos

### 3. Capacitor Integration
- ✅ `@capacitor/push-notifications` instalado
- ✅ Hook `use-notifications.ts` implementado
- ✅ Permissões configuradas
- ✅ Listeners de eventos nativos

### 4. Database Schema
**Tabela sugerida:** `user_fcm_tokens`
- ⚠️ Precisa ser criada no Supabase
- user_id, fcm_token, device_type, created_at

---

## 🧪 Checklist de Testes

### Setup Inicial
- [ ] Variáveis de ambiente Firebase configuradas
- [ ] Service worker registrado e ativo
- [ ] Firebase inicializado sem erros
- [ ] Tabela `user_fcm_tokens` criada no Supabase

### Web (Desktop)
- [ ] Permissão de notificação solicitada
- [ ] Token FCM gerado
- [ ] Token salvo no banco de dados
- [ ] Notificação de teste recebida (foreground)
- [ ] Notificação de teste recebida (background)
- [ ] Click em notificação abre o app
- [ ] Notificação mostra ícone correto
- [ ] Sound/vibration funciona

### Web (Mobile Browser)
- [ ] Permissão solicitada corretamente
- [ ] Token gerado em browser móvel
- [ ] Notificações aparecem no mobile
- [ ] Click redireciona corretamente
- [ ] Funciona em Chrome Android
- [ ] Funciona em Samsung Internet
- ⚠️ Safari iOS não suporta Web Push

### Mobile Native (Capacitor)
- [ ] Permissões solicitadas no app
- [ ] Token registrado no dispositivo
- [ ] Push recebido quando app fechado
- [ ] Push recebido quando app em background
- [ ] Push recebido quando app em foreground
- [ ] Data payload processado
- [ ] Actions/buttons funcionam
- [ ] Badge count atualizado

### Backend
- [ ] API para enviar push implementada
- [ ] Filtro por device_type funciona
- [ ] Filtro por user_id funciona
- [ ] Batch sending funciona
- [ ] Rate limiting implementado
- [ ] Logs de envio salvos

---

## 📊 Métricas de Qualidade

| Métrica | Valor Atual | Meta | Status |
|---------|-------------|------|--------|
| Token Registration Rate | N/A | > 95% | ⚠️ |
| Delivery Rate | N/A | > 90% | ⚠️ |
| Click-through Rate | N/A | > 20% | ⚠️ |
| Permission Grant Rate | N/A | > 60% | ⚠️ |
| Background Delivery | N/A | > 85% | ⚠️ |
| Latency (send → receive) | N/A | < 5s | ⚠️ |

⚠️ Métricas serão disponíveis após configuração completa do Firebase

---

## 🔧 Configuração Necessária

### 1. Firebase Console Setup
```bash
# 1. Criar projeto Firebase
# 2. Habilitar Cloud Messaging
# 3. Gerar Web credentials
# 4. Obter VAPID key
# 5. Configurar domínios autorizados
```

### 2. Variáveis de Ambiente
**Arquivo:** `.env`
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=sender-id
VITE_FIREBASE_APP_ID=app-id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_FIREBASE_VAPID_KEY=your-vapid-key
```

### 3. Service Worker Update
**Arquivo:** `public/firebase-messaging-sw.js`

Substituir placeholders:
```javascript
firebase.initializeApp({
  apiKey: 'YOUR_API_KEY', // ← Substituir
  authDomain: 'YOUR_AUTH_DOMAIN', // ← Substituir
  projectId: 'YOUR_PROJECT_ID', // ← Substituir
  storageBucket: 'YOUR_STORAGE_BUCKET', // ← Substituir
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID', // ← Substituir
  appId: 'YOUR_APP_ID' // ← Substituir
});
```

### 4. Supabase Schema
```sql
CREATE TABLE user_fcm_tokens (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  fcm_token text NOT NULL,
  device_type text NOT NULL CHECK (device_type IN ('web', 'android', 'ios')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, device_type)
);

ALTER TABLE user_fcm_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own tokens"
  ON user_fcm_tokens FOR ALL
  USING (auth.uid() = user_id);
```

---

## 📱 Implementação por Plataforma

### Web Push (Browser)
**Arquivo:** `src/lib/firebase.ts`

```typescript
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Solicitar permissão e obter token
export const requestNotificationPermission = async () => {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    const token = await getToken(messaging, {
      vapidKey: VITE_FIREBASE_VAPID_KEY
    });
    // Salvar token no banco
    await saveTokenToDatabase(token, 'web');
    return token;
  }
};

// Listener para foreground messages
export const onForegroundMessage = (callback) => {
  onMessage(messaging, (payload) => {
    callback(payload);
  });
};
```

### Native Push (Capacitor)
**Arquivo:** `src/hooks/use-notifications.ts`

```typescript
import { PushNotifications } from '@capacitor/push-notifications';

// Já implementado ✅
const initializeNotifications = async () => {
  await PushNotifications.requestPermissions();
  await PushNotifications.register();
  
  PushNotifications.addListener('registration', (token) => {
    // Salvar token
    saveTokenToDatabase(token.value, 'android');
  });
  
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    // Processar notificação
  });
};
```

---

## 📤 Envio de Notificações

### Método 1: Firebase Console
1. Firebase Console > Cloud Messaging
2. "Send test message"
3. Inserir token FCM
4. Configurar título/corpo/imagem
5. Enviar

### Método 2: Admin SDK (Backend)
```typescript
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const message = {
  notification: {
    title: 'Novo Incidente',
    body: 'Incidente reportado no Vessel XYZ'
  },
  data: {
    type: 'incident',
    id: 'incident-123',
    url: '/incidents/incident-123'
  },
  token: userFcmToken
};

await admin.messaging().send(message);
```

### Método 3: Edge Function (Supabase)
```typescript
import { createClient } from '@supabase/supabase-js';

const sendPushToUser = async (userId: string, notification: any) => {
  // 1. Buscar tokens do usuário
  const { data: tokens } = await supabase
    .from('user_fcm_tokens')
    .select('fcm_token, device_type')
    .eq('user_id', userId);
  
  // 2. Enviar para cada token
  const promises = tokens.map(({ fcm_token }) => 
    sendFCMNotification(fcm_token, notification)
  );
  
  await Promise.all(promises);
};
```

---

## 🎨 Tipos de Notificações

### 1. Notification-only
```json
{
  "notification": {
    "title": "Título",
    "body": "Mensagem",
    "icon": "/icon.png",
    "badge": "/badge.png"
  }
}
```

### 2. Data-only (Silent)
```json
{
  "data": {
    "type": "sync",
    "action": "refresh",
    "timestamp": "2025-10-25T10:00:00Z"
  }
}
```

### 3. Hybrid (Notification + Data)
```json
{
  "notification": {
    "title": "Novo Incidente",
    "body": "Vessel XYZ reportou incidente"
  },
  "data": {
    "type": "incident",
    "id": "incident-123",
    "severity": "high"
  }
}
```

---

## 🐛 Problemas Conhecidos

### Web
- ⚠️ Safari (macOS/iOS) não suporta Web Push com FCM
- ⚠️ Notificações só funcionam em HTTPS
- ⚠️ Service worker precisa estar no root (`/`)
- ⚠️ Token pode expirar e precisar refresh

### Mobile Native
- ⚠️ iOS requer certificado APNs configurado
- ⚠️ Android requer google-services.json
- ⚠️ Permissões podem ser negadas pelo usuário
- ⚠️ Background restrictions podem bloquear notificações

### Geral
- ⚠️ Rate limits do FCM (1000 req/s)
- ⚠️ Payload limitado a 4KB
- ⚠️ Entrega não garantida (best effort)
- ⚠️ Latência pode variar (1s-5s+)

---

## 🔐 Segurança

### Best Practices
- ✅ Tokens são públicos (domain-restricted)
- ✅ Server key deve ser privada
- ✅ Validar origem das mensagens
- ✅ Sanitizar conteúdo das notificações
- ✅ Rate limiting no backend
- ✅ Revocar tokens inativos

### RLS Policies
```sql
-- Usuários só veem seus próprios tokens
CREATE POLICY "Users view own tokens"
  ON user_fcm_tokens FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários só deletam seus próprios tokens
CREATE POLICY "Users delete own tokens"
  ON user_fcm_tokens FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 💡 Melhorias Futuras

### Curto Prazo
- [ ] Implementar backend de envio de push
- [ ] Criar UI para gerenciar notificações
- [ ] Adicionar preferences de notificação
- [ ] Implementar notification grouping

### Médio Prazo
- [ ] Rich notifications com imagens
- [ ] Action buttons em notificações
- [ ] Notificações agendadas
- [ ] Push categories/topics

### Longo Prazo
- [ ] Analytics de engagement
- [ ] A/B testing de mensagens
- [ ] Notificações personalizadas por IA
- [ ] Push to specific device types

---

## 📚 Referências

- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Protocol](https://web.dev/push-notifications-overview/)
- [Capacitor Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)
- [VAPID Keys](https://web.dev/push-notifications-web-push-protocol/)

---

## ✅ Verificação Final

**Antes de considerar completo:**
- [ ] Firebase configurado com credenciais reais
- [ ] Service worker atualizado (sem placeholders)
- [ ] Tabela `user_fcm_tokens` criada
- [ ] Token gerado e salvo em web
- [ ] Token gerado e salvo em mobile
- [ ] Notificação de teste recebida
- [ ] Background notifications funcionando
- [ ] Edge function de envio implementada
- [ ] Documentação atualizada

---

**Status Geral:** ⚠️ AGUARDANDO CONFIGURAÇÃO FIREBASE  
**Última Atualização:** 2025-10-25  
**Responsável:** Backend Team  
**Próxima Revisão:** Após setup Firebase completo
