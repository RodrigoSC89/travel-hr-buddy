# Nautilus Beta 3.1 - AI Embarcada e Conectividade MQTT

## 📋 Visão Geral

Esta atualização implementa três componentes principais para o sistema Nautilus One:

1. **BridgeLink Event Bus** - Sistema de comunicação entre módulos
2. **MQTT Client** - Conexão bidirecional com broker MQTT
3. **NautilusAI Inference** - Inferência de IA local com ONNX Runtime

## 🧠 NautilusAI - Inferência Local

### Características

- ✅ Suporte a modelos ONNX
- ✅ Inferência offline (não requer conexão)
- ✅ Análise contextual de logs
- ✅ Detecção de padrões de risco
- ✅ Análise de eventos DP e FMEA

### Uso Básico

```typescript
import { nautilusInference } from "@/ai/nautilus-inference";

// Carregar modelo
await nautilusInference.loadModel("/models/nautilus-mini.onnx");

// Analisar texto
const result = await nautilusInference.analyze("Texto para análise");
console.log(result); // "🧩 Confidence: 85.23%"

// Analisar contexto de logs
const logs = [
  "DP system operating normally",
  "Thruster 1 status: OK",
  "Position accuracy: 2.5m"
];

const analysis = await nautilusInference.analyzeContext(logs);
console.log(analysis);
// {
//   summary: "Analysis of 3 entries: ...",
//   insights: ["✅ No significant patterns detected"],
//   risks: ["✅ No significant risks identified"]
// }
```

### Detecção de Padrões

O NautilusAI detecta automaticamente:

- ⚠️ **Erros e Warnings**: Identifica padrões de erro nos logs
- 🔴 **Eventos Críticos**: Detecta keywords como "critical", "failure", "emergency"
- ⚓ **Eventos DP**: Monitora sistema de posicionamento dinâmico
- 📊 **Alto Volume**: Identifica quando há muitos eventos simultâneos

### API Completa

```typescript
// Informações do modelo
const info = nautilusInference.getModelInfo();
// { url: "/models/nautilus-mini.onnx", loaded: true }

// Verificar se está carregado
const isLoaded = nautilusInference.isModelLoaded();

// Descarregar modelo
await nautilusInference.unload();
```

## 📡 MQTTClient - Comunicação em Tempo Real

### Características

- ✅ Conexão automática ao broker MQTT
- ✅ Reconexão automática (a cada 5 segundos)
- ✅ Integração com BridgeLink
- ✅ Publicação e subscrição de tópicos
- ✅ Tratamento de erros robusto

### Configuração

Adicione ao arquivo `.env`:

```bash
# MQTT Broker Configuration
VITE_MQTT_URL=ws://localhost:1883  # Local
# ou
VITE_MQTT_URL=wss://mqtt.yourdomain.com:8883  # Produção (TLS)
```

### Uso Básico

```typescript
import { MQTTClient } from "@/core/MQTTClient";

// Conectar ao broker
MQTTClient.connect();
// Ou com URL customizada
MQTTClient.connect("ws://mqtt.example.com:1883");

// Enviar eventos
MQTTClient.send("nautilus/dp/telemetry", {
  position: { lat: -22.9068, lon: -43.1729 },
  accuracy: 2.5,
  thrusters: [
    { id: 1, status: "ok", power: 75 },
    { id: 2, status: "ok", power: 80 }
  ]
});

// Subscrever a tópicos adicionais
MQTTClient.subscribe("nautilus/alerts");
MQTTClient.subscribe(["topic1", "topic2", "topic3"]);

// Desinscrever
MQTTClient.unsubscribe("nautilus/alerts");

// Verificar status
const isConnected = MQTTClient.getConnectionStatus();

// Desconectar
MQTTClient.disconnect();
```

### Eventos Emitidos

O MQTTClient emite eventos através do BridgeLink:

- `mqtt:connected` - Quando conecta ao broker
- `mqtt:disconnected` - Quando desconecta
- `mqtt:reconnecting` - Durante tentativas de reconexão
- `mqtt:error` - Quando ocorre erro
- `mqtt:offline` - Quando o cliente fica offline
- `nautilus:event` - Quando recebe mensagens do tópico `nautilus/events`

### Tópicos Padrão

O sistema se inscreve automaticamente em:

- `nautilus/events` - Eventos gerais do sistema

### Casos de Uso

#### 1. Telemetria DP

```typescript
MQTTClient.send("nautilus/dp/telemetry", {
  timestamp: new Date().toISOString(),
  position: { lat: -22.9068, lon: -43.1729 },
  accuracy: 2.5,
  mode: "auto",
  thrusters: [
    { id: 1, status: "ok", power: 75, rpm: 1850 },
    { id: 2, status: "ok", power: 80, rpm: 1920 }
  ]
});
```

#### 2. Alertas FMEA

```typescript
MQTTClient.send("nautilus/fmea/alert", {
  severity: "high",
  component: "thruster_3",
  message: "Performance degradation detected",
  timestamp: new Date().toISOString(),
  recommendedAction: "Inspect thruster bearings"
});
```

#### 3. Logs ASOG

```typescript
MQTTClient.send("nautilus/asog/log", {
  eventType: "inspection",
  inspector: "João Silva",
  vessel: "Platform Alpha",
  status: "compliant",
  findings: [],
  timestamp: new Date().toISOString()
});
```

## 🔗 BridgeLink Event Bus

### Características

- ✅ Comunicação assíncrona entre módulos
- ✅ Múltiplos subscribers por evento
- ✅ Tratamento de erros em callbacks
- ✅ Gerenciamento de subscrições
- ✅ Singleton global

### Uso Básico

```typescript
import { BridgeLink } from "@/core/BridgeLink";

// Subscrever a um evento
const unsubscribe = BridgeLink.on("nautilus:event", (data) => {
  console.log("Evento recebido:", data);
});

// Emitir evento
BridgeLink.emit("nautilus:event", {
  message: "DP system operating normally",
  timestamp: new Date().toISOString()
});

// Desinscrever
unsubscribe();
```

### API Completa

```typescript
// Subscrever a evento
const unsub = BridgeLink.on("event:name", (data) => {
  // Handle event
});

// Emitir evento
BridgeLink.emit("event:name", { data: "payload" });

// Contar subscribers
const count = BridgeLink.getSubscriberCount("event:name");

// Listar eventos registrados
const events = BridgeLink.getRegisteredEvents();
// ["event:name", "another:event"]

// Remover todos os listeners de um evento
BridgeLink.removeAllListeners("event:name");

// Limpar todos os subscribers
BridgeLink.clear();
```

### Eventos Padrão do Sistema

- `nautilus:event` - Eventos gerais (MQTT, logs, etc)
- `mqtt:connected` - MQTT conectado
- `mqtt:disconnected` - MQTT desconectado
- `mqtt:reconnecting` - MQTT reconectando
- `mqtt:error` - Erro MQTT
- `mqtt:offline` - MQTT offline
- `dp:event` - Eventos do sistema DP
- `asog:event` - Eventos ASOG
- `fmea:event` - Eventos FMEA

### Exemplo React

```typescript
import { useEffect, useState } from "react";
import { BridgeLink } from "@/core/BridgeLink";

function MyComponent() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Subscribe to events
    const unsub = BridgeLink.on("nautilus:event", (data) => {
      setEvents((prev) => [...prev, data]);
    });

    // Cleanup
    return () => unsub();
  }, []);

  return (
    <div>
      {events.map((event, i) => (
        <div key={i}>{event.message}</div>
      ))}
    </div>
  );
}
```

## 🎯 ControlHub - Console de Telemetria

O ControlHub foi atualizado para integrar todos os sistemas:

### Recursos

- ✅ Console de telemetria em tempo real
- ✅ Exibe eventos BridgeLink + MQTT
- ✅ Indicador de status MQTT
- ✅ Buffer de 50 eventos mais recentes
- ✅ Auto-refresh a cada 30 segundos

### Visualização

O console exibe eventos no formato:

```
[2025-10-20T23:07:52.616Z] [MQTT] DP system operating normally
[2025-10-20T23:07:53.123Z] [MQTT] Thruster allocation updated
[2025-10-20T23:07:54.456Z] [MQTT] Position accuracy: 2.5m
```

## 🧪 Testes

Todos os módulos possuem cobertura de testes completa:

### Executar Testes

```bash
# Todos os testes
npm test

# Apenas testes novos
npm test src/tests/bridgelink-event-bus.test.ts
npm test src/tests/mqtt-client.test.ts
npm test src/tests/nautilus-inference.test.ts
```

### Cobertura

- **BridgeLink**: 13 testes (subscrição, emissão, gerenciamento)
- **MQTTClient**: 24 testes (conexão, publicação, subscrição)
- **NautilusInference**: 20 testes (carregamento, análise, contexto)

**Total**: 57 testes ✅

## 🔒 Segurança e Resiliência

### Reconexão Automática MQTT

- ✅ Tentativas a cada 5 segundos
- ✅ Timeout de conexão de 10 segundos
- ✅ Eventos de status em tempo real

### Tratamento de Erros

- ✅ Callbacks protegidos no BridgeLink
- ✅ Fallback gracioso em caso de falha MQTT
- ✅ Logs detalhados de erros

### Modo Offline

- ✅ NautilusAI funciona sem internet
- ✅ Sistema continua operando se MQTT falhar
- ✅ Cache local no ControlHub

## 📦 Futuras Expansões

### Previsto para Beta 3.2+

- [ ] Assinatura JWT entre módulos críticos
- [ ] Armazenamento IndexedDB para logs offline
- [ ] Logs de auditoria IMCA M 117 / NORMAM 101
- [ ] Modelo Nautilus-mini (~80MB) embarcado
- [ ] TLS/SSL para conexões MQTT
- [ ] Compressão de payload MQTT
- [ ] Persistência e replay de logs

## 📚 Documentação Adicional

- [CONTROL_HUB_IMPLEMENTATION_COMPLETE.md](../CONTROL_HUB_IMPLEMENTATION_COMPLETE.md)
- [CONTROL_HUB_QUICKREF.md](../CONTROL_HUB_QUICKREF.md)
- [Arquitetura do Sistema](../DEPLOYMENT_ARCHITECTURE.md)

## 🛠️ Troubleshooting

### MQTT não conecta

1. Verifique se `VITE_MQTT_URL` está configurado
2. Confirme que o broker está acessível
3. Verifique firewall/CORS para WebSockets

### Modelo AI não carrega

1. Verifique o caminho do modelo ONNX
2. Confirme que o arquivo existe
3. Verifique console para erros específicos

### Eventos não aparecem no ControlHub

1. Verifique se MQTTClient está conectado
2. Confirme subscrição ao tópico correto
3. Verifique console de erros do BridgeLink

## 📞 Suporte

Para questões ou problemas, abra uma issue no repositório ou consulte a documentação completa.

---

**Versão**: Beta 3.1  
**Data**: Q1 2025  
**Status**: ✅ Implementado
