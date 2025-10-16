# 🚢 Sistema de Auditoria Técnica IMCA

## Visão Geral

O Sistema de Auditoria Técnica IMCA é uma ferramenta avançada para geração de auditorias técnicas completas para embarcações com sistemas de posicionamento dinâmico (DP), seguindo as normas internacionais IMCA, IMO e MTS.

## 📚 Normas Suportadas

### IMCA Standards
- **IMCA M103** - Guidelines for the Design and Operation of Dynamically Positioned Vessels
- **IMCA M117** - Code of Practice for the Training and Experience of Key DP Personnel
- **IMCA M190** - Code of Practice for Developing and Conducting DP Annual Trials Programmes
- **IMCA M166** - Code of Practice on Failure Modes and Effects Analysis (FMEA)
- **IMCA M109** - Guide to DP-related Documentation
- **IMCA M220** - Guidance on Operational Activity Planning
- **IMCA M140** - Specification for DP Capability Plots

### IMO & MTS Standards
- **MSF 182** - International Guidelines for the Safe Operation of Dynamically Positioned Offshore Supply Vessels
- **MTS DP Operations** - DP Operations Guidance (Marine Technology Society)
- **IMO MSC.1/Circ.1580** - Guidelines for Vessels with Dynamic Positioning Systems

## 🎯 Funcionalidades

### 1. Geração de Auditorias com IA
- Geração automática de auditorias técnicas completas usando GPT-4
- Análise baseada em normas internacionais
- Contextualização com dados operacionais do navio

### 2. Módulos Auditados
O sistema audita os seguintes módulos:
- ✅ Sistema de Controle DP
- ✅ Sistema de Propulsão
- ✅ Sensores de Posicionamento (GNSS, gyro, etc.)
- ✅ Rede e Comunicações
- ✅ Pessoal DP (qualificação conforme IMCA M117)
- ✅ Logs e Históricos (conforme IMCA M109)
- ✅ FMEA (conforme IMCA M166)
- ✅ Testes Anuais (conforme IMCA M190)
- ✅ Documentação
- ✅ Power Management System (PMS)
- ✅ Capability Plots (conforme IMCA M140)
- ✅ Planejamento Operacional (conforme IMCA M220)

### 3. Avaliação de Conformidade
- Classificação de não-conformidades por nível de risco (Alto/Médio/Baixo)
- Identificação de causas prováveis
- Sugestões de ações corretivas
- Referências às normas aplicáveis

### 4. Plano de Ação Priorizado
- Itens críticos destacados
- Cronograma de ações com prazos
- Requisitos de verificação
- Responsáveis e status

### 5. Exportação
- Exportação em formato Markdown
- Pronto para conversão em PDF
- Formatação profissional e técnica

## 🚀 Como Usar

### Passo 1: Acessar o Gerador
Navegue para `/imca-audit` no sistema ou acesse através do menu principal.

### Passo 2: Preencher Dados Básicos
- **Nome da Embarcação**: Ex: "Aurora Explorer"
- **Tipo de Operação**: Navio ou Terra
- **Localização**: Ex: "Campos Basin"
- **Classe DP**: DP1, DP2 ou DP3
- **Objetivo da Auditoria**: Descrição do propósito

### Passo 3: Adicionar Dados Operacionais (Opcional)
- Descrição do incidente ou operação
- Condições meteorológicas
- Informações da tripulação
- Status dos sistemas
- Dados de sensores
- Dados de logs

### Passo 4: Gerar Auditoria
Clique em "Gerar Auditoria IMCA" e aguarde o processamento pela IA.

### Passo 5: Revisar e Exportar
- Revise a auditoria gerada
- Exporte em formato Markdown
- Salve no banco de dados para referência futura

## 📊 Estrutura da Auditoria

```markdown
# Auditoria Técnica IMCA

## 📋 Informações da Auditoria
- Embarcação
- Tipo
- Localização
- Classe DP
- Data
- Auditor
- Objetivo

## 🌊 Contexto Operacional
- Descrição da operação
- Condições meteorológicas
- Status da tripulação

## 📊 Resumo Executivo
- Conformidade geral (%)
- Questões críticas
- Total de não-conformidades

## 📚 Normas de Referência
[Lista de todas as normas IMCA/IMO/MTS]

## 🔍 Módulos Auditados
Para cada módulo:
- Descrição
- Status de conformidade
- Observações
- Não-conformidades
  - Nível de risco
  - Normas aplicáveis
  - Causas prováveis
  - Ações corretivas
- Recomendações

## 📋 Plano de Ação Priorizado
- Itens críticos
- Cronograma de ações
- Prazos e verificações
```

## 🗄️ Banco de Dados

### Tabela: `imca_audits`
Armazena todas as auditorias geradas com:
- Informações da embarcação
- Contexto operacional
- Módulos auditados (JSON)
- Estatísticas de conformidade
- Plano de ação (JSON)
- Metadados (criador, datas, etc.)

### View: `imca_audit_stats`
Estatísticas agregadas:
- Total de auditorias
- Auditorias concluídas/pendentes
- Auditorias com questões críticas
- Total de não-conformidades
- Conformidade média por classe DP

## 🔐 Segurança

- **RLS (Row Level Security)** habilitado
- Apenas usuários autenticados podem ler auditorias
- Apenas o criador pode editar/deletar suas auditorias
- Full-text search em português

## 🤖 Tecnologia

### Frontend
- React + TypeScript
- Shadcn/ui components
- TailwindCSS

### Backend
- Supabase (PostgreSQL)
- Supabase Edge Functions (Deno)
- OpenAI GPT-4o para geração de auditorias

### AI
- Modelo: GPT-4o
- Prompt engineering especializado
- Resposta em formato JSON estruturado
- Temperatura: 0.7 (balanceado)

## 📖 Exemplo de Uso

```typescript
import { generateIMCAAudit } from "@/services/imca-audit-service";

const request = {
  vesselName: "Aurora Explorer",
  operationType: "Navio",
  location: "Campos Basin",
  dpClass: "DP2",
  objective: "Auditoria após incidente de perda parcial de sensor GNSS",
  operationalData: {
    incidentDescription: "Falha parcial do sensor GNSS durante operação...",
    weatherConditions: "Vento moderado 15 knots, corrente lateral 2 knots",
    crewInformation: "DPO qualificado conforme IMCA M117"
  }
};

const audit = await generateIMCAAudit(request);
console.log(`Auditoria gerada com ${audit.totalNonConformities} não-conformidades`);
```

## 🎨 Interface

### Tela Principal
- Formulário intuitivo com abas (Dados Básicos / Dados Operacionais)
- Botão de geração com loading state
- Modal para visualizar normas IMCA

### Tela de Resultados
- Dashboard com estatísticas (Conformidade, Questões Críticas, Não-Conformidades)
- Cards detalhados para cada módulo
- Visualização de não-conformidades com código de cores por risco
- Plano de ação priorizado
- Botão de exportação

## 🔄 Integração com DP Intelligence Center

O sistema de auditorias se integra perfeitamente com o DP Intelligence Center existente:
- Compartilha dados de incidentes DP
- Utiliza análise de incidentes para gerar auditorias contextualizadas
- Normas IMCA consistentes em ambos os módulos

## 📝 Roadmap

- [ ] Suporte a auditorias periódicas programadas
- [ ] Sistema de aprovação de auditorias
- [ ] Dashboard de tendências de conformidade
- [ ] Integração com sistema de gestão de qualidade (SGQ)
- [ ] Exportação em PDF nativo
- [ ] Notificações de prazos de ações corretivas
- [ ] Histórico de auditorias por embarcação
- [ ] Comparação entre auditorias

## 📞 Suporte

Para dúvidas ou sugestões sobre o sistema de auditoria IMCA, entre em contato com a equipe de desenvolvimento ou consulte a documentação das normas IMCA em:
- https://www.imca-int.com/

---

**Gerado com 💡 por GitHub Copilot Agent**
