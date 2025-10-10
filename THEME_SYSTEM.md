# Sistema Unificado de Tema (Theme System)

## 📍 Localização
`/src/lib/ui/theme.ts`

## 🎯 Objetivo
Sistema centralizado de temas visuais para o Nautilus One, permitindo consistência visual em toda a aplicação e fácil manutenção das cores, espaçamentos, fontes e outros elementos visuais.

## 🎨 Estrutura

### Cores (Colors)
```typescript
colors: {
  primary: '#3b82f6',      // Azul - Ações principais
  secondary: '#10b981',    // Verde - Sucesso, confirmação
  accent: '#f59e0b',       // Laranja - Destacar elementos
  danger: '#ef4444',       // Vermelho - Alertas, erros
  background: '#18181b',   // Fundo escuro
  surface: '#27272a',      // Cards, containers
  text: '#f4f4f5',        // Texto principal
  textMuted: '#a1a1aa',   // Texto secundário
  border: '#3f3f46'       // Bordas
}
```

### Espaçamento (Spacing)
```typescript
spacing: {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
}
```

### Bordas (Radii)
```typescript
radii: {
  sm: '4px',   // Bordas pequenas
  md: '8px',   // Bordas médias
  lg: '16px',  // Bordas grandes
}
```

### Fontes (Font)
```typescript
font: {
  base: 'Inter, sans-serif',      // Fonte padrão
  heading: 'Inter, sans-serif',   // Títulos
  monospace: 'Menlo, monospace'   // Código, números
}
```

### Sombras (Shadow)
```typescript
shadow: {
  sm: '0 1px 2px rgba(0,0,0,0.05)',   // Sombra leve
  md: '0 4px 6px rgba(0,0,0,0.1)',    // Sombra média
  lg: '0 10px 15px rgba(0,0,0,0.15)', // Sombra profunda
}
```

## 📖 Como Usar

### Importação Básica
```typescript
import { theme } from '@/lib/ui/theme';

// Acessar valores diretamente
const primaryColor = theme.colors.primary;
const mediumSpacing = theme.spacing.md;
```

### Com Helper Functions
```typescript
import { getColor, getSpacing, getRadius, getFont, getShadow } from '@/lib/ui/theme';

const myComponent = () => {
  return (
    <div style={{
      color: getColor('primary'),
      padding: getSpacing('md'),
      borderRadius: getRadius('md'),
      fontFamily: getFont('base'),
      boxShadow: getShadow('sm')
    }}>
      Meu conteúdo
    </div>
  );
};
```

### CSS Custom Properties
```typescript
import { generateThemeCSSVars } from '@/lib/ui/theme';

// Aplicar no root do app
const App = () => {
  return (
    <div style={generateThemeCSSVars()}>
      {/* Seu app */}
    </div>
  );
};

// Usar no CSS
.my-element {
  color: var(--theme-primary);
  background: var(--theme-surface);
}
```

### Com Tailwind Classes (Recomendado)
O tema foi projetado para trabalhar em harmonia com o Tailwind CSS. Use as classes existentes:

```tsx
// As cores do tema correspondem a:
primary → text-blue-600 ou bg-blue-600
secondary → text-green-600 ou bg-green-600
accent → text-orange-500 ou bg-orange-500
danger → text-red-600 ou bg-red-600
```

## 🔧 Personalização

### Alterando Cores
Para mudar a paleta de cores do sistema, edite `/src/lib/ui/theme.ts`:

```typescript
export const theme = {
  colors: {
    primary: '#seu-codigo-hex',
    secondary: '#seu-codigo-hex',
    // ...
  }
}
```

### Adicionando Novas Cores
```typescript
export const theme = {
  colors: {
    // ... cores existentes
    info: '#0ea5e9',      // Nova cor: info
    warning: '#f59e0b',   // Nova cor: warning
  }
}
```

## 🌓 Suporte a Tema Claro/Escuro

O sistema foi projetado para trabalhar com o `ThemeProvider` existente em:
- `/src/components/layout/theme-provider.tsx`
- `/src/components/layout/theme-toggle.tsx`

As cores escuras definidas no tema são aplicadas automaticamente quando o modo escuro está ativo através do Tailwind CSS e das classes `dark:` prefix.

## ✅ Páginas Usando o Sistema

Todas as páginas administrativas (`/admin/*`) agora seguem o padrão visual unificado:

- ✅ `/admin` - Painel Administrativo
- ✅ `/admin/analytics` - CI Analytics
- ✅ `/admin/wall` - CI/CD TV Wall
- ✅ `/admin/control-panel` - Control Panel
- ✅ `/admin/api-status` - API Status
- ✅ `/admin/api-tester` - API Tester
- ✅ `/admin/tests` - Testes Automatizados
- ✅ `/admin/ci-history` - Histórico CI/CD
- ✅ `/admin/checklists` - Checklists Inteligentes (NOVO)

## 📝 Convenções

1. **Sempre use o tema** para valores de cores, espaçamentos, etc ao invés de hardcoded values
2. **Prefira Tailwind classes** quando possível para aproveitar o sistema de design existente
3. **Use helper functions** para casos onde CSS inline é necessário
4. **Documente alterações** ao modificar o tema base

## 🔄 Integração com Componentes Existentes

O tema foi projetado para trabalhar perfeitamente com:
- shadcn/ui components
- MultiTenantWrapper
- ModulePageWrapper
- ModuleHeader
- Todos os componentes UI existentes

## 📚 Referências

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- Design System: Baseado em cores semânticas e hierarquia visual clara

## 🎯 Próximos Passos

- [ ] Adicionar suporte a temas personalizados por organização
- [ ] Criar variantes de cores adicionais (info, warning, success variants)
- [ ] Implementar sistema de tokens de design completo
- [ ] Adicionar mais opções de tipografia (weights, sizes)
- [ ] Criar documentação visual (Storybook ou similar)
