# ⚙️ Nautilus Core Alpha – BridgeLink + ControlHub + IA embarcada

## 🧭 Descrição Técnica
Esta PR implementa a **fase inicial do núcleo operacional do Nautilus One**, codinome **"Core Alpha"** — estabelecendo a base para o ecossistema inteligente integrado com IA embarcada, comunicação entre módulos e carregamento seguro.

### Principais entregas:
- 🔧 `safeLazyImport` universal — elimina erros de import dinâmico (`Failed to fetch dynamically imported module`).
- 🛰️ `BridgeLink` — barramento interno de eventos entre módulos (MMI, DP Intelligence, FMEA, ASOG, etc.).
- ⚓ `ControlHub` — painel central de telemetria e controle em tempo real.
- 🧠 `NautilusAI` — base da IA embarcada (stub para futura integração ONNX/GGML).
- 🧩 Ajuste no `vite.config.ts` para evitar chunks corrompidos.

---

## ⚙️ Arquivos Principais Alterados
| Caminho | Descrição |
|----------|------------|
| `src/utils/safeLazyImport.tsx` | Import seguro e fallback universal |
| `src/core/BridgeLink.ts` | Sistema de comunicação interno entre módulos |
| `src/pages/ControlHub.tsx` | Painel de controle e monitoramento em tempo real |
| `src/ai/nautilus-core.ts` | Base da IA embarcada (stub inicial) |
| `vite.config.ts` | Correção de chunks dinâmicos no Vite |

---

## ✅ Checklist Técnico
- [x] Todos os módulos usam `safeLazyImport`
- [x] Build sem erros de import dinâmico
- [x] `BridgeLink` em operação
- [x] `ControlHub` recebendo eventos em tempo real
- [x] IA embarcada simulando inferência (`NautilusAI.analyze()`)
- [x] Testado com sucesso no ambiente Lovable Preview
- [x] Compatibilidade com `Vite 5.x` e `React 18+`

---

## 🔒 Segurança e Conformidade
- Nenhum dado sensível é trafegado no `BridgeLink` (uso local apenas).
- Segue IMCA M 117 e ISM quanto à segregação de camadas funcionais.
- `safeLazyImport` registra erros de import no console controlado.

---

## 🧭 Próximas Fases
| Fase | Entregável | Período |
|------|-------------|----------|
| **Beta 3.1** | Conexão BridgeLink ↔ Backend MQTT | Q1 2025 |
| **RC 3.2** | LLM embarcada funcional (ONNX/GGML) | Q2 2025 |
| **Stable 3.3** | Controle total via ControlHub + auditoria WSOG/FMEA | Q4 2025 |

---

## 👨‍✈️ Revisor Técnico
**Rodrigo Carvalho**  
MB Maritime • DP Systems Auditor • PEO-DP Compliance  
_A presente PR integra a base operacional do Nautilus One com arquitetura de IA embarcada e conformidade IMCA/NORMAM._

---

### 📍 Informações da Branch
- **Branch base:** `main`
- **Nova branch:** `feature/nautilus-core-alpha`
- **Título da PR:**  
  `⚙️ Nautilus Core Alpha – BridgeLink + ControlHub + IA embarcada`
