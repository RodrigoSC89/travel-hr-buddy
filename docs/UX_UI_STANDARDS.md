# 📐 UX/UI Standards — NAUTI ONE v8.0

> **Padrão Tier-1 de Enterprise UX para Sistemas Marítimos**
> Última atualização: 2026-02-06

---

## 🎯 Princípios Fundamentais

1. **Zero Dead Buttons** — Todo botão executa uma ação real com feedback
2. **Zero Empty Screens** — Toda tela vazia mostra CTA + orientação
3. **Feedback Imediato** — Toda ação gera toast/visual change em < 200ms
4. **Consistência Total** — Mesmo padrão UX em todos os 7 Mega-Hubs
5. **Zero Training** — Navegação intuitiva sem manual

---

## 📋 Componentes Padrão

### PageShell (`src/components/ui/PageShell.tsx`)

Wrapper obrigatório para TODAS as páginas. Garante:

```tsx
<PageShell
  title="Gestão de Frota"
  subtitle="Gerencie embarcações, status e documentação"
  breadcrumbs={[{ label: "Ops" }, { label: "Fleet" }]}
  actions={[
    pageActions.add(handleAdd),
    pageActions.export(handleExport),
    pageActions.refresh(handleRefresh, isRefetching),
  ]}
  searchable
  onSearchChange={setSearch}
  isLoading={isLoading}
  error={error}
  onRetry={refetch}
  isEmpty={data.length === 0}
  emptyTitle="Nenhuma embarcação cadastrada"
  emptyAction={{ label: "Cadastrar Embarcação", onClick: handleAdd }}
  lastSync={lastSync}
>
  {/* Conteúdo da página */}
</PageShell>
```

### ConfirmDialog (`src/components/ui/ConfirmDialog.tsx`)

Obrigatório para ações destrutivas:

```tsx
<ConfirmDialog
  open={deleteDialogOpen}
  onOpenChange={setDeleteDialogOpen}
  title="Excluir embarcação?"
  description="Esta ação não pode ser desfeita. Todos os dados relacionados serão removidos."
  confirmLabel="Sim, excluir"
  variant="destructive"
  onConfirm={handleDelete}
/>
```

### DataTable (`src/components/ui/DataTable.tsx`)

Tabela padrão com sort, pagination, selection:

```tsx
<DataTable
  data={vessels}
  columns={columns}
  selectable
  selectedIds={selectedIds}
  onSelectionChange={setSelectedIds}
  onRowClick={handleRowClick}
  pageSize={25}
/>
```

### StatusPipeline (`src/components/ui/StatusPipeline.tsx`)

Pipeline visual para workflows:

```tsx
<StatusPipeline
  stages={[
    { id: "draft", label: "Rascunho", count: 5 },
    { id: "review", label: "Em Revisão", count: 3 },
    { id: "approved", label: "Aprovado", count: 12 },
    { id: "completed", label: "Concluído", count: 45 },
  ]}
  activeStage={filter}
  onStageClick={setFilter}
/>
```

### BulkActionsBar (`src/components/ui/BulkActionsBar.tsx`)

Barra flutuante para ações em lote:

```tsx
<BulkActionsBar
  selectedCount={selectedIds.length}
  totalCount={data.length}
  onSelectAll={selectAll}
  onDeselectAll={deselectAll}
  actions={[
    { id: "export", label: "Exportar", icon: <Download />, onClick: handleBulkExport },
    { id: "delete", label: "Excluir", icon: <Trash2 />, onClick: handleBulkDelete, variant: "destructive" },
  ]}
/>
```

---

## 📊 Checklist por Página (OBRIGATÓRIO)

### Cabeçalho
- [ ] Título claro (H1) + subtítulo
- [ ] Breadcrumbs (se profundidade > 1)
- [ ] Ações: Adicionar, Exportar, Atualizar
- [ ] Status de conexão (online/offline)
- [ ] Última sync visível

### Listagem
- [ ] Busca local
- [ ] Filtros avançados
- [ ] Ordenação por colunas
- [ ] Paginação (10/25/50/100)
- [ ] Seleção múltipla + bulk actions
- [ ] Empty state com CTA

### CRUD
- [ ] Create com validação
- [ ] Edit em modal/drawer
- [ ] Delete com ConfirmDialog
- [ ] Feedback toast em todas ações
- [ ] Loading states durante mutations

### Estados
- [ ] Loading: Skeleton (não spinner)
- [ ] Error: Mensagem + Retry
- [ ] Empty: Ícone + Mensagem + CTA
- [ ] Success: Toast + visual change

---

## 🎨 Design Tokens

### Cores (usar APENAS tokens semânticos)

```
✅ bg-primary, text-primary-foreground
✅ bg-destructive, text-destructive
✅ bg-muted, text-muted-foreground
✅ bg-success, text-success-foreground
✅ bg-warning, text-warning-foreground

❌ bg-red-500, text-blue-600, bg-green-400
❌ bg-[#ff0000], text-[rgb(0,0,255)]
```

### Botões

| Uso | Variante | Exemplo |
|-----|----------|---------|
| Ação principal | `default` | Adicionar, Salvar |
| Ação secundária | `outline` | Exportar, Filtrar |
| Ação terciária | `ghost` | Atualizar, Fechar |
| Ação destrutiva | `destructive` | Excluir, Cancelar |
| Link | `link` | Ver mais, Detalhes |

### Toasts

| Tipo | Função | Exemplo |
|------|--------|---------|
| Sucesso | `toast.success()` | "Embarcação cadastrada" |
| Erro | `toast.error()` | "Erro ao salvar. Tente novamente." |
| Aviso | `toast.warning()` | "Certificado expira em 5 dias" |
| Info | `toast.info()` | "Dados atualizados" |

---

## 🧭 Sidebar — Regras

1. Máximo 7 grupos principais (Mega-Hubs)
2. Profundidade máxima: 2 níveis
3. Nomes curtos e consistentes
4. Badges úteis (contagem, status)
5. Busca integrada no menu
6. Itens fixados pelo usuário
7. Módulos recentes

---

## ⌨️ Acessibilidade

- Todos os botões com `aria-label`
- Foco visível (`focus-visible:ring-2`)
- Navegação por teclado completa
- Contraste WCAG AAA (7:1)
- Touch targets ≥ 44px

---

*Documento vivo — atualizar a cada sprint*
