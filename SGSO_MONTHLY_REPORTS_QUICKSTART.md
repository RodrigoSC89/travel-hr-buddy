# 🚀 SGSO Monthly Reports - Quick Start Guide

## 📦 Instalação Rápida

### 1. Verificar Dependências

✅ **Resend já está instalado** no projeto (versão 4.0.1)

### 2. Configurar Secrets no Supabase

```bash
# Obrigatório
supabase secrets set RESEND_API_KEY=re_your_resend_api_key

# Opcional (tem defaults)
supabase secrets set SGSO_REPORT_EMAILS=seguranca@empresa.com,qsms@empresa.com
supabase secrets set APP_URL=https://app.nautilus-one.com
supabase secrets set EMAIL_FROM="SGSO Reports <relatorios@nautilus-one.com>"
```

### 3. Deploy da Edge Function

```bash
cd supabase/functions
supabase functions deploy send-monthly-sgso
```

### 4. Ativar Cron Job

O cron já está configurado em `supabase/functions/cron.yaml`:
```yaml
send-monthly-sgso:
  schedule: '0 6 1 * *' # Dia 1 de cada mês às 06:00 UTC
  endpoint: '/send-monthly-sgso'
  method: GET
```

## 🧪 Teste Imediato

### Via Dashboard do Supabase

1. Acesse: **Functions** → **send-monthly-sgso**
2. Clique em **Invoke Function**
3. Verifique a resposta e logs

### Via cURL

```bash
curl -X GET \
  'https://your-project.supabase.co/functions/v1/send-monthly-sgso' \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

### Resposta Esperada

```json
{
  "success": true,
  "message": "Monthly SGSO reports sent",
  "vessels_count": 3,
  "success_count": 3,
  "failure_count": 0,
  "recipients": ["seguranca@empresa.com", "qsms@empresa.com"],
  "results": [
    {
      "vessel": "PSV Atlântico",
      "success": true,
      "metrics": {
        "vessel_id": "uuid",
        "vessel_name": "PSV Atlântico",
        "incidents_count": 2,
        "non_conformities_count": 3,
        "risk_assessments_count": 1,
        "pending_actions": 4,
        "compliance_level": 85
      }
    }
  ]
}
```

## 📋 Checklist de Verificação

- [ ] Resend API Key configurada
- [ ] Emails de destino configurados
- [ ] Edge Function deployada
- [ ] Cron job ativo
- [ ] Embarcações com `status = 'active'` no banco
- [ ] Teste manual executado com sucesso
- [ ] Email recebido com anexo PDF

## 🎯 Uso Programático (Frontend)

### Exemplo Completo

```typescript
import { generatePDFBufferForVessel, getAllVessels } from "@/lib/sgso-report";
import { sendSGSOReport } from "@/lib/email/send-sgso";

// Enviar relatório de uma embarcação específica
async function sendVesselReport(vesselId: string, vesselName: string) {
  try {
    // Gerar PDF
    const pdfBuffer = await generatePDFBufferForVessel(vesselId);
    
    // Enviar email
    const result = await sendSGSOReport({
      vessel: vesselName,
      to: ["seguranca@empresa.com", "operacoes@empresa.com"],
      pdfBuffer: pdfBuffer,
      dashboardLink: "https://app.nautilus-one.com/admin/sgso"
    });
    
    if (result.success) {
      console.log("✅ Relatório enviado:", result.data);
    } else {
      console.error("❌ Erro ao enviar:", result.error);
    }
  } catch (error) {
    console.error("❌ Erro:", error);
  }
}

// Enviar relatórios para todas as embarcações
async function sendAllReports() {
  const vessels = await getAllVessels();
  
  for (const vessel of vessels) {
    await sendVesselReport(vessel.id, vessel.name);
  }
}
```

## 🔍 Monitoramento

### Verificar Logs de Execução

```sql
-- Últimas 10 execuções
SELECT 
  status,
  message,
  metadata->>'vessels_count' as vessels,
  metadata->>'success_count' as success,
  metadata->>'failure_count' as failures,
  execution_duration_ms,
  created_at
FROM cron_execution_logs
WHERE function_name = 'send-monthly-sgso'
ORDER BY created_at DESC
LIMIT 10;
```

### Dashboard de Métricas

Acessar: `https://app.nautilus-one.com/admin/reports/cron-status`

## ⚙️ Configurações Avançadas

### Alterar Frequência

```yaml
# Semanal (toda segunda às 6h)
schedule: '0 6 * * 1'

# Quinzenal (dias 1 e 15)
schedule: '0 6 1,15 * *'

# Diário às 8h
schedule: '0 8 * * *'
```

### Adicionar Destinatários

```bash
supabase secrets set SGSO_REPORT_EMAILS=email1@empresa.com,email2@empresa.com,email3@empresa.com
```

### Customizar Sender

```bash
supabase secrets set EMAIL_FROM="Segurança Marítima <sgso@nautilus-one.com>"
```

## 🐛 Debug Rápido

### Problema: Nenhum email enviado

```bash
# 1. Verificar se há embarcações ativas
SELECT count(*) FROM vessels WHERE status = 'active';

# 2. Verificar secrets
supabase secrets list

# 3. Ver logs da função
supabase functions logs send-monthly-sgso --limit 50
```

### Problema: PDF vazio ou incorreto

```typescript
// Testar localmente
import { getSGSOMetricsForVessel } from "@/lib/sgso-report";

const metrics = await getSGSOMetricsForVessel("vessel-uuid");
console.log(metrics);
```

### Problema: Email no spam

1. Configure SPF/DKIM no Resend
2. Verifique domínio verificado no Resend
3. Use domínio corporativo como sender

## 📞 Suporte

- 📚 [Documentação Completa](./SGSO_MONTHLY_REPORTS_IMPLEMENTATION.md)
- 🐛 [Reportar Issue](https://github.com/RodrigoSC89/travel-hr-buddy/issues)
- 💬 Contato: rodrigo@nautilus-one.com

## ✅ Status da Implementação

| Feature | Status |
|---------|--------|
| Email com PDF | ✅ |
| Cron mensal | ✅ |
| Multi-vessel | ✅ |
| Logs detalhados | ✅ |
| Error handling | ✅ |
| Documentação | ✅ |

---

**Última atualização:** Outubro 2025  
**Versão:** 1.0.0
