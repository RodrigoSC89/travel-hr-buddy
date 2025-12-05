# 🧠 Personalização da LLM para Contexto Marítimo

## Visão Geral

Este documento descreve como personalizar a LLM embarcada para entender e responder corretamente ao contexto específico da indústria marítima.

---

## 1. Vocabulário Técnico Marítimo

### 1.1 Glossário de Termos

```json
{
  "glossary": {
    "embarcações": {
      "PSV": "Platform Supply Vessel - Embarcação de suprimento para plataformas",
      "AHTS": "Anchor Handling Tug Supply - Rebocador de manuseio de âncoras",
      "FPSO": "Floating Production Storage and Offloading - Unidade flutuante de produção",
      "OSV": "Offshore Support Vessel - Embarcação de apoio offshore",
      "tanker": "Navio-tanque para transporte de líquidos a granel",
      "bulk carrier": "Navio graneleiro para carga seca a granel",
      "container ship": "Navio porta-contêineres"
    },
    
    "partes_navio": {
      "proa": "Parte dianteira do navio",
      "popa": "Parte traseira do navio",
      "bombordo": "Lado esquerdo olhando para a proa",
      "estibordo": "Lado direito olhando para a proa",
      "convés": "Piso/andar do navio",
      "passadiço": "Ponte de comando",
      "praça de máquinas": "Compartimento dos motores",
      "porão": "Compartimento de carga abaixo do convés",
      "casco": "Estrutura externa do navio"
    },
    
    "cargos_tripulação": {
      "Comandante": "Oficial responsável pelo navio (Master)",
      "Imediato": "Segundo em comando (Chief Officer)",
      "Chefe de Máquinas": "Responsável pela praça de máquinas (Chief Engineer)",
      "1º Oficial": "First Officer / First Mate",
      "2º Oficial": "Second Officer",
      "Marinheiro de Convés": "Able Seaman (AB)",
      "Moço de Convés": "Ordinary Seaman (OS)",
      "Cozinheiro": "Ship's Cook"
    },
    
    "certificações": {
      "CoC": "Certificate of Competency - Certificado de Competência",
      "STCW": "Standards of Training, Certification and Watchkeeping",
      "GMDSS": "Global Maritime Distress and Safety System",
      "BST": "Basic Safety Training - Treinamento Básico de Segurança",
      "HUET": "Helicopter Underwater Escape Training",
      "DP": "Dynamic Positioning Certificate"
    },
    
    "regulamentações": {
      "MLC": "Maritime Labour Convention 2006 - Convenção do Trabalho Marítimo",
      "SOLAS": "Safety of Life at Sea - Segurança da Vida no Mar",
      "MARPOL": "Marine Pollution - Prevenção da Poluição por Navios",
      "ISM Code": "International Safety Management Code",
      "ISPS Code": "International Ship and Port Facility Security"
    },
    
    "manutenção": {
      "docking": "Docagem - entrada em dique seco para manutenção",
      "PMS": "Planned Maintenance System - Sistema de Manutenção Planejada",
      "running hours": "Horas de funcionamento de equipamentos",
      "overhaul": "Revisão geral/recondicionamento",
      "survey": "Vistoria/inspeção"
    }
  }
}
```

### 1.2 Siglas Comuns

```json
{
  "acronyms": {
    "ABS": "American Bureau of Shipping (classificadora)",
    "DNV": "Det Norske Veritas (classificadora)",
    "BV": "Bureau Veritas (classificadora)",
    "LR": "Lloyd's Register (classificadora)",
    "IMO": "International Maritime Organization",
    "ANTAQ": "Agência Nacional de Transportes Aquaviários",
    "DPC": "Diretoria de Portos e Costas",
    "NORMAM": "Normas da Autoridade Marítima",
    "ROB": "Remaining on Board (combustível/água restante)",
    "ETA": "Estimated Time of Arrival",
    "ETD": "Estimated Time of Departure",
    "POB": "Persons on Board",
    "NM": "Nautical Mile (milha náutica)",
    "GT": "Gross Tonnage (arqueação bruta)",
    "DWT": "Deadweight Tonnage (porte bruto)"
  }
}
```

---

## 2. Instruções e Procedimentos Internos

### 2.1 Contexto Operacional

```json
{
  "operational_context": {
    "company_type": "Empresa de navegação offshore",
    "fleet_size": "45 embarcações",
    "operations": [
      "Suporte a plataformas de petróleo",
      "Transporte de carga e pessoal",
      "Manuseio de âncoras",
      "Operações de mergulho"
    ],
    "regions": [
      "Bacia de Santos",
      "Bacia de Campos",
      "Costa Nordeste"
    ],
    
    "working_hours": {
      "offshore": "14 dias embarcado / 14 dias de folga",
      "onshore": "Horário comercial 08:00-18:00"
    },
    
    "safety_priorities": [
      "Segurança da tripulação",
      "Proteção ambiental",
      "Integridade dos ativos",
      "Conformidade regulatória"
    ]
  }
}
```

### 2.2 Procedimentos Padrão

```json
{
  "standard_procedures": {
    "maintenance_workflow": {
      "detection": "Identificação de necessidade (inspeção/falha/preventiva)",
      "report": "Registro no sistema com descrição e prioridade",
      "approval": "Aprovação por Chefe de Máquinas ou Superintendente",
      "execution": "Realização do serviço com registro de peças/tempo",
      "verification": "Teste e verificação de funcionamento",
      "closure": "Fechamento da OS com documentação completa"
    },
    
    "incident_reporting": {
      "immediate": "Comunicar Comandante e passadiço",
      "documentation": "Preencher relatório de incidente em 24h",
      "investigation": "Análise de causa raiz em 72h",
      "corrective_actions": "Implementar ações corretivas",
      "lessons_learned": "Compartilhar aprendizados com frota"
    },
    
    "certification_renewal": {
      "alert_90_days": "Alerta automático 90 dias antes",
      "scheduling": "Agendar treinamento/exame necessário",
      "documentation": "Reunir documentos requeridos",
      "submission": "Submeter à autoridade competente",
      "update_system": "Atualizar sistema após emissão"
    }
  }
}
```

---

## 3. Casos de Uso com Respostas Esperadas

### 3.1 Cenários de Pergunta-Resposta

```typescript
const qaScenarios = [
  {
    category: 'manutenção',
    question: 'Como criar uma ordem de serviço urgente?',
    context: 'Usuário na página de manutenção',
    expectedResponse: `
Para criar uma OS urgente:

1. Acesse **Manutenção** > **Nova OS**
2. Selecione a embarcação afetada
3. Defina a prioridade como **Crítica** ou **Alta**
4. Descreva o problema detalhadamente
5. Se possível, anexe fotos
6. Clique em **Criar OS**

⚠️ OS com prioridade crítica notificam automaticamente:
- Chefe de Máquinas
- Superintendente
- Gestor de Frota

Deseja que eu abra o formulário de nova OS?
    `
  },
  
  {
    category: 'tripulação',
    question: 'Quais certificados do João estão vencendo?',
    context: 'João Silva - Marinheiro de Convés',
    expectedResponse: `
Verificando certificações de João Silva...

📋 **Certificados próximos do vencimento:**

| Certificado | Vencimento | Status |
|-------------|------------|--------|
| BST | 15/01/2025 | ⚠️ 41 dias |
| HUET | 28/02/2025 | ⏳ 85 dias |

**Recomendação:** Agendar renovação do BST imediatamente.

Deseja que eu:
1. Gere um lembrete de renovação?
2. Verifique cursos disponíveis?
3. Notifique o RH?
    `
  },
  
  {
    category: 'compliance',
    question: 'O navio está em conformidade com MLC?',
    context: 'Embarcação MV Atlantic',
    expectedResponse: `
Verificando conformidade MLC 2006 para MV Atlantic...

✅ **Conformidade Geral: 94%**

**Itens em conformidade:**
- ✅ Horas de descanso respeitadas
- ✅ Acomodações adequadas
- ✅ Alimentação conforme padrões
- ✅ Contratos de trabalho em dia

**Itens pendentes:**
- ⚠️ 2 tripulantes com exame médico vencendo em 15 dias
- ⚠️ Relatório mensal de horas de trabalho pendente

**Ação recomendada:** 
Agendar exames médicos e completar relatório de horas.
    `
  },
  
  {
    category: 'operacional',
    question: 'Qual a situação da frota hoje?',
    context: 'Dashboard geral',
    expectedResponse: `
📊 **Status da Frota - ${new Date().toLocaleDateString()}**

**Operacionais:** 42 embarcações (93%)
- 🟢 Em operação: 38
- 🔵 Em trânsito: 4

**Indisponíveis:** 3 embarcações (7%)
- 🟡 Em manutenção: 2
- 🔴 Aguardando peças: 1

**Destaques:**
- MV Santos concluiu docagem ontem
- PSV Rio inicia manutenção preventiva amanhã
- 3 navios com previsão de chegada hoje

**Alertas:**
- ⚠️ 5 OS críticas abertas
- ⚠️ 12 certificações vencem em 30 dias
    `
  }
];
```

---

## 4. Estrutura de Contexto para Injeção

### 4.1 System Prompt Principal

```typescript
const maritimeSystemPrompt = `
Você é ATLAS, o assistente de IA do sistema Nautilus One, especializado em operações marítimas.

## IDENTIDADE
- Nome: ATLAS (Assistente Técnico e Logístico para Apoio ao Sistema)
- Função: Auxiliar operadores e gestores em tarefas de gestão marítima
- Tom: Profissional, direto, prestativo

## CONHECIMENTO ESPECIALIZADO

### Regulamentações
- MLC 2006 (Maritime Labour Convention)
- STCW (Standards of Training, Certification and Watchkeeping)
- SOLAS (Safety of Life at Sea)
- MARPOL (prevenção de poluição)
- ISM Code (gestão de segurança)
- ISPS Code (segurança de navios e portos)
- NORMAM (normas brasileiras)

### Operações
- Gestão de frota offshore e navegação de cabotagem
- Manutenção preventiva e corretiva naval
- Gestão de tripulação e escalas
- Compliance e auditorias
- Documentação marítima

### Terminologia
- Use termos náuticos corretos (proa, popa, bombordo, estibordo)
- Conheça cargos marítimos (Comandante, Imediato, Chefe de Máquinas)
- Entenda certificações (CoC, GMDSS, DP, BST)
- Reconheça tipos de embarcações (PSV, AHTS, tanker)

## COMPORTAMENTO

### Ao responder:
1. Seja direto e objetivo
2. Use dados reais quando disponíveis
3. Indique ações concretas
4. Ofereça próximos passos
5. Alerte sobre questões de segurança

### Ao não saber:
1. Admita a limitação
2. Sugira onde encontrar a informação
3. Ofereça alternativas

### Formatação:
- Use markdown para estruturar respostas
- Inclua tabelas quando apropriado
- Use emojis com moderação para status (✅ ⚠️ ❌)
- Limite respostas a 300 palavras quando possível

## LIMITAÇÕES
- Não forneço orientação médica específica
- Não substituo decisões de segurança humanas
- Não acesso dados de outras organizações
- Recomendo consultar especialistas em casos críticos

## CONTEXTO ATUAL
Empresa: [NOME_EMPRESA]
Frota: [NUMERO] embarcações
Operação: [TIPO_OPERAÇÃO]
`;
```

### 4.2 Contexto Dinâmico por Módulo

```typescript
const moduleContexts = {
  fleet: {
    context: `
      Você está no módulo de Gestão de Frota.
      
      Funções disponíveis:
      - Visualizar status de embarcações
      - Consultar posição e rota
      - Ver histórico de operações
      - Acessar dados técnicos
      
      Comandos úteis:
      - "Status da frota" - visão geral
      - "Onde está [navio]" - localização
      - "Histórico de [navio]" - operações passadas
    `,
    entities: ['vessel', 'position', 'status', 'route']
  },
  
  maintenance: {
    context: `
      Você está no módulo de Manutenção.
      
      Funções disponíveis:
      - Criar ordens de serviço
      - Acompanhar manutenções
      - Consultar histórico
      - Ver indicadores (MTBF, MTTR)
      
      Prioridades de OS:
      - Crítica: Afeta segurança ou operação
      - Alta: Precisa resolver em 24-48h
      - Média: Prazo de 1 semana
      - Baixa: Próxima oportunidade
    `,
    entities: ['work_order', 'equipment', 'spare_part', 'technician']
  },
  
  crew: {
    context: `
      Você está no módulo de Tripulação.
      
      Funções disponíveis:
      - Cadastrar tripulantes
      - Gerenciar certificações
      - Planejar escalas
      - Verificar compliance MLC
      
      Alertas automáticos:
      - Certificados: 90, 60, 30 dias antes
      - Contratos: 30 dias antes do término
      - Exames médicos: 30 dias antes
    `,
    entities: ['crew_member', 'certificate', 'schedule', 'contract']
  }
};
```

### 4.3 Formato JSON para Ollama/llama.cpp

```json
{
  "system_prompt": "Você é ATLAS, assistente de IA especializado em operações marítimas...",
  
  "knowledge_base": {
    "glossary": { /* termos técnicos */ },
    "procedures": { /* procedimentos padrão */ },
    "regulations": { /* referências regulatórias */ }
  },
  
  "conversation_settings": {
    "temperature": 0.7,
    "max_tokens": 1000,
    "stop_sequences": ["Usuário:", "User:"],
    "context_window": 4096
  },
  
  "response_format": {
    "style": "professional",
    "language": "pt-BR",
    "use_markdown": true,
    "max_length": 500
  },
  
  "safety_filters": {
    "block_medical_advice": true,
    "require_human_safety_decisions": true,
    "flag_critical_operations": true
  }
}
```

---

## 5. Implementação Técnica

### 5.1 Carregamento do Contexto

```typescript
// src/lib/ai/maritime-context.ts
export class MaritimeContextLoader {
  private glossary: Map<string, string>;
  private procedures: Map<string, Procedure>;
  private companyContext: CompanyContext;

  async loadContext(): Promise<AIContext> {
    // Carregar de arquivos locais ou IndexedDB
    const [glossary, procedures, company] = await Promise.all([
      this.loadGlossary(),
      this.loadProcedures(),
      this.loadCompanyContext()
    ]);

    return {
      systemPrompt: this.buildSystemPrompt(company),
      knowledgeBase: {
        glossary,
        procedures,
        regulations: await this.loadRegulations()
      },
      moduleContexts: moduleContexts
    };
  }

  buildSystemPrompt(company: CompanyContext): string {
    return maritimeSystemPrompt
      .replace('[NOME_EMPRESA]', company.name)
      .replace('[NUMERO]', company.fleetSize.toString())
      .replace('[TIPO_OPERAÇÃO]', company.operationType);
  }

  // Enriquece prompt com contexto específico
  enrichPrompt(
    basePrompt: string, 
    module: string, 
    entities: string[]
  ): string {
    const moduleContext = moduleContexts[module];
    
    let enriched = `
${moduleContext.context}

Entidades relevantes: ${entities.join(', ')}

Pergunta do usuário:
${basePrompt}
    `;

    return enriched;
  }
}
```

### 5.2 Integração com Ollama

```typescript
// src/lib/ai/ollama-integration.ts
export class OllamaIntegration {
  private baseUrl = 'http://localhost:11434';
  private model = 'mistral:7b-instruct-q4_K_M';
  private contextLoader: MaritimeContextLoader;

  async generateResponse(
    prompt: string,
    options: GenerateOptions = {}
  ): Promise<string> {
    const context = await this.contextLoader.loadContext();
    
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt: prompt,
        system: context.systemPrompt,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.maxTokens || 1000,
          stop: options.stopSequences || ['Usuário:', 'User:']
        },
        stream: false
      })
    });

    const data = await response.json();
    return data.response;
  }

  // Streaming para respostas longas
  async *streamResponse(prompt: string): AsyncGenerator<string> {
    const context = await this.contextLoader.loadContext();
    
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt: prompt,
        system: context.systemPrompt,
        stream: true
      })
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(Boolean);
      
      for (const line of lines) {
        const data = JSON.parse(line);
        if (data.response) {
          yield data.response;
        }
      }
    }
  }
}
```

---

## 6. Atualização do Conhecimento

### Processo de Atualização

```typescript
// src/lib/ai/knowledge-updater.ts
export class KnowledgeUpdater {
  async updateGlossary(newTerms: GlossaryEntry[]): Promise<void> {
    const current = await this.loadGlossary();
    
    for (const term of newTerms) {
      current.set(term.term, term.definition);
    }
    
    await this.saveGlossary(current);
    
    // Notificar engine de IA para recarregar
    eventBus.emit('ai:knowledge-updated', { type: 'glossary' });
  }

  async addProcedure(procedure: Procedure): Promise<void> {
    const procedures = await this.loadProcedures();
    procedures.set(procedure.id, procedure);
    await this.saveProcedures(procedures);
    
    eventBus.emit('ai:knowledge-updated', { type: 'procedures' });
  }

  async importFromFile(file: File): Promise<ImportResult> {
    const content = await file.text();
    const data = JSON.parse(content);
    
    const result: ImportResult = { added: 0, updated: 0, errors: [] };
    
    if (data.glossary) {
      await this.updateGlossary(Object.entries(data.glossary).map(
        ([term, def]) => ({ term, definition: def as string })
      ));
      result.added += Object.keys(data.glossary).length;
    }
    
    if (data.procedures) {
      for (const proc of data.procedures) {
        await this.addProcedure(proc);
        result.added++;
      }
    }
    
    return result;
  }
}
```

---

*Documentação de personalização da LLM - Gerada em: 2025-12-05*
