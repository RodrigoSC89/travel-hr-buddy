# Diferenças Entre os Sistemas Marítimos

## 🔍 Resumo Executivo

Este documento resume as principais diferenças entre os três sistemas marítimos implementados:

---

## 📊 Comparação Rápida

| Característica | PEO-DP | SGSO | PEOTRAM |
|---------------|---------|------|---------|
| **Objetivo** | Auditoria de Posicionamento Dinâmico | Gestão de Segurança Operacional | Gestão Ambiental Marítima |
| **Regulador** | Petrobras | ANP (Agência Nacional do Petróleo) | Geral (Ambiental) |
| **Foco** | Sistemas DP, Propulsores, Capability | Segurança, Riscos, Incidentes | Meio Ambiente, Proteção Marinha |
| **Aplicável a** | Embarcações com DP | Instalações Offshore (FPSO, Plataformas) | Operações Marítimas em Geral |
| **Frequência** | Anual/Intermediária | Anual/Periódica | Anual |
| **Cor UI** | Azul/Cyan | Verde/Esmeralda | Verde/Variações |
| **Ícone** | Ship | Shield | Globe |

---

## 🎯 PEO-DP (Petrobras - Dynamic Positioning)

### Propósito
Sistema específico da Petrobras para auditoria de sistemas de posicionamento dinâmico em embarcações offshore.

### O que é Auditado
- ✅ **Sistemas DP**: Operação e redundância
- ✅ **Propulsores (Thrusters)**: Principais, proa, popa, azimuth
- ✅ **Power Management**: Geradores e distribuição de energia
- ✅ **Capability Plots**: Gráficos de capacidade operacional
- ✅ **FMEA**: Análise de modos de falha
- ✅ **Sensores**: GPS, DGPS, referências de posição
- ✅ **Weather Limits**: Limitações operacionais

### Classes DP
- **DP1**: Sistema único, sem redundância
- **DP2**: Redundância parcial, mantém posição com falha única
- **DP3**: Redundância total com segregação física

### Tabelas do Banco de Dados
1. `peo_dp_audits` - Auditorias principais
2. `dynamic_positioning_systems` - Sistemas DP
3. `dp_thrusters` - Propulsores
4. `dp_capability_plots` - Capability plots
5. `dp_power_management` - Gestão de energia
6. `peo_dp_petrobras_reports` - Relatórios Petrobras

### Rota
`/peo-dp`

---

## 🛡️ SGSO (Sistema de Gestão de Segurança Operacional)

### Propósito
Sistema obrigatório da ANP (Resolução 43/2007) para gestão de segurança em instalações offshore.

### 17 Práticas Obrigatórias ANP
1. Liderança e Responsabilização
2. Política de SMS (Saúde, Meio Ambiente e Segurança)
3. Conformidade Legal
4. Análise e Gestão de Riscos
5. Procedimentos Operacionais
6. Capacitação e Treinamento
7. Comunicação e Consulta
8. Gestão de Mudanças
9. Aquisição de Bens e Serviços
10. Resposta a Emergências
11. Gestão de Integridade de Poços
12. Gestão de Integridade de Instalações
13. Registros e Documentação
14. Investigação de Incidentes
15. Monitoramento de Desempenho
16. Auditoria e Revisão
17. Melhoria Contínua

### Aplicável a
- FPSOs (Floating Production Storage and Offloading)
- Plataformas fixas e flutuantes
- Sondas de perfuração
- Semi-submersíveis
- Instalações submarinas

### Tabelas do Banco de Dados
1. `sgso_audits` - Auditorias SGSO
2. `sgso_anp_practices` - 17 Práticas ANP
3. `sgso_risk_assessments` - Avaliação de riscos
4. `sgso_training_management` - Gestão de treinamentos
5. `sgso_incident_management` - Gestão de incidentes
6. `sgso_regulatory_reports` - Relatórios ANP/IBAMA
7. `sgso_management_system` - Sistema de gestão

### Rota
`/sgso`

---

## 🌊 PEOTRAM (Gestão Ambiental Marítima)

### Propósito
Programa de Excelência Operacional em Trabalho Ambiental Marítimo - foco em conformidade ambiental.

### O que é Gerenciado
- ✅ **Gestão Ambiental**: Políticas e procedimentos
- ✅ **Proteção Marinha**: Preservação de ecossistemas
- ✅ **Gestão de Resíduos**: Controle e descarte adequado
- ✅ **Conformidade Ambiental**: Atendimento a normas ambientais
- ✅ **Monitoramento**: Indicadores ambientais
- ✅ **Prevenção**: Medidas preventivas de poluição

### Diferença dos Outros Sistemas
**ANTES (Confuso):**
- Era tratado como sistema geral de auditoria
- Misturava conceitos de DP e segurança

**AGORA (Correto):**
- Foco específico em GESTÃO AMBIENTAL
- Separado de sistemas técnicos (DP) e segurança (SGSO)
- Claramente identificado na interface

### Tabelas do Banco de Dados
- Utiliza as tabelas existentes: `peotram_audits`, `peotram_documents`, etc.
- Foco em gestão ambiental e conformidade

### Rota
`/peotram`

---

## 🔄 Quando Usar Cada Sistema

### Use PEO-DP quando:
- ❓ Precisar auditar sistemas de posicionamento dinâmico
- ❓ Trabalhar com embarcações DP1, DP2 ou DP3
- ❓ Analisar capability plots
- ❓ Avaliar propulsores e power management
- ❓ Cumprir requisitos Petrobras para DP

### Use SGSO quando:
- ❓ Precisar cumprir Resolução ANP 43/2007
- ❓ Auditar instalações offshore
- ❓ Implementar as 17 práticas obrigatórias
- ❓ Gerenciar riscos operacionais
- ❓ Reportar para ANP/IBAMA
- ❓ Investigar incidentes
- ❓ Gerenciar treinamentos obrigatórios

### Use PEOTRAM quando:
- ❓ Precisar gerenciar aspectos ambientais
- ❓ Controlar resíduos e efluentes
- ❓ Monitorar impactos ambientais
- ❓ Cumprir normas ambientais
- ❓ Proteger ecossistemas marinhos
- ❓ Auditar gestão ambiental

---

## 🎨 Identificação Visual na Interface

### PEO-DP
- **Cor Primária**: Azul (#2563EB - blue-600)
- **Cor Secundária**: Cyan (#06B6D4 - cyan-600)
- **Ícone**: 🚢 Ship
- **Badges**: Capability Plots, Classes DP, Gestão de Propulsores

### SGSO
- **Cor Primária**: Verde (#059669 - emerald-600)
- **Cor Secundária**: Verde (#16A34A - green-600)
- **Ícone**: 🛡️ Shield
- **Badges**: 17 Práticas ANP, Gestão de Riscos, Relatórios ANP/IBAMA

### PEOTRAM
- **Cor Primária**: Amarelo/Warning (#F59E0B - warning)
- **Cor Secundária**: Info (#3B82F6 - info)
- **Ícone**: 🌍 Globe
- **Badges**: Gestão Ambiental, Conformidade Ambiental, Proteção Marinha

---

## 📍 Navegação no Sistema

### Maritime Dashboard > Quick Actions

1. **PEO-DP - Posicionamento Dinâmico** 
   - Ícone: Ship (azul)
   - Navega para: `/peo-dp`

2. **SGSO - Segurança Operacional ANP**
   - Ícone: Shield (verde)
   - Navega para: `/sgso`

3. **PEOTRAM - Gestão Ambiental**
   - Ícone: FileText (amarelo)
   - Navega para: `/peotram`

### Maritime Dashboard > Compliance Tab

Cards informativos com:
- Nome do sistema
- Descrição curta
- Percentual de conformidade
- Lista de elementos principais
- Click para navegar ao sistema

---

## 🔑 Pontos-Chave de Diferenciação

### 1. **Escopo Técnico**
- **PEO-DP**: Sistemas mecânicos e eletrônicos de DP
- **SGSO**: Processos e gestão de segurança
- **PEOTRAM**: Meio ambiente e impactos ecológicos

### 2. **Regulamentação**
- **PEO-DP**: Normas Petrobras + IMCA
- **SGSO**: Resolução ANP nº 43/2007
- **PEOTRAM**: Normas ambientais gerais

### 3. **Tipo de Instalação**
- **PEO-DP**: Embarcações com DP
- **SGSO**: Qualquer instalação offshore
- **PEOTRAM**: Operações marítimas em geral

### 4. **Foco da Auditoria**
- **PEO-DP**: Capacidade técnica e operacional
- **SGSO**: Conformidade com práticas de segurança
- **PEOTRAM**: Impacto e conformidade ambiental

### 5. **Relatórios**
- **PEO-DP**: Relatórios Petrobras
- **SGSO**: Relatórios ANP/IBAMA
- **PEOTRAM**: Relatórios ambientais

---

## ✅ Checklist de Uso Correto

### Ao criar uma nova auditoria:

**Pergunte-se:**

1. ❓ **É sobre sistemas de posicionamento dinâmico?**
   - ✅ Sim → Use **PEO-DP**
   - ❌ Não → Próxima pergunta

2. ❓ **É sobre segurança operacional e práticas ANP?**
   - ✅ Sim → Use **SGSO**
   - ❌ Não → Próxima pergunta

3. ❓ **É sobre gestão ambiental e proteção marinha?**
   - ✅ Sim → Use **PEOTRAM**
   - ❌ Não → Sistema não aplicável

---

## 📈 Métricas de Conformidade

Cada sistema tem suas próprias métricas:

### PEO-DP
- Conformidade com capability plots
- Status operacional de propulsores
- Eficiência de power management
- Classificação DP atendida

### SGSO
- Percentual de atendimento às 17 práticas
- Número de não-conformidades
- Riscos identificados e mitigados
- Incidentes investigados

### PEOTRAM
- Conformidade ambiental
- Gestão adequada de resíduos
- Indicadores de proteção marinha
- Auditorias ambientais completas

---

## 🚀 Resumo para Implementação

### Desenvolvedor deve saber:
1. Cada sistema tem seu próprio conjunto de tabelas
2. Rotas são independentes: `/peo-dp`, `/sgso`, `/peotram`
3. Componentes estão em pastas separadas
4. Cores e ícones são distintos para cada sistema

### Usuário deve saber:
1. PEO-DP = Sistemas de Posicionamento Dinâmico (Petrobras)
2. SGSO = Segurança Operacional (17 Práticas ANP)
3. PEOTRAM = Gestão Ambiental Marítima

### Auditor deve saber:
1. Não misturar auditorias de sistemas diferentes
2. Cada sistema tem requisitos e checklists específicos
3. Relatórios são gerados separadamente
4. Conformidade é medida independentemente

---

**Resumo Final:** Os três sistemas são COMPLETAMENTE SEPARADOS e atendem necessidades distintas das operações marítimas offshore.
