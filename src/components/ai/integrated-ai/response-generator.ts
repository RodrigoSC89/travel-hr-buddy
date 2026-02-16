interface AIResponse {
  content: string;
  confidence: number;
  functionCalls: string[];
  sources: string[];
}

export const generateAIResponse = async (prompt: string): Promise<AIResponse> => {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes("vendas") || lowerPrompt.includes("receita")) {
    return {
      content: `📊 **Análise de Vendas Concluída**

Com base nos dados disponíveis, identifiquei os seguintes insights:

**Métricas Principais:**
• Receita atual: R$ 2.847.392
• Crescimento vs. mês anterior: +12.8%
• Número de transações: 1.429
• Ticket médio: R$ 1.993

**Tendências Identificadas:**
1. **Crescimento Consistente**: Vendas crescendo 12.8% ao mês
2. **Sazonalidade**: Picos nas terças e quintas-feiras
3. **Produtos Top**: Categoria "Tecnologia" lidera com 34% das vendas

**Recomendações:**
✅ Focar em campanhas nas terças e quintas
✅ Expandir estoque de tecnologia
✅ Implementar cross-selling para aumentar ticket médio

Deseja que eu gere um relatório detalhado ou configure alertas automáticos?`,
      confidence: 94,
      functionCalls: ["analytics_query", "sales_analysis"],
      sources: ["price_alerts", "user_statistics"]
    };
  }

  if (lowerPrompt.includes("equipe") || lowerPrompt.includes("rh") || lowerPrompt.includes("funcionário")) {
    return {
      content: `👥 **Análise de Equipe - Relatório Executivo**

**Overview da Equipe:**
• Total de colaboradores ativos: 47
• Taxa de retenção: 94.2%
• Satisfação média: 8.7/10
• Produtividade geral: +15% vs. trimestre anterior

**Destaques por Departamento:**
📈 **Vendas**: 12 pessoas, performance 118% da meta
💻 **TI**: 8 pessoas, 98% de entregas no prazo
📊 **Marketing**: 6 pessoas, ROI de campanhas +23%
🏢 **Operações**: 21 pessoas, eficiência operacional 91%

**Oportunidades de Melhoria:**
1. **Treinamento**: 15% dos colaboradores precisam de capacitação
2. **Ferramentas**: Modernizar stack tecnológico do time de operações
3. **Processos**: Automatizar aprovações para reduzir gargalos

**Próximos Passos:**
🎯 Implementar programa de mentoria
🎯 Investir em novas ferramentas de produtividade
🎯 Criar dashboard de performance individual

Posso detalhar algum departamento específico ou criar um plano de ação?`,
      confidence: 92,
      functionCalls: ["hr_analysis", "performance_metrics"],
      sources: ["employee_certificates", "performance_metrics"]
    };
  }

  if (lowerPrompt.includes("automatizar") || lowerPrompt.includes("workflow") || lowerPrompt.includes("processo")) {
    return {
      content: `⚙️ **Sistema de Automação Configurado**

Identifiquei oportunidades de automação nos seus processos:

**Automações Recomendadas:**

🔄 **Aprovação de Documentos**
• Roteamento automático baseado em valor/tipo
• Notificações inteligentes para aprovadores
• Escalação automática após 48h

📧 **Comunicação Inteligente**
• Relatórios automáticos semanais
• Alertas de KPIs críticos
• Lembretes de tarefas pendentes

📊 **Análise de Dados**
• Dashboards atualizados em tempo real
• Alertas de anomalias nos dados
• Relatórios mensais automatizados

Deseja ativar alguma automação específica ou configurar novos triggers?`,
      confidence: 96,
      functionCalls: ["workflow_setup", "automation_config"],
      sources: ["optimization_actions", "intelligent_notifications"]
    };
  }

  if (lowerPrompt.includes("dashboard") || lowerPrompt.includes("kpi") || lowerPrompt.includes("métricas")) {
    return {
      content: `📈 **Dashboard de KPIs Criado**

**KPIs Financeiros:**
💰 Receita Mensal: R$ 2.847.392 (+12.8%)
💳 Margem de Lucro: 34.2% (+2.1%)
💸 Custos Operacionais: R$ 1.873.248 (-3.4%)
🎯 ROI: 187% (+15%)

**KPIs Operacionais:**
⚡ Produtividade: 94.7% (+8.2%)
🕐 Tempo Médio de Resposta: 2.3h (-25%)
✅ Taxa de Conclusão: 97.1% (+4.3%)
🔄 Eficiência de Processos: 89.4% (+6.7%)

**KPIs de Equipe:**
👥 Satisfação: 8.7/10 (+0.4)
📚 Horas de Treinamento: 42h/mês (+12h)
🎯 Metas Atingidas: 94.3% (+7.2%)
⭐ Net Promoter Score: 73 (+8)

O dashboard está disponível em tempo real. Posso configurar alertas adicionais ou criar visualizações específicas?`,
      confidence: 98,
      functionCalls: ["dashboard_creation", "kpi_analysis"],
      sources: ["system_metrics", "performance_metrics", "ux_metrics"]
    };
  }

  return {
    content: `Entendi sua solicitação! Como seu assistente IA empresarial, posso ajudar com:

🎯 **Análises e Relatórios**
• Análise de vendas e performance
• Relatórios financeiros automatizados
• Insights de business intelligence

⚡ **Automação de Processos**
• Configuração de workflows
• Notificações inteligentes
• Otimização de operações

👥 **Gestão de Equipe**
• Análise de produtividade
• Métricas de satisfação
• Planos de desenvolvimento

📊 **Business Intelligence**
• Dashboards personalizados
• KPIs em tempo real
• Análises preditivas

Como posso ajudá-lo especificamente hoje?`,
    confidence: 85,
    functionCalls: ["general_help"],
    sources: []
  };
};
