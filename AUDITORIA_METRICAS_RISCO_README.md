# Auditoria Métricas Risco - Sistema de Gestão de Risco Operacional

## 📋 Visão Geral

Sistema completo para monitoramento e gestão de métricas de risco em auditorias IMCA, com integração automática ao painel SGSO e exportação/envio automatizado de relatórios.

## 🎯 Funcionalidades

### 1. **Banco de Dados**
- ✅ Campo `embarcacao` adicionado à tabela `auditorias_imca`
- ✅ Nova tabela `auditoria_alertas` para rastreamento de falhas críticas
- ✅ Função RPC `auditoria_metricas_risco()` para agregação de métricas
- ✅ Row Level Security (RLS) implementado para segurança

### 2. **Exportação de Dados**
- 📄 Exportação automática em **CSV**
- 📊 Exportação automática em **PDF** (via HTML)
- 🔄 Edge Function `exportar-metricas` para geração sob demanda

### 3. **Integração SGSO**
- 🧭 Endpoint `/api/admin/sgso` para painel de risco operacional
- 📈 Mapeamento automático de risco por embarcação
- ⚠️ Destaque automático para embarcações com > 3 alertas/mês

### 4. **Envio Automatizado**
- 📧 Email automático mensal (dia 01)
- 📎 Anexo CSV com dados completos
- 🔗 Link para painel interativo
- 👥 Destinatários: compliance, segurança, diretoria

## 🗄️ Estrutura do Banco de Dados

### Tabela: `auditorias_imca`
```sql
- embarcacao: TEXT -- Nome da embarcação auditada
- (outros campos existentes...)
```

### Tabela: `auditoria_alertas`
```sql
- id: UUID PRIMARY KEY
- auditoria_id: UUID (FK -> auditorias_imca)
- tipo_alerta: TEXT ('critico', 'alto', 'medio', 'baixo')
- descricao: TEXT
- severidade: INTEGER (1-5)
- status: TEXT ('aberto', 'em_analise', 'resolvido', 'fechado')
- responsavel_id: UUID (FK -> users)
- data_identificacao: TIMESTAMP
- data_resolucao: TIMESTAMP
- acao_corretiva: TEXT
- observacoes: TEXT
```

### Função RPC: `auditoria_metricas_risco()`
Retorna métricas agregadas por embarcação e mês:
```typescript
{
  auditoria_id: UUID,
  embarcacao: TEXT,
  mes: TEXT,           // Formato: 'YYYY-MM'
  falhas_criticas: BIGINT
}
```

## 🚀 APIs e Endpoints

### 1. Edge Function: `exportar-metricas`
**Endpoint:** `https://[projeto].supabase.co/functions/v1/exportar-metricas`

**Método:** GET

**Resposta:**
```json
{
  "success": true,
  "timestamp": "2025-10-16T19:47:15.167Z",
  "recordCount": 42,
  "csv": "string (conteúdo CSV)",
  "html": "string (HTML para PDF)",
  "data": [...],
  "summary": {
    "totalAudits": 42,
    "highRiskVessels": 3
  }
}
```

### 2. API Admin: `/api/admin/sgso`
**Endpoint:** `/api/admin/sgso`

**Método:** GET

**Resposta:**
```json
{
  "success": true,
  "timestamp": "2025-10-16T19:47:15.167Z",
  "summary": {
    "total_embarcacoes": 10,
    "embarcacoes_alto_risco": 3,
    "total_falhas_criticas": 45,
    "embarcacoes_criticas": 1
  },
  "risco_operacional": [
    {
      "embarcacao": "Navio Alpha",
      "total_falhas_criticas": 15,
      "nivel_risco": "critico",
      "ultimas_auditorias": 3,
      "meses_com_alertas": ["2025-10", "2025-09", "2025-08"]
    }
  ]
}
```

### 3. Edge Function: `send-auditoria-report`
**Endpoint:** `https://[projeto].supabase.co/functions/v1/send-auditoria-report`

**Método:** POST

**Body:**
```json
{
  "recipients": [
    "compliance@empresa.com",
    "seguranca@empresa.com",
    "diretoria@empresa.com"
  ]
}
```

**Resposta:**
```json
{
  "success": true,
  "timestamp": "2025-10-16T19:47:15.167Z",
  "recipients": ["..."],
  "emailId": "re_abc123",
  "recordCount": 42,
  "summary": {
    "totalAudits": 42,
    "highRiskVessels": 3
  }
}
```

## ⏰ Agendamento Automático

### Cron Job Configurado
- **Frequência:** Mensal (dia 01)
- **Horário:** 09:00 UTC (06:00 BRT)
- **Função:** `send-auditoria-report`
- **Configuração:** `supabase/functions/cron.yaml`

```yaml
send-auditoria-report:
  schedule: '0 9 1 * *' # Todo dia 01 de cada mês às 09:00 UTC
  endpoint: '/send-auditoria-report'
  method: POST
```

## 📧 Formato do Email Automatizado

### Conteúdo
1. **Cabeçalho:** Título e data do relatório
2. **Resumo Executivo:**
   - Total de auditorias
   - Embarcações monitoradas
   - Total de falhas críticas
   - Embarcações em alto risco

3. **Alertas:** Destacando embarcações críticas (>3 falhas/mês)
4. **Tabela:** Top 10 auditorias recentes
5. **Botão:** Link para painel interativo completo
6. **Anexo:** CSV com dados completos

### Destinatários Padrão
- `compliance@nautilus.system`
- `seguranca@nautilus.system`
- Pode ser customizado via API

## 🔒 Segurança (RLS)

### Políticas Implementadas
1. **Usuários comuns:**
   - Veem apenas alertas de suas próprias auditorias
   - Podem criar/editar alertas em suas auditorias

2. **Administradores:**
   - Acesso completo a todos os alertas
   - Podem gerenciar alertas de qualquer auditoria

## 📊 Níveis de Risco

### Classificação Automática
- **Baixo:** < 1 falha crítica/mês em média
- **Médio:** 1-3 falhas críticas/mês em média
- **Alto:** 3-5 falhas críticas/mês em média
- **Crítico:** > 5 falhas críticas/mês em média

## 🛠️ Instalação e Configuração

### 1. Aplicar Migration
```bash
# A migration será aplicada automaticamente ao fazer deploy
# Arquivo: supabase/migrations/20251016194700_create_auditoria_metricas_risco.sql
```

### 2. Configurar Variáveis de Ambiente
```env
NEXT_PUBLIC_SUPABASE_URL=https://[projeto].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RESEND_API_KEY=re_...
APP_URL=https://app.nautilus.system
EMAIL_FROM=noreply@nautilus.system
```

### 3. Deploy Edge Functions
```bash
# Deploy exportar-metricas
supabase functions deploy exportar-metricas

# Deploy send-auditoria-report
supabase functions deploy send-auditoria-report
```

## 📱 Uso no Frontend

### Exemplo: Buscar Métricas para SGSO
```typescript
const response = await fetch('/api/admin/sgso');
const data = await response.json();

// Usar data.risco_operacional para renderizar mapa de risco
```

### Exemplo: Exportar Relatório Manualmente
```typescript
const response = await fetch(
  'https://[projeto].supabase.co/functions/v1/exportar-metricas'
);
const data = await response.json();

// Baixar CSV
const blob = new Blob([data.csv], { type: 'text/csv' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'metricas-risco.csv';
a.click();
```

## 🧪 Testes

### Testar Função RPC
```sql
SELECT * FROM public.auditoria_metricas_risco();
```

### Testar API SGSO
```bash
curl http://localhost:3000/api/admin/sgso
```

### Testar Exportação
```bash
curl https://[projeto].supabase.co/functions/v1/exportar-metricas
```

### Testar Envio de Email (Manual)
```bash
curl -X POST https://[projeto].supabase.co/functions/v1/send-auditoria-report \
  -H "Content-Type: application/json" \
  -d '{"recipients": ["teste@empresa.com"]}'
```

## 📈 Roadmap

- [x] Banco de dados e RPC function
- [x] Exportação CSV/PDF
- [x] API SGSO para integração de painel
- [x] Email automatizado mensal
- [ ] Dashboard visual no frontend
- [ ] Notificações push para alertas críticos
- [ ] Integração com sistema de tickets
- [ ] Análise preditiva com AI

## 🤝 Contribuindo

Para adicionar novas funcionalidades ou melhorias, siga o padrão estabelecido:
1. Adicione migrations em `supabase/migrations/`
2. Crie edge functions em `supabase/functions/`
3. Adicione APIs em `pages/api/`
4. Atualize esta documentação

## 📝 Licença

Copyright © 2025 Travel HR Buddy - Nautilus System
