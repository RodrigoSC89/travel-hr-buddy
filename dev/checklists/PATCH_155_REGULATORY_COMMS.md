# ✅ PATCH 155 – Regulatory Communications Channel
**Secure Encrypted Document Submission to Authorities**

---

## 📋 Resumo

Canal seguro de comunicação com autoridades regulatórias:
- Criptografia AES-256 de documentos e metadados
- Submissão multi-canal (email, WhatsApp, API)
- Rastreamento completo de envios
- Timeline de eventos de cada submissão
- Notificações de recebimento e processamento
- Auto-cleanup após 90 dias (LGPD compliance)

---

## 🎯 Objetivos

- ✅ Enviar documentos criptografados para autoridades
- ✅ Suportar múltiplos canais de comunicação
- ✅ Rastrear status de submissões
- ✅ Manter timeline completa de eventos
- ✅ Notificar automaticamente autoridades
- ✅ Garantir compliance com LGPD/GDPR

---

## ✅ Checklist de Validação

### 1. Cadastro de Autoridades Regulatórias

- [ ] **Dados da Autoridade**
  - [ ] Nome oficial
  - [ ] Sigla/Acrônimo
  - [ ] País/Região
  - [ ] Tipo (Marítima, Ambiental, Alfândega, etc.)
  - [ ] Website oficial
  - [ ] Status (ativo/inativo)

- [ ] **Canais de Comunicação**
  - [ ] Email principal
  - [ ] Emails secundários (CC)
  - [ ] WhatsApp Business (formato E.164)
  - [ ] API endpoint (se disponível)
  - [ ] API authentication (OAuth2/API Key)

- [ ] **Configurações de Notificação**
  - [ ] Horário de atendimento
  - [ ] Timezone
  - [ ] Idioma preferencial
  - [ ] Template de email customizado

### 2. Submissão de Documentos

- [ ] **Preparação da Submissão**
  - [ ] Seleção da autoridade
  - [ ] Assunto da submissão
  - [ ] Descrição detalhada
  - [ ] Upload de documentos (PDF, max 10MB cada)
  - [ ] Múltiplos documentos suportados

- [ ] **Criptografia**
  - [ ] Geração de chave AES-256 única
  - [ ] Criptografia dos dados:
    - [ ] Assunto
    - [ ] Descrição
    - [ ] Lista de documentos
    - [ ] Metadados sensíveis
  - [ ] Armazenamento seguro da chave de criptografia
  - [ ] Checksum SHA-256 dos dados criptografados

- [ ] **Metadados da Submissão**
  - [ ] Submission ID único
  - [ ] Data/hora de submissão (UTC)
  - [ ] Status inicial: "pending"
  - [ ] Priority level (low/medium/high/urgent)
  - [ ] Expected response time

- [ ] **Envio**
  - [ ] Payload criptografado enviado
  - [ ] Confirmação de recebimento
  - [ ] Geração de tracking ID
  - [ ] Toast de sucesso para usuário

### 3. Notificações Multi-Canal

- [ ] **Email**
  - [ ] Subject: `[NAUTILUS] New Secure Submission - ${subject}`
  - [ ] Body HTML com informações:
    - [ ] Submission ID
    - [ ] Data/hora
    - [ ] Assunto
    - [ ] Descrição (resumo)
    - [ ] Número de documentos anexados
    - [ ] Link para portal de validação
    - [ ] Instruções de descriptografia (se aplicável)
  - [ ] Documentos anexados (criptografados)
  - [ ] DKIM/SPF configurados

- [ ] **WhatsApp Business**
  - [ ] Mensagem curta:
    ```
    🚢 NAUTILUS - Nova Submissão Regulatória
    
    ID: ${submissionId}
    Assunto: ${subject}
    Documentos: ${docCount}
    
    Acesse o portal para mais detalhes:
    ${trackingUrl}
    ```
  - [ ] Status de entrega rastreado
  - [ ] Fallback para SMS se WhatsApp falhar

- [ ] **API (se disponível)**
  - [ ] POST request para endpoint da autoridade
  - [ ] Payload:
    ```json
    {
      "submissionId": "SUB-1234567890",
      "subject": "encrypted_subject",
      "description": "encrypted_description",
      "documents": [
        {
          "name": "certificate.pdf",
          "url": "https://secure.storage/...",
          "checksum": "sha256_hash"
        }
      ],
      "encryptedData": "base64_encrypted_payload",
      "encryptionKey": "base64_key_for_authority",
      "submittedAt": "2025-10-25T14:30:00Z"
    }
    ```
  - [ ] Retry logic (3 tentativas)
  - [ ] Confirmação de recebimento

- [ ] **Log de Notificações**
  - [ ] Registro de cada canal utilizado
  - [ ] Timestamp de envio
  - [ ] Status (sent/delivered/failed)
  - [ ] Response codes
  - [ ] Retry attempts

### 4. Rastreamento e Timeline

- [ ] **Portal de Rastreamento**
  - [ ] URL pública: `/regulatory/track/${submissionId}`
  - [ ] Informações visíveis:
    - [ ] Status atual
    - [ ] Data de submissão
    - [ ] Autoridade destinatária
    - [ ] Timeline completa de eventos

- [ ] **Timeline de Eventos**
  - [ ] `submitted` - Submissão criada
  - [ ] `encrypted` - Dados criptografados
  - [ ] `sent` - Notificações enviadas
  - [ ] `delivered` - Confirmação de entrega
  - [ ] `acknowledged` - Autoridade confirmou recebimento
  - [ ] `processing` - Em análise
  - [ ] `additional_info_requested` - Solicitação de informações adicionais
  - [ ] `approved` - Aprovado
  - [ ] `rejected` - Rejeitado
  - [ ] `completed` - Concluído

- [ ] **Atualização de Status**
  - [ ] Manual (admin/autoridade)
  - [ ] Via webhook (se API disponível)
  - [ ] Via email reply (parsing automático)

### 5. Segurança e Compliance

- [ ] **Criptografia**
  - [ ] AES-256-GCM para dados
  - [ ] Chaves únicas por submissão
  - [ ] Chaves armazenadas com criptografia adicional
  - [ ] Rotação de chaves (opcional)

- [ ] **Armazenamento Seguro**
  - [ ] Documentos em Supabase Storage (encrypted at rest)
  - [ ] Access control via RLS
  - [ ] URLs assinadas (tempo limitado)
  - [ ] Logs de acesso

- [ ] **LGPD/GDPR Compliance**
  - [ ] Consentimento de envio explícito
  - [ ] Direito ao esquecimento (delete submissão)
  - [ ] Auto-cleanup após 90 dias
  - [ ] Export de dados do usuário
  - [ ] Log de todas as operações

- [ ] **Auditoria**
  - [ ] Registro de quem criou a submissão
  - [ ] Registro de quem acessou os documentos
  - [ ] Registro de alterações de status
  - [ ] Timestamps UTC em todos os eventos

### 6. Gestão de Submissões

- [ ] **Listagem de Submissões**
  - [ ] Filtro por status
  - [ ] Filtro por autoridade
  - [ ] Filtro por data
  - [ ] Search por submission ID
  - [ ] Ordenação por data (mais recente primeiro)

- [ ] **Ações Disponíveis**
  - [ ] Ver detalhes
  - [ ] Ver timeline
  - [ ] Download de documentos (decrypted)
  - [ ] Adicionar comentário
  - [ ] Atualizar status (admin)
  - [ ] Deletar submissão (com confirmação)

---

## 🧪 Cenários de Teste

### Teste 1: Submissão Completa com Email + WhatsApp

**Pré-condições:**
- Autoridade cadastrada (ANVISA - exemplo)
- Email e WhatsApp configurados
- Certificado PDF disponível

**Passos:**
1. Acessar "Regulatory Channel" → "New Submission"
2. Selecionar autoridade: ANVISA
3. Preencher:
   - Subject: "Certificação de Equipamentos Médicos a Bordo"
   - Description: "Submissão de certificados ISM e inventário médico conforme RDC 56/2008"
4. Upload de 2 documentos:
   - `certificado_ISM.pdf` (500KB)
   - `inventario_medico.pdf` (1.2MB)
5. Clicar "Submit Securely"

**Resultado Esperado:**
- ✅ Chave AES-256 gerada
- ✅ Dados criptografados
- ✅ Submissão criada: `SUB-1234567890`
- ✅ Timeline event: "submitted"
- ✅ Notificação enviada por email
  - Subject: `[NAUTILUS] New Secure Submission - Certificação de Equipamentos Médicos a Bordo`
  - Documentos anexados (criptografados)
- ✅ Notificação enviada por WhatsApp
  - Mensagem recebida em < 2 min
  - Status "delivered" no log
- ✅ Timeline event: "sent"
- ✅ Toast: "Submission sent successfully"
- ✅ Redirecionado para tracking page

### Teste 2: Rastreamento Público

**Pré-condições:**
- Submissão criada no Teste 1

**Passos:**
1. Acessar URL pública: `/regulatory/track/SUB-1234567890`
2. Verificar informações

**Resultado Esperado:**
- ✅ Status: "Pending" (amarelo)
- ✅ Authority: "ANVISA"
- ✅ Submitted: "2025-10-25 14:30 UTC"
- ✅ Timeline completa:
  - ✅ 14:30 - Submitted
  - ✅ 14:30 - Encrypted
  - ✅ 14:31 - Sent (email + whatsapp)
- ✅ Tracking URL pode ser compartilhada publicamente
- ℹ️ Documentos NÃO são visíveis (privacidade)

### Teste 3: Atualização de Status via Webhook

**Pré-condições:**
- Submissão em "pending"
- Webhook endpoint exposto

**Passos:**
1. Simular POST webhook da autoridade:
```json
{
  "submissionId": "SUB-1234567890",
  "newStatus": "acknowledged",
  "message": "Documentação recebida e em análise",
  "estimatedCompletionDate": "2025-11-05",
  "timestamp": "2025-10-26T09:00:00Z"
}
```

**Resultado Esperado:**
- ✅ Webhook recebido e validado
- ✅ Status atualizado: "pending" → "acknowledged"
- ✅ Timeline event adicionado:
  - `2025-10-26 09:00 - Acknowledged: Documentação recebida e em análise`
- ✅ Notificação enviada ao submitter
  - Email: "Your submission SUB-123... has been acknowledged by ANVISA"
- ✅ Estimated completion date armazenado

### Teste 4: Auto-Cleanup (90 dias)

**Pré-condições:**
- 5 submissões antigas (> 90 dias)
- Status "completed" ou "rejected"

**Passos:**
1. Executar job de cleanup (manual ou cron)
2. Verificar resultado

**Resultado Esperado:**
- ✅ 5 submissões antigas deletadas
- ✅ Documentos removidos do storage
- ✅ Timeline mantida (opcional, para auditoria)
- ✅ Log de cleanup registrado
- ℹ️ Submissões "processing" NÃO são deletadas (mesmo se > 90 dias)

### Teste 5: Fallback SMS quando WhatsApp Falha

**Pré-condições:**
- Autoridade com WhatsApp e SMS configurados
- WhatsApp forçado a falhar (mock)

**Passos:**
1. Criar submissão
2. Observar notificações

**Resultado Esperado:**
- ⚠️ Tentativa de envio via WhatsApp falha
- ⏳ Aguarda 5s
- ✅ Fallback automático para SMS
- ✅ SMS enviado com sucesso
- ✅ Mensagem curta (< 160 chars):
  ```
  NAUTILUS: Nova submissão SUB-123...
  Acesse: https://short.url/track
  ```
- ✅ Log registra fallback: "whatsapp_failed → sms_sent"

### Teste 6: Decriptação de Submissão (Admin)

**Pré-condições:**
- Submissão criptografada existente
- Usuário com role "admin"

**Passos:**
1. Admin acessa detalhes da submissão
2. Clica "Decrypt & View"
3. Insere senha de admin (2FA)

**Resultado Esperado:**
- ✅ Chave de criptografia recuperada
- ✅ Dados decriptados:
  - Subject: texto original
  - Description: texto original
  - Documents: links para download (decrypted)
- ✅ Log de acesso registrado:
  - Who: admin_user_id
  - When: timestamp
  - Action: "decrypted_submission"
- ⚠️ Alerta: "Sensitive operation logged for audit"

---

## 📂 Arquivos Relacionados

### Core Module (a criar)
- `modules/regulatory-channel/index.tsx` - Componente principal
- `modules/regulatory-channel/types/index.ts` - Type definitions (a completar)

### Services
- `modules/regulatory-channel/services/regulatory-service.ts` - Lógica de submissão ✅
  - `submitSecureDocument()` - Submissão
  - `getTrackingInfo()` - Rastreamento
  - `listSubmissions()` - Listagem
  - `updateSubmissionStatus()` - Atualização
  - `cleanupOldSubmissions()` - Cleanup

### Utilities
- `modules/regulatory-channel/utils/encryption.ts` - Criptografia AES-256
  - `generateEncryptionKey()` - Geração de chave
  - `encryptData()` - Criptografar
  - `decryptData()` - Descriptografar
  - `generateChecksum()` - SHA-256

### Components (a criar)
- `modules/regulatory-channel/components/SubmissionForm.tsx` - Formulário
- `modules/regulatory-channel/components/TrackingPage.tsx` - Rastreamento público
- `modules/regulatory-channel/components/SubmissionList.tsx` - Listagem
- `modules/regulatory-channel/components/TimelineView.tsx` - Timeline de eventos
- `modules/regulatory-channel/components/AuthoritySelector.tsx` - Seleção de autoridade

### API (Edge Functions)
- `supabase/functions/regulatory-webhook/index.ts` - Recebe webhooks de autoridades
- `supabase/functions/regulatory-notify/index.ts` - Envia notificações
- `supabase/functions/regulatory-cleanup/index.ts` - Auto-cleanup (cron)

### Database
- Supabase table: `regulatory_authorities` - Cadastro de autoridades
- Supabase table: `regulatory_submissions` - Submissões
- Supabase table: `notification_logs` - Log de notificações
- Supabase table: `submission_timeline` - Timeline de eventos

---

## 📊 Métricas de Sucesso

| Métrica | Target | Crítico |
|---------|--------|---------|
| Taxa de envio bem-sucedido | > 98% | ✅ |
| Tempo médio de submissão | < 5s | ✅ |
| Taxa de entrega de notificações | > 95% | ⚠️ |
| Tempo médio de resposta (autoridade) | < 48h | ℹ️ |
| Compliance com LGPD | 100% | ⚠️ CRÍTICO |
| Uptime do tracking portal | > 99.9% | ✅ |

---

## 🐛 Problemas Conhecidos

### Críticos
- ⚠️ **Nenhum identificado no momento**

### Médios
- ⚠️ Algumas autoridades não possuem canal digital
  - **Solução temporária:** Geração automática de ofício em PDF para envio físico
- ⚠️ WhatsApp Business API requer aprovação da Meta
  - **Solução:** Usar Twilio API ou similar

### Baixos
- ℹ️ Auto-cleanup pode deletar submissões ainda em análise (se > 90 dias)
  - **Solução:** Adicionar flag "keep_indefinitely" para casos especiais

---

## ✅ Critérios de Aprovação

### Obrigatórios
- ✅ Submissão de documentos criptografados funcional
- ✅ Notificação por email funcionando
- ✅ Rastreamento público disponível
- ✅ Timeline de eventos completa
- ✅ Auto-cleanup após 90 dias
- ✅ Compliance com LGPD/GDPR

### Desejáveis
- ✅ WhatsApp notifications funcionando
- ✅ SMS fallback configurado
- ✅ Webhook para receber atualizações de status
- ✅ Dashboard de submissões em tempo real

---

## 📝 Notas Técnicas

### Criptografia AES-256-GCM
```javascript
// Gerar chave única
const key = await crypto.subtle.generateKey(
  { name: 'AES-GCM', length: 256 },
  true,
  ['encrypt', 'decrypt']
);

// Encrypt
const iv = crypto.getRandomValues(new Uint8Array(12));
const encrypted = await crypto.subtle.encrypt(
  { name: 'AES-GCM', iv },
  key,
  encoder.encode(data)
);

// Decrypt
const decrypted = await crypto.subtle.decrypt(
  { name: 'AES-GCM', iv },
  key,
  encrypted
);
```

### Database Schema
```sql
-- regulatory_authorities
{
  id: uuid (PK)
  name: string
  acronym: string
  country: string
  type: string
  email: string
  emailCC: string[]
  whatsapp: string (E.164)
  apiEndpoint: string
  apiAuthType: 'oauth2' | 'apikey'
  website: string
  isActive: boolean
  createdAt: timestamp
}

-- regulatory_submissions
{
  id: string (PK) - "SUB-1234567890"
  authorityId: uuid (FK)
  userId: uuid (FK)
  subject: string (encrypted)
  description: text (encrypted)
  documents: jsonb (encrypted)
  encryptedData: text
  encryptionKey: text (encrypted)
  checksum: string (SHA-256)
  status: 'pending' | 'sent' | 'acknowledged' | 'processing' | 'approved' | 'rejected' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  estimatedCompletion: timestamp
  submittedAt: timestamp
  completedAt: timestamp
}

-- submission_timeline
{
  id: uuid (PK)
  submissionId: string (FK)
  action: string
  description: text
  performedBy: uuid (FK to users)
  timestamp: timestamp
}
```

---

## 🔄 Próximos Passos

1. **Integração com PATCH 151**
   - Enviar certificados automaticamente para autoridades
   - Link bidirecional certificado ↔ submissão

2. **Integração com PATCH 154**
   - Registrar submissões em blockchain
   - Prova imutável de envio e recebimento

3. **Automação**
   - IA para preencher formulários automaticamente
   - Sugestão de autoridade baseada no tipo de documento

4. **Analytics**
   - Dashboard de performance de autoridades
   - Tempo médio de resposta por tipo de submissão
   - Taxa de aprovação por autoridade

---

## 📚 Referências

### Legislação
- [LGPD - Lei 13.709/2018](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm) - Brasil
- [GDPR](https://gdpr.eu/) - União Europeia
- [IMO Conventions](https://www.imo.org/en/About/Conventions/Pages/Default.aspx)

### Criptografia
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [NIST AES-GCM](https://csrc.nist.gov/publications/detail/sp/800-38d/final)

### Notificações
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Twilio API](https://www.twilio.com/docs)
- [Resend API](https://resend.com/docs)

---

**Status:** 🟡 EM DESENVOLVIMENTO  
**Última Atualização:** 2025-10-25  
**Responsável:** Nautilus One Compliance & Security Team
