# 🚑 PATCH_25.8 — AutoHeal System Quick Reference

## 📖 O que é?

Sistema de auto-recuperação que detecta e corrige falhas de módulos em runtime automaticamente.

## 🎯 Principais Recursos

- ✅ **Auto-detecção** de erros em módulos lazy-loaded
- ✅ **Rollback automático** para versão funcional em cache
- ✅ **Logging** em Supabase + MQTT para auditoria
- ✅ **Zero downtime** - aplicação continua funcionando

## 🔧 Comandos Rápidos

```bash
# Instalar/Reinstalar o sistema
npm run setup:autoheal

# Build normal
npm run build

# Verificar lint
npm run lint
```

## 📁 Arquivos Principais

- `src/lib/ai/AutoHealSystem.ts` - Core do sistema
- `src/lib/ai/AutoHealMonitor.ts` - Monitor MQTT
- `src/AppRouter.tsx` - Integração com rotas
- `src/main.tsx` - Inicialização do monitor

## 🔍 Como Usar

### Carregar Módulo com AutoHeal

```typescript
import { AutoHealSystem } from "@/lib/ai/AutoHealSystem";

const MyModule = React.lazy(() =>
  AutoHealSystem.loadSafely("MyModule", () => import("@/pages/MyModule"))
);
```

### Inicializar Monitor

```typescript
import { initAutoHealMonitor } from "@/lib/ai/AutoHealMonitor";

// No main.tsx ou App.tsx
initAutoHealMonitor();
```

## 📊 Logs e Monitoramento

### Console Logs

```
🚑 AutoHeal Monitor conectado ao MQTT
🛑 Falha detectada no módulo Dashboard: Error message
🔁 Restaurando módulo anterior de cache: Dashboard
```

### Supabase

Tabela: `system_logs`
```json
{
  "type": "autoheal_error",
  "message": "Failed to fetch",
  "context": { "module": "Dashboard" },
  "created_at": "2025-10-22T03:08:00.000Z"
}
```

### MQTT

Tópico: `system/autoheal`
```json
{
  "module": "Dashboard",
  "error": "Failed to fetch dynamically imported module"
}
```

## 🔐 Variáveis Necessárias

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_KEY=eyJ...
VITE_MQTT_URL=wss://broker.hivemq.com:8884/mqtt
```

## 🎨 Fluxo de Trabalho

```
Módulo carregado
    ↓
Sucesso? → Cache atualizado → Módulo renderizado
    ↓
Erro? → Log (Supabase + MQTT)
    ↓
Cache existe? → Rollback → Módulo anterior renderizado
    ↓
Sem cache? → Mensagem de erro amigável
```

## 🧪 Testar

1. Force um erro em um módulo
2. Veja logs no console com 🛑
3. Confira Supabase `system_logs`
4. Monitore MQTT `system/autoheal`
5. Verifique rollback/recuperação

## 💡 Benefícios

- 🟢 Previne "tela branca"
- 🟢 Recovery automático
- 🟢 Auditoria completa
- 🟢 Zero config para devs
- 🟢 Compatível com código existente

## 📌 Status

**Versão:** PATCH_25.8  
**Build:** ✅ Passing  
**Tests:** ✅ Passing  
**Deployment:** ✅ Ready

---

**Desenvolvido para Travel HR Buddy - Nautilus AI Platform**
