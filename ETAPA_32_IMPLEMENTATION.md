# ETAPA 32 - Sistema de Auditoria Externa, Performance e Evidências

## ✅ Implementação Completa

Este documento descreve a implementação do sistema de simulação de auditoria externa, painel de performance técnica por embarcação e módulo de evidências para certificadoras.

## 📦 Componentes Criados

### 1. Database Schema (`supabase/migrations/20251018143000_audit_simulation_system.sql`)

Criação de tabelas para:
- **audit_simulations**: Armazena simulações de auditorias com IA
- **vessel_performance_metrics**: Métricas de performance por embarcação
- **compliance_evidences**: Evidências para certificadoras (ISO, IMO, IBAMA, etc.)
- **audit_norm_templates**: Templates de normas e cláusulas

Funções PostgreSQL:
- `calculate_vessel_performance_metrics()`: Calcula métricas agregadas
- `get_missing_evidences()`: Identifica evidências faltantes

### 2. Supabase Edge Function (`supabase/functions/audit-simulate/index.ts`)

Função serverless que:
- Recebe solicitação de simulação de auditoria
- Consulta dados da embarcação e histórico
- Usa OpenAI GPT-4 para análise técnica
- Retorna:
  - ✅ Conformidades detectadas
  - 🚨 Não conformidades (com severidade)
  - 📊 Score por norma (0-100)
  - 📄 Relatório técnico
  - 📋 Plano de ação sugerido

Suporta auditorias de:
- Petrobras (PEO-DP)
- IBAMA (SGSO)
- IMO (ISM Code, MODU Code)
- ISO (9001, 14001, 45001)
- IMCA

### 3. Frontend Components

#### AuditSimulator (`src/components/audit/AuditSimulator.tsx`)
- Seleção de embarcação e tipo de auditoria
- Simulação com IA
- Visualização de resultados:
  - Score geral e por norma
  - Conformidades e não conformidades
  - Relatório técnico detalhado
  - Plano de ação priorizado
- Exportação em PDF (html2pdf.js)

#### PerformanceDashboard (`src/components/audit/PerformanceDashboard.tsx`)
- Filtros por embarcação e período
- Métricas exibidas:
  - ✅ Conformidade normativa (%)
  - 📅 Frequência de falhas por sistema
  - 🔧 MTTR (Mean Time To Repair)
  - 🧠 Ações com IA vs humanas
  - 🎓 Treinamentos completados
- Gráficos:
  - Radar Chart (performance geral)
  - Bar Chart (falhas por sistema)
  - Progress bars (IA vs Humano)
- Exportação CSV e PDF

#### EvidenceManager (`src/components/audit/EvidenceManager.tsx`)
- Gestão de evidências por norma e cláusula
- Upload de arquivos (documentos, vídeos, fotos, logs)
- Validação de evidências
- Alertas de evidências faltantes
- Pesquisa e filtros avançados
- Templates de cláusulas por norma

### 4. Admin Page (`src/pages/admin/audit-system.tsx`)
Página centralizada com tabs:
- 📋 Simulação de Auditoria
- 📊 Performance por Embarcação
- 📂 Gestão de Evidências

## 🔧 Configuração

### Variáveis de Ambiente Necessárias
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
VITE_OPENAI_API_KEY=sk-proj-...
```

### Criação do Bucket no Supabase Storage
Para armazenar evidências, é necessário criar um bucket chamado `evidence-files`:

```sql
-- No Supabase Dashboard > Storage > New Bucket
-- Name: evidence-files
-- Public: false (apenas usuários autenticados)
```

## 📊 Fluxo de Uso

### 1. Simulação de Auditoria
1. Acesse `/admin/audit-system`
2. Selecione tab "Simulação de Auditoria"
3. Escolha embarcação e tipo de auditoria
4. Clique em "Simular Auditoria"
5. Aguarde análise da IA (GPT-4)
6. Visualize resultados e exporte PDF

### 2. Performance Dashboard
1. Acesse tab "Performance por Embarcação"
2. Selecione embarcação e período
3. Clique em "Carregar Métricas"
4. Visualize gráficos e indicadores
5. Exporte CSV ou PDF

### 3. Evidências
1. Acesse tab "Evidências"
2. Selecione embarcação
3. Veja alertas de evidências faltantes
4. Adicione novas evidências:
   - Selecione norma e cláusula
   - Descreva a evidência
   - Faça upload de arquivo (opcional)
5. Valide evidências existentes

## 🧠 Integração com IA

### Prompt GPT-4 para Auditoria
O sistema usa um prompt estruturado que:
- Define o papel do auditor (entidade específica)
- Fornece contexto da embarcação
- Lista normas aplicáveis
- Solicita análise em JSON estruturado

### Resposta da IA
```json
{
  "conformidades": ["item 1", "item 2", ...],
  "naoConformidades": [
    {
      "item": "descrição",
      "severidade": "critical|high|medium|low",
      "norma": "norma aplicável"
    }
  ],
  "scoresPorNorma": {
    "norma1": 85,
    "norma2": 72
  },
  "relatorioTecnico": "texto do relatório...",
  "planoAcao": [
    {
      "prioridade": 1,
      "acao": "descrição",
      "prazo": "dias estimados"
    }
  ]
}
```

## 📈 Métricas Calculadas

### Performance por Embarcação
- **Conformidade Normativa**: Média de scores de auditorias
- **Total de Falhas**: Contagem de incidentes de segurança
- **MTTR**: Tempo médio de resolução de incidentes
- **Ações IA vs Humanas**: Tracking de automação
- **Treinamentos**: Capacitações completadas

### Falhas por Sistema
Agrupa incidentes por:
- Sistema operacional
- Localização
- Tipo de equipamento

## 🔐 Segurança

### Row Level Security (RLS)
Todas as tabelas possuem políticas RLS que:
- Limitam acesso por organização
- Verificam autenticação via `auth.uid()`
- Permitem apenas usuários da mesma organização

### Permissões
- Acesso ao módulo: `admin`, `hr_manager`
- Validação de evidências: `admin`
- Visualização: Todos os usuários autenticados da organização

## 📝 Normas Suportadas

### ISO Standards
- **ISO 9001**: Gestão da Qualidade
- **ISO 14001**: Gestão Ambiental
- **ISO 45001**: Saúde e Segurança Ocupacional

### IMO Codes
- **ISM Code**: International Safety Management
- **ISPS Code**: International Ship and Port Facility Security
- **MODU Code**: Mobile Offshore Drilling Units

### Específicas do Brasil
- **IBAMA**: Resolução ANP 43/2007 (SGSO)
- **Petrobras**: PEO-DP

### IMCA
- IMCA M 149
- IMCA M 179
- IMCA SEL 016

## 🚀 Próximos Passos (Sugestões)

1. **Validação Manual**: Interface para auditores validarem resultados da IA
2. **Histórico**: Timeline de auditorias anteriores
3. **Comparações**: Benchmark entre embarcações
4. **Alertas**: Notificações quando conformidade cai abaixo de threshold
5. **Integração**: Vincular evidências automaticamente com incidentes
6. **ML Training**: Treinar modelo específico com histórico de auditorias
7. **Relatórios Avançados**: Templates customizados por certificadora

## 📚 Referências

- [ISO 9001:2015](https://www.iso.org/standard/62085.html)
- [ISO 14001:2015](https://www.iso.org/standard/60857.html)
- [ISO 45001:2018](https://www.iso.org/standard/63787.html)
- [IMO ISM Code](https://www.imo.org/en/OurWork/HumanElement/Pages/ISMCode.aspx)
- [Resolução ANP 43/2007](http://www.anp.gov.br)
- [IMCA Guidelines](https://www.imca-int.com)

## 👥 Suporte

Para dúvidas ou sugestões sobre esta implementação:
- Abra uma issue no repositório
- Consulte a documentação técnica em `/docs`
- Entre em contato com a equipe de desenvolvimento
