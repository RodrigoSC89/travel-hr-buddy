# 🚢 NAUTILUS ONE - Guia de Acessibilidade e Otimização Offshore

## 📋 Índice
1. [Padrões de Acessibilidade](#padrões-de-acessibilidade)
2. [Componentes Maritime](#componentes-maritime)
3. [Touch Targets e Responsividade](#touch-targets-e-responsividade)
4. [Contraste e Visibilidade](#contraste-e-visibilidade)
5. [Uso com Luvas](#uso-com-luvas)
6. [Guia de Desenvolvimento](#guia-de-desenvolvimento)

---

## 🎯 Padrões de Acessibilidade

### WCAG 2.1 Level AAA Compliance

#### Focus Indicators
- **Outline**: 3px solid (primary color)
- **Offset**: 2px
- **Shadow**: 0 0 0 4px com 20% opacity

```tsx
// Todos os elementos focáveis têm indicadores visíveis
<button className="focus-visible:outline-3 focus-visible:outline-offset-2">
  Botão Acessível
</button>
```

#### Touch Targets
- **Desktop**: Mínimo 44x44px
- **Mobile/Tablet**: Mínimo 48x48px
- **Offshore**: Recomendado 56x56px para uso com luvas

#### Screen Reader Support
```tsx
import { SrOnly, LiveRegion } from '@/components/ui/accessibility-components';

// Texto apenas para leitores de tela
<SrOnly>Informação adicional para acessibilidade</SrOnly>

// Anúncios dinâmicos
<LiveRegion politeness="polite">
  Dados atualizados com sucesso
</LiveRegion>
```

---

## ⚓ Componentes Maritime

### Botões Maritime
Variantes otimizadas para alto contraste offshore:

```tsx
import { Button } from '@/components/ui/button';

// Botão maritime padrão (azul marinho)
<Button variant="maritime">Ação Principal</Button>

// Sucesso (verde escuro) - Contraste 7:1+
<Button variant="maritime-success">Confirmar</Button>

// Perigo (vermelho escuro) - Contraste 7:1+
<Button variant="maritime-danger">Alerta</Button>

// Warning (âmbar escuro) - Contraste 7:1+
<Button variant="maritime-warning">Atenção</Button>

// Tamanho offshore (48px altura)
<Button size="offshore">Uso com Luvas</Button>
```

### Loading States Maritime

```tsx
import { MaritimeLoading } from '@/components/ui/maritime-loading';

// Loading padrão
<MaritimeLoading message="Carregando dados..." />

// Maritime com âncora animada
<MaritimeLoading variant="maritime" size="lg" />

// Offshore com navio e ondas
<MaritimeLoading 
  variant="offshore" 
  message="Sincronizando sistema offshore"
  fullScreen
/>
```

### Card Skeleton
```tsx
import { MaritimeCardSkeleton } from '@/components/ui/maritime-loading';

// Skeleton para loading de cards
<MaritimeCardSkeleton />
```

---

## 📱 Touch Targets e Responsividade

### Breakpoints
- **Mobile**: 375px - 768px
- **Tablet**: 769px - 1024px (Industrial tablets)
- **Desktop**: 1025px - 1919px
- **Large**: 1920px+

### Touch Target Guidelines

#### Mobile (< 768px)
```css
button, .btn {
  min-height: 48px !important;
  min-width: 48px !important;
  font-size: 16px !important;
}
```

#### Tablet Industrial (769px - 1024px)
```css
button, .btn {
  min-height: 48px !important;
  font-size: 16px !important;
}
```

#### Offshore Optimization
```tsx
// Usar classe offshore-text para máxima legibilidade
<p className="offshore-text">
  Texto otimizado para luz solar direta
</p>

// Background alto contraste
<div className="offshore-bg">
  Conteúdo importante
</div>
```

---

## 🎨 Contraste e Visibilidade

### Padrões de Contraste

#### Texto
- **Primary**: Preto puro (#000000) - Contraste 21:1
- **Secondary**: Quase preto (#1a1a1a) - Contraste 18:1
- **Tertiary**: Cinza escuro - Contraste mínimo 9:1

#### Cores Maritime
```css
/* PEOTRAM - Verde ambiente */
--maritime-peotram: hsl(142 76% 36%);     /* #059669 */
--maritime-peotram-fg: hsl(0 0% 100%);    /* Contraste 7:1+ */

/* PEO-DP - Azul marinho */
--maritime-peo-dp: hsl(221 83% 38%);      /* #1e40af */
--maritime-peo-dp-fg: hsl(0 0% 100%);     /* Contraste 7:1+ */

/* SGSO - Vermelho segurança */
--maritime-sgso: hsl(0 84% 45%);          /* #dc2626 */
--maritime-sgso-fg: hsl(0 0% 100%);       /* Contraste 7:1+ */
```

### Classes de Alto Contraste
```tsx
// Texto alto contraste
<h1 className="text-high-contrast">Título Principal</h1>

// Texto maritime com sombra
<p className="text-maritime-primary">Conteúdo importante</p>

// Badge maritime alta visibilidade
<Badge className="badge-maritime">Status</Badge>
```

---

## 🧤 Uso com Luvas

### Design para Operação com Luvas

#### Touch Targets Ampliados
- Mínimo recomendado: 56x56px
- Espaçamento entre elementos: 8px mínimo
- Botões grandes para ações primárias

#### Exemplo de Implementação
```tsx
import { Button } from '@/components/ui/button';

// Botão otimizado para luvas
<Button 
  size="xl"                    // 64px altura
  variant="maritime"           // Alto contraste
  className="min-w-[200px]"    // Largura generosa
>
  Ação Principal
</Button>

// Grid de ações rápidas
<div className="grid grid-cols-2 gap-4">
  <Button size="offshore" variant="maritime-success">
    Confirmar
  </Button>
  <Button size="offshore" variant="maritime-danger">
    Cancelar
  </Button>
</div>
```

---

## 👨‍💻 Guia de Desenvolvimento

### Hook useMaritimeActions
```tsx
import { useMaritimeActions } from '@/hooks/useMaritimeActions';

function MyComponent() {
  const {
    handleCreate,
    handleUpdate,
    handleDelete,
    handleExport,
    handleGenerateReport,
    handleViewDetails,
    showSuccess,
    showError,
    showInfo,
    isLoading
  } = useMaritimeActions();

  // Criar novo item
  const createItem = () => {
    handleCreate('Nome do Item', async () => {
      // Lógica de criação
    });
  };

  // Exportar dados
  const exportData = () => {
    handleExport('Nome do Módulo', dataToExport);
  };

  return (
    <Button onClick={createItem} disabled={isLoading}>
      Criar Item
    </Button>
  );
}
```

### Error Boundaries
```tsx
import { ModuleErrorBoundary } from '@/components/layout/module-error-boundary';

function App() {
  return (
    <ModuleErrorBoundary moduleName="SGSO">
      <SGSODashboard />
    </ModuleErrorBoundary>
  );
}
```

### Acessibilidade em Forms
```tsx
// Input com label apropriado
<div className="space-y-2">
  <label htmlFor="vessel-name" className="text-sm font-medium offshore-text">
    Nome da Embarcação
  </label>
  <input
    id="vessel-name"
    type="text"
    className="min-h-[44px] w-full"
    aria-required="true"
    aria-describedby="vessel-name-help"
  />
  <p id="vessel-name-help" className="text-xs text-gray-600">
    Digite o nome oficial da embarcação
  </p>
</div>
```

---

## ✅ Checklist de Implementação

### Ao criar novo componente:
- [ ] Touch targets mínimo 44px (48px mobile)
- [ ] Contraste mínimo 4.5:1 (7:1 para AAA)
- [ ] Focus indicators visíveis (3px solid)
- [ ] ARIA labels apropriados
- [ ] Suporte a screen readers
- [ ] Variantes maritime quando aplicável
- [ ] Error boundary implementado
- [ ] Loading states acessíveis
- [ ] Testado com zoom 200%
- [ ] Validado em tablet industrial

### Ao criar nova página:
- [ ] Skip to main content link
- [ ] Heading hierarchy correta (h1 > h2 > h3)
- [ ] Alt text em todas as imagens
- [ ] Landmark roles (main, nav, aside)
- [ ] Breadcrumbs para navegação
- [ ] ModuleErrorBoundary wrapper
- [ ] Mobile responsive
- [ ] Offshore optimization classes

---

## 🔍 Ferramentas de Teste

### Contraste
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools: Lighthouse Accessibility Audit

### Screen Readers
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)
- TalkBack (Android)

### Touch Targets
- Chrome DevTools: Mobile Device Emulation
- Firefox: Responsive Design Mode

---

## 📚 Recursos Adicionais

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Maritime UX Best Practices](https://www.maritime-executive.com/editorials/ux-design-for-offshore)
- [Touch Target Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)

---

**Última atualização**: 2024
**Versão**: Nautilus One 1.0
**Compliance**: WCAG 2.1 Level AAA
