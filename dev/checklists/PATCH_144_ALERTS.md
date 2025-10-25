# PATCH 144 - Alerts System Audit
**SMS & Email Notifications via Twilio/SendGrid**

## 📋 Status Geral
- **Versão**: 144.0
- **Data Implementação**: 2025-01-23
- **Status**: ⚠️ **Parcialmente Implementado** - Edge Functions Faltando
- **Arquivos Principais**: N/A

---

## 🎯 Objetivos do PATCH
Implementar sistema de alertas críticos via SMS (Twilio) e Email (SendGrid) para notificações de emergência, manutenção urgente, e eventos importantes.

---

## 📝 Especificação Técnica

### Funcionalidades Planejadas

#### 1. **Tipos de Alertas**
```typescript
type AlertType = 
  | 'emergency'        // SOS, colisão, incêndio
  | 'critical'         // Falha de sistema crítico
  | 'maintenance'      // Manutenção urgente
  | 'weather'          // Tempestade, condições extremas
  | 'security'         // Intrusão, acesso não autorizado
  | 'compliance'       // Vencimento de certificados
  | 'operational';     // Desvio de rota, atraso

interface Alert {
  id: string;
  type: AlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  vessel_id?: string;
  timestamp: string;
  recipients: {
    sms?: string[];      // Phone numbers
    email?: string[];    // Email addresses
    push?: string[];     // User IDs
  };
  metadata?: Record<string, any>;
}
```

#### 2. **Canais de Notificação**
- **SMS** via Twilio (alertas críticos)
- **Email** via SendGrid (relatórios detalhados)
- **Push Notifications** via Firebase (in-app)
- **Webhook** para sistemas externos

#### 3. **Regras de Escalação**
```typescript
interface EscalationRule {
  alertType: AlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: ('sms' | 'email' | 'push')[];
  recipients: string[];
  retryAttempts: number;
  retryInterval: number; // minutes
}

// Exemplo:
const rules: EscalationRule[] = [
  {
    alertType: 'emergency',
    severity: 'critical',
    channels: ['sms', 'email', 'push'],
    recipients: ['captain', 'shore_manager', 'emergency_contact'],
    retryAttempts: 3,
    retryInterval: 5
  }
];
```

---

## ⚠️ Status Atual: PARCIALMENTE IMPLEMENTADO

### Arquivos Existentes
```
✅ Firebase configurado (push notifications)
✅ Capacitor push-notifications instalado
❌ Twilio edge function
❌ SendGrid edge function
❌ Alert management hook
❌ Alert UI components
❌ Alert history/logs
```

### Integrações Necessárias
```
❌ Twilio SMS API
❌ SendGrid Email API
✅ Firebase Cloud Messaging (FCM)
❌ Alert routing logic
❌ Escalation engine
```

---

## 🏗️ Arquitetura Proposta

### 1. **Edge Functions**

#### supabase/functions/send-sms/index.ts
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Twilio from "npm:twilio";

const twilioClient = Twilio(
  Deno.env.get('TWILIO_ACCOUNT_SID'),
  Deno.env.get('TWILIO_AUTH_TOKEN')
);

serve(async (req) => {
  const { to, message, from } = await req.json();
  
  const result = await twilioClient.messages.create({
    body: message,
    to: to,
    from: from || Deno.env.get('TWILIO_PHONE_NUMBER')
  });
  
  return new Response(JSON.stringify({ 
    success: true, 
    messageId: result.sid 
  }));
});
```

#### supabase/functions/send-email/index.ts
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SendGrid } from "npm:@sendgrid/mail";

const sendGrid = new SendGrid();
sendGrid.setApiKey(Deno.env.get('SENDGRID_API_KEY'));

serve(async (req) => {
  const { to, subject, html, text } = await req.json();
  
  const result = await sendGrid.send({
    to: to,
    from: Deno.env.get('SENDGRID_FROM_EMAIL'),
    subject: subject,
    html: html,
    text: text
  });
  
  return new Response(JSON.stringify({ 
    success: true,
    messageId: result[0].messageId
  }));
});
```

### 2. **Client-Side Hook**

#### src/hooks/useAlerts.ts
```typescript
export const useAlerts = () => {
  const sendAlert = async (alert: Alert) => {
    // Determine channels based on severity
    const channels = determineChannels(alert.severity);
    
    // Send via appropriate channels
    const results = await Promise.allSettled([
      channels.includes('sms') && sendSMS(alert),
      channels.includes('email') && sendEmail(alert),
      channels.includes('push') && sendPush(alert)
    ]);
    
    // Log results
    await logAlertSent(alert, results);
    
    return results;
  };
  
  const sendSMS = async (alert: Alert) => {
    const { data } = await supabase.functions.invoke('send-sms', {
      body: {
        to: alert.recipients.sms,
        message: formatSMSMessage(alert)
      }
    });
    return data;
  };
  
  const sendEmail = async (alert: Alert) => {
    const { data } = await supabase.functions.invoke('send-email', {
      body: {
        to: alert.recipients.email,
        subject: alert.title,
        html: formatEmailHTML(alert),
        text: formatEmailText(alert)
      }
    });
    return data;
  };
  
  return { sendAlert };
};
```

### 3. **UI Components**

#### AlertManager.tsx
```typescript
// Dashboard para gerenciar alertas
// - Criar novo alerta
// - Ver histórico de alertas enviados
// - Configurar regras de escalação
// - Testar canais de notificação
```

#### AlertHistory.tsx
```typescript
// Lista de alertas enviados
// - Filtros por tipo, severidade, data
// - Status de entrega (delivered, failed, pending)
// - Retry de alertas falhados
```

#### AlertBanner.tsx
```typescript
// Banner de alerta in-app
// - Exibe alertas ativos
// - Botão para acknowledge
// - Link para detalhes
```

---

## 🧪 Testes Planejados

### Testes de Envio
| Teste | Prioridade | Implementado |
|-------|-----------|--------------|
| Envio de SMS via Twilio | 🔴 Alta | ❌ |
| Envio de Email via SendGrid | 🔴 Alta | ❌ |
| Push notification via FCM | 🔴 Alta | ⚠️ Parcial |
| Múltiplos destinatários | 🟡 Média | ❌ |
| Retry em caso de falha | 🔴 Alta | ❌ |

### Testes de Escalação
| Teste | Prioridade | Implementado |
|-------|-----------|--------------|
| Seleção de canal por severidade | 🔴 Alta | ❌ |
| Escalação automática | 🟡 Média | ❌ |
| Rate limiting | 🟡 Média | ❌ |
| Deduplicação de alertas | 🟡 Média | ❌ |

### Testes de Logging
| Teste | Prioridade | Implementado |
|-------|-----------|--------------|
| Log de alerta enviado | 🔴 Alta | ❌ |
| Status de entrega | 🔴 Alta | ❌ |
| Histórico pesquisável | 🟡 Média | ❌ |
| Métricas de performance | 🟢 Baixa | ❌ |

---

## 🔧 Configuração Necessária

### Variáveis de Ambiente (Supabase Secrets)
```bash
# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+15551234567

# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=alerts@maritime-system.com
SENDGRID_FROM_NAME=Maritime Alert System

# Firebase (já configurado)
FIREBASE_PROJECT_ID=existing_value
FIREBASE_CLIENT_EMAIL=existing_value
FIREBASE_PRIVATE_KEY=existing_value
```

### Database Tables
```sql
-- Tabela de alertas enviados
CREATE TABLE alert_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  vessel_id UUID REFERENCES vessels(id),
  channels TEXT[] NOT NULL, -- ['sms', 'email', 'push']
  recipients JSONB NOT NULL,
  status TEXT NOT NULL, -- 'pending', 'sent', 'failed'
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB
);

-- Tabela de regras de escalação
CREATE TABLE escalation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  channels TEXT[] NOT NULL,
  recipients TEXT[] NOT NULL,
  retry_attempts INT DEFAULT 3,
  retry_interval INT DEFAULT 5, -- minutes
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🚀 Roadmap de Implementação

### Fase 1: Twilio SMS (1 semana)
- [ ] Criar edge function `send-sms`
- [ ] Configurar Twilio credentials
- [ ] Implementar formatação de mensagens
- [ ] Testes de envio básico
- [ ] Error handling e retry logic

### Fase 2: SendGrid Email (1 semana)
- [ ] Criar edge function `send-email`
- [ ] Configurar SendGrid credentials
- [ ] Templates de email (HTML)
- [ ] Attachments support
- [ ] Testes de entregabilidade

### Fase 3: Alert Management (2 semanas)
- [ ] Hook `useAlerts`
- [ ] Routing logic (qual canal usar)
- [ ] Escalation engine
- [ ] UI para criar/gerenciar alertas
- [ ] Histórico de alertas

### Fase 4: Advanced Features (1 semana)
- [ ] Regras de escalação configuráveis
- [ ] Rate limiting
- [ ] Deduplicação
- [ ] Analytics e métricas
- [ ] Integração com incident management

---

## 💰 Considerações de Custo

### Twilio SMS
| Região | Custo por SMS | Volume Estimado | Custo Mensal |
|--------|---------------|-----------------|--------------|
| Brasil | $0.15 | 100 SMS/mês | $15 |
| EUA | $0.0079 | 50 SMS/mês | $0.40 |
| Europa | $0.08 | 50 SMS/mês | $4 |
| **Total** | - | **200 SMS/mês** | **~$20** |

### SendGrid Email
| Plano | Emails/mês | Custo |
|-------|-----------|-------|
| Free | 100/dia (3000/mês) | $0 |
| Essentials | 50,000/mês | $19.95 |
| Pro | 100,000/mês | $89.95 |

**Estimativa**: Free tier suficiente para início (< 3000 emails/mês)

### Firebase Push Notifications
- **Grátis**: Ilimitado
- **Custo**: $0

---

## 🎓 Casos de Uso

### 1. **Emergência a Bordo**
Enviar SOS via SMS/Email para capitão, escritório em terra, e contatos de emergência.

### 2. **Manutenção Crítica**
Alertar equipe técnica sobre falha iminente de equipamento crítico.

### 3. **Alerta Meteorológico**
Notificar embarcações sobre tempestade se aproximando da rota.

### 4. **Vencimento de Certificados**
Lembrar capitão 30/15/7 dias antes de certificado vencer.

### 5. **Desvio de Rota**
Alertar quando embarcação desvia significativamente da rota planejada.

### 6. **Acesso Não Autorizado**
Notificar sobre tentativa de login suspeita ou acesso a área restrita.

---

## ✅ Checklist de Validação (Quando Implementado)

### SMS (Twilio)
- [ ] SMS enviado e recebido em número real
- [ ] Mensagem formatada corretamente
- [ ] Múltiplos destinatários funcionam
- [ ] Retry em caso de falha
- [ ] Log de envio OK
- [ ] Custo rastreável

### Email (SendGrid)
- [ ] Email enviado e recebido
- [ ] HTML renderiza corretamente
- [ ] Links funcionam
- [ ] Attachments (se aplicável)
- [ ] Não cai em spam
- [ ] Log de envio OK

### Push Notifications
- [ ] Token recebido (FCM)
- [ ] Notificação aparece no device
- [ ] Deep linking funciona
- [ ] Badge count atualiza
- [ ] Som/vibração configurable

### Logging & Histórico
- [ ] Alertas registrados em DB
- [ ] Status de entrega atualizado
- [ ] Histórico pesquisável
- [ ] Retry de falhados
- [ ] Métricas de performance

---

## 🐛 Riscos e Desafios

### Técnicos
1. **Deliverability**: Emails podem cair em spam
2. **Rate limits**: APIs têm limites de requisições
3. **Latência**: SMS pode demorar minutos para entregar
4. **Custos**: SMS pode ficar caro em alto volume
5. **Compliance**: GDPR, LGPD, TCPA

### Operacionais
1. **False positives**: Alertas desnecessários geram fadiga
2. **Escalação**: Definir quem recebe o quê e quando
3. **Testes**: Difícil testar sem enviar notificações reais
4. **Manutenção**: Contatos precisam ser atualizados
5. **Monitoramento**: Detectar quando sistema falha

---

## 🔗 Recursos Externos

### Documentação
- [Twilio SMS API](https://www.twilio.com/docs/sms)
- [SendGrid API](https://docs.sendgrid.com/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)

### Ferramentas
- [Twilio Console](https://console.twilio.com/)
- [SendGrid Dashboard](https://app.sendgrid.com/)
- [Firebase Console](https://console.firebase.google.com/)

### Alternativas
- **SMS**: AWS SNS, Vonage (Nexmo), MessageBird
- **Email**: AWS SES, Mailgun, Postmark
- **Push**: OneSignal, Pusher, AWS SNS

---

## 📝 Conclusão

**Status Final**: ⚠️ **PARCIALMENTE IMPLEMENTADO**

Push notifications via Firebase estão **configurados**, mas **SMS e Email estão faltando** completamente.

### Próximos Passos Imediatos
1. **Criar edge functions** para Twilio e SendGrid
2. **Configurar secrets** no Supabase
3. **Implementar hook `useAlerts`**
4. **Criar UI de gerenciamento de alertas**
5. **Testar com números/emails reais**

### Estimativa de Esforço
- **Edge Functions**: 2-3 dias
- **Client Hook**: 2 dias
- **UI Components**: 3-4 dias
- **Testes**: 2 dias
- **Total**: ~2 semanas

### Dependências Críticas
- Conta Twilio (trial gratuito disponível)
- Conta SendGrid (free tier: 100 emails/dia)
- Database tables criadas
- Secrets configurados no Supabase

### Priorização
1. 🔴 **Alta**: Twilio SMS (emergências)
2. 🔴 **Alta**: SendGrid Email (relatórios)
3. 🟡 **Média**: Escalation rules
4. 🟡 **Média**: Alert history/logging
5. 🟢 **Baixa**: Analytics e métricas

---

**Auditado em**: 2025-01-23  
**Próxima Revisão**: Após implementação de edge functions
