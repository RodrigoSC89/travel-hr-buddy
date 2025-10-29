# Finance Hub Module

## Visão Geral

O Finance Hub é o módulo centralizado para gestão financeira completa, incluindo controle de custos, budgets, faturamento, análise financeira e forecasting com dados em tempo real.

**Categoria**: Operations / Finance  
**Rota**: `/finance-hub`  
**Status**: Ativo  
**Versão**: 192.0

## Componentes Principais

### FinancialDashboard
- Overview financeiro
- Revenue vs Expenses
- Cash flow summary
- Budget status
- Key financial metrics

### CostControl
- Cost tracking por categoria
- Budget vs Actual
- Variance analysis
- Cost allocation
- Spend trending

### InvoiceManagement
- Invoice creation e tracking
- Payment status
- Accounts receivable
- Accounts payable
- Aging reports

### BudgetPlanner
- Budget creation e management
- Multi-year planning
- Department budgets
- Project budgets
- Forecast vs Actual

### FinancialReports
- P&L statements
- Balance sheets
- Cash flow statements
- Custom reports
- Export to Excel/PDF

## Banco de Dados Utilizado

### Tabelas Principais
```sql
CREATE TABLE financial_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_type VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  description TEXT,
  transaction_date DATE NOT NULL,
  vessel_id UUID REFERENCES vessels(id),
  project_id UUID,
  vendor_name VARCHAR(255),
  invoice_number VARCHAR(100),
  payment_status VARCHAR(20),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_name VARCHAR(255) NOT NULL,
  budget_type VARCHAR(50) NOT NULL,
  fiscal_year INTEGER NOT NULL,
  department VARCHAR(100),
  category VARCHAR(100),
  allocated_amount DECIMAL(15, 2) NOT NULL,
  spent_amount DECIMAL(15, 2) DEFAULT 0,
  remaining_amount DECIMAL(15, 2),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  invoice_type VARCHAR(20) NOT NULL,
  vendor_name VARCHAR(255),
  customer_name VARCHAR(255),
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  total_amount DECIMAL(15, 2) NOT NULL,
  paid_amount DECIMAL(15, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  line_items JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id),
  payment_date DATE NOT NULL,
  payment_amount DECIMAL(15, 2) NOT NULL,
  payment_method VARCHAR(50),
  reference_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Requisições API Envolvidas

### Transactions
- **GET /api/finance/transactions** - Lista transações
- **POST /api/finance/transactions** - Cria transação
- **GET /api/finance/transactions/:id** - Detalhes
- **PUT /api/finance/transactions/:id** - Atualiza
- **DELETE /api/finance/transactions/:id** - Remove
- **GET /api/finance/transactions/summary** - Resumo

### Budgets
- **GET /api/finance/budgets** - Lista budgets
- **POST /api/finance/budgets** - Cria budget
- **GET /api/finance/budgets/:id** - Detalhes
- **PUT /api/finance/budgets/:id** - Atualiza
- **GET /api/finance/budgets/utilization** - Utilização

### Invoices
- **GET /api/finance/invoices** - Lista invoices
- **POST /api/finance/invoices** - Cria invoice
- **GET /api/finance/invoices/:id** - Detalhes
- **PUT /api/finance/invoices/:id** - Atualiza
- **POST /api/finance/invoices/:id/payment** - Registra pagamento
- **GET /api/finance/invoices/aging** - Aging report

### Reports
- **GET /api/finance/reports/pl** - P&L statement
- **GET /api/finance/reports/cashflow** - Cash flow
- **GET /api/finance/reports/balance-sheet** - Balance sheet
- **POST /api/finance/reports/custom** - Custom report

## Features Financeiros

### Multi-Currency Support
- Suporte a múltiplas moedas
- Exchange rate management
- Currency conversion automática
- Reporting em moeda base

### Cost Allocation
- Alocação por departamento
- Alocação por projeto
- Alocação por embarcação
- Cost center tracking

### Financial Forecasting
- Revenue forecasting
- Expense forecasting
- Cash flow forecasting
- Budget projections

### Variance Analysis
- Budget vs Actual
- Period-over-period comparison
- Trend analysis
- Exception reporting

## Integrações

### Fleet Management
- Operational costs por vessel
- Fuel costs
- Maintenance costs
- Crew costs

### Crew Management
- Payroll integration
- Travel expenses
- Per diem
- Benefits costs

### Mission Control
- Mission costs
- Project accounting
- Resource costs
- ROI analysis

### Procurement
- Purchase orders
- Vendor management
- Payment processing
- Spend analysis

## Compliance & Auditoria

### Financial Controls
- Approval workflows
- Segregation of duties
- Audit trails
- Access controls

### Tax Compliance
- Tax calculation
- Tax reporting
- Withholding tax
- Sales tax / VAT

### Regulatory Compliance
- SOX compliance
- GAAP standards
- IFRS standards
- Industry regulations

## Analytics e KPIs

- **Revenue Growth**: Taxa de crescimento da receita
- **Gross Margin**: Margem bruta
- **Operating Margin**: Margem operacional
- **EBITDA**: Earnings before interest, taxes, depreciation, and amortization
- **Cash Burn Rate**: Taxa de queima de caixa
- **Days Sales Outstanding (DSO)**: Prazo médio de recebimento
- **Accounts Payable Turnover**: Giro de contas a pagar
- **Budget Variance**: Variância de budget

## Testes

Localização: 
- `tests/finance-hub.test.ts`

## Última Atualização

**Data**: 2025-10-29  
**Versão**: 192.0  
**Features**: Real-time data, Multi-currency, Forecasting
