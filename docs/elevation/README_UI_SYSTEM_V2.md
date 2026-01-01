# 📋 Design System V2 - Guia de Uso
## Nautilus One - Componentes Padronizados

---

## ⚠️ REGRA IMPORTANTE

```
╔══════════════════════════════════════════════════════════╗
║  Componentes V2 são ADICIONAIS - NÃO substituem antigos  ║
║  Componentes originais em src/components/ui/ PRESERVADOS ║
╚══════════════════════════════════════════════════════════╝
```

---

## 📦 Componentes Disponíveis

### Layout
- `PageLayoutV2` - Layout padrão para páginas/módulos
- `ModuleHeaderV2` - Header padronizado com suporte a IA

### Cards
- `StatCardV2` - Cards de estatísticas com trends
- `ContentCardV2` - Cards de conteúdo genérico
- `GridCardV2` - Grid responsivo de cards

### Navigation
- `TabsV2` - Sistema de tabs com badges e ícones

### Buttons
- `ButtonV2` - Botões com feedback automático
- `IconButtonV2` - Botões de ícone com tooltip

### AI
- `AIAssistantV2` - Assistente IA integrado

---

## 🚀 Como Usar

### Importação
```tsx
import { 
  PageLayoutV2, 
  ModuleHeaderV2, 
  StatCardV2,
  TabsV2,
  AIAssistantV2 
} from '@/components/shared/v2';
```

### Exemplo de Módulo V2
```tsx
import { Ship, FileText, Users } from 'lucide-react';
import { 
  PageLayoutV2, 
  ModuleHeaderV2, 
  StatCardV2, 
  GridCardV2,
  TabsV2,
  AIAssistantV2 
} from '@/components/shared/v2';

export function MeuModuloV2() {
  const [aiEnabled, setAiEnabled] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: Ship, content: <Overview /> },
    { id: 'documents', label: 'Documentos', icon: FileText, badge: 12, content: <Documents /> },
    { id: 'crew', label: 'Tripulação', icon: Users, content: <Crew /> },
  ];

  return (
    <PageLayoutV2 title="Meu Módulo" icon={Ship}>
      <ModuleHeaderV2
        title="Meu Módulo"
        description="Descrição do módulo"
        icon={Ship}
        aiEnabled={aiEnabled}
        onAIToggle={() => setAiEnabled(!aiEnabled)}
      />

      <GridCardV2 columns={4} className="my-6">
        <StatCardV2 title="Total" value={1234} trend="up" trendValue="+12%" />
        <StatCardV2 title="Ativos" value={98} variant="success" />
        <StatCardV2 title="Pendentes" value={15} variant="warning" />
        <StatCardV2 title="Críticos" value={3} variant="danger" />
      </GridCardV2>

      <TabsV2 tabs={tabs} variant="pills" />

      {aiEnabled && (
        <AIAssistantV2 
          moduleName="Meu Módulo" 
          position="floating"
          suggestions={['Analisar dados', 'Gerar relatório']}
        />
      )}
    </PageLayoutV2>
  );
}
```

---

## 📊 Status da Implementação

| Componente | Status | Docs |
|------------|--------|------|
| PageLayoutV2 | ✅ Criado | ✅ |
| ModuleHeaderV2 | ✅ Criado | ✅ |
| StatCardV2 | ✅ Criado | ✅ |
| ContentCardV2 | ✅ Criado | ✅ |
| GridCardV2 | ✅ Criado | ✅ |
| TabsV2 | ✅ Criado | ✅ |
| ButtonV2 | ✅ Criado | ✅ |
| IconButtonV2 | ✅ Criado | ✅ |
| AIAssistantV2 | ✅ Criado | ✅ |

---

## ✅ Próximos Passos

1. **ETAPA 3**: Criar módulos V2 (versões melhoradas)
2. **ETAPA 4**: Integrar IA em módulos selecionados
3. **ETAPA 5**: Aplicar padronização visual
4. **ETAPA 6**: Testes de não-regressão
5. **ETAPA 7**: Documentação completa
6. **ETAPA 8**: Validação final
