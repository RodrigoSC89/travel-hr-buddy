# Guia Visual Rápido - Sistemas Marítimos

## 🎯 Acesso Rápido aos Sistemas

### 1️⃣ PEO-DP (Posicionamento Dinâmico Petrobras)
```
🚢 Ícone: Ship (Navio)
🎨 Cor: Azul/Cyan
📍 Rota: /peo-dp
🎯 Para: Auditorias de sistemas DP
```

**Principais Features:**
- ✅ Classes DP (DP1/DP2/DP3)
- ✅ Capability Plots
- ✅ Gestão de Propulsores
- ✅ Power Management
- ✅ Relatórios Petrobras

---

### 2️⃣ SGSO (Segurança Operacional ANP)
```
🛡️ Ícone: Shield (Escudo)
🎨 Cor: Verde/Esmeralda
📍 Rota: /sgso
🎯 Para: Conformidade com ANP
```

**Principais Features:**
- ✅ 17 Práticas Obrigatórias ANP
- ✅ Gestão de Riscos
- ✅ Gestão de Incidentes
- ✅ Treinamentos Obrigatórios
- ✅ Relatórios ANP/IBAMA

---

### 3️⃣ PEOTRAM (Gestão Ambiental)
```
🌍 Ícone: Globe (Globo)
🎨 Cor: Amarelo/Warning
📍 Rota: /peotram
🎯 Para: Gestão ambiental marítima
```

**Principais Features:**
- ✅ Gestão Ambiental
- ✅ Proteção Marinha
- ✅ Gestão de Resíduos
- ✅ Conformidade Ambiental
- ✅ Monitoramento Ambiental

---

## 📊 Fluxo de Navegação

```
Maritime Dashboard
       │
       ├── Quick Actions
       │   ├── PEO-DP → /peo-dp
       │   ├── SGSO → /sgso
       │   └── PEOTRAM → /peotram
       │
       └── Compliance Tab
           ├── Card PEO-DP (click → /peo-dp)
           ├── Card SGSO (click → /sgso)
           └── Card PEOTRAM (click → /peotram)
```

---

## 🗂️ Estrutura de Arquivos

```
src/
├── pages/
│   ├── PeoDp.tsx          ← Página PEO-DP
│   ├── Sgso.tsx           ← Página SGSO
│   ├── PEOTRAM.tsx        ← Página PEOTRAM (corrigida)
│   └── Maritime.tsx       ← Dashboard principal
│
└── components/
    ├── peo-dp/
    │   └── PeoDpAuditManager.tsx
    ├── sgso/
    │   └── SgsoAuditManager.tsx
    └── peotram/
        └── (componentes existentes)

supabase/migrations/
├── 20251008000001_create_peo_dp_tables.sql
└── 20251008000002_create_sgso_tables.sql
```

---

## 🎨 Paleta de Cores

### PEO-DP
```css
Primary: #2563EB (blue-600)
Secondary: #06B6D4 (cyan-600)
Background: from-blue-600 via-blue-700 to-cyan-600
```

### SGSO
```css
Primary: #059669 (emerald-600)
Secondary: #16A34A (green-600)
Background: from-emerald-600 via-emerald-700 to-green-600
```

### PEOTRAM
```css
Primary: #F59E0B (warning)
Secondary: #3B82F6 (info)
Background: from-warning via-warning/90 to-warning-glow
```

---

## 🔍 Decisão Rápida: Qual Sistema Usar?

### Precisa auditar POSICIONAMENTO DINÂMICO?
→ Use **PEO-DP** 🚢

### Precisa cumprir RESOLUÇÃO ANP 43/2007?
→ Use **SGSO** 🛡️

### Precisa gerenciar ASPECTOS AMBIENTAIS?
→ Use **PEOTRAM** 🌍

---

## 📋 Checklists Rápidos

### PEO-DP Checklist
- [ ] Verificar classe DP (DP1/DP2/DP3)
- [ ] Testar propulsores
- [ ] Validar capability plots
- [ ] Verificar power management
- [ ] Gerar relatório Petrobras

### SGSO Checklist
- [ ] Verificar 17 práticas ANP
- [ ] Avaliar riscos operacionais
- [ ] Revisar incidentes
- [ ] Validar treinamentos
- [ ] Gerar relatório ANP/IBAMA

### PEOTRAM Checklist
- [ ] Verificar gestão ambiental
- [ ] Avaliar gestão de resíduos
- [ ] Monitorar proteção marinha
- [ ] Validar conformidade ambiental
- [ ] Gerar relatório ambiental

---

## 🚀 Como Começar

### 1. Acessar Maritime Dashboard
```
/maritime
```

### 2. Escolher Sistema
- Quick Actions (botões)
- Compliance Tab (cards)

### 3. Criar Nova Auditoria
- Clicar em "Nova Auditoria" no sistema escolhido

### 4. Preencher Dados
- Seguir wizard específico do sistema

### 5. Gerar Relatório
- Usar tab "Relatórios" do sistema

---

## 📈 Indicadores de Conformidade

```
PEO-DP:    85% ████████▌░
SGSO:      88% ████████▊░
PEOTRAM:   87% ████████▋░
ISM Code:  92% █████████▏
ISPS Code: 78% ███████▊░░
MARPOL:    95% █████████▌
```

---

## 🔗 Links Rápidos

- **PEO-DP**: http://localhost:8080/peo-dp
- **SGSO**: http://localhost:8080/sgso
- **PEOTRAM**: http://localhost:8080/peotram
- **Maritime**: http://localhost:8080/maritime

---

## 📞 Suporte

### Dúvidas sobre PEO-DP?
→ Consultar: `MARITIME_SYSTEMS_DIFFERENCES.md`

### Dúvidas sobre SGSO?
→ Consultar: `MARITIME_SYSTEMS_IMPLEMENTATION.md`

### Dúvidas sobre implementação?
→ Verificar comentários no código

---

**Versão:** 1.0.0  
**Data:** 2024-10-08  
**Status:** ✅ Funcional
