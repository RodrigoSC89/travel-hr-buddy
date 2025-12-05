# 🎓 Plano de Treinamento Assistido por IA

## Visão Geral

O sistema de treinamento utiliza a IA embarcada para criar uma experiência de aprendizado adaptativa e interativa, funcionando mesmo em modo offline.

---

## Estrutura do Programa de Capacitação

### Módulos de Treinamento

```
📚 Programa de Capacitação Nautilus One
│
├── 🏠 Módulo 1: Introdução ao Sistema
│   ├── 1.1 Visão geral do Nautilus One
│   ├── 1.2 Navegação básica
│   ├── 1.3 Seu perfil e configurações
│   └── 1.4 Primeiros passos
│
├── 🚢 Módulo 2: Gestão de Frota
│   ├── 2.1 Cadastro de embarcações
│   ├── 2.2 Monitoramento de status
│   ├── 2.3 Localização e tracking
│   └── 2.4 Relatórios de frota
│
├── 🔧 Módulo 3: Manutenção
│   ├── 3.1 Criando ordens de serviço
│   ├── 3.2 Workflow de aprovação
│   ├── 3.3 Registro de execução
│   └── 3.4 Histórico e relatórios
│
├── 👥 Módulo 4: Tripulação
│   ├── 4.1 Cadastro de tripulantes
│   ├── 4.2 Certificações e vencimentos
│   ├── 4.3 Escalas de trabalho
│   └── 4.4 Compliance MLC
│
├── 📄 Módulo 5: Documentos
│   ├── 5.1 Upload e organização
│   ├── 5.2 Busca e filtros
│   ├── 5.3 OCR e extração
│   └── 5.4 Versionamento
│
├── 🤖 Módulo 6: Usando o Assistente IA
│   ├── 6.1 O que a IA pode fazer
│   ├── 6.2 Comandos úteis
│   ├── 6.3 Modo offline
│   └── 6.4 Boas práticas
│
└── 📊 Módulo 7: Relatórios e Analytics
    ├── 7.1 Dashboard principal
    ├── 7.2 Relatórios pré-definidos
    ├── 7.3 Relatórios customizados
    └── 7.4 Exportação de dados
```

---

## Lições por Módulo

### Módulo 1: Introdução ao Sistema

**Lição 1.1: Visão Geral**

```typescript
const lesson1_1 = {
  title: 'Bem-vindo ao Nautilus One',
  duration: '5 min',
  objectives: [
    'Entender o propósito do sistema',
    'Conhecer os módulos principais',
    'Identificar seu papel no sistema'
  ],
  content: `
    # O que é o Nautilus One?
    
    O Nautilus One é um sistema completo de gestão marítima que ajuda você a:
    
    - 🚢 **Gerenciar sua frota** - Acompanhe todas as embarcações em tempo real
    - 🔧 **Controlar manutenções** - Nunca perca uma manutenção preventiva
    - 👥 **Administrar tripulação** - Certificações, escalas e compliance
    - 📄 **Organizar documentos** - Tudo digitalizado e acessível
    
    ## Funciona Offline!
    
    Uma característica especial do Nautilus One é que ele funciona mesmo sem internet.
    Você pode continuar trabalhando e os dados serão sincronizados quando a conexão voltar.
  `,
  quiz: [
    {
      question: 'O Nautilus One pode funcionar sem internet?',
      options: ['Sim', 'Não'],
      correct: 0
    },
    {
      question: 'Qual módulo você usaria para registrar um reparo?',
      options: ['Frota', 'Manutenção', 'Documentos', 'Tripulação'],
      correct: 1
    }
  ],
  aiInteraction: {
    prompt: 'Me apresente brevemente o Nautilus One',
    expectedTopics: ['gestão marítima', 'frota', 'manutenção', 'offline']
  }
};
```

**Lição 1.2: Navegação Básica**

```typescript
const lesson1_2 = {
  title: 'Navegando pelo Sistema',
  duration: '10 min',
  type: 'interactive',
  steps: [
    {
      instruction: 'Clique no menu lateral para ver as opções',
      target: '#sidebar-menu',
      highlight: true,
      onComplete: 'Ótimo! Você pode acessar todos os módulos pelo menu.'
    },
    {
      instruction: 'Clique em "Frota" para ver suas embarcações',
      target: '#menu-fleet',
      validation: (location) => location.pathname === '/fleet'
    },
    {
      instruction: 'Use a barra de busca para encontrar um navio',
      target: '#search-input',
      validation: (input) => input.value.length > 0
    },
    {
      instruction: 'Clique no ícone do assistente IA',
      target: '#ai-assistant-button',
      aiResponse: 'Olá! Sou o assistente IA do Nautilus. Posso ajudar você a usar o sistema. Tente me perguntar "Como criar uma ordem de serviço?"'
    }
  ]
};
```

---

### Módulo 6: Usando o Assistente IA

**Lição 6.1: O que a IA pode fazer**

```typescript
const lesson6_1 = {
  title: 'Conhecendo o Assistente IA',
  content: `
    # Seu Assistente Inteligente
    
    O assistente IA do Nautilus One está sempre disponível para ajudar você.
    Ele pode:
    
    ## ✅ O que ele FAZ:
    
    - **Responder perguntas** sobre como usar o sistema
    - **Buscar informações** nos seus dados
    - **Gerar relatórios** automaticamente
    - **Sugerir ações** baseado no contexto
    - **Explicar procedimentos** passo a passo
    
    ## ❌ O que ele NÃO FAZ:
    
    - Tomar decisões críticas por você
    - Acessar dados de outras empresas
    - Executar ações sem sua confirmação
    
    ## 💡 Dica: Modo Offline
    
    Mesmo sem internet, o assistente funciona! 
    Ele usa um modelo local e consegue responder perguntas comuns.
  `,
  
  practicePrompts: [
    {
      instruction: 'Tente perguntar sobre manutenção:',
      example: 'Como criar uma ordem de serviço?',
      expectedResponse: 'Para criar uma ordem de serviço, vá em Manutenção > Nova OS...'
    },
    {
      instruction: 'Peça um relatório:',
      example: 'Mostre as manutenções pendentes',
      expectedResponse: 'Encontrei X manutenções pendentes...'
    },
    {
      instruction: 'Peça ajuda com compliance:',
      example: 'Quais certificados vencem este mês?',
      expectedResponse: 'Verificando certificações... X certificados vencem...'
    }
  ]
};
```

**Lição 6.2: Comandos Úteis**

```typescript
const usefulCommands = {
  navigation: [
    { command: 'Ir para frota', action: 'Navega para a página de frota' },
    { command: 'Abrir manutenção', action: 'Abre o módulo de manutenção' },
    { command: 'Ver meus documentos', action: 'Lista seus documentos' }
  ],
  
  queries: [
    { command: 'Quantos navios estão ativos?', action: 'Conta embarcações ativas' },
    { command: 'Mostre manutenções atrasadas', action: 'Lista OS em atraso' },
    { command: 'Quem está embarcado no [navio]?', action: 'Lista tripulação' }
  ],
  
  actions: [
    { command: 'Criar OS para [navio]', action: 'Inicia wizard de criação' },
    { command: 'Gerar relatório semanal', action: 'Cria relatório automático' },
    { command: 'Exportar dados de [módulo]', action: 'Prepara exportação' }
  ],
  
  help: [
    { command: 'Como faço para...?', action: 'Explica procedimento' },
    { command: 'O que significa [termo]?', action: 'Define termo técnico' },
    { command: 'Qual a diferença entre...?', action: 'Compara conceitos' }
  ]
};
```

---

## Tutor Virtual Interativo

### Implementação

```typescript
// src/lib/training/ai-tutor.ts
export class AITutor {
  private currentModule: string;
  private progress: UserProgress;
  private aiEngine: SmartAssistant;

  constructor() {
    this.aiEngine = new SmartAssistant();
    this.progress = this.loadProgress();
  }

  /**
   * Inicia uma sessão de treinamento
   */
  async startSession(moduleId: string): Promise<TrainingSession> {
    this.currentModule = moduleId;
    const module = await this.loadModule(moduleId);
    
    return {
      module,
      currentLesson: this.getNextLesson(module),
      aiGreeting: await this.generateGreeting(module)
    };
  }

  /**
   * Processa pergunta do usuário durante o treinamento
   */
  async handleQuestion(question: string): Promise<TutorResponse> {
    const context = {
      currentModule: this.currentModule,
      currentLesson: this.progress.currentLesson,
      userLevel: this.progress.level,
      recentTopics: this.progress.recentTopics
    };

    // Verificar se é pergunta sobre o conteúdo atual
    if (this.isAboutCurrentLesson(question)) {
      return this.answerLessonQuestion(question);
    }

    // Verificar se é pedido de ajuda geral
    if (this.isHelpRequest(question)) {
      return this.provideHelp(question);
    }

    // Resposta geral usando IA
    const response = await this.aiEngine.processCommand(question, {
      mode: 'training',
      context
    });

    return {
      answer: response.response,
      suggestions: this.generateFollowUpSuggestions(question),
      relatedLessons: this.findRelatedLessons(question)
    };
  }

  /**
   * Gera explicação adaptativa baseada no nível do usuário
   */
  async explainConcept(concept: string): Promise<Explanation> {
    const userLevel = this.progress.level;
    
    const prompt = `
      Explique "${concept}" para um usuário de nível ${userLevel} do sistema Nautilus One.
      
      Nível iniciante: Use linguagem simples, evite jargões, dê exemplos práticos.
      Nível intermediário: Pode usar termos técnicos, foque em eficiência.
      Nível avançado: Seja direto, inclua dicas avançadas.
      
      Contexto: Sistema de gestão marítima.
      Formato: Explicação clara com exemplos do dia a dia marítimo.
    `;

    const explanation = await this.aiEngine.complete(prompt);
    
    return {
      text: explanation,
      level: userLevel,
      relatedTopics: this.findRelatedTopics(concept),
      practiceExercise: await this.generateExercise(concept)
    };
  }

  /**
   * Simula passo a passo interativo
   */
  async startWalkthrough(taskName: string): Promise<Walkthrough> {
    const task = this.getTaskDefinition(taskName);
    
    return {
      task,
      steps: task.steps.map((step, index) => ({
        ...step,
        number: index + 1,
        aiHint: this.generateHint(step),
        onComplete: () => this.markStepComplete(taskName, index)
      })),
      onComplete: async () => {
        await this.recordTaskCompletion(taskName);
        return this.suggestNextTask(taskName);
      }
    };
  }
}
```

### Componente de UI do Tutor

```typescript
// src/components/training/AITutorPanel.tsx
export function AITutorPanel() {
  const { 
    currentLesson, 
    sendMessage, 
    messages, 
    isTyping,
    suggestions 
  } = useAITutor();

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <GraduationCap className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Tutor IA</h3>
          <p className="text-sm text-muted-foreground">
            {currentLesson?.title || 'Pronto para ajudar'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div 
              key={i}
              className={cn(
                "flex gap-3",
                msg.role === 'user' && "justify-end"
              )}
            >
              {msg.role === 'assistant' && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback>IA</AvatarFallback>
                </Avatar>
              )}
              <div className={cn(
                "rounded-lg p-3 max-w-[80%]",
                msg.role === 'user' 
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}>
                <Markdown>{msg.content}</Markdown>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback>IA</AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-3">
                <TypingIndicator />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="p-2 border-t flex flex-wrap gap-2">
          {suggestions.map((suggestion, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              onClick={() => sendMessage(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t">
        <form onSubmit={(e) => {
          e.preventDefault();
          const input = e.currentTarget.elements.namedItem('message') as HTMLInputElement;
          sendMessage(input.value);
          input.value = '';
        }}>
          <div className="flex gap-2">
            <Input
              name="message"
              placeholder="Faça uma pergunta..."
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

## Perguntas que a IA Pode Responder

### Durante Navegação

| Contexto | Perguntas Suportadas |
|----------|---------------------|
| Dashboard | "O que significam esses números?", "Como atualizar os dados?" |
| Frota | "Como adicionar um navio?", "O que é status 'em manutenção'?" |
| Manutenção | "Como criar uma OS?", "O que é manutenção preventiva?" |
| Tripulação | "Como cadastrar um tripulante?", "O que é certificação STCW?" |
| Documentos | "Como fazer upload?", "O que é OCR?" |

### Perguntas Frequentes

```typescript
const faqResponses = {
  'como criar ordem de serviço': `
    Para criar uma Ordem de Serviço:
    
    1. Vá em **Manutenção** no menu lateral
    2. Clique em **Nova OS**
    3. Selecione a embarcação
    4. Preencha título e descrição
    5. Defina prioridade e prazo
    6. Clique em **Criar**
    
    💡 Dica: Você pode anexar fotos clicando no ícone de câmera.
  `,
  
  'como ver certificados vencendo': `
    Para ver certificados próximos do vencimento:
    
    1. Vá em **Tripulação** > **Certificações**
    2. Use o filtro "Vencendo em 30/60/90 dias"
    
    Ou pergunte-me: "Quais certificados vencem este mês?"
  `,
  
  'como funciona offline': `
    O Nautilus One funciona offline! 
    
    Quando você está sem internet:
    - ✅ Pode criar e editar registros
    - ✅ Pode consultar dados em cache
    - ✅ Pode usar o assistente IA (modo limitado)
    - ⏳ Alterações são salvas e sincronizam depois
    
    Um ícone no topo indica quando você está offline.
  `
};
```

---

## Guia de Boas Práticas

### Para Operadores

```markdown
# Boas Práticas - Operador

## Registro de Manutenção
✅ Sempre inclua fotos do problema
✅ Descreva claramente o que foi feito
✅ Registre peças utilizadas
✅ Informe tempo real de execução

## Documentação
✅ Use nomes descritivos nos arquivos
✅ Mantenha versões atualizadas
✅ Verifique validade dos documentos

## Uso do Sistema
✅ Salve frequentemente quando offline
✅ Sincronize assim que tiver conexão
✅ Verifique notificações diariamente
```

### Para Gestores

```markdown
# Boas Práticas - Gestor

## Dashboard
✅ Revise KPIs diariamente
✅ Atue em alertas críticos imediatamente
✅ Monitore tendências semanais

## Relatórios
✅ Agende relatórios automáticos
✅ Compartilhe insights com a equipe
✅ Use IA para análises profundas

## Compliance
✅ Verifique vencimentos semanalmente
✅ Planeje renovações com antecedência
✅ Mantenha evidências organizadas
```

---

## Métricas de Aprendizado

```typescript
interface LearningMetrics {
  // Progresso geral
  modulesCompleted: number;
  totalModules: number;
  overallProgress: number;
  
  // Desempenho
  quizScores: { moduleId: string; score: number }[];
  averageScore: number;
  
  // Engajamento
  timeSpent: number; // minutos
  questionsAsked: number;
  aiInteractions: number;
  
  // Competências
  skills: {
    name: string;
    level: 'básico' | 'intermediário' | 'avançado';
    verified: boolean;
  }[];
}
```

---

*Plano de treinamento com IA - Documentação gerada em: 2025-12-05*
