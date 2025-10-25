# ✅ PATCH 152 – Port Authority Integration
**Two-Way Data Synchronization with Port Authorities**

---

## 📋 Resumo

Sistema de integração bidirecional com autoridades portuárias para:
- Sincronização automática de certificados emitidos
- Notificações em tempo real (email, WhatsApp, SMS)
- Atualização de status operacional de embarcações
- Compartilhamento de dados de inspeção
- Compliance tracking

---

## 🎯 Objetivos

- ✅ Conectar com APIs de autoridades portuárias
- ✅ Sincronizar certificações automaticamente
- ✅ Enviar notificações multi-canal
- ✅ Receber atualizações de status
- ✅ Manter log completo de comunicações
- ✅ Garantir segurança dos dados (TLS 1.3, OAuth 2.0)

---

## ✅ Checklist de Validação

### 1. Configuração de Autoridades

- [ ] **Registro de Autoridades**
  - [ ] Nome da autoridade
  - [ ] País/região de atuação
  - [ ] API endpoint configurado
  - [ ] Credenciais OAuth armazenadas (secrets)
  - [ ] Email de contato
  - [ ] Número WhatsApp (formato internacional)
  - [ ] Telefone para SMS
  - [ ] Timezone configurado

- [ ] **Autenticação**
  - [ ] OAuth 2.0 implementado
  - [ ] Tokens armazenados de forma segura
  - [ ] Refresh token automático
  - [ ] Fallback para API Key (se OAuth indisponível)
  - [ ] Rate limiting respeitado

### 2. Sincronização de Dados

- [ ] **Push de Certificados**
  - [ ] Envio automático após emissão
  - [ ] Formato padronizado (JSON/XML)
  - [ ] Retry logic (3 tentativas, backoff exponencial)
  - [ ] Confirmação de recebimento
  - [ ] Log de sincronização

- [ ] **Dados Sincronizados**
  - [ ] Certificate ID
  - [ ] Vessel Name, IMO Number
  - [ ] Certificate Type (ISM/ISPS/IMCA)
  - [ ] Issue Date, Expiry Date
  - [ ] Issued By
  - [ ] Status (compliant/non-compliant/conditional)
  - [ ] PDF URL (link seguro)
  - [ ] Hash SHA-256

- [ ] **Pull de Atualizações**
  - [ ] Webhook configurado para receber atualizações
  - [ ] Polling a cada 15 minutos (fallback)
  - [ ] Atualização de status de embarcação
  - [ ] Alertas de inspeção agendada
  - [ ] Notificações de expiração

### 3. Notificações Multi-Canal

- [ ] **Email**
  - [ ] Template HTML profissional
  - [ ] Subject line informativo
  - [ ] Link para validação do certificado
  - [ ] Anexo do PDF (opcional)
  - [ ] Assinatura digital DKIM/SPF

- [ ] **WhatsApp**
  - [ ] Integração com WhatsApp Business API
  - [ ] Mensagem curta e objetiva
  - [ ] Link para validação
  - [ ] Status de entrega rastreado
  - [ ] Resposta automática configurada

- [ ] **SMS**
  - [ ] Mensagem < 160 caracteres
  - [ ] Link encurtado para validação
  - [ ] Fallback se WhatsApp falhar
  - [ ] Confirmação de recebimento

- [ ] **Log de Notificações**
  - [ ] Timestamp de envio
  - [ ] Canal utilizado (email/whatsapp/sms)
  - [ ] Status (sent/delivered/failed)
  - [ ] Retry attempts
  - [ ] Response code

### 4. Segurança e Compliance

- [ ] **Criptografia**
  - [ ] TLS 1.3 em todas as comunicações
  - [ ] Certificados SSL válidos
  - [ ] Dados sensíveis nunca em query string
  - [ ] Headers de segurança configurados

- [ ] **Auditoria**
  - [ ] Log de todas as sincronizações
  - [ ] Registro de acesso a dados
  - [ ] Rastreamento de alterações
  - [ ] Compliance com LGPD/GDPR

- [ ] **Rate Limiting**
  - [ ] Max 100 requests/minuto por autoridade
  - [ ] Backoff se limite excedido
  - [ ] Alertas se rate limit atingido frequentemente

---

## 🧪 Cenários de Teste

### Teste 1: Sincronização Automática após Emissão

**Pré-condições:**
- Autoridade portuária configurada
- Certificado ISM emitido (PATCH 151)

**Passos:**
1. Emitir novo certificado ISM para "MV Atlantic Star"
2. Observar logs de sincronização

**Resultado Esperado:**
- ✅ Request POST enviado para API da autoridade
- ✅ Payload contém todos os dados obrigatórios
- ✅ Response 200/201 recebido
- ✅ Notificação enviada por email
- ✅ Notificação enviada por WhatsApp (se configurado)
- ✅ Log registrado em `port_sync_log`

### Teste 2: Retry Logic em Caso de Falha

**Pré-condições:**
- API da autoridade temporariamente indisponível (mock)

**Passos:**
1. Emitir certificado com API down
2. Observar tentativas de retry

**Resultado Esperado:**
- ⚠️ Tentativa 1 falha → aguarda 5s
- ⚠️ Tentativa 2 falha → aguarda 15s
- ⚠️ Tentativa 3 falha → aguarda 45s
- ❌ Após 3 falhas, marca como "sync_failed"
- ✅ Email de alerta enviado ao admin
- ✅ Job agendado para retry manual

### Teste 3: Webhook de Atualização de Status

**Pré-condições:**
- Webhook endpoint exposto
- Autoridade portuária configurada para enviar updates

**Passos:**
1. Simular POST webhook com status update:
```json
{
  "vesselImoNumber": "IMO1234567",
  "certificateId": "CERT-ISM-1234567890",
  "newStatus": "revoked",
  "reason": "Vessel failed re-inspection",
  "timestamp": "2025-10-25T14:30:00Z"
}
```

**Resultado Esperado:**
- ✅ Webhook recebido e validado (HMAC signature)
- ✅ Certificado atualizado no banco
- ✅ Status mudado para "revoked"
- ✅ Timeline event registrado
- ✅ Notificação enviada ao vessel owner

### Teste 4: Notificação Multi-Canal

**Pré-condições:**
- Autoridade com email e WhatsApp configurados

**Passos:**
1. Emitir certificado ISPS
2. Verificar recebimento das notificações

**Resultado Esperado:**
- ✅ Email recebido em < 1 minuto
  - Subject: "New ISPS Certificate Issued - MV Atlantic Star"
  - Body contém link para validação
  - PDF anexado
- ✅ WhatsApp message recebido em < 2 minutos
  - Mensagem: "🚢 New ISPS Certificate issued for MV Atlantic Star. Validate: [link]"
  - Status "delivered" no log

### Teste 5: Rate Limiting

**Pré-condições:**
- Rate limit: 100 req/min

**Passos:**
1. Emitir 150 certificados em 1 minuto (script)
2. Observar comportamento

**Resultado Esperado:**
- ✅ Primeiros 100 requests processados normalmente
- ⚠️ Requests 101-150 entram em fila
- ✅ Processamento retomado após 1 minuto
- ✅ Alerta enviado: "Rate limit atingido - considerar aumento"

---

## 📂 Arquivos Relacionados

### Services (a criar)
- `modules/port-integration/services/sync-service.ts` - Sincronização de dados
- `modules/port-integration/services/notification-service.ts` - Envio de notificações
- `modules/port-integration/services/webhook-handler.ts` - Recebimento de webhooks

### API Routes (Edge Functions)
- `supabase/functions/port-sync/index.ts` - Endpoint de sincronização
- `supabase/functions/port-webhook/index.ts` - Endpoint de webhook
- `supabase/functions/send-notification/index.ts` - Envio de notificações

### Types
- `modules/port-integration/types/index.ts` - Type definitions

### Database
- Supabase table: `port_authorities` - Cadastro de autoridades
- Supabase table: `port_sync_log` - Log de sincronizações
- Supabase table: `notification_log` - Log de notificações
- Supabase table: `webhook_events` - Log de webhooks recebidos

---

## 📊 Métricas de Sucesso

| Métrica | Target | Crítico |
|---------|--------|---------|
| Taxa de sincronização bem-sucedida | > 98% | ✅ |
| Tempo médio de sincronização | < 2s | ✅ |
| Taxa de entrega de email | > 95% | ⚠️ |
| Taxa de entrega WhatsApp | > 90% | ⚠️ |
| Uptime do webhook | > 99.9% | ✅ CRÍTICO |
| Latência do webhook | < 500ms | ✅ |

---

## 🐛 Problemas Conhecidos

### Críticos
- ⚠️ **Nenhum identificado no momento**

### Médios
- ⚠️ WhatsApp Business API requer aprovação (processo de 7-14 dias)
  - **Solução temporária:** Usar Twilio API para WhatsApp
- ⚠️ Algumas autoridades não possuem API pública
  - **Solução:** Email automático + portal web para validação manual

### Baixos
- ℹ️ Rate limiting pode causar atrasos em bulk imports
  - **Solução:** Implementar batch processing com delay

---

## ✅ Critérios de Aprovação

### Obrigatórios
- ✅ Sincronização automática de certificados funcional
- ✅ Notificação por email funcionando
- ✅ Webhook recebe atualizações de status
- ✅ Retry logic implementado (3 tentativas)
- ✅ Logs completos de todas as operações
- ✅ TLS 1.3 em todas as comunicações

### Desejáveis
- ✅ WhatsApp notifications funcionando
- ✅ SMS fallback configurado
- ✅ Dashboard de sincronização em tempo real
- ✅ Alertas automáticos para falhas

---

## 📝 Notas Técnicas

### API Payload (Sync Certificate)
```json
{
  "certificate": {
    "id": "CERT-ISM-1234567890",
    "type": "ISM",
    "vessel": {
      "name": "MV Atlantic Star",
      "imoNumber": "IMO1234567",
      "vesselId": "VS-001"
    },
    "issuedBy": "Port Authority Santos",
    "issuedDate": "2025-10-25T10:00:00Z",
    "expiryDate": "2027-10-25T10:00:00Z",
    "status": "compliant",
    "hash": "a1b2c3d4e5f6...",
    "pdfUrl": "https://secure.storage/certs/CERT-ISM-1234567890.pdf",
    "validationUrl": "https://yourapp.com/certification/validate/CERT-ISM-1234567890"
  }
}
```

### Webhook Signature Verification
```javascript
// HMAC SHA-256
const signature = req.headers['x-webhook-signature'];
const payload = JSON.stringify(req.body);
const secret = process.env.WEBHOOK_SECRET;

const computedSignature = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');

if (signature !== computedSignature) {
  throw new Error('Invalid webhook signature');
}
```

### Database Schema
```sql
-- port_authorities
{
  id: uuid (PK)
  name: string
  country: string
  apiEndpoint: string
  authType: 'oauth2' | 'apikey'
  email: string
  whatsapp: string (E.164 format)
  sms: string
  timezone: string
  isActive: boolean
  createdAt: timestamp
}

-- port_sync_log
{
  id: uuid (PK)
  certificateId: string (FK)
  authorityId: uuid (FK)
  action: 'push' | 'pull'
  status: 'success' | 'failed' | 'pending'
  attempts: integer
  responseCode: integer
  responseBody: jsonb
  timestamp: timestamp
}

-- notification_log
{
  id: uuid (PK)
  certificateId: string (FK)
  authorityId: uuid (FK)
  channel: 'email' | 'whatsapp' | 'sms'
  recipient: string
  status: 'sent' | 'delivered' | 'failed'
  errorMessage: text
  timestamp: timestamp
}
```

---

## 🔄 Próximos Passos

1. **Ampliar Cobertura**
   - Integrar com top 20 autoridades portuárias mundiais
   - Padronizar contratos de API

2. **Automação Avançada**
   - IA para prever necessidade de renovação
   - Agendamento automático de inspeções

3. **Integração com PATCH 154**
   - Registrar sincronizações em blockchain
   - Auditoria imutável de comunicações

4. **Analytics**
   - Dashboard de performance de autoridades
   - Tempo médio de resposta por região
   - Taxa de compliance por país

---

## 📚 Referências

### APIs e Protocolos
- [OAuth 2.0 RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749)
- [Webhook Best Practices](https://webhooks.fyi/)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Twilio API](https://www.twilio.com/docs/whatsapp)

### Segurança
- [OWASP API Security Top 10](https://owasp.org/API-Security/editions/2023/en/0x00-header/)
- [TLS 1.3 RFC 8446](https://datatracker.ietf.org/doc/html/rfc8446)

### Compliance
- LGPD (Lei Geral de Proteção de Dados - Brasil)
- GDPR (General Data Protection Regulation - EU)
- IMO GISIS (Global Integrated Shipping Information System)

---

**Status:** 🟡 EM DESENVOLVIMENTO  
**Última Atualização:** 2025-10-25  
**Responsável:** Nautilus One Integration Team
