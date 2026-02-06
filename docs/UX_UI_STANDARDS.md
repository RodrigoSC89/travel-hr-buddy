# 📐 UX/UI STANDARDS - NAUTI ONE

> **Design System Tier-1 para Excelência Mundial**
> Versão: 8.0 | Data: Fevereiro 2026

---

## 🎯 PRINCÍPIOS FUNDAMENTAIS

### Regra de Ouro (Não Negociável)

| ❌ PROIBIDO | ✅ OBRIGATÓRIO |
|-------------|----------------|
| Botão decorativo sem ação | Todo botão executa uma ação |
| Tela sem estados (empty/loading/error) | 3 estados em toda tela |
| Ação sem feedback | Toast em toda operação |
| UX inconsistente entre módulos | Design System único |
| Dados mockados em produção | Dados reais ou feature flag |

---

## 🏗️ ARQUITETURA DE COMPONENTES

### 1. PageShell (Container de Página)

```tsx
import { PageShell } from '@/components/design-system';

<PageShell
  title="Gestão de Navios"
  subtitle="Gerencie sua frota de embarcações"
  breadcrumbs={[
    { label: 'Operations', href: '/ops' },
    { label: 'Navios' }
  ]}
  
  // Ações padrão
  onAdd={() => setShowModal(true)}
  addLabel="Novo Navio"
  onRefresh={refetch}
  isRefreshing={isRefetching}
  onExport={exportToCSV}
  
  // Estados
  isLoading={isLoading}
  error={error}
  onRetry={refetch}
  isEmpty={data?.length === 0}
  emptyState={{
    icon: Ship,
    title: "Nenhum navio cadastrado",
    description: "Comece adicionando seu primeiro navio.",
    actionLabel: "Adicionar Navio",
    onAction: () => setShowModal(true)
  }}
  
  // Status do sistema
  isOnline={isOnline}
  lastSync={lastSync}
  activeFilters={filters.length}
>
  {/* Conteúdo da página */}
</PageShell>
```

### 2. DataGrid (Tabela Avançada)

```tsx
import { DataGrid, createDefaultBulkActions } from '@/components/design-system';

<DataGrid
  data={vessels}
  columns={[
    { key: 'name', header: 'Nome', sortable: true },
    { key: 'imo', header: 'IMO', width: '120px' },
    { key: 'status', header: 'Status', render: (row) => (
      <StatusBadge status={row.status === 'active' ? 'active' : 'inactive'} />
    )},
    { key: 'updated_at', header: 'Atualizado', render: (row) => formatDate(row.updated_at) },
  ]}
  
  // Features
  searchable
  searchPlaceholder="Buscar por nome ou IMO..."
  selectable
  bulkActions={createDefaultBulkActions(handleDelete, handleExport)}
  
  // Paginação
  paginated
  pageSize={20}
  
  // Ações por linha
  rowActions={(row) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleEdit(row)}>
          <Edit className="w-4 h-4 mr-2" /> Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDelete(row)} className="text-destructive">
          <Trash className="w-4 h-4 mr-2" /> Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )}
  
  // Estados
  isLoading={isLoading}
  emptyTitle="Nenhum navio encontrado"
  emptyDescription="Ajuste os filtros ou adicione novos navios."
  emptyAction={{ label: "Adicionar", onClick: handleAdd }}
/>
```

### 3. FormField (Campo de Formulário)

```tsx
import { FormField } from '@/components/design-system';

<FormField
  label="Nome do Navio"
  name="name"
  required
  placeholder="Ex: MV Atlantic Star"
  helperText="Nome oficial conforme registro"
  error={errors.name?.message}
  tooltip="Nome completo da embarcação"
/>

<FormField
  label="Capacidade (DWT)"
  name="capacity"
  type="number"
  suffix="tons"
  success={isValid ? "Valor válido" : undefined}
/>

<FormField
  label="Descrição"
  inputType="textarea"
  rows={4}
  helperText="Opcional: informações adicionais"
/>
```

### 4. ConfirmModal (Confirmação de Ações)

```tsx
import { ConfirmModal, useConfirmModal } from '@/components/design-system';

const { confirm, ConfirmModalComponent } = useConfirmModal();

const handleDelete = async () => {
  const confirmed = await confirm({
    title: "Excluir navio?",
    description: "Esta ação é irreversível. Todos os dados serão perdidos.",
    variant: "danger",
    confirmLabel: "Sim, excluir",
  });
  
  if (confirmed) {
    await deleteVessel(vessel.id);
    toast.success("Navio excluído com sucesso");
  }
};

// Renderize o modal
<ConfirmModalComponent />
```

### 5. StatusBadge (Badges de Status)

```tsx
import { StatusBadge } from '@/components/design-system';

// Status predefinidos
<StatusBadge status="active" />        // Verde: Ativo
<StatusBadge status="inactive" />      // Cinza: Inativo
<StatusBadge status="pending" />       // Cinza: Pendente
<StatusBadge status="approved" />      // Verde: Aprovado
<StatusBadge status="rejected" />      // Vermelho: Rejeitado
<StatusBadge status="review" />        // Amarelo: Em Revisão
<StatusBadge status="draft" />         // Cinza: Rascunho
<StatusBadge status="loading" />       // Azul: Carregando (com spinner)

// Com label customizado
<StatusBadge status="success" label="Concluído" />

// Tamanhos
<StatusBadge status="active" size="sm" />
<StatusBadge status="active" size="md" />
<StatusBadge status="active" size="lg" />
```

### 6. SkeletonLoaders (Estados de Carregamento)

```tsx
import { 
  TableSkeleton, 
  CardSkeleton, 
  KPIGridSkeleton,
  ChartSkeleton,
  FormSkeleton 
} from '@/components/design-system';

// Tabela
<TableSkeleton rows={5} columns={4} />

// Grid de Cards
<CardsGridSkeleton cards={6} columns={3} />

// KPIs
<KPIGridSkeleton count={4} />

// Gráfico
<ChartSkeleton type="bar" height={300} />

// Formulário
<FormSkeleton fields={6} />
```

### 7. ToastNotification (Feedback)

```tsx
import { toast, toastMessages } from '@/components/design-system';

// Toasts básicos
toast.success("Operação concluída!");
toast.error("Erro ao processar");
toast.warning("Atenção necessária");
toast.info("Nova atualização disponível");

// Com detalhes
toast.success({
  title: "Navio cadastrado",
  description: "O registro foi salvo no sistema.",
  duration: 5000,
});

// Com ação
toast.error({
  title: "Falha na conexão",
  description: "Não foi possível salvar.",
  action: {
    label: "Tentar novamente",
    onClick: () => retry(),
  },
});

// Mensagens padrão para CRUD
toastMessages.created("Navio");      // "Navio criado com sucesso"
toastMessages.updated("Contrato");   // "Contrato atualizado"
toastMessages.deleted("Documento");  // "Documento removido"
toastMessages.loadError();           // "Erro ao carregar dados"

// Promise (loading → success/error)
toast.promise(saveVessel(data), {
  loading: "Salvando...",
  success: "Navio salvo!",
  error: "Erro ao salvar",
});
```

---

## 📋 CHECKLIST POR TELA (OBRIGATÓRIO)

### Header da Página

- [ ] Título claro e conciso (h1)
- [ ] Subtítulo descritivo (quando necessário)
- [ ] Breadcrumbs para navegação
- [ ] Ações principais visíveis: [Adicionar] [Importar] [Exportar] [Atualizar]
- [ ] Indicador de status (online/offline)
- [ ] Indicador de filtros ativos

### Listagens

- [ ] Campo de busca funcional
- [ ] Filtros avançados acessíveis
- [ ] Ordenação por colunas (sort)
- [ ] Paginação (client ou server-side)
- [ ] Seleção múltipla (checkbox)
- [ ] Bulk actions visíveis quando há seleção
- [ ] Empty state com CTA
- [ ] Loading state (skeleton)
- [ ] Ações por linha (edit/delete/view)

### CRUD

- [ ] Modal ou drawer para criar/editar
- [ ] Validação inline em tempo real
- [ ] Campos obrigatórios marcados (*)
- [ ] Helper text em campos complexos
- [ ] Botões de ação claros (Salvar/Cancelar)
- [ ] Loading no botão durante submit
- [ ] Confirm modal para exclusões
- [ ] Toast de feedback após operação

### Estados

- [ ] Loading: Skeleton adequado ao conteúdo
- [ ] Empty: Ícone + mensagem + CTA
- [ ] Error: Mensagem clara + botão Retry
- [ ] Offline: Banner informativo

### Acessibilidade

- [ ] Navegação por teclado (Tab/Enter/Esc)
- [ ] Focus visível em elementos interativos
- [ ] Labels em todos os inputs
- [ ] aria-labels em botões sem texto
- [ ] Contraste adequado (WCAG AA+)

---

## 🎨 TOKENS DE DESIGN

### Cores (Usar tokens semânticos)

```css
/* ✅ CORRETO - Usar tokens */
bg-primary
bg-secondary
bg-muted
bg-destructive
bg-success
bg-warning

text-foreground
text-muted-foreground
text-primary-foreground

border-border
border-primary

/* ❌ ERRADO - Não usar cores diretas */
bg-blue-500
bg-red-600
text-gray-700
```

### Espaçamento

```css
/* Padrão de espaçamento */
p-4   /* Padding interno de cards */
p-6   /* Padding de seções principais */
gap-2 /* Gap entre botões */
gap-4 /* Gap entre elementos */
gap-6 /* Gap entre seções */

/* Margins */
mb-2  /* Entre label e input */
mb-4  /* Entre campos de form */
mb-6  /* Entre seções */
```

### Tipografia

```css
/* Títulos */
text-3xl font-bold     /* h1 - Título da página */
text-2xl font-semibold /* h2 - Seções */
text-xl font-semibold  /* h3 - Subseções */
text-lg font-medium    /* h4 - Cards */

/* Corpo */
text-base              /* Texto padrão */
text-sm                /* Texto secundário */
text-xs                /* Labels, badges */

/* Cores de texto */
text-foreground        /* Texto principal */
text-muted-foreground  /* Texto secundário */
```

### Bordas e Sombras

```css
/* Bordas */
rounded-lg    /* Cards, modais */
rounded-md    /* Inputs, botões */
rounded-full  /* Avatares, badges */

/* Sombras */
shadow-soft   /* Cards leves */
shadow-elegant/* Cards destacados */
shadow-azure  /* Elementos primários */
```

---

## 🚫 ANTI-PATTERNS (EVITAR)

### ❌ Botão Decorativo

```tsx
// ERRADO
<Button>Ver Detalhes</Button> // onClick não definido

// CORRETO
<Button onClick={() => navigate(`/vessel/${id}`)}>Ver Detalhes</Button>
```

### ❌ Toast Genérico

```tsx
// ERRADO
toast("Sucesso"); // Não informa o que aconteceu

// CORRETO
toast.success("Navio adicionado com sucesso");
```

### ❌ Loading Infinito

```tsx
// ERRADO - Sem tratamento de erro
if (isLoading) return <Spinner />;

// CORRETO - Com estados completos
<PageShell
  isLoading={isLoading}
  error={error}
  onRetry={refetch}
>
  {content}
</PageShell>
```

### ❌ Empty State Vazio

```tsx
// ERRADO
{data.length === 0 && <p>Nenhum dado</p>}

// CORRETO
{data.length === 0 && (
  <EmptyState
    icon={Ship}
    title="Nenhum navio cadastrado"
    description="Comece adicionando seu primeiro navio."
    actionLabel="Adicionar Navio"
    onAction={handleAdd}
  />
)}
```

### ❌ Cores Hardcoded

```tsx
// ERRADO
<div className="bg-blue-500 text-white">...</div>

// CORRETO
<div className="bg-primary text-primary-foreground">...</div>
```

---

## 📊 MÉTRICAS DE QUALIDADE UX

| Critério | Meta | Medição |
|----------|------|---------|
| Time to Interactive | < 3s | Lighthouse |
| Feedback Time | < 200ms | UX Audit |
| Error Recovery | 100% | Manual test |
| Empty States | 100% | Code review |
| Loading States | 100% | Code review |
| Keyboard Navigation | 100% | a11y test |
| Touch Targets | ≥ 44px | Visual check |

---

## ✅ VALIDAÇÃO

Antes de aprovar qualquer tela:

1. **Funcional**: Todo botão executa ação
2. **Feedback**: Toda ação tem resposta visual
3. **Estados**: Loading/Empty/Error implementados
4. **Consistência**: Usa componentes do Design System
5. **Acessível**: Navegável por teclado

---

*Documento gerado automaticamente - NAUTI ONE v8.0*
