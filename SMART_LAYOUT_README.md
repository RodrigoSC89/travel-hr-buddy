# 🧭 Smart Layout System - Nautilus One

## 📋 Visão Geral

O **Smart Layout System** é uma reimplementação moderna da navegação do Nautilus One, oferecendo uma experiência de usuário superior com design inteligente e responsivo.

## 🎯 Objetivos Alcançados

### ✅ Redesign e Reorganização do Menu
- **32 módulos organizados** em 6 categorias temáticas
- **Ícones intuitivos** para cada grupo (Ship, Brain, Bell, BarChart2, Folder)
- **Navegação colapsável** com animações suaves
- **Modo compacto** para mobile/tablet com menu hamburger

### ✅ Refinamento Visual (Design System)
- **Paleta de cores padronizada** com contraste ideal
- **Tema escuro** como padrão (zinc-900, zinc-800)
- **Componentes consistentes** (botões, inputs, cards)
- **Espaçamentos e tipografia** bem definidos

### ✅ Experiência Guiada (UX Inteligente)
- **Navegação ativa** destacada em azul
- **Feedback visual** em hover e cliques
- **Layout responsivo** adaptado para todos os dispositivos

### ✅ Header Inteligente
- **Toggle tema escuro/claro** (🌙/☀️)
- **Central de notificações** com badge de contagem
- **Assistente IA** de fácil acesso
- **Busca global** centralizada

## 📂 Estrutura de Arquivos

```
src/
├── components/layout/
│   ├── SmartSidebar.tsx      # Sidebar com módulos agrupados
│   ├── SmartHeader.tsx        # Header com funcionalidades
│   └── SmartLayout.tsx        # Layout wrapper principal
├── pages/
│   └── SmartLayoutDemo.tsx    # Página de demonstração
└── SmartLayoutDemoApp.tsx     # App standalone para demo

public/
└── smart-layout-demo.html     # Demo HTML puro
```

## 🗂️ Categorias de Módulos

### 1. Dashboard & Visão Geral
- Dashboard Principal
- Visão Geral

### 2. Sistema Marítimo
- Sistema Marítimo
- Checklists Inteligentes
- Otimização
- Otimização Mobile
- PEOTRAM
- PEO-DP
- SGSO
- Monitor de Sistema

### 3. Colaboração & IA
- IA & Inovação
- Automação IA
- Assistente IA
- Assistente de Voz
- Documentos IA

### 4. Comunicação & Alertas
- Comunicação
- Centro de Notificações
- Alertas de Preços
- Centro de Ajuda

### 5. Gestão e Analytics
- Analytics Avançado
- Analytics Tempo Real
- Monitor Avançado
- Business Intelligence
- Smart Workflow

### 6. Outros Módulos
- Templates
- Reservas
- Viagens
- Hub de Integrações
- Documentos
- Colaboração
- Portal do Funcionário
- Configurações

## 🎨 Design Tokens

### Cores
```css
/* Sidebar & Header */
--sidebar-bg: zinc-900
--header-bg: zinc-800
--border-color: zinc-700

/* Estados */
--active-bg: blue-600
--hover-bg: zinc-800
--text-primary: white
--text-secondary: zinc-300
--text-muted: zinc-400
```

### Espaçamento
```css
--sidebar-width: 16rem (256px)
--header-height: 3.5rem (56px)
--padding-base: 1rem (16px)
--gap-base: 0.5rem (8px)
```

## 📱 Responsividade

### Desktop (>= 1024px)
- Sidebar fixa e sempre visível
- Header completo com todas as features
- Layout em duas colunas

### Tablet (768px - 1023px)
- Sidebar colapsável
- Header compacto
- Menu hamburguer disponível

### Mobile (< 768px)
- Sidebar em overlay com backdrop
- Header simplificado
- Botão hamburger fixo no topo

## 🚀 Como Usar

### Opção 1: React Component

```tsx
import { SmartLayout } from "@/components/layout/SmartLayout";
import { SmartLayoutDemo } from "@/pages/SmartLayoutDemo";

function App() {
  return (
    <SmartLayout>
      <SmartLayoutDemo />
    </SmartLayout>
  );
}
```

### Opção 2: HTML Standalone

Acesse `http://localhost:8081/smart-layout-demo.html` para ver a demonstração completa em HTML puro.

## 🔧 Componentes Principais

### SmartSidebar

Características:
- Agrupamento de módulos por categoria
- Expansão/colapso de seções
- Indicação visual de item ativo
- Menu mobile com overlay
- Rodapé com versão e copyright

Props:
```tsx
interface SmartSidebarProps {
  className?: string;
}
```

### SmartHeader

Características:
- Logo e branding
- Busca global
- Toggle de tema
- Notificações com badge
- Menu de usuário

Sem props configuráveis (component autônomo).

### SmartLayout

Características:
- Wrapper que combina Sidebar e Header
- Provider de tema integrado
- Toast notifications
- Layout flex responsivo

Usa `<Outlet />` do React Router para renderizar páginas.

## 🎯 Próximos Passos

- [ ] Adicionar microanimações com Framer Motion
- [ ] Implementar onboarding interativo
- [ ] Criar integração profunda entre módulos
- [ ] Adicionar suporte a atalhos de teclado
- [ ] Implementar histórico de navegação
- [ ] Adicionar busca inteligente nos módulos

## 📸 Screenshots

Veja as capturas de tela no PR para visualizar:
- Desktop view completa
- Seções expandidas/colapsadas
- Vista mobile responsiva
- Página de demonstração

## 🤝 Contribuição

Este sistema foi desenvolvido seguindo os requisitos especificados no issue #xxx, implementando todas as funcionalidades solicitadas para tornar o Nautilus One mais fluido, moderno e surpreendente.

## 📄 Licença

© 2024 Nautilus - Todos os direitos reservados
