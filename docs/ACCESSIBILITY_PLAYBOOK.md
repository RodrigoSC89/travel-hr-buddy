# ♿️ Playbook Técnico – Contraste & Acessibilidade Visual

## 📌 Objetivo
Padronizar o uso de cores e estilos visuais para garantir acessibilidade e conformidade com WCAG 2.1 (nível AA ou superior).

---

## 🎨 1. Regras de Contraste

| Tipo | Ratio Mínimo | Uso |
|------|--------------|-----|
| Texto normal | `4.5:1` | Parágrafos, labels, links |
| Texto grande (≥18px bold ou ≥24px) | `3:1` | Títulos, headers |
| Componentes UI | `3:1` | Botões, inputs, badges |
| Foco visível | `3:1` | Outlines, focus rings |

---

## 🛑 2. Proibido Usar

| Tipo | Exemplo | Correção Sugerida |
|------|---------|-------------------|
| `text-gray-400` | `#9ca3af` | `text-foreground/80` |
| `text-gray-300` | `#d1d5db` | `text-foreground/70` |
| `opacity-60` em texto | `opacity: 0.6` | cor sólida com menor saturação |
| `text-white` sobre `bg-white` | ilegível | `text-foreground` |
| `text-muted-foreground` sem verificar | pode falhar | `text-foreground/70` mínimo |

---

## ✅ 3. Tokens Recomendados

### CSS Variables (index.css)
```css
:root {
  --foreground: 222 47% 11%;        /* Texto principal - escuro */
  --muted-foreground: 215 16% 47%;  /* Texto secundário - contraste OK */
  --primary: 213 94% 51%;           /* Ações principais */
  --destructive: 0 84% 60%;         /* Erros/alertas */
}

.dark {
  --foreground: 210 40% 98%;        /* Texto principal - claro */
  --muted-foreground: 215 20% 65%;  /* Texto secundário - contraste OK */
}
```

### Tailwind Classes Seguras
```tsx
// ✅ USAR
className="text-foreground"           // Texto principal
className="text-foreground/80"        // Texto secundário (80% opacidade)
className="text-foreground/70"        // Texto terciário (70% opacidade)
className="text-primary"              // Links e ações

// ❌ EVITAR
className="text-gray-400"             // Pode falhar contraste
className="text-muted-foreground"     // Verificar sempre
className="opacity-60"                // Reduz contraste
```

---

## 🧪 4. Testes Obrigatórios

### Automatizados (CI)
- `axe-core` via Playwright
- Lighthouse Accessibility Score ≥ 90
- `e2e/contrast-accessibility.spec.ts`

### Manuais (PR Review)
- Verificar contraste com DevTools
- Testar com `prefers-contrast: more`
- Validar em dark/light mode

---

## 🔧 5. Ferramentas Recomendadas

| Ferramenta | Uso |
|------------|-----|
| axe DevTools | Extensão Chrome para auditoria |
| Lighthouse | Auditoria de performance e a11y |
| Color Contrast Checker | Verificar ratio específico |
| Stark (Figma) | Validar design antes do código |

---

## 📋 6. Checklist para PRs

- [ ] Todos os textos usam tokens semânticos (`text-foreground`, etc.)
- [ ] Nenhum uso de `opacity` para clarear texto
- [ ] Contraste verificado em dark e light mode
- [ ] Testes de acessibilidade passando
- [ ] Screenshots de antes/depois se houve mudança visual

---

## 🎯 7. Componentes Críticos

### Badges
```tsx
// ✅ Correto
<Badge className="bg-green-600 text-white">Ativo</Badge>

// ❌ Incorreto
<Badge className="bg-green-200 text-green-600">Ativo</Badge>
```

### Cards
```tsx
// ✅ Correto
<CardTitle className="text-foreground font-semibold">Título</CardTitle>
<CardDescription className="text-foreground/70">Descrição</CardDescription>

// ❌ Incorreto
<CardDescription className="text-muted-foreground opacity-60">Descrição</CardDescription>
```

### Links
```tsx
// ✅ Correto
<a className="text-primary hover:text-primary/80 underline">Link</a>

// ❌ Incorreto
<a className="text-gray-400 hover:text-gray-500">Link</a>
```

---

## 🔁 8. Processo de Correção

1. **Identificar** - Rodar `axe-core` ou Lighthouse
2. **Classificar** - Severidade (crítico, médio, baixo)
3. **Corrigir** - Usar tokens semânticos
4. **Testar** - Verificar ratio com DevTools
5. **Documentar** - Screenshot antes/depois

---

## 📚 Referências

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Axe-core Documentation](https://github.com/dequelabs/axe-core)
