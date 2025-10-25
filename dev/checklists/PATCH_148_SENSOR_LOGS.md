# ✅ PATCH 148.0 — Sensor Logs

**Status:** 🟡 Pendente de Validação  
**Data:** 2025-10-25  
**Responsável:** Sistema de Validação Automática

---

## 📋 Resumo do PATCH

Sistema de coleta, armazenamento e visualização de logs técnicos provenientes de sensores IoT embarcados, com alertas automáticos baseados em thresholds configuráveis.

---

## 🎯 Objetivos do PATCH

- [x] Ingestão de dados de sensores IoT via MQTT
- [x] Armazenamento de time-series no Supabase
- [x] Visualização de logs em tempo real
- [x] Configuração de alertas baseados em thresholds
- [x] Dashboard de monitoramento técnico

---

## 🔍 Checklist de Validação

### ◼️ Coleta de Dados

- [ ] **Conectividade MQTT**
  - [ ] Conexão estabelecida com broker MQTT
  - [ ] Subscrição em tópicos de sensores
  - [ ] Recepção de mensagens em tempo real
  - [ ] Reconexão automática em caso de falha

- [ ] **Parsing de Dados**
  - [ ] Mensagens JSON parseadas corretamente
  - [ ] Validação de schema de sensores
  - [ ] Conversão de unidades quando necessário
  - [ ] Timestamp sincronizado com servidor

- [ ] **Tipos de Sensores Suportados**
  - [ ] Temperatura (°C)
  - [ ] Pressão (bar, psi)
  - [ ] RPM (rotações por minuto)
  - [ ] Vibração (Hz, g)
  - [ ] Nível de combustível (%)
  - [ ] Voltagem/corrente (V, A)

### ◼️ Armazenamento

- [ ] **Database Schema**
  - [ ] Tabela `sensor_logs` criada
  - [ ] Índices em timestamp e sensor_id
  - [ ] Particionamento por data (opcional)
  - [ ] Retenção de dados configurável (90 dias padrão)

- [ ] **Performance de Escrita**
  - [ ] Batch insert de múltiplos logs
  - [ ] Throttling para evitar overload (1000 logs/s)
  - [ ] Buffer local para períodos offline
  - [ ] Sincronização ao retornar online

### ◼️ Visualização

- [ ] **Dashboard de Logs**
  - [ ] Lista de sensores ativos
  - [ ] Filtros por tipo, status, período
  - [ ] Gráficos de time-series (Chart.js)
  - [ ] Atualização em tempo real (WebSocket/polling)

- [ ] **Detalhes de Sensor**
  - [ ] Histórico de valores
  - [ ] Estatísticas (min, max, avg)
  - [ ] Status atual (OK, Warning, Critical)
  - [ ] Última leitura com timestamp

- [ ] **Gráficos e Visualizações**
  - [ ] Line chart para tendências
  - [ ] Range selector para zoom temporal
  - [ ] Múltiplos sensores no mesmo gráfico
  - [ ] Exportação de dados (CSV, JSON)

### ◼️ Sistema de Alertas

- [ ] **Configuração de Thresholds**
  - [ ] Interface para definir limites (min/max)
  - [ ] Thresholds por tipo de sensor
  - [ ] Múltiplos níveis (warning, critical)
  - [ ] Histerese para evitar alertas repetidos

- [ ] **Disparo de Alertas**
  - [ ] Detecção automática de violação de threshold
  - [ ] Criação de registro de alerta
  - [ ] Notificação via toast/banner
  - [ ] Integração com sistema de alertas geral

- [ ] **Gestão de Alertas**
  - [ ] Lista de alertas ativos
  - [ ] Histórico de alertas resolvidos
  - [ ] Ações de resposta (acknowledge, dismiss)
  - [ ] Estatísticas de alertas por período

---

## 🧪 Cenários de Teste

### Teste 1: Ingestão de Dados MQTT
```
1. Conectar ao broker MQTT de teste
2. Publicar mensagem de sensor no tópico
3. Verificar recepção no sistema
4. Confirmar salvamento no banco
5. Observar log na interface
```

**Payload MQTT Exemplo:**
```json
{
  "sensor_id": "TEMP_ENGINE_01",
  "type": "temperature",
  "value": 87.5,
  "unit": "celsius",
  "timestamp": "2025-10-25T14:30:00Z",
  "location": "Engine Room"
}
```

**Resultado Esperado:**
- Mensagem recebida e parseada
- Registro criado em `sensor_logs`
- Log visível no dashboard em < 2s

### Teste 2: Visualização de Tendências
```
1. Acessar dashboard de logs
2. Selecionar sensor "TEMP_ENGINE_01"
3. Configurar período: últimas 24h
4. Observar gráfico de linha
5. Fazer zoom em período específico
```

**Resultado Esperado:**
- Gráfico carrega em < 3s
- Dados plotados corretamente
- Zoom funciona suavemente
- Estatísticas atualizadas

### Teste 3: Alerta de Threshold
```
1. Configurar threshold para TEMP_ENGINE_01
   - Warning: > 85°C
   - Critical: > 95°C
2. Simular leitura de 88°C
3. Verificar criação de alerta Warning
4. Simular leitura de 97°C
5. Verificar criação de alerta Critical
```

**Resultado Esperado:**
- Alerta Warning criado aos 88°C
- Notificação exibida na UI
- Alerta Critical criado aos 97°C
- Prioridade elevada no dashboard

### Teste 4: Performance com Alto Volume
```
1. Simular 1000 leituras/minuto de 10 sensores
2. Monitorar performance do sistema
3. Verificar latência de escrita
4. Observar impacto na UI
5. Confirmar integridade dos dados
```

**Resultado Esperado:**
- Sistema processa 1000 logs/min sem falhas
- Latência média de escrita < 100ms
- UI permanece responsiva
- Todos os logs salvos corretamente

### Teste 5: Buffer Offline
```
1. Desconectar rede enquanto sensores geram dados
2. Aguardar acúmulo de 100 leituras no buffer
3. Reconectar rede
4. Observar sincronização automática
5. Verificar integridade dos dados enviados
```

**Resultado Esperado:**
- Leituras armazenadas localmente durante offline
- Sincronização inicia automaticamente ao reconectar
- Todos os 100 logs enviados com sucesso
- Ordem temporal preservada

---

## 🔧 Arquivos Relacionados

```
src/components/logs/
├── SensorLogsTable.tsx          # Tabela de logs
├── SensorChart.tsx              # Gráfico de time-series
├── SensorAlertsList.tsx         # Lista de alertas
└── ThresholdConfig.tsx          # Configuração de limites

src/hooks/
├── useSensorLogs.ts             # Hook para logs
├── useSensorAlerts.ts           # Hook para alertas
└── useMQTTConnection.ts         # Conexão MQTT

src/lib/
├── mqttClient.ts                # Cliente MQTT
├── sensorParser.ts              # Parser de mensagens
├── sensorDB.ts                  # Operações DB
└── alertEngine.ts               # Motor de alertas

supabase/
└── tables/
    ├── sensor_logs.sql          # Schema de logs
    ├── sensor_thresholds.sql    # Thresholds configurados
    └── sensor_alerts.sql        # Alertas disparados
```

---

## 📊 Métricas de Sucesso

| Métrica | Meta | Atual | Status |
|---------|------|-------|--------|
| Throughput Ingestão | > 1000 logs/min | - | 🟡 |
| Latência Escrita | < 100ms | - | 🟡 |
| Uptime MQTT | > 99.5% | - | 🟡 |
| Taxa Detecção Alertas | 100% | - | 🟡 |
| Tempo Load Dashboard | < 3s | - | 🟡 |
| Retenção Dados | 90 dias | - | 🟡 |

---

## 🐛 Problemas Conhecidos

- [ ] **P1:** Buffer offline pode overflow com > 10k leituras acumuladas
- [ ] **P2:** Reconexão MQTT pode demorar até 30s
- [ ] **P3:** Gráficos com > 10k pontos ficam lentos
- [ ] **P4:** Alertas duplicados podem ocorrer em threshold boundary

---

## ✅ Critérios de Aprovação

- [x] Código implementado e sem erros TypeScript
- [ ] Conexão MQTT funcional
- [ ] Logs sendo coletados e armazenados
- [ ] Dashboard de visualização operacional
- [ ] Sistema de alertas funcionando
- [ ] Performance dentro das metas
- [ ] Documentação completa

---

## 📝 Notas Técnicas

### Schema de Sensor Log
```sql
CREATE TABLE sensor_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id TEXT NOT NULL,
  sensor_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  location TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sensor_logs_timestamp ON sensor_logs(timestamp DESC);
CREATE INDEX idx_sensor_logs_sensor_id ON sensor_logs(sensor_id);
```

### Configuração MQTT
- **Broker:** `mqtt://broker.example.com:1883`
- **Tópicos:** `nautilus/sensors/{sensor_id}`
- **QoS:** 1 (at least once delivery)
- **Keep Alive:** 60s

---

## 🚀 Próximos Passos

1. **Machine Learning:** Detecção de anomalias via ML
2. **Agregação:** Downsampling para períodos longos (1h, 1d)
3. **Correlação:** Análise de múltiplos sensores simultaneamente
4. **Preditiva:** Manutenção preditiva baseada em tendências
5. **Integração:** API REST para acesso externo aos logs

---

## 📖 Referências

- [MQTT Protocol](https://mqtt.org/)
- [Time-Series Best Practices](https://docs.timescale.com/timescaledb/latest/)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [IoT Data Ingestion Patterns](https://aws.amazon.com/blogs/iot/)

---

**Última Atualização:** 2025-10-25  
**Próxima Revisão:** Após testes com sensores reais
