/**
 * Support System - Sistema de Suporte Completo
 * Prompt 10: Support System (chatbot, tickets, FAQ)
 */

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  resolution?: string;
  resolved_at?: string;
  satisfaction_rating?: number;
  messages: TicketMessage[];
  attachments: TicketAttachment[];
  tags: string[];
}

export type TicketCategory = 
  | 'technical'
  | 'billing'
  | 'feature_request'
  | 'bug_report'
  | 'compliance'
  | 'training'
  | 'general';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_type: 'customer' | 'agent' | 'system';
  sender_name: string;
  content: string;
  created_at: string;
  read: boolean;
}

export interface TicketAttachment {
  id: string;
  filename: string;
  url: string;
  size_bytes: number;
  mime_type: string;
  uploaded_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: string[];
  actions?: ChatAction[];
}

export interface ChatAction {
  type: 'create_ticket' | 'view_article' | 'contact_human' | 'schedule_call';
  label: string;
  payload: Record<string, any>;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  helpful_count: number;
  view_count: number;
  order: number;
}

// AI Chatbot responses
const CHATBOT_RESPONSES: Record<string, { keywords: string[]; response: string; suggestions?: string[] }> = {
  greeting: {
    keywords: ['olá', 'oi', 'hello', 'hi', 'bom dia', 'boa tarde', 'boa noite'],
    response: 'Olá! 👋 Sou o assistente virtual do Nauti One. Como posso ajudar você hoje?',
    suggestions: [
      'Preciso de ajuda com login',
      'Quero reportar um bug',
      'Dúvida sobre faturamento',
      'Falar com atendente humano'
    ]
  },
  login: {
    keywords: ['login', 'entrar', 'senha', 'acesso', 'credenciais'],
    response: `Para problemas de login, tente:

1. **Verifique suas credenciais** - Confira se não há erros de digitação
2. **Caps Lock** - Certifique-se que não está ativado
3. **Limpe o cache** - Ctrl+Shift+Delete no navegador
4. **Esqueceu a senha?** - Use o link "Esqueci minha senha" na tela de login

Se o problema persistir, posso criar um ticket para nossa equipe técnica.`,
    suggestions: ['Criar ticket de suporte', 'Redefinir senha', 'Falar com atendente']
  },
  billing: {
    keywords: ['fatura', 'pagamento', 'cobrança', 'plano', 'assinatura', 'cancelar'],
    response: `Sobre faturamento e assinatura:

📋 **Planos disponíveis:**
- Starter: Até 50 tripulantes - R$ 499/mês
- Pro: Até 500 tripulantes - R$ 1.499/mês
- Enterprise: Ilimitado - Sob consulta

💳 **Pagamento:**
- Cartão de crédito ou boleto
- Desconto de 20% no plano anual

📧 Para questões específicas de faturamento, recomendo falar com nossa equipe.`,
    suggestions: ['Ver planos', 'Atualizar forma de pagamento', 'Falar com comercial']
  },
  bug: {
    keywords: ['bug', 'erro', 'problema', 'não funciona', 'travou', 'lento'],
    response: `Sinto muito pelo inconveniente! Para reportar o problema, preciso de algumas informações:

1. **O que aconteceu?** - Descreva o erro
2. **Quando aconteceu?** - Data e hora aproximada
3. **Navegador** - Chrome, Firefox, Safari?
4. **Passos para reproduzir** - O que você estava fazendo?

Posso criar um ticket com essas informações para nossa equipe técnica investigar.`,
    suggestions: ['Criar ticket de bug', 'Ver status do sistema', 'Soluções comuns']
  },
  human: {
    keywords: ['humano', 'atendente', 'pessoa', 'real', 'falar'],
    response: `Entendo que você prefere falar com um atendente humano. 

📞 **Opções de contato:**
- **Chat ao vivo**: Segunda a sexta, 8h às 18h (BRT)
- **Email**: support@nautione.com (resposta em até 4h)
- **Telefone**: +55 11 4000-0000
- **Agendar ligação**: Escolha um horário conveniente

Posso transferir você agora para um atendente, se estiver em horário comercial.`,
    suggestions: ['Transferir para atendente', 'Agendar ligação', 'Enviar email']
  },
  compliance: {
    keywords: ['mlc', 'stcw', 'compliance', 'auditoria', 'certificado'],
    response: `Sobre compliance marítimo:

📜 **MLC 2006:**
- O sistema monitora automaticamente horas de trabalho/descanso
- Alertas 30 dias antes de vencimentos
- Relatórios para inspeções PSC

📋 **STCW:**
- Validação automática de certificados
- Alertas de treinamentos necessários
- Matriz de competências por função

Posso direcionar você para nossa documentação detalhada ou criar um ticket para o time de compliance.`,
    suggestions: ['Ver documentação MLC', 'Verificar status compliance', 'Falar com especialista']
  }
};

// FAQ Database
const FAQ_DATABASE: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Como faço para redefinir minha senha?',
    answer: 'Na tela de login, clique em "Esqueci minha senha". Digite seu email cadastrado e você receberá um link para criar uma nova senha. O link expira em 24 horas.',
    category: 'Acesso',
    tags: ['senha', 'login', 'acesso'],
    helpful_count: 234,
    view_count: 1523,
    order: 1
  },
  {
    id: 'faq-2',
    question: 'O sistema funciona offline?',
    answer: 'Sim! O Nauti One é um PWA (Progressive Web App) que funciona offline. Os dados são sincronizados automaticamente quando você reconectar. Para instalar, acesse o sistema no Chrome e clique em "Instalar" na barra de endereço.',
    category: 'Funcionalidades',
    tags: ['offline', 'PWA', 'sync'],
    helpful_count: 189,
    view_count: 892,
    order: 2
  },
  {
    id: 'faq-3',
    question: 'Como adiciono um novo tripulante?',
    answer: 'Acesse Crew > Tripulantes > Novo Tripulante. Preencha os dados obrigatórios (nome, cargo, documentos) e clique em Salvar. Você pode importar em lote via CSV em Crew > Importar.',
    category: 'Crew Management',
    tags: ['tripulante', 'cadastro', 'crew'],
    helpful_count: 156,
    view_count: 678,
    order: 3
  },
  {
    id: 'faq-4',
    question: 'Como exporto relatórios?',
    answer: 'Em qualquer dashboard ou listagem, clique no ícone de exportação (↓). Escolha o formato (PDF, Excel, CSV) e o período desejado. Relatórios agendados podem ser configurados em Configurações > Relatórios.',
    category: 'Relatórios',
    tags: ['exportar', 'relatório', 'PDF', 'Excel'],
    helpful_count: 145,
    view_count: 567,
    order: 4
  },
  {
    id: 'faq-5',
    question: 'Posso integrar com outros sistemas?',
    answer: 'Sim! Oferecemos APIs REST e webhooks para integração. Integrações prontas incluem: SAP, Oracle, sistemas de AIS, port community systems. Consulte nossa documentação de API ou fale com nosso time técnico.',
    category: 'Integrações',
    tags: ['API', 'integração', 'webhook'],
    helpful_count: 98,
    view_count: 456,
    order: 5
  },
  {
    id: 'faq-6',
    question: 'Como o MLC 2006 é monitorado automaticamente?',
    answer: 'O sistema registra automaticamente horas de trabalho e descanso a partir de registros de bordo e check-ins. Alertas são gerados quando há risco de violação (ex: menos de 10h de descanso em 24h). Relatórios prontos para inspeção PSC estão disponíveis em Compliance > MLC.',
    category: 'Compliance',
    tags: ['MLC', 'compliance', 'horas'],
    helpful_count: 178,
    view_count: 723,
    order: 6
  },
  {
    id: 'faq-7',
    question: 'Como funciona o backup dos dados?',
    answer: 'Backups automáticos são realizados a cada hora e armazenados em múltiplas regiões. Retenção de 90 dias para backups diários e 1 ano para backups mensais. Você pode solicitar restauração via suporte.',
    category: 'Segurança',
    tags: ['backup', 'dados', 'segurança'],
    helpful_count: 67,
    view_count: 345,
    order: 7
  },
  {
    id: 'faq-8',
    question: 'Quais navegadores são suportados?',
    answer: 'Chrome 90+, Firefox 88+, Safari 14+, Edge 90+. Para melhor experiência, recomendamos Chrome ou Firefox em versões recentes. Internet Explorer não é suportado.',
    category: 'Técnico',
    tags: ['navegador', 'browser', 'compatibilidade'],
    helpful_count: 45,
    view_count: 234,
    order: 8
  }
];

class SupportSystem {
  private tickets: Map<string, SupportTicket> = new Map();
  private chatHistory: Map<string, ChatMessage[]> = new Map();

  /**
   * Get AI chatbot response
   */
  getChatbotResponse(userMessage: string, sessionId: string): ChatMessage {
    const messageLower = userMessage.toLowerCase();
    
    // Find matching response
    let bestMatch: typeof CHATBOT_RESPONSES[string] | null = null;
    let bestScore = 0;

    for (const [key, data] of Object.entries(CHATBOT_RESPONSES)) {
      const matchingKeywords = data.keywords.filter(kw => messageLower.includes(kw));
      if (matchingKeywords.length > bestScore) {
        bestScore = matchingKeywords.length;
        bestMatch = data;
      }
    }

    // Default response if no match
    if (!bestMatch || bestScore === 0) {
      bestMatch = {
        keywords: [],
        response: `Desculpe, não entendi completamente sua dúvida. 

Posso ajudar com:
- 🔐 Problemas de acesso/login
- 💳 Dúvidas sobre faturamento
- 🐛 Reportar bugs
- 📚 Dúvidas sobre funcionalidades
- 👤 Falar com atendente humano

Por favor, tente reformular ou escolha uma das opções acima.`,
        suggestions: [
          'Ver FAQ completo',
          'Criar ticket de suporte',
          'Falar com atendente humano'
        ]
      };
    }

    const response: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: bestMatch.response,
      timestamp: new Date().toISOString(),
      suggestions: bestMatch.suggestions
    };

    // Store in history
    const history = this.chatHistory.get(sessionId) || [];
    history.push({
      id: `msg_${Date.now() - 1}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    });
    history.push(response);
    this.chatHistory.set(sessionId, history);

    return response;
  }

  /**
   * Get chat history
   */
  getChatHistory(sessionId: string): ChatMessage[] {
    return this.chatHistory.get(sessionId) || [];
  }

  /**
   * Create support ticket
   */
  createTicket(data: {
    subject: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
    created_by: string;
    attachments?: TicketAttachment[];
  }): SupportTicket {
    const ticket: SupportTicket = {
      id: `TKT-${Date.now()}`,
      ...data,
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: [],
      attachments: data.attachments || [],
      tags: this.autoTag(data.subject, data.description)
    };

    this.tickets.set(ticket.id, ticket);
    return ticket;
  }

  /**
   * Get ticket by ID
   */
  getTicket(id: string): SupportTicket | undefined {
    return this.tickets.get(id);
  }

  /**
   * Get user tickets
   */
  getUserTickets(userId: string): SupportTicket[] {
    return Array.from(this.tickets.values())
      .filter(t => t.created_by === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  /**
   * Add message to ticket
   */
  addMessage(ticketId: string, message: Omit<TicketMessage, 'id' | 'ticket_id' | 'created_at' | 'read'>): TicketMessage | null {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return null;

    const newMessage: TicketMessage = {
      id: `msg_${Date.now()}`,
      ticket_id: ticketId,
      ...message,
      created_at: new Date().toISOString(),
      read: false
    };

    ticket.messages.push(newMessage);
    ticket.updated_at = new Date().toISOString();
    
    if (message.sender_type === 'customer') {
      ticket.status = 'open';
    }

    return newMessage;
  }

  /**
   * Update ticket status
   */
  updateTicketStatus(ticketId: string, status: TicketStatus, resolution?: string): boolean {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return false;

    ticket.status = status;
    ticket.updated_at = new Date().toISOString();

    if (status === 'resolved' || status === 'closed') {
      ticket.resolved_at = new Date().toISOString();
      if (resolution) ticket.resolution = resolution;
    }

    return true;
  }

  /**
   * Get all FAQs
   */
  getFAQs(): FAQItem[] {
    return FAQ_DATABASE.sort((a, b) => a.order - b.order);
  }

  /**
   * Get FAQs by category
   */
  getFAQsByCategory(category: string): FAQItem[] {
    return FAQ_DATABASE
      .filter(faq => faq.category === category)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Search FAQs
   */
  searchFAQs(query: string): FAQItem[] {
    const queryLower = query.toLowerCase();
    return FAQ_DATABASE
      .filter(faq => 
        faq.question.toLowerCase().includes(queryLower) ||
        faq.answer.toLowerCase().includes(queryLower) ||
        faq.tags.some(tag => tag.toLowerCase().includes(queryLower))
      )
      .sort((a, b) => b.helpful_count - a.helpful_count);
  }

  /**
   * Mark FAQ as helpful
   */
  markFAQHelpful(faqId: string): void {
    const faq = FAQ_DATABASE.find(f => f.id === faqId);
    if (faq) {
      faq.helpful_count++;
    }
  }

  /**
   * Get support statistics
   */
  getStatistics(): {
    total_tickets: number;
    open_tickets: number;
    avg_resolution_time_hours: number;
    satisfaction_rate: number;
    top_categories: { category: string; count: number }[];
  } {
    const tickets = Array.from(this.tickets.values());
    const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress');
    
    const resolvedTickets = tickets.filter(t => t.resolved_at);
    const avgResolutionTime = resolvedTickets.length > 0
      ? resolvedTickets.reduce((sum, t) => {
          const created = new Date(t.created_at).getTime();
          const resolved = new Date(t.resolved_at!).getTime();
          return sum + (resolved - created);
        }, 0) / resolvedTickets.length / (1000 * 60 * 60)
      : 0;

    const ratedTickets = tickets.filter(t => t.satisfaction_rating);
    const satisfactionRate = ratedTickets.length > 0
      ? ratedTickets.reduce((sum, t) => sum + (t.satisfaction_rating || 0), 0) / ratedTickets.length
      : 0;

    const categoryCount: Record<string, number> = {};
    tickets.forEach(t => {
      categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
    });

    const topCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total_tickets: tickets.length,
      open_tickets: openTickets.length,
      avg_resolution_time_hours: Math.round(avgResolutionTime * 10) / 10,
      satisfaction_rate: Math.round(satisfactionRate * 10) / 10,
      top_categories: topCategories
    };
  }

  private autoTag(subject: string, description: string): string[] {
    const text = `${subject} ${description}`.toLowerCase();
    const tags: string[] = [];

    if (text.includes('login') || text.includes('senha') || text.includes('acesso')) {
      tags.push('acesso');
    }
    if (text.includes('erro') || text.includes('bug') || text.includes('problema')) {
      tags.push('bug');
    }
    if (text.includes('mlc') || text.includes('stcw') || text.includes('compliance')) {
      tags.push('compliance');
    }
    if (text.includes('fatura') || text.includes('pagamento') || text.includes('cobrança')) {
      tags.push('billing');
    }
    if (text.includes('api') || text.includes('integração') || text.includes('webhook')) {
      tags.push('integração');
    }

    return tags;
  }
}

export const supportSystem = new SupportSystem();
