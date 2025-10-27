# Finance Hub - Complete Financial Management System
## PATCH 242 Implementation Guide

This document describes the Finance Hub implementation completed as part of Week 2 of the system stabilization roadmap.

## ✅ Completed Components

### 1. Database Schema
The following tables have been created with complete RLS policies:

#### `expense_categories`
- Categorizes all expenses and budgets
- Includes default maritime categories (Fuel, Crew Wages, Maintenance, etc.)
- Budget codes for accounting integration

#### `financial_transactions`
- All income and expense transactions
- Multi-currency support
- Approval workflow (pending → approved → completed)
- Attachments and metadata support
- Links to expense categories

#### `invoices`
- Receivable and payable invoices
- Line items support (JSONB)
- Status tracking (draft → sent → paid → overdue)
- PDF URL storage for generated invoices
- Payment tracking integration

#### `budgets`
- Multiple budget types (annual, quarterly, monthly, project, department)
- Auto-calculated remaining amount
- Alert thresholds for overspending
- Category and vessel/department filtering

#### `payments`
- Payment records linked to invoices
- Multiple payment methods
- Transaction reference tracking

### 2. TypeScript Types
Complete type definitions in `src/types/finance/index.ts`:
- All entity interfaces
- Enum types for statuses and categories
- Form input types for creating/updating
- Report types for analytics

### 3. Features
- ✅ Row Level Security enabled on all tables
- ✅ Automatic timestamp updates
- ✅ Generated columns for calculated fields
- ✅ Proper indexes for performance
- ✅ Default data seeded (10 expense categories)

## 🚧 Next Steps (To Complete PATCH 242)

### React Query Hooks
Create `src/hooks/finance/useFinanceData.ts` with:
- `useExpenseCategories()` - List all categories
- `useFinancialTransactions()` - CRUD operations for transactions
- `useInvoices()` - Invoice management
- `useBudgets()` - Budget tracking
- `usePayments()` - Payment recording

### Components to Create

#### 1. Invoice Generator (`src/components/finance/InvoiceGenerator.tsx`)
```typescript
// Features:
- Create new invoices with line items
- Calculate subtotal, tax, and total automatically
- Generate PDF using jspdf (already installed)
- Send invoices by email
- Track invoice status
```

#### 2. Payment Tracker (`src/components/finance/PaymentTracker.tsx`)
```typescript
// Features:
- List all payments
- Filter by date range, method, status
- Link payments to invoices
- Record partial payments
- Export payment history
```

#### 3. Budget Reports (`src/components/finance/BudgetReports.tsx`)
```typescript
// Features:
- Budget vs. actual spending charts
- Alert when threshold exceeded
- Department/category breakdown
- Time series analysis
- Export to CSV/PDF
```

#### 4. Transaction Dashboard (`src/components/finance/TransactionDashboard.tsx`)
```typescript
// Features:
- Income vs. expenses chart
- Category breakdown pie chart
- Recent transactions list
- Quick add transaction
- Filter by date range
```

## Usage Examples

### Creating a Transaction
```typescript
import { useCreateTransaction } from '@/hooks/finance/useFinanceData';

const { mutate: createTransaction } = useCreateTransaction();

createTransaction({
  transaction_type: 'expense',
  category_id: 'fuel-category-id',
  amount: 5000.00,
  currency: 'USD',
  description: 'Fuel purchase for MV Atlantic',
  transaction_date: '2025-01-27',
  vessel_id: 'vessel-id',
  payment_method: 'bank_transfer',
});
```

### Generating an Invoice
```typescript
import { useCreateInvoice } from '@/hooks/finance/useFinanceData';

const { mutate: createInvoice } = useCreateInvoice();

createInvoice({
  invoice_number: 'INV-2025-001',
  invoice_type: 'receivable',
  vendor_name: 'XYZ Shipping Co.',
  vendor_email: 'billing@xyz.com',
  issue_date: '2025-01-27',
  due_date: '2025-02-27',
  subtotal: 10000.00,
  tax_amount: 800.00,
  total_amount: 10800.00,
  line_items: [
    {
      description: 'Vessel charter - 7 days',
      quantity: 7,
      unit_price: 1500.00,
      amount: 10500.00
    }
  ]
});
```

### Tracking Budget Usage
```typescript
import { useBudgets } from '@/hooks/finance/useFinanceData';

const { data: budgets } = useBudgets({ status: 'active' });

budgets?.forEach(budget => {
  const utilization = (budget.spent_amount / budget.total_amount) * 100;
  if (utilization > budget.alert_threshold) {
    console.warn(`Budget ${budget.name} is at ${utilization}%`);
  }
});
```

## Integration with Existing Systems

### Logger Integration
All finance operations log to the Winston logger:
```typescript
logger.info('Creating invoice', { invoice_number, total_amount });
logger.error('Failed to process payment', error, { payment_id });
```

### Supabase Realtime
Enable real-time updates for collaborative finance management:
```typescript
const channel = supabase
  .channel('finance-updates')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'financial_transactions' },
    (payload) => {
      // Handle real-time transaction updates
    }
  )
  .subscribe();
```

### Export Capabilities
Use existing PDF libraries:
- `jspdf` - Generate invoice PDFs
- `jspdf-autotable` - Format tables in PDFs
- `xlsx` - Export to Excel
- `html2canvas` - Capture charts as images

## API Endpoints (Future Enhancement)

Consider creating Supabase Edge Functions for:
- `generate-invoice-pdf` - Server-side PDF generation
- `send-invoice-email` - Email invoices to vendors
- `calculate-budget-alerts` - Scheduled budget monitoring
- `financial-reports` - Complex financial analytics

## Security Considerations

### Row Level Security
All tables have RLS enabled with policies:
- Authenticated users can read all finance data
- Authenticated users can create transactions/invoices/budgets
- Admin role required for deletions (to be implemented)

### Audit Trail
All tables include:
- `created_by` - User who created the record
- `created_at` - Timestamp of creation
- `updated_at` - Automatic update timestamp
- Metadata JSONB for additional context

## Testing Strategy

### Unit Tests (Vitest)
```typescript
// Test transaction calculations
// Test invoice total calculations
// Test budget utilization formulas
```

### Integration Tests (Playwright)
```typescript
// Test creating a complete invoice
// Test recording a payment
// Test budget alert workflow
```

## Performance Optimization

### Indexes Created
- `idx_financial_transactions_date` - Fast date range queries
- `idx_invoices_status` - Quick status filtering
- `idx_budgets_dates` - Efficient period filtering

### Query Optimization
- Use selective joins with `select()`
- Paginate large result sets
- Cache frequently accessed categories

## Next Steps

1. **Complete React Query Hooks** - Full CRUD operations
2. **Build Invoice Generator UI** - Form + PDF export
3. **Create Payment Tracker** - Payment recording interface
4. **Implement Budget Dashboard** - Charts and alerts
5. **Add Export Functions** - CSV/PDF/Excel exports
6. **Write Tests** - Unit and integration tests
7. **Documentation** - API docs and user guide

## Resources

- Database Schema: `supabase/migrations/20251027010237_create_finance_hub_tables.sql`
- TypeScript Types: `src/types/finance/index.ts`
- React Query Hooks: `src/hooks/finance/useFinanceData.ts` (to be created)
- Components: `src/components/finance/` (to be created)

---

**Status**: Database schema and types complete ✅  
**Next**: Implement React hooks and UI components ⚙️  
**Target**: Full Finance Hub operational by end of Week 2
