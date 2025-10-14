# MMI - Módulo de Manutenção Inteligente (Intelligent Maintenance Module)

## 📋 Visão Geral

O MMI (Módulo de Manutenção Inteligente) é um sistema completo para gestão de manutenção preventiva e corretiva, com recursos de inteligência artificial para previsão de falhas e suporte à decisão.

## 🎯 Funcionalidades Principais

### 🧠 Inteligência Artificial
- **Previsão de Falhas**: Análise preditiva baseada em histórico e sensores IoT
- **Copilot Conversacional**: Assistente IA para técnicos e engenheiros
- **Sugestões Automáticas**: Recomendações inteligentes de manutenção

### 🛠️ Gestão de Manutenção
- **Central de Jobs**: Painel centralizado com filtros inteligentes
- **Ordens de Serviço**: Abertura e acompanhamento de OS
- **Histórico Técnico**: Registro completo de eventos e manutenções
- **Horímetros**: Controle de uso manual, OCR e IoT

### 🔁 Integrações
- **Sensores IoT**: Dados em tempo real de equipamentos
- **Estoque**: Integração com gestão de peças e materiais
- **Checklists**: Vinculação com procedimentos e inspeções

### 📊 Painéis e Relatórios
- **Dashboard de Saúde**: Status da frota por criticidade
- **KPIs de Manutenção**: Métricas de performance
- **Análise de Tendências**: Gráficos e estatísticas

## 🗂️ Estrutura do Módulo

```
src/modules/mmi/
├── components/              # Componentes React
│   ├── MMICentralJobsDashboard.tsx    # Painel central de jobs
│   ├── MMIMaintenanceCopilot.tsx      # Copilot de IA
│   └── ...
├── services/                # Camada de serviços
│   └── mmiService.ts        # API para banco de dados
├── hooks/                   # React hooks customizados
└── index.ts                 # Exports do módulo

src/types/mmi/
└── index.ts                 # Definições TypeScript

supabase/migrations/
└── 20251014214016_create_mmi_schema.sql  # Schema do banco
```

## 📊 Schema do Banco de Dados

### Tabelas Principais

#### `mmi_assets` - Ativos da Frota
- Equipamentos e embarcações
- Marcação de criticidade
- Localização e compartimento

#### `mmi_components` - Componentes Técnicos
- Componentes vinculados aos ativos
- Informações de fabricante e série
- Tipo e especificações

#### `mmi_jobs` - Jobs de Manutenção
- Manutenções preventivas e corretivas
- Status e prioridade
- Sugestões da IA
- Data de vencimento

#### `mmi_os` - Ordens de Serviço
- OS vinculadas aos jobs
- Aprovação e execução
- Histórico de abertura/fechamento

#### `mmi_history` - Histórico Técnico
- Registro de eventos (falhas, trocas, inspeções)
- Timeline de manutenções
- Análise de padrões

#### `mmi_hours` - Horímetros
- Leituras de horímetros
- Fonte: manual, OCR, IoT
- Controle de uso dos componentes

## 🚀 Como Usar

### Importar o Módulo

```typescript
import {
  MMICentralJobsDashboard,
  MMIMaintenanceCopilot,
  jobsService,
  dashboardService,
} from '@/modules/mmi';
```

### Usar o Dashboard

```tsx
import { MMICentralJobsDashboard } from '@/modules/mmi';

function MaintenancePage() {
  return <MMICentralJobsDashboard />;
}
```

### Usar o Copilot

```tsx
import { MMIMaintenanceCopilot } from '@/modules/mmi';

function CopilotPage() {
  return (
    <div className="h-screen p-4">
      <MMIMaintenanceCopilot />
    </div>
  );
}
```

### Acessar Dados

```typescript
import { jobsService, dashboardService } from '@/modules/mmi';

// Buscar jobs pendentes
const pendingJobs = await jobsService.getPending();

// Buscar estatísticas
const stats = await dashboardService.getStats();

// Criar novo job
const newJob = await jobsService.create({
  component_id: '...',
  title: 'Troca de óleo',
  status: 'pendente',
  priority: 'alta',
  due_date: '2025-10-20',
});
```

## 🔐 Segurança

- **Row Level Security (RLS)**: Todas as tabelas têm RLS habilitado
- **Autenticação**: Apenas usuários autenticados podem acessar
- **Políticas**: Controle granular de permissões

## 📝 Políticas de RLS

As políticas padrão permitem que:
- ✅ Usuários autenticados visualizem todos os dados
- ✅ Usuários autenticados criem novos registros
- ✅ Usuários autenticados atualizem registros existentes

**Nota**: Em produção, ajuste as políticas conforme necessário para sua regra de negócio.

## 🧪 Testes

```bash
# Rodar testes do módulo
npm test -- mmi

# Testes com cobertura
npm run test:coverage -- mmi
```

## 📈 Métricas e KPIs

O módulo rastreia:
- Total de ativos e componentes
- Jobs por status (pendente, em andamento, concluído)
- Jobs críticos e atrasados
- Ordens de serviço abertas
- Taxa de conclusão de manutenções
- MTTR (Mean Time To Repair)
- MTBF (Mean Time Between Failures)

## 🔄 Roadmap

### Fase 1 - Base (Implementada) ✅
- [x] Schema do banco de dados
- [x] Tipos TypeScript
- [x] Serviços de dados
- [x] Dashboard central
- [x] Copilot de IA

### Fase 2 - Integrações (Próxima)
- [ ] Integração com sensores IoT
- [ ] Integração com estoque
- [ ] Integração com checklists
- [ ] OCR para horímetros

### Fase 3 - IA Avançada
- [ ] Machine Learning para previsão de falhas
- [ ] Análise de padrões com ML
- [ ] Otimização de rotas de manutenção
- [ ] Recomendações personalizadas

### Fase 4 - Mobile
- [ ] App mobile para técnicos
- [ ] Offline first
- [ ] Push notifications
- [ ] Scan de QR codes

## 🤝 Contribuindo

Para adicionar novas funcionalidades ao MMI:

1. Adicione novos tipos em `src/types/mmi/index.ts`
2. Implemente serviços em `src/modules/mmi/services/`
3. Crie componentes em `src/modules/mmi/components/`
4. Exporte no `src/modules/mmi/index.ts`

## 📚 Documentação Adicional

- [Supabase Schema](../../supabase/migrations/20251014214016_create_mmi_schema.sql)
- [Type Definitions](../../types/mmi/index.ts)
- [Service Layer](./services/mmiService.ts)

## 💡 Dicas

- Use o Copilot para consultas rápidas
- Filtre jobs por prioridade e status
- Monitore jobs críticos diariamente
- Configure alertas para jobs atrasados
- Registre sempre o histórico técnico

## 🆘 Suporte

Para questões ou problemas, consulte:
- Documentação do projeto
- Issues no GitHub
- Equipe de desenvolvimento

---

**Status**: 🟢 Produção
**Versão**: 1.0.0
**Última atualização**: Outubro 2025
