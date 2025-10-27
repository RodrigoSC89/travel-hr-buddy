# 🔵 PATCH 248 – Testes Automatizados (Vitest + Playwright)

**Data:** 2025-10-27  
**Status:** PENDENTE  
**Prioridade:** ALTA 🔵  
**Módulo:** Testing / Quality Assurance

---

## 📋 Objetivo

Estabilizar módulos críticos com testes automatizados, incluindo unit tests (Vitest) e E2E tests (Playwright), com cobertura mínima de 70%.

---

## 🎯 Resultados Esperados

- ✅ Unit tests para módulos prioritários
- ✅ E2E tests para fluxos críticos
- ✅ Cobertura de 70%+ em módulos críticos
- ✅ CI/CD pipeline com testes
- ✅ Test reports automatizados
- ✅ Mocking apropriado do Supabase
- ✅ Performance tests básicos

---

## 📦 Módulos Prioritários

### 1. Finance Hub (80% coverage)
- Transaction CRUD
- Invoice generation
- Budget calculations
- Payment status

### 2. Logs Center (75% coverage)
- Log ingestion
- Filtering
- Search
- Export

### 3. Voice Assistant (70% coverage)
- Speech recognition
- Command detection
- Response generation
- History storage

---

## 🧪 Unit Tests com Vitest

### Setup Base

**Arquivo:** `vitest.config.ts` (já existe)
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/*',
        'dist/'
      ],
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

### 1. Finance Hub Tests

**Arquivo:** `src/modules/finance-hub/__tests__/transactionService.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { transactionService } from '../services/transactionService'
import { supabase } from '@/integrations/supabase/client'

vi.mock('@/integrations/supabase/client')

describe('Transaction Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  describe('create', () => {
    it('should create a transaction successfully', async () => {
      const mockTransaction = {
        type: 'expense',
        amount: 1000,
        categoryId: 'cat-1',
        description: 'Test expense'
      }
      
      const mockResponse = {
        data: { id: 'txn-1', ...mockTransaction },
        error: null
      }
      
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse)
          })
        })
      } as any)
      
      const result = await transactionService.create(mockTransaction)
      
      expect(result).toEqual(mockResponse.data)
      expect(supabase.from).toHaveBeenCalledWith('financial_transactions')
    })
    
    it('should handle errors when creating transaction', async () => {
      const mockError = { message: 'Database error' }
      
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: mockError
            })
          })
        })
      } as any)
      
      await expect(
        transactionService.create({ amount: 1000 })
      ).rejects.toThrow('Database error')
    })
  })
  
  describe('calculateBudgetUtilization', () => {
    it('should calculate budget utilization correctly', async () => {
      const budgetId = 'budget-1'
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [
              { amount: 500 },
              { amount: 300 },
              { amount: 200 }
            ],
            error: null
          })
        })
      } as any)
      
      const utilization = await transactionService.calculateBudgetUtilization(
        budgetId,
        10000
      )
      
      expect(utilization).toBe(10) // (500 + 300 + 200) / 10000 * 100
    })
  })
})
```

**Arquivo:** `src/modules/finance-hub/__tests__/InvoiceGenerator.test.tsx`

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InvoiceGenerator } from '../components/InvoiceGenerator'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

describe('InvoiceGenerator', () => {
  const queryClient = new QueryClient()
  
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
  
  it('should render invoice form', () => {
    render(<InvoiceGenerator />, { wrapper })
    
    expect(screen.getByLabelText('Invoice Number')).toBeInTheDocument()
    expect(screen.getByLabelText('Vendor Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Amount')).toBeInTheDocument()
  })
  
  it('should generate PDF when form is submitted', async () => {
    const user = userEvent.setup()
    render(<InvoiceGenerator />, { wrapper })
    
    await user.type(screen.getByLabelText('Invoice Number'), 'INV-001')
    await user.type(screen.getByLabelText('Vendor Name'), 'Acme Corp')
    await user.type(screen.getByLabelText('Amount'), '5000')
    
    await user.click(screen.getByRole('button', { name: /generate pdf/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/pdf generated/i)).toBeInTheDocument()
    })
  })
  
  it('should validate required fields', async () => {
    const user = userEvent.setup()
    render(<InvoiceGenerator />, { wrapper })
    
    await user.click(screen.getByRole('button', { name: /generate pdf/i }))
    
    expect(screen.getByText(/invoice number is required/i)).toBeInTheDocument()
    expect(screen.getByText(/vendor name is required/i)).toBeInTheDocument()
  })
})
```

### 2. Logs Center Tests

**Arquivo:** `src/modules/logs-center/__tests__/logService.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { logService } from '../services/logService'

describe('Log Service', () => {
  describe('filterLogs', () => {
    it('should filter logs by severity', () => {
      const logs = [
        { severity: 'error', message: 'Error 1' },
        { severity: 'info', message: 'Info 1' },
        { severity: 'error', message: 'Error 2' }
      ]
      
      const filtered = logService.filterLogs(logs, { severity: 'error' })
      
      expect(filtered).toHaveLength(2)
      expect(filtered.every(log => log.severity === 'error')).toBe(true)
    })
    
    it('should filter logs by date range', () => {
      const now = new Date()
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      
      const logs = [
        { timestamp: yesterday.toISOString(), message: 'Old' },
        { timestamp: now.toISOString(), message: 'Current' },
        { timestamp: tomorrow.toISOString(), message: 'Future' }
      ]
      
      const filtered = logService.filterLogs(logs, {
        startDate: now,
        endDate: tomorrow
      })
      
      expect(filtered).toHaveLength(2)
    })
  })
  
  describe('searchLogs', () => {
    it('should search logs by message content', () => {
      const logs = [
        { message: 'User login failed' },
        { message: 'Database connection error' },
        { message: 'User logout' }
      ]
      
      const results = logService.searchLogs(logs, 'user')
      
      expect(results).toHaveLength(2)
    })
  })
})
```

### 3. Voice Assistant Tests

**Arquivo:** `src/services/voice/__tests__/wakeWordDetector.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { WakeWordDetector } from '../wakeWordDetector'

describe('WakeWordDetector', () => {
  const detector = new WakeWordDetector()
  
  it('should detect exact wake word', () => {
    expect(detector.detect('nautilus')).toBe(true)
    expect(detector.detect('hey nautilus')).toBe(true)
    expect(detector.detect('ok nautilus')).toBe(true)
  })
  
  it('should detect wake word with variations', () => {
    expect(detector.detect('Hey Nautilus, what time is it?')).toBe(true)
    expect(detector.detect('OK NAUTILUS show me the dashboard')).toBe(true)
  })
  
  it('should not detect similar but wrong words', () => {
    expect(detector.detect('hello navigator')).toBe(false)
    expect(detector.detect('nautical')).toBe(false)
  })
  
  it('should handle fuzzy matching', () => {
    expect(detector.detect('natilus')).toBe(true) // small typo
    expect(detector.detect('noutilus')).toBe(true) // small typo
  })
})
```

---

## 🎭 E2E Tests com Playwright

### Configuration

**Arquivo:** `playwright.config.ts` (já existe)
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'playwright-report/results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI
  }
})
```

### 1. Finance Hub E2E

**Arquivo:** `e2e/finance-hub.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Finance Hub', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/finance')
  })
  
  test('should create a transaction', async ({ page }) => {
    // Click "New Transaction" button
    await page.click('button:has-text("New Transaction")')
    
    // Fill form
    await page.fill('input[name="amount"]', '1000')
    await page.selectOption('select[name="type"]', 'expense')
    await page.fill('textarea[name="description"]', 'Test expense')
    
    // Submit
    await page.click('button:has-text("Create")')
    
    // Verify success
    await expect(page.locator('text=Transaction created successfully')).toBeVisible()
  })
  
  test('should generate invoice PDF', async ({ page }) => {
    await page.click('button:has-text("New Invoice")')
    
    await page.fill('input[name="invoiceNumber"]', 'INV-001')
    await page.fill('input[name="vendorName"]', 'Test Vendor')
    await page.fill('input[name="amount"]', '5000')
    
    // Listen for download
    const downloadPromise = page.waitForEvent('download')
    await page.click('button:has-text("Generate PDF")')
    
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('INV-001')
  })
  
  test('should filter transactions by date', async ({ page }) => {
    // Set date filter
    await page.fill('input[name="startDate"]', '2025-01-01')
    await page.fill('input[name="endDate"]', '2025-12-31')
    await page.click('button:has-text("Filter")')
    
    // Verify filtered results
    const rows = await page.locator('table tbody tr')
    expect(await rows.count()).toBeGreaterThan(0)
  })
})
```

### 2. Voice Assistant E2E

**Arquivo:** `e2e/voice-assistant.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Voice Assistant', () => {
  test('should activate voice assistant', async ({ page }) => {
    await page.goto('/')
    
    // Grant microphone permission
    await page.context().grantPermissions(['microphone'])
    
    // Click voice assistant button
    await page.click('button[aria-label="Voice Assistant"]')
    
    // Verify listening state
    await expect(page.locator('text=Listening...')).toBeVisible()
  })
  
  test('should process voice command', async ({ page }) => {
    await page.goto('/')
    await page.context().grantPermissions(['microphone'])
    
    await page.click('button[aria-label="Voice Assistant"]')
    
    // Simulate voice input (would need mock)
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('voice-command', {
        detail: { transcript: 'show dashboard' }
      }))
    })
    
    // Verify navigation
    await expect(page).toHaveURL('/')
  })
})
```

### 3. Dashboard E2E

**Arquivo:** `e2e/dashboard.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test('should load dashboard with data', async ({ page }) => {
    await page.goto('/')
    
    // Wait for data to load
    await page.waitForSelector('[data-testid="kpi-card"]')
    
    // Verify KPI cards are visible
    const kpiCards = await page.locator('[data-testid="kpi-card"]')
    expect(await kpiCards.count()).toBeGreaterThanOrEqual(4)
  })
  
  test('should refresh data', async ({ page }) => {
    await page.goto('/')
    
    // Get initial value
    const initialValue = await page.locator('[data-testid="active-vessels"]').textContent()
    
    // Click refresh
    await page.click('button[aria-label="Refresh"]')
    
    // Wait for update
    await page.waitForTimeout(1000)
    
    // Value should be loaded
    const newValue = await page.locator('[data-testid="active-vessels"]').textContent()
    expect(newValue).toBeTruthy()
  })
})
```

---

## 📊 Coverage Reports

### Generate Coverage

```bash
# Unit tests with coverage
npm run test:coverage

# View HTML report
open coverage/index.html

# E2E tests
npm run test:e2e

# View Playwright report
npx playwright show-report
```

### Coverage Badges

Add to README.md:
```markdown
![Coverage](https://img.shields.io/badge/coverage-75%25-brightgreen)
![Tests](https://img.shields.io/badge/tests-passing-brightgreen)
```

---

## 🔄 CI/CD Integration

**Arquivo:** `.github/workflows/tests.yml`

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
  
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## ✅ Checklist de Validação

### Unit Tests
- [ ] Finance Hub: 80%+ coverage
- [ ] Logs Center: 75%+ coverage
- [ ] Voice Assistant: 70%+ coverage
- [ ] All tests passing
- [ ] No flaky tests

### E2E Tests
- [ ] Critical user flows covered
- [ ] Tests run in CI/CD
- [ ] Screenshots on failure
- [ ] Test reports generated

### Quality
- [ ] Code coverage > 70%
- [ ] No skipped tests
- [ ] Tests are maintainable
- [ ] Mock data properly isolated

### CI/CD
- [ ] Tests run on push
- [ ] Tests run on PR
- [ ] Coverage reports uploaded
- [ ] Build blocks on failure

---

**STATUS:** 🔵 AGUARDANDO IMPLEMENTAÇÃO  
**PRÓXIMO PATCH:** PATCH 249 – Performance & Observability
