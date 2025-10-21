# AI Compliance & Audit Engine - Nautilus

## 🎯 Objetivo

O **AI Compliance & Audit Engine** é um módulo de auditoria automática que monitora a conformidade das operações marítimas com base em normas e diretrizes internacionais, incluindo:

- **IMCA**: M103, M109, M117, M140, M166, M190, M206, M216, M254, MSF182
- **IMO Guidelines** e **MTS Recommendations**
- **ISM Code**, **ISPS Code**
- **NORMAM-101**

## 🏗️ Arquitetura

### Componentes Principais

1. **AI Compliance Engine** (`src/lib/compliance/ai-compliance-engine.ts`)
   - Motor de inferência ONNX para análise de conformidade
   - Sistema de pontuação ponderada baseado em 15 normas marítimas
   - Integração com Supabase para armazenamento de logs
   - Publicação de alertas via MQTT

2. **Compliance Dashboard** (`src/components/compliance/ComplianceDashboard.tsx`)
   - Interface visual para monitoramento em tempo real
   - Indicadores visuais de status (Verde/Amarelo/Vermelho)
   - Exibição de pontuação percentual
   - Referência às normas auditadas

3. **Database Schema** (`compliance_audit_logs`)
   - Armazenamento histórico de auditorias
   - Índices otimizados para consultas rápidas
   - Políticas RLS para segurança

## 📊 Sistema de Pontuação

### Pesos das Normas

```typescript
IMCA_M103:    8%  - Marine Operations
IMCA_M109:    6%  - DP Vessel Design
IMCA_M117:   10%  - DP Operations
IMCA_M140:    7%  - DP FMEA
IMCA_M166:    7%  - DP Incident Reporting
IMCA_M190:    5%  - ASOG
IMCA_M206:    6%  - DP Annual Trials
IMCA_M216:    8%  - DP Operations Record
IMCA_M254:    5%  - DP Capability Plots
MSF_182:      4%  - Marine Safety Forum
IMO_GUIDE:    6%  - IMO Guidelines
MTS_GUIDE:    6%  - MTS Recommendations
ISM_CODE:     6%  - International Safety Management
ISPS_CODE:    8%  - International Ship and Port Security
NORMAM_101:   8%  - Normas Brasileiras
```

### Níveis de Conformidade

- **✅ Conforme** (>85%): Sistema em total conformidade
- **⚠️ Risco** (65-85%): Atenção necessária, possíveis gaps
- **❌ Não Conforme** (<65%): Ação imediata requerida

## 🚀 Uso

### 1. Executar Auditoria

```typescript
import { runComplianceAudit } from "@/lib/compliance/ai-compliance-engine";

// Dados de exemplo para auditoria
const auditData = [0.9, 0.85, 0.78, 0.92, 0.8];

const result = await runComplianceAudit(auditData);
console.log(result);
// { score: 0.872, complianceLevel: "Conforme" }
```

### 2. Visualizar Dashboard

O dashboard está integrado no **Control Hub** (`/control-hub`):

```typescript
import ComplianceDashboard from "@/components/compliance/ComplianceDashboard";

<ComplianceDashboard />
```

### 3. Receber Alertas MQTT

Subscreva ao tópico para receber alertas em tempo real:

```typescript
Topic: nautilus/compliance/alerts
Payload: {
  "level": "Risco",
  "score": 0.72
}
```

## 🗄️ Database

### Tabela: `compliance_audit_logs`

```sql
CREATE TABLE compliance_audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  score float NOT NULL CHECK (score >= 0 AND score <= 1),
  level text NOT NULL CHECK (level IN ('Conforme', 'Risco', 'Não Conforme')),
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
```

### Consultas Úteis

```sql
-- Últimas auditorias
SELECT * FROM compliance_audit_logs 
ORDER BY timestamp DESC 
LIMIT 10;

-- Status de conformidade atual
SELECT level, COUNT(*) 
FROM compliance_audit_logs 
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY level;

-- Tendência de pontuação
SELECT 
  DATE_TRUNC('hour', timestamp) as hour,
  AVG(score) as avg_score
FROM compliance_audit_logs
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY hour
ORDER BY hour DESC;
```

## 🔧 Configuração

### Variáveis de Ambiente

```env
VITE_MQTT_URL=wss://broker.hivemq.com:8884/mqtt
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

### Modelo ONNX

Coloque o modelo de IA em:
```
public/models/nautilus_compliance.onnx
```

Se o modelo não estiver disponível, o sistema irá registrar um erro mas continuará funcionando (fallback graceful).

## 📈 Integração com ControlHub

O Compliance Dashboard está integrado automaticamente no Control Hub:

```typescript
// src/pages/ControlHub.tsx
const ComplianceDashboard = safeLazyImport(
  () => import("@/components/compliance/ComplianceDashboard"),
  "ComplianceDashboard"
);

// No grid principal
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <ControlHubPanel />
  <SystemAlerts />
  <ComplianceDashboard />
</div>
```

## 🔐 Segurança

- **RLS (Row Level Security)** habilitado
- Usuários autenticados podem ler logs
- Apenas service role pode inserir logs
- Políticas personalizadas podem ser adicionadas conforme necessário

## 📝 Notas Técnicas

### ONNX Runtime Web

O módulo usa `onnxruntime-web` para inferência de modelos de IA no navegador. Isso permite:
- Processamento client-side sem latência de servidor
- Privacidade dos dados (processamento local)
- Redução de custos de infraestrutura

### MQTT Integration

Alertas são publicados em tempo real via MQTT para permitir:
- Notificações push em outros sistemas
- Integração com dashboards externos
- Logs distribuídos

### Supabase Integration

Todos os resultados de auditoria são persistidos para:
- Histórico completo de conformidade
- Análise de tendências
- Relatórios regulatórios

## 🛠️ Desenvolvimento

### Adicionar Nova Norma

1. Adicione a norma ao array `RULES`:

```typescript
{ id: "NOVA_NORMA", weight: 0.05 }
```

2. Ajuste os pesos para somar 100%

3. Atualize a documentação

### Personalizar Níveis

Modifique os thresholds em `runComplianceAudit()`:

```typescript
const complianceLevel = 
  weightedScore > 0.90 ? "Excelente" :
  weightedScore > 0.75 ? "Bom" :
  weightedScore > 0.60 ? "Aceitável" :
  "Crítico";
```

## 📚 Referências

- [IMCA Standards](https://www.imca-int.com/)
- [IMO Guidelines](https://www.imo.org/)
- [ISM Code](https://www.imo.org/en/OurWork/HumanElement/Pages/ISMCode.aspx)
- [ISPS Code](https://www.imo.org/en/OurWork/Security/Pages/ISPS.aspx)
- [NORMAM-01](https://www.marinha.mil.br/dpc/normam)

## ✅ Checklist de Implementação

- [x] Motor de compliance engine
- [x] Dashboard visual
- [x] Integração com ControlHub
- [x] Tabela Supabase
- [x] Alertas MQTT
- [x] Documentação
- [ ] Modelo ONNX (deploy manual)
- [ ] Testes automatizados
- [ ] Calibração de pesos
- [ ] Dashboard de histórico

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação do projeto principal ou abra uma issue no GitHub.
