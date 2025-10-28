# Finance Hub Module

## 📋 Overview

**Version**: 192.0  
**Status**: Partial Implementation  
**Category**: Finance  
**Route**: `/finance`

The Finance Hub is a comprehensive financial management system providing real-time financial tracking, reporting, and analysis capabilities for the maritime operations.

## 🎯 Objectives

- **Financial Tracking**: Monitor income, expenses, and net profit in real-time
- **Invoice Management**: Create, track, and manage invoices
- **Reporting**: Generate financial reports and export data
- **Budget Control**: Track budget allocations and spending
- **Transaction Management**: Record and categorize financial transactions
- **Analytics**: Provide insights into financial performance

## 🏗️ Architecture

### Component Structure

```
finance-hub/
├── components/
│   └── InvoiceManager.tsx       # Invoice management component
├── hooks/
│   └── useFinanceData.ts        # Custom hook for fetching finance data
├── services/
│   └── finance-export.ts        # Export and reporting service
└── index.tsx                    # Main module entry point
```

### Data Flow

```
User Interface (index.tsx)
       ↓
Custom Hook (useFinanceData)
       ↓
Supabase Database
       ↓
React State Management
       ↓
Component Rendering
```

## 🧩 Components

### Main Component (`index.tsx`)

The main Finance Hub component provides:
- **Financial Summary Cards**: Display total income, expenses, net profit, and pending invoices
- **Transaction List**: View and filter financial transactions
- **Category Breakdown**: Visualize expenses by category
- **Invoice Management**: Access invoice creation and tracking
- **Export Functionality**: Download financial reports

### InvoiceManager Component

Dedicated component for invoice management:
- Create new invoices
- Track invoice status
- Manage payment records
- Export invoice data

## 🔌 Services

### FinanceExportService

**Purpose**: Handle export of financial data in various formats

**Methods**:
```typescript
/**
 * Export financial data to Excel format
 * @param data - Financial data to export
 * @param filename - Name of the output file
 */
exportToExcel(data: any[], filename: string): void

/**
 * Export financial data to PDF format
 * @param data - Financial data to export
 * @param filename - Name of the output file
 */
exportToPDF(data: any[], filename: string): void

/**
 * Generate financial report
 * @param startDate - Report start date
 * @param endDate - Report end date
 * @returns Financial report data
 */
generateReport(startDate: Date, endDate: Date): Promise<Report>
```

## 🪝 Hooks

### useFinanceData

**Purpose**: Fetch and manage financial data from Supabase

**Returns**:
```typescript
{
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    pendingInvoices: number;
  };
  transactions: Transaction[];
  categories: Category[];
  invoices: Invoice[];
  loading: boolean;
  error: Error | null;
}
```

**Usage**:
```typescript
import { useFinanceData } from './hooks/useFinanceData';

function MyComponent() {
  const { summary, transactions, loading } = useFinanceData();
  
  if (loading) return <Loading />;
  
  return <div>{summary.netProfit}</div>;
}
```

## 💾 Database Schema

### Tables

#### financial_transactions
```sql
CREATE TABLE financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(10) CHECK (type IN ('income', 'expense')),
  amount DECIMAL(15, 2) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  transaction_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### invoices
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  client_name VARCHAR(200) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  due_date DATE,
  paid_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### budget_categories
```sql
CREATE TABLE budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  allocated_amount DECIMAL(15, 2),
  spent_amount DECIMAL(15, 2) DEFAULT 0,
  fiscal_year INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Relationships

- `financial_transactions.category` → `budget_categories.name`
- `invoices` tracks payment status independently

## 🔗 Dependencies

### Internal Dependencies
- `@/components/ui/*` - UI component library (shadcn/ui)
- `@/hooks/use-toast` - Toast notifications
- `@/integrations/supabase/client` - Database client

### External Dependencies
- `react` - UI framework
- `lucide-react` - Icon library
- `xlsx` - Excel export (via finance-export service)
- `jspdf` - PDF generation (via finance-export service)

### Module Dependencies
None - This is a standalone module

## 📡 API Reference

### Data Fetching

```typescript
// Fetch financial summary
const { data: summary } = await supabase
  .rpc('get_financial_summary');

// Fetch transactions
const { data: transactions } = await supabase
  .from('financial_transactions')
  .select('*')
  .order('transaction_date', { ascending: false });

// Fetch invoices
const { data: invoices } = await supabase
  .from('invoices')
  .select('*')
  .order('created_at', { ascending: false });
```

### Data Mutations

```typescript
// Create transaction
const { data, error } = await supabase
  .from('financial_transactions')
  .insert({
    type: 'income',
    amount: 1000.00,
    category: 'Services',
    description: 'Client payment'
  });

// Update invoice status
const { error } = await supabase
  .from('invoices')
  .update({ status: 'paid', paid_date: new Date() })
  .eq('id', invoiceId);
```

## 🚀 Usage Examples

### Basic Integration

```typescript
import FinanceHub from '@/modules/finance-hub';

function App() {
  return (
    <div>
      <FinanceHub />
    </div>
  );
}
```

### Custom Implementation

```typescript
import { useFinanceData } from '@/modules/finance-hub/hooks/useFinanceData';
import { FinanceExportService } from '@/modules/finance-hub/services/finance-export';

function CustomFinanceView() {
  const { summary, transactions } = useFinanceData();
  const exportService = new FinanceExportService();

  const handleExport = () => {
    exportService.exportToExcel(transactions, 'financial-report.xlsx');
  };

  return (
    <div>
      <h2>Net Profit: ${summary.netProfit}</h2>
      <button onClick={handleExport}>Export Report</button>
    </div>
  );
}
```

## 🧪 Testing

### Unit Tests Location
- `src/tests/finance-hub.test.ts` (to be created)
- `__tests__/finance-hub.test.tsx` (to be created)

### Test Coverage Goals
- Hook functionality: useFinanceData
- Service methods: Finance export
- Component rendering: Main hub and InvoiceManager
- Data formatting: Currency, dates
- Error handling: API failures

### Example Test

```typescript
import { render, screen } from '@testing-library/react';
import FinanceHub from './index';

describe('FinanceHub', () => {
  it('renders financial summary', () => {
    render(<FinanceHub />);
    expect(screen.getByText('Total Income')).toBeInTheDocument();
    expect(screen.getByText('Total Expenses')).toBeInTheDocument();
  });
});
```

## 🔧 Configuration

### Environment Variables
```bash
# Supabase configuration (inherited from project)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### Feature Flags
None currently implemented

## 🐛 Known Issues

1. **Partial Implementation**: Database integration needs completion
2. **No Real-time Updates**: Requires Supabase real-time subscriptions
3. **Limited Export Formats**: Only basic export functionality implemented
4. **No Budget Tracking UI**: Budget features exist in DB but no UI

## 🚧 Roadmap

### Short Term
- [ ] Complete Supabase integration
- [ ] Add real-time data updates
- [ ] Implement comprehensive unit tests
- [ ] Add data validation

### Long Term
- [ ] Advanced reporting dashboard
- [ ] Budget tracking UI
- [ ] Multi-currency support
- [ ] Automated reconciliation
- [ ] Integration with accounting software

## 📚 Related Documentation

- [Module Registry](../../registry.ts)
- [Supabase Integration Guide](../../../../docs/INTEGRATION-GUIDE.md)
- [Testing Guide](../../../../docs/TESTING-GUIDE.md)

## 👥 Maintainers

- Development Team

## 📄 License

Internal use only - Travel HR Buddy Project

---

**Last Updated**: 2025-10-28  
**Version**: 192.0  
**Status**: In Development
