# Painel de Alertas Críticos - Guia Visual

## 🎨 Interface do Usuário

### Layout Principal

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ⚠️ Alertas Críticos da Auditoria                          │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ╔═══════════════════════════════════════════════════╗ │ │
│  │ ║  🔴 ALERTA CRÍTICO                                ║ │ │
│  │ ║                                                   ║ │ │
│  │ ║  Auditoria ID: 12345678-abcd-...                 ║ │ │
│  │ ║  Comentário ID: 87654321-dcba-...                ║ │ │
│  │ ║  Data: 16/10/2025, 16:23:45                      ║ │ │
│  │ ║                                                   ║ │ │
│  │ ║  CRÍTICO: Vazamento de informações sensíveis     ║ │ │
│  │ ║  detectado durante auditoria.                    ║ │ │
│  │ ║  Ação imediata necessária para corrigir          ║ │ │
│  │ ║  vulnerabilidades de segurança.                  ║ │ │
│  │ ║                                                   ║ │ │
│  │ ║  [CRÍTICO]                                        ║ │ │
│  │ ╚═══════════════════════════════════════════════════╝ │ │
│  │                                                         │ │
│  │ ╔═══════════════════════════════════════════════════╗ │ │
│  │ ║  🔴 ALERTA CRÍTICO                                ║ │ │
│  │ ║                                                   ║ │ │
│  │ ║  Auditoria ID: 12345678-abcd-...                 ║ │ │
│  │ ║  Data: 16/10/2025, 14:15:30                      ║ │ │
│  │ ║                                                   ║ │ │
│  │ ║  CRÍTICO: Áreas de acesso restrito sem           ║ │ │
│  │ ║  controles adequados.                            ║ │ │
│  │ ║  Implementar controles de acesso imediatamente.  ║ │ │
│  │ ║                                                   ║ │ │
│  │ ║  [CRÍTICO]                                        ║ │ │
│  │ ╚═══════════════════════════════════════════════════╝ │ │
│  └───────────────────────────────────────────────────────┘ │
│                        ↕ Scroll                            │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Cores e Estilização

### Cores Principais

```css
/* Cards de Alerta */
background: #fef2f2      /* bg-red-50 */
border: #fecaca          /* border-red-200 */

/* Texto Principal */
color: #b91c1c           /* text-red-700 */

/* Badge de Nível */
background: #fee2e2      /* bg-red-100 */
color: #991b1b           /* text-red-800 */

/* Texto Secundário */
color: #6b7280           /* text-muted-foreground */
```

### Tipografia

- **Título Principal:** 2xl, font-bold (24px)
- **Descrição do Alerta:** font-medium (texto destacado)
- **Metadados:** text-sm (14px)
- **Badge:** text-xs (12px)

## 📱 Estados da Interface

### 1. Loading (Carregando)

```
┌─────────────────────────────────────────┐
│                                         │
│  ⚠️ Alertas Críticos da Auditoria      │
│                                         │
│              ⌛ Loading...               │
│           (spinner animado)             │
│                                         │
└─────────────────────────────────────────┘
```

**Elementos:**
- Spinner vermelho animado
- Centralizado na tela
- Título permanece visível

### 2. Erro

```
┌─────────────────────────────────────────┐
│                                         │
│  ⚠️ Alertas Críticos da Auditoria      │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ⚠️ Erro ao carregar alertas:    │   │
│  │    Não autenticado              │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**Elementos:**
- Alert component com variante "destructive"
- Ícone de alerta triangular
- Mensagem de erro clara

### 3. Vazio (Sem Alertas)

```
┌─────────────────────────────────────────┐
│                                         │
│  ⚠️ Alertas Críticos da Auditoria      │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ℹ️ Nenhum alerta crítico        │   │
│  │    encontrado. ✅               │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**Elementos:**
- Alert component neutro
- Mensagem positiva
- Check mark emoji

### 4. Com Alertas (Normal)

```
┌─────────────────────────────────────────┐
│  ⚠️ Alertas Críticos da Auditoria      │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ [Card 1] Alerta Crítico          │ │
│  └───────────────────────────────────┘ │
│  ┌───────────────────────────────────┐ │
│  │ [Card 2] Alerta Crítico          │ │
│  └───────────────────────────────────┘ │
│  ┌───────────────────────────────────┐ │
│  │ [Card 3] Alerta Crítico          │ │
│  └───────────────────────────────────┘ │
│                    ↕                    │
└─────────────────────────────────────────┘
```

## 🎯 Anatomia de um Card de Alerta

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ① Metadados (cinza, pequeno)                  │
│     Auditoria ID: ...                          │
│     Comentário ID: ... (opcional)              │
│     Data: ...                                  │
│                                                 │
│  ② Descrição (vermelho escuro, destaque)       │
│     Texto do alerta com múltiplas linhas       │
│     preservando quebras de linha               │
│                                                 │
│  ③ Badge de Nível                              │
│     [CRÍTICO]                                   │
│                                                 │
└─────────────────────────────────────────────────┘

① text-sm text-muted-foreground
② font-medium text-red-700 whitespace-pre-wrap
③ px-2 py-1 rounded-full bg-red-100 text-red-800
```

## 📐 Dimensões e Espaçamento

### Container Principal
- `className="container mx-auto p-6"`
- Responsivo com max-width automático

### Área de Scroll
- `max-h-[70vh]` - 70% da altura da viewport
- `border rounded-md p-4` - Borda e padding
- Scroll vertical automático

### Cards
- `mb-4` - Margem inferior entre cards
- `bg-red-50 border-red-200` - Fundo e borda
- `pt-6` - Padding top no conteúdo

### Espaçamento Interno
- `space-y-2` - Espaçamento vertical entre elementos
- `gap-2` - Gap entre badge e outros elementos

## 🎭 Animações e Transições

### Loading Spinner
```css
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### Hover States
- Cards podem ter hover effect (futuro)
- Links e botões com transição suave

## 📱 Responsividade

### Desktop (≥1024px)
```
┌─────────────────────────────────────────────────────────┐
│  ⚠️ Alertas Críticos da Auditoria                      │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  [Card - Largura completa]                        │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Tablet (768px - 1023px)
```
┌──────────────────────────────────────────┐
│  ⚠️ Alertas Críticos da Auditoria       │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  [Card - Largura ajustada]        │ │
│  └────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

### Mobile (<768px)
```
┌────────────────────────────┐
│ ⚠️ Alertas Críticos        │
│                            │
│ ┌────────────────────────┐ │
│ │ [Card Compacto]        │ │
│ └────────────────────────┘ │
└────────────────────────────┘
```

## 🎨 Temas

### Light Mode (Padrão)
- Fundo branco/cinza claro
- Cards vermelho claro
- Texto escuro

### Dark Mode (Futuro)
- Fundo escuro
- Cards vermelho escuro
- Texto claro

## 🔍 Elementos de UI Utilizados

### Componentes Radix UI
- `Card` - Container principal dos alertas
- `CardContent` - Conteúdo interno do card
- `ScrollArea` - Área com scroll customizado
- `Alert` - Mensagens de estado
- `AlertDescription` - Descrição do alert

### Ícones Lucide
- `AlertTriangle` - Ícone de aviso

### Utilitários TailwindCSS
- Spacing (p-, m-, space-)
- Colors (bg-, text-, border-)
- Typography (text-, font-)
- Layout (flex, grid)
- Responsive (sm:, md:, lg:)

## 🎯 Acessibilidade

### Semântica
- Uso correto de headings (h2)
- Estrutura lógica de conteúdo
- Labels descritivos

### Navegação
- Suporte a teclado (tab navigation)
- Focus visível em elementos interativos
- Skip links (futuro)

### Contraste
- Ratio 4.5:1 para texto normal
- Ratio 3:1 para texto grande
- Cores com bom contraste

## 📊 Métricas Visuais

### Performance
- First Contentful Paint: <1s
- Largest Contentful Paint: <2.5s
- Cumulative Layout Shift: <0.1

### Usabilidade
- Touch targets: mínimo 44x44px
- Espaçamento entre elementos: mínimo 8px
- Legibilidade: fonte mínima 14px

---

**Nota:** Este é um guia visual baseado na implementação atual. A interface real pode ter variações sutis dependendo do tema e configurações do navegador.

**Versão:** 1.0.0 | **Data:** 2025-10-16
