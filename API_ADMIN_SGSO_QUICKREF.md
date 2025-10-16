# API Admin SGSO - Referência Rápida

## 🎯 Endpoint

```
GET /api/admin/sgso
```

## 🔑 Classificação de Risco

| Nível | Ícone | Total de Falhas | Código |
|-------|-------|-----------------|--------|
| Alto | 🔴 | >= 5 | `"alto"` |
| Moderado | 🟠 | 3-4 | `"moderado"` |
| Baixo | 🟢 | < 3 | `"baixo"` |

## 📦 Resposta

```typescript
interface VesselRisk {
  embarcacao: string;      // Nome da embarcação
  total: number;           // Total de falhas críticas
  por_mes: {               // Falhas por mês
    [mes: string]: number; // "YYYY-MM": quantidade
  };
  risco: "baixo" | "moderado" | "alto"; // Nível de risco
}

// Retorna: VesselRisk[]
```

## 💻 Exemplo de Resposta

```json
[
  {
    "embarcacao": "Navio Atlântico",
    "total": 7,
    "por_mes": { "2025-10": 3, "2025-09": 2, "2025-08": 2 },
    "risco": "alto"
  }
]
```

## 🚀 Uso Rápido

### JavaScript

```javascript
// Buscar dados
const response = await fetch('/api/admin/sgso');
const vessels = await response.json();

// Filtrar por risco
const highRisk = vessels.filter(v => v.risco === 'alto');
const moderateRisk = vessels.filter(v => v.risco === 'moderado');
const lowRisk = vessels.filter(v => v.risco === 'baixo');

// Estatísticas
const stats = {
  total: vessels.length,
  alto: highRisk.length,
  moderado: moderateRisk.length,
  baixo: lowRisk.length
};
```

### TypeScript

```typescript
interface VesselRisk {
  embarcacao: string;
  total: number;
  por_mes: Record<string, number>;
  risco: 'baixo' | 'moderado' | 'alto';
}

const fetchSGSOData = async (): Promise<VesselRisk[]> => {
  const response = await fetch('/api/admin/sgso');
  return response.json();
};
```

## 🎨 Badge Visual

```typescript
const getRiskBadge = (risco: string) => {
  const badges = {
    alto: { icon: '🔴', label: 'Alto Risco', color: 'red' },
    moderado: { icon: '🟠', label: 'Moderado', color: 'orange' },
    baixo: { icon: '🟢', label: 'Baixo Risco', color: 'green' }
  };
  return badges[risco] || badges.baixo;
};
```

## ❌ Códigos de Erro

| Código | Descrição | Resposta |
|--------|-----------|----------|
| 405 | Método não permitido | `{ "error": "Método não permitido." }` |
| 500 | Erro do banco de dados | `{ "error": "<mensagem>" }` |
| 500 | Erro interno | `{ "error": "Erro interno do servidor." }` |

## 📊 Análise Rápida

```javascript
// Total de falhas na frota
const totalFalhas = vessels.reduce((sum, v) => sum + v.total, 0);

// Embarcação mais crítica
const mostCritical = vessels.sort((a, b) => b.total - a.total)[0];

// Falhas do mês atual
const currentMonth = '2025-10';
const monthlyFails = vessels.reduce(
  (sum, v) => sum + (v.por_mes[currentMonth] || 0), 
  0
);

// Taxa de risco alto
const highRiskRate = (highRisk.length / vessels.length * 100).toFixed(1);
```

## 🔄 Atualização em Tempo Real

```javascript
// Polling a cada 5 minutos
setInterval(async () => {
  const data = await fetch('/api/admin/sgso').then(r => r.json());
  updateDashboard(data);
}, 5 * 60 * 1000);
```

## 📈 Tendência Mensal

```javascript
// Calcular tendência de uma embarcação
const getTrend = (vessel) => {
  const months = Object.keys(vessel.por_mes).sort();
  const values = months.map(m => vessel.por_mes[m]);
  
  const trend = values[values.length - 1] - values[0];
  return trend > 0 ? '📈 Aumentando' : 
         trend < 0 ? '📉 Diminuindo' : 
         '➡️ Estável';
};
```

## 🎯 Use Cases Rápidos

### 1. Alert System
```javascript
const alertHighRisk = (vessels) => {
  const critical = vessels.filter(v => v.risco === 'alto');
  if (critical.length > 0) {
    sendAlert(`${critical.length} embarcações em alto risco!`);
  }
};
```

### 2. Dashboard Card
```javascript
const DashboardCard = ({ vessel }) => (
  <Card className={`risk-${vessel.risco}`}>
    <h3>{vessel.embarcacao}</h3>
    <Badge>{getRiskBadge(vessel.risco).label}</Badge>
    <p>Total: {vessel.total} falhas</p>
  </Card>
);
```

### 3. Risk Chart
```javascript
const chartData = vessels.map(v => ({
  name: v.embarcacao,
  value: v.total,
  fill: v.risco === 'alto' ? '#ef4444' : 
        v.risco === 'moderado' ? '#f97316' : '#22c55e'
}));
```

## ⚡ Performance

- **Tempo de resposta**: ~150ms
- **Cache recomendado**: 5-10 minutos
- **Otimização**: Agregação no banco de dados

## 🔐 Segurança

- ✅ Service Role Key
- ✅ Row Level Security
- ✅ Validação de método
- ✅ Tratamento de erros

## 📝 Notas Importantes

1. **Período de dados**: Últimos 12 meses
2. **Critério**: Incidentes críticos/alta severidade
3. **Atualização**: Dados atualizados em tempo real
4. **Fonte**: RPC `auditoria_metricas_risco()`

## 🎓 Referência Completa

Para documentação detalhada, consulte [API_ADMIN_SGSO.md](./API_ADMIN_SGSO.md)

---

**Versão**: 1.0.0 | **Status**: ✅ Produção | **Testes**: 30/30 ✅
