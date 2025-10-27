# 🔴 PATCH 242 – Finalizar Finance Hub

**Data:** 2025-10-27  
**Status:** PENDENTE  
**Prioridade:** ALTA 🔴  
**Módulo:** Finance Hub  
**Progresso Atual:** 20% → 100%

---

## 📋 Objetivo

Levar o Finance Hub de apenas placeholder (20% completo) para um módulo financeiro completo e funcional com gestão de transações, faturas, orçamentos e relatórios.

---

## 🎯 Resultados Esperados

- ✅ CRUD completo para transações financeiras
- ✅ Sistema de faturas com geração de PDF
- ✅ Gestão de orçamentos e alocações
- ✅ Controle de categorias de despesas
- ✅ Relatórios financeiros por período
- ✅ Dashboard financeiro com KPIs
- ✅ Status de pagamentos (Pendente, Pago, Atrasado)
- ✅ Integração com dados reais do Supabase

---

## 🗄️ Tabelas Necessárias

### 1. financial_transactions
```sql
CREATE TABLE financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  category_id UUID REFERENCES expense_categories(id),
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  transaction_date DATE NOT NULL,
  vessel_id UUID REFERENCES vessels(id),
  budget_id UUID REFERENCES budgets(id),
  invoice_id UUID REFERENCES invoices(id),
  payment_method TEXT,
  reference_number TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_by UUID REFERENCES auth.users(id),
  organization_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_financial_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX idx_financial_transactions_vessel ON financial_transactions(vessel_id);
CREATE INDEX idx_financial_transactions_budget ON financial_transactions(budget_id);
```

### 2. invoices
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  vendor_name TEXT NOT NULL,
  vendor_email TEXT,
  vessel_id UUID REFERENCES vessels(id),
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'paid', 'overdue', 'cancelled')),
  payment_date DATE,
  description TEXT,
  notes TEXT,
  pdf_url TEXT,
  organization_id UUID,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
```

### 3. budgets
```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  fiscal_year INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  allocated_amount DECIMAL(12,2) DEFAULT 0,
  spent_amount DECIMAL(12,2) DEFAULT 0,
  vessel_id UUID REFERENCES vessels(id),
  category_id UUID REFERENCES expense_categories(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed', 'exceeded')),
  alert_threshold DECIMAL(5,2) DEFAULT 80.00, -- Percentage
  organization_id UUID,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_budgets_fiscal_year ON budgets(fiscal_year);
CREATE INDEX idx_budgets_status ON budgets(status);
```

### 4. expense_categories
```sql
CREATE TABLE expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_category_id UUID REFERENCES expense_categories(id),
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT 'DollarSign',
  is_active BOOLEAN DEFAULT true,
  organization_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Categorias padrão
INSERT INTO expense_categories (name, code, description, icon) VALUES
('Fuel', 'FUEL', 'Combustível e lubrificantes', 'Fuel'),
('Maintenance', 'MAINT', 'Manutenção e reparos', 'Wrench'),
('Crew', 'CREW', 'Salários e benefícios da tripulação', 'Users'),
('Port Fees', 'PORT', 'Taxas portuárias e de atracação', 'Anchor'),
('Insurance', 'INS', 'Seguros diversos', 'Shield'),
('Supplies', 'SUPP', 'Suprimentos e materiais', 'Package'),
('Communication', 'COMM', 'Comunicações e internet', 'Radio'),
('Other', 'OTHER', 'Despesas diversas', 'MoreHorizontal');
```

---

## 🔧 Estrutura de Arquivos

```
src/modules/finance-hub/
├── components/
│   ├── TransactionList.tsx          ← Lista de transações
│   ├── TransactionForm.tsx          ← Formulário de transação
│   ├── InvoiceList.tsx              ← Lista de faturas
│   ├── InvoiceForm.tsx              ← Formulário de fatura
│   ├── InvoicePreview.tsx           ← Preview de PDF
│   ├── BudgetList.tsx               ← Lista de orçamentos
│   ├── BudgetForm.tsx               ← Formulário de orçamento
│   ├── BudgetProgress.tsx           ← Barras de progresso
│   ├── CategoryManager.tsx          ← Gestão de categorias
│   ├── FinancialDashboard.tsx       ← Dashboard principal
│   ├── ReportGenerator.tsx          ← Gerador de relatórios
│   └── PaymentStatusBadge.tsx       ← Badge de status
├── hooks/
│   ├── useTransactions.ts           ← Hook para transações
│   ├── useInvoices.ts               ← Hook para faturas
│   ├── useBudgets.ts                ← Hook para orçamentos
│   ├── useCategories.ts             ← Hook para categorias
│   └── useFinancialReports.ts       ← Hook para relatórios
├── services/
│   ├── transactionService.ts        ← Service de transações
│   ├── invoiceService.ts            ← Service de faturas
│   ├── pdfGenerator.ts              ← Geração de PDF
│   └── reportService.ts             ← Service de relatórios
├── types/
│   └── finance.types.ts             ← Types do módulo
└── index.tsx                        ← Página principal
```

---

## 🛠️ Funcionalidades a Implementar

### 1. Gestão de Transações

**Componente:** `TransactionForm.tsx`
```typescript
interface Transaction {
  id: string
  type: 'income' | 'expense' | 'transfer'
  categoryId: string
  amount: number
  currency: string
  description: string
  transactionDate: Date
  vesselId?: string
  budgetId?: string
  paymentMethod?: string
  referenceNumber?: string
  status: 'pending' | 'completed' | 'cancelled'
}
```

**Ações:**
- [ ] Criar transação
- [ ] Editar transação
- [ ] Deletar transação
- [ ] Filtrar por data/categoria/vessel
- [ ] Busca por referência
- [ ] Export CSV/Excel

### 2. Sistema de Faturas

**Componente:** `InvoiceForm.tsx`
```typescript
interface Invoice {
  id: string
  invoiceNumber: string
  vendorName: string
  vendorEmail?: string
  vesselId?: string
  issueDate: Date
  dueDate: Date
  amount: number
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled'
  paymentDate?: Date
  description?: string
  notes?: string
  pdfUrl?: string
}
```

**Ações:**
- [ ] Criar fatura
- [ ] Gerar PDF automático
- [ ] Marcar como paga
- [ ] Enviar email (integração futura)
- [ ] Alertas de vencimento
- [ ] Histórico de pagamentos

**PDF Generator:**
```typescript
// pdfGenerator.ts
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function generateInvoicePDF(invoice: Invoice) {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(20)
  doc.text('INVOICE', 105, 20, { align: 'center' })
  
  // Invoice details
  doc.setFontSize(12)
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 40)
  doc.text(`Issue Date: ${format(invoice.issueDate, 'PP')}`, 20, 50)
  doc.text(`Due Date: ${format(invoice.dueDate, 'PP')}`, 20, 60)
  
  // Vendor info
  doc.text(`Vendor: ${invoice.vendorName}`, 20, 80)
  
  // Amount
  doc.setFontSize(16)
  doc.text(`Amount: $${invoice.amount.toFixed(2)}`, 20, 100)
  
  return doc.output('blob')
}
```

### 3. Gestão de Orçamentos

**Componente:** `BudgetForm.tsx`
```typescript
interface Budget {
  id: string
  name: string
  description?: string
  fiscalYear: number
  startDate: Date
  endDate: Date
  totalAmount: number
  allocatedAmount: number
  spentAmount: number
  vesselId?: string
  categoryId?: string
  status: 'draft' | 'active' | 'closed' | 'exceeded'
  alertThreshold: number // percentage
}
```

**Ações:**
- [ ] Criar orçamento
- [ ] Alocar valores
- [ ] Rastrear gastos
- [ ] Alertas de threshold
- [ ] Comparação ano a ano
- [ ] Previsão de gastos

### 4. Dashboard Financeiro

**Componente:** `FinancialDashboard.tsx`

**KPIs a Exibir:**
- Total Income (mês/ano)
- Total Expenses (mês/ano)
- Net Profit/Loss
- Budget Utilization (%)
- Pending Invoices Count
- Overdue Invoices Count
- Cash Flow Trend (últimos 6 meses)
- Top Expense Categories

**Gráficos:**
- Income vs Expenses (Line Chart)
- Expenses by Category (Pie Chart)
- Budget vs Actual (Bar Chart)
- Cash Flow (Area Chart)

### 5. Relatórios Financeiros

**Componente:** `ReportGenerator.tsx`

**Tipos de Relatórios:**
- [ ] Relatório de Receitas/Despesas
- [ ] Relatório de Orçamento
- [ ] Relatório de Faturas
- [ ] Análise por Categoria
- [ ] Análise por Embarcação
- [ ] Comparativo Período a Período

**Filtros:**
- Data (range)
- Categoria
- Embarcação
- Status
- Tipo de transação

---

## 📊 Integração React Query

```typescript
// hooks/useTransactions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionService } from '../services/transactionService'

export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionService.getAll(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: transactionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['financial-dashboard'] })
    },
  })
}
```

---

## ✅ Critérios de Validação

### Funcionalidade
- [ ] CRUD completo para todas as entidades
- [ ] Geração de PDF de faturas funcional
- [ ] Cálculos financeiros corretos
- [ ] Filtros e buscas funcionando
- [ ] Status de pagamento atualiza corretamente

### UI/UX
- [ ] Interface responsiva
- [ ] Loading states
- [ ] Error handling
- [ ] Confirmação de ações destrutivas
- [ ] Feedback visual de ações

### Dados
- [ ] Conectado a dados reais do Supabase
- [ ] React Query configurado com cache
- [ ] Zero dados mockados
- [ ] RLS policies implementadas

### Performance
- [ ] Queries otimizadas
- [ ] Paginação implementada
- [ ] Cache eficiente
- [ ] Build sem warnings

---

## 📈 Progresso

| Funcionalidade | Status |
|----------------|--------|
| Database Schema | 🔴 Pendente |
| Transaction CRUD | 🔴 Pendente |
| Invoice System | 🔴 Pendente |
| Budget Management | 🔴 Pendente |
| PDF Generation | 🔴 Pendente |
| Financial Dashboard | 🟡 Parcial (20%) |
| Reports | 🔴 Pendente |
| React Query Integration | 🔴 Pendente |

---

## 🔗 Dependências

- PATCH 241 (Supabase Types) - Recomendado completar antes
- jsPDF - Já instalado
- jspdf-autotable - Já instalado
- react-query - Já instalado
- date-fns - Já instalado

---

**STATUS:** 🔴 AGUARDANDO IMPLEMENTAÇÃO  
**PRÓXIMO PATCH:** PATCH 243 – Conectar Dashboard a Dados Reais
