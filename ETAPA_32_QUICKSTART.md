# 🚀 ETAPA 32 - Quick Start Guide

## Acesso Rápido

Acesse o sistema em: **`/admin/audit-system`**

## Módulos Disponíveis

### 1️⃣ Simulação de Auditoria Externa
**Tab**: Simulação de Auditoria

**Como usar:**
1. Selecione a embarcação
2. Escolha o tipo de auditoria (Petrobras, IBAMA, IMO, ISO, IMCA)
3. Clique em "Simular Auditoria"
4. Aguarde análise da IA (GPT-4)
5. Visualize:
   - Score geral e por norma
   - ✅ Conformidades
   - 🚨 Não conformidades (com severidade)
   - 📄 Relatório técnico
   - 📋 Plano de ação
6. Exporte em PDF

**Tipos de Auditoria:**
- `petrobras_peo_dp` - Petrobras PEO-DP
- `ibama_sgso` - IBAMA SGSO (Resolução ANP 43/2007)
- `imo_ism` - IMO ISM Code
- `imo_modu` - IMO MODU Code
- `iso_9001` - ISO 9001:2015
- `iso_14001` - ISO 14001:2015
- `iso_45001` - ISO 45001:2018
- `imca` - IMCA Guidelines

### 2️⃣ Painel de Performance Técnica
**Tab**: Performance por Embarcação

**Como usar:**
1. Selecione a embarcação
2. Defina período (data início e fim)
3. Clique em "Carregar Métricas"
4. Visualize:
   - Cards: Conformidade, Falhas, MTTR, Treinamentos
   - Radar Chart: Performance geral
   - Bar Chart: Falhas por sistema
   - Comparativo: Ações IA vs Humanas
5. Exporte CSV ou PDF

**Métricas Calculadas:**
- **Conformidade Normativa (%)**: Média de scores de auditorias
- **Total de Falhas**: Contagem de incidentes de segurança
- **MTTR (horas)**: Mean Time To Repair
- **Ações IA vs Humanas**: Tracking de automação
- **Treinamentos**: Capacitações completadas

### 3️⃣ Módulo de Evidências
**Tab**: Evidências

**Como usar:**

**Visualizar:**
1. Selecione a embarcação
2. Aplique filtros (norma, cláusula)
3. Alterne entre "Todas" e "Validadas"
4. Veja alertas de evidências faltantes

**Adicionar:**
1. Selecione norma (ISO, IMO, IBAMA, etc.)
2. Escolha cláusula (templates disponíveis)
3. Descreva a evidência
4. Selecione tipo (documento, vídeo, foto, log, etc.)
5. Faça upload do arquivo (opcional)
6. Clique em "Enviar Evidência"

**Normas Suportadas:**
- ISO 9001, 14001, 45001
- ISM Code, ISPS Code, MODU Code
- IBAMA
- Petrobras
- IMCA

## 🔧 Configuração Inicial

### Passo 1: Executar Migration
```bash
# Na pasta do projeto
supabase db push
```

### Passo 2: Criar Bucket no Storage
No Supabase Dashboard:
1. Storage → New Bucket
2. Nome: `evidence-files`
3. Public: false (apenas autenticados)

### Passo 3: Configurar Variáveis de Ambiente
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave
VITE_OPENAI_API_KEY=sk-proj-...
```

### Passo 4: Testar
1. Acesse `/admin/audit-system`
2. Selecione uma embarcação
3. Execute uma simulação de auditoria

## 📊 Exemplos de Uso

### Exemplo 1: Auditoria IBAMA
```
Embarcação: PSV Atlantic Star
Tipo: IBAMA (SGSO)
Resultado: Score 78/100
- 5 conformidades detectadas
- 3 não conformidades (2 médias, 1 baixa)
- Plano de ação com 4 itens priorizados
```

### Exemplo 2: Performance Mensal
```
Embarcação: PSV Atlantic Star
Período: 01/09/2025 - 30/09/2025
Conformidade: 82%
Falhas: 12 (5 sistema elétrico, 4 propulsão, 3 outros)
MTTR: 8.5 horas
```

### Exemplo 3: Evidências ISO 9001
```
Norma: ISO 9001
Cláusula: 5.1 - Leadership and commitment
Descrição: Ata de reunião mensal com alta direção
Tipo: Documento
Status: Validada ✅
```

## 🎯 Casos de Uso

### Para Gerentes de Qualidade
1. Simular auditorias antes da certificação real
2. Identificar gaps antecipadamente
3. Preparar evidências documentais

### Para Operadores de Frota
1. Monitorar performance técnica
2. Comparar embarcações
3. Priorizar manutenções

### Para Auditores Internos
1. Validar evidências
2. Verificar conformidade normativa
3. Gerar relatórios executivos

## 📱 Atalhos

- **Admin Dashboard**: `/admin`
- **Sistema de Auditoria**: `/admin/audit-system`
- **Dashboard SGSO**: `/admin/sgso`
- **Métricas de Risco**: `/admin/metricas-risco`

## 🆘 Troubleshooting

### Erro: "OpenAI API key not configured"
**Solução**: Configure `VITE_OPENAI_API_KEY` nas variáveis de ambiente e na Supabase Edge Function:
```bash
supabase secrets set OPENAI_API_KEY=sk-proj-...
```

### Erro: "Erro ao enviar arquivo"
**Solução**: Verifique se o bucket `evidence-files` existe e se as políticas RLS estão corretas.

### Simulação demora muito
**Solução**: Normal. GPT-4 pode levar 15-30 segundos para gerar análise completa.

### Métricas retornam vazias
**Solução**: Certifique-se de que há dados no período selecionado (auditorias, incidentes, treinamentos).

## 📚 Documentação Completa

Para mais detalhes técnicos, consulte: `ETAPA_32_IMPLEMENTATION.md`

## 💡 Dicas

- ✅ Execute simulações regularmente para identificar gaps
- 📊 Exporte relatórios mensais de performance
- 📂 Mantenha evidências atualizadas antes de auditorias
- 🔄 Use os alertas de evidências faltantes como checklist
- 📈 Compare performance entre embarcações para benchmarking
