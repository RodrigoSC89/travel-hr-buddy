# 🧪 Casos de Teste - Nautilus One

## 1. Testes Unitários

### 1.1 Componentes UI

```typescript
// src/components/fleet/__tests__/VesselCard.test.tsx
import { render, screen } from '@testing-library/react';
import { VesselCard } from '../VesselCard';

describe('VesselCard', () => {
  const mockVessel = {
    id: '1',
    name: 'MV Atlantic',
    type: 'Cargo',
    status: 'active',
    location: { lat: -23.5, lng: -46.6 }
  };

  test('deve renderizar nome do navio', () => {
    render(<VesselCard vessel={mockVessel} />);
    expect(screen.getByText('MV Atlantic')).toBeInTheDocument();
  });

  test('deve mostrar badge de status correto', () => {
    render(<VesselCard vessel={mockVessel} />);
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveClass('bg-green-500');
  });

  test('deve chamar onClick ao clicar', () => {
    const handleClick = jest.fn();
    render(<VesselCard vessel={mockVessel} onClick={handleClick} />);
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalledWith('1');
  });
});
```

### 1.2 Hooks

```typescript
// src/hooks/__tests__/use-offline.test.ts
import { renderHook, act } from '@testing-library/react';
import { useOffline } from '../use-offline';

describe('useOffline', () => {
  test('deve detectar estado offline', async () => {
    const { result } = renderHook(() => useOffline());
    
    // Simular offline
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    
    expect(result.current.isOffline).toBe(true);
  });

  test('deve enfileirar operações quando offline', async () => {
    const { result } = renderHook(() => useOffline());
    
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    
    await act(async () => {
      await result.current.queueOperation({
        type: 'CREATE',
        table: 'maintenance_orders',
        data: { description: 'Test' }
      });
    });
    
    expect(result.current.pendingOperations).toHaveLength(1);
  });
});
```

### 1.3 Utilitários

```typescript
// src/lib/offline/__tests__/payload-compression.test.ts
import { PayloadCompression } from '../payload-compression';

describe('PayloadCompression', () => {
  const compressor = PayloadCompression.getInstance();
  
  test('deve comprimir e descomprimir dados corretamente', async () => {
    const original = { name: 'Test', data: 'A'.repeat(1000) };
    
    const compressed = await compressor.compress(original);
    const decompressed = await compressor.decompress(compressed);
    
    expect(decompressed).toEqual(original);
  });

  test('deve reduzir tamanho de payload repetitivo', async () => {
    const original = JSON.stringify({ data: 'A'.repeat(10000) });
    const compressed = await compressor.compress(JSON.parse(original));
    
    expect(compressed.length).toBeLessThan(original.length);
  });
});
```

---

## 2. Testes de Integração

### 2.1 Fluxo de Cadastro de OS

```typescript
// src/__tests__/integration/maintenance-order-flow.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MaintenanceOrderForm } from '@/components/maintenance/MaintenanceOrderForm';

describe('Fluxo de Ordem de Serviço', () => {
  const queryClient = new QueryClient();
  
  test('deve criar OS com sucesso', async () => {
    const user = userEvent.setup();
    
    render(
      <QueryClientProvider client={queryClient}>
        <MaintenanceOrderForm />
      </QueryClientProvider>
    );
    
    // Preencher formulário
    await user.type(screen.getByLabelText('Título'), 'Reparo motor principal');
    await user.selectOptions(screen.getByLabelText('Prioridade'), 'high');
    await user.type(screen.getByLabelText('Descrição'), 'Motor apresentando falhas');
    
    // Submeter
    await user.click(screen.getByRole('button', { name: 'Criar OS' }));
    
    // Verificar sucesso
    await waitFor(() => {
      expect(screen.getByText('OS criada com sucesso')).toBeInTheDocument();
    });
  });

  test('deve validar campos obrigatórios', async () => {
    const user = userEvent.setup();
    
    render(
      <QueryClientProvider client={queryClient}>
        <MaintenanceOrderForm />
      </QueryClientProvider>
    );
    
    // Tentar submeter sem preencher
    await user.click(screen.getByRole('button', { name: 'Criar OS' }));
    
    // Verificar erros
    expect(screen.getByText('Título é obrigatório')).toBeInTheDocument();
  });
});
```

### 2.2 Sincronização Offline

```typescript
// src/__tests__/integration/offline-sync.test.ts
import { IndexedDBSync } from '@/lib/offline/indexeddb-sync';
import { ChunkedSync } from '@/lib/offline/chunked-sync';

describe('Sincronização Offline', () => {
  let dbSync: IndexedDBSync;
  let chunkedSync: ChunkedSync;
  
  beforeEach(async () => {
    dbSync = IndexedDBSync.getInstance();
    chunkedSync = ChunkedSync.getInstance();
    await dbSync.clearQueue();
  });

  test('deve enfileirar operação quando offline', async () => {
    // Simular offline
    Object.defineProperty(navigator, 'onLine', { value: false });
    
    await dbSync.queueOperation({
      type: 'CREATE',
      table: 'maintenance_orders',
      data: { title: 'Test OS' },
      priority: 'high'
    });
    
    const pending = await dbSync.getPendingOperations();
    expect(pending).toHaveLength(1);
    expect(pending[0].data.title).toBe('Test OS');
  });

  test('deve sincronizar em chunks quando online', async () => {
    // Adicionar múltiplas operações
    for (let i = 0; i < 50; i++) {
      await dbSync.queueOperation({
        type: 'CREATE',
        table: 'test_data',
        data: { index: i },
        priority: 'normal'
      });
    }
    
    // Simular online
    Object.defineProperty(navigator, 'onLine', { value: true });
    
    const syncResult = await chunkedSync.syncAllPending();
    
    expect(syncResult.success).toBe(true);
    expect(syncResult.synced).toBe(50);
  });
});
```

---

## 3. Testes de Usabilidade

### 3.1 Navegação Principal

| Teste | Objetivo | Procedimento | Resultado Esperado |
|-------|----------|--------------|-------------------|
| NAV-001 | Acesso ao dashboard | Fazer login → Verificar tela inicial | Dashboard carrega em <3s |
| NAV-002 | Menu lateral | Clicar em cada item do menu | Navega corretamente sem erros |
| NAV-003 | Breadcrumb | Navegar 3 níveis profundo | Breadcrumb mostra caminho correto |
| NAV-004 | Voltar | Usar botão voltar do browser | Estado preservado corretamente |
| NAV-005 | Mobile menu | Abrir/fechar menu em mobile | Menu responsivo funciona |

### 3.2 Formulários

| Teste | Objetivo | Procedimento | Resultado Esperado |
|-------|----------|--------------|-------------------|
| FORM-001 | Validação em tempo real | Digitar email inválido | Erro aparece ao perder foco |
| FORM-002 | Salvamento automático | Preencher parcialmente | Dados preservados ao navegar |
| FORM-003 | Upload de arquivo | Fazer upload de PDF | Preview e barra de progresso |
| FORM-004 | Seleção de data | Usar date picker | Data formatada corretamente |
| FORM-005 | Campos condicionais | Selecionar opção com dependência | Campos aparecem/somem |

---

## 4. Testes Offline e Rede Lenta

### 4.1 Configuração de Teste

```bash
# Simular rede 2mbps no Linux
sudo tc qdisc add dev eth0 root tbf rate 2mbit burst 32kbit latency 400ms

# Simular no Chrome DevTools
# Network > Custom > Download: 250kb/s, Upload: 125kb/s, Latency: 300ms
```

### 4.2 Casos de Teste Offline

```typescript
// src/__tests__/e2e/offline-mode.spec.ts (Playwright)
import { test, expect } from '@playwright/test';

test.describe('Modo Offline', () => {
  test('OFF-001: deve mostrar indicador offline', async ({ page, context }) => {
    // Ir offline
    await context.setOffline(true);
    await page.goto('/dashboard');
    
    // Verificar indicador
    const offlineBadge = page.locator('[data-testid="offline-indicator"]');
    await expect(offlineBadge).toBeVisible();
    await expect(offlineBadge).toHaveText(/offline/i);
  });

  test('OFF-002: deve permitir criar OS offline', async ({ page, context }) => {
    await page.goto('/maintenance/new');
    await context.setOffline(true);
    
    // Preencher formulário
    await page.fill('[name="title"]', 'OS Criada Offline');
    await page.fill('[name="description"]', 'Descrição do reparo');
    await page.click('button[type="submit"]');
    
    // Verificar mensagem de pending
    await expect(page.locator('.toast')).toHaveText(/pendente de sincronização/i);
    
    // Verificar no IndexedDB
    const pending = await page.evaluate(async () => {
      const db = await indexedDB.open('nautilus_sync');
      // ... verificar fila
    });
    
    expect(pending.length).toBeGreaterThan(0);
  });

  test('OFF-003: deve sincronizar ao reconectar', async ({ page, context }) => {
    // Criar item offline
    await context.setOffline(true);
    await page.goto('/maintenance/new');
    await page.fill('[name="title"]', 'OS para Sync');
    await page.click('button[type="submit"]');
    
    // Reconectar
    await context.setOffline(false);
    
    // Aguardar sincronização
    await page.waitForSelector('[data-testid="sync-complete"]', { timeout: 30000 });
    
    // Verificar que item foi criado no servidor
    const response = await page.request.get('/api/maintenance-orders?title=OS para Sync');
    expect(response.ok()).toBeTruthy();
  });

  test('OFF-004: IA deve funcionar offline com fallback', async ({ page, context }) => {
    await context.setOffline(true);
    await page.goto('/ai-assistant');
    
    // Fazer pergunta
    await page.fill('[name="ai-input"]', 'Como criar uma ordem de serviço?');
    await page.click('button[type="submit"]');
    
    // Verificar resposta do fallback local
    const response = await page.waitForSelector('.ai-response');
    await expect(response).toHaveText(/ordem de serviço/i);
  });
});
```

### 4.3 Testes de Rede Lenta (2mbps)

```typescript
// src/__tests__/e2e/slow-network.spec.ts (Playwright)
import { test, expect } from '@playwright/test';

test.describe('Rede Lenta (2mbps)', () => {
  test.beforeEach(async ({ page }) => {
    // Simular 2mbps
    await page.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100)); // latência
      await route.continue();
    });
  });

  test('SLOW-001: dashboard deve carregar em <5s', async ({ page }) => {
    const start = Date.now();
    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="dashboard-ready"]');
    const loadTime = Date.now() - start;
    
    expect(loadTime).toBeLessThan(5000);
  });

  test('SLOW-002: imagens devem usar lazy loading', async ({ page }) => {
    await page.goto('/fleet');
    
    // Verificar que imagens fora da viewport não carregaram
    const lazyImages = await page.$$('img[loading="lazy"]');
    expect(lazyImages.length).toBeGreaterThan(0);
    
    // Verificar placeholder
    const placeholders = await page.$$('[data-testid="image-skeleton"]');
    expect(placeholders.length).toBeGreaterThan(0);
  });

  test('SLOW-003: formulário deve mostrar progresso de upload', async ({ page }) => {
    await page.goto('/documents/upload');
    
    // Upload de arquivo grande
    const fileChooser = await page.waitForEvent('filechooser');
    // ... simular arquivo de 5MB
    
    // Verificar barra de progresso
    const progress = page.locator('[role="progressbar"]');
    await expect(progress).toBeVisible();
    
    // Aguardar conclusão
    await expect(progress).toHaveAttribute('aria-valuenow', '100', { timeout: 60000 });
  });

  test('SLOW-004: sync deve usar chunks pequenos', async ({ page }) => {
    // Monitorar requests
    const requests: any[] = [];
    page.on('request', (req) => {
      if (req.url().includes('/sync')) {
        requests.push({
          url: req.url(),
          size: req.postDataBuffer()?.length || 0
        });
      }
    });
    
    // Triggear sync com muitos dados
    await page.evaluate(() => {
      // Criar 100 registros para sync
    });
    
    // Verificar tamanho dos chunks
    requests.forEach(req => {
      expect(req.size).toBeLessThan(8 * 1024); // <8KB por chunk em rede lenta
    });
  });
});
```

---

## 5. Exemplos de Código de Teste

### 5.1 Jest - Teste de Criptografia Local

```typescript
// src/lib/security/__tests__/local-crypto.test.ts
import { LocalCrypto } from '../local-crypto';

describe('LocalCrypto', () => {
  const crypto = LocalCrypto.getInstance();
  const password = 'SecurePassword123!';
  
  test('deve criptografar e descriptografar string', async () => {
    const original = 'Dados sensíveis do tripulante';
    
    const encrypted = await crypto.encrypt(original, password);
    expect(encrypted.data).not.toBe(original);
    expect(encrypted.salt).toBeDefined();
    expect(encrypted.iv).toBeDefined();
    
    const decrypted = await crypto.decrypt(encrypted, password);
    expect(decrypted).toBe(original);
  });
  
  test('deve falhar com senha incorreta', async () => {
    const encrypted = await crypto.encrypt('Dados', password);
    
    await expect(
      crypto.decrypt(encrypted, 'senha_errada')
    ).rejects.toThrow('Decryption failed');
  });
  
  test('deve gerar hashs consistentes', async () => {
    const data = 'Dados para hash';
    
    const hash1 = await crypto.hash(data);
    const hash2 = await crypto.hash(data);
    
    expect(hash1).toBe(hash2);
  });
});
```

### 5.2 Cypress - Teste E2E

```typescript
// cypress/e2e/maintenance-flow.cy.ts
describe('Fluxo de Manutenção', () => {
  beforeEach(() => {
    cy.login('tecnico@empresa.com', 'senha123');
  });

  it('deve criar ordem de serviço completa', () => {
    cy.visit('/maintenance');
    cy.get('[data-testid="new-os-button"]').click();
    
    // Preencher formulário
    cy.get('[name="title"]').type('Reparo bomba de óleo');
    cy.get('[name="vessel_id"]').select('MV Atlantic');
    cy.get('[name="priority"]').select('high');
    cy.get('[name="description"]').type('Bomba apresentando vazamento');
    
    // Upload de foto
    cy.get('[data-testid="upload-zone"]').attachFile('vazamento.jpg');
    cy.get('[data-testid="upload-complete"]').should('be.visible');
    
    // Submeter
    cy.get('button[type="submit"]').click();
    
    // Verificar criação
    cy.get('.toast-success').should('contain', 'OS criada com sucesso');
    cy.url().should('match', /\/maintenance\/OS-\d+/);
  });

  it('deve funcionar offline', () => {
    // Ir offline
    cy.window().then((win) => {
      cy.stub(win.navigator, 'onLine').value(false);
      win.dispatchEvent(new Event('offline'));
    });
    
    cy.visit('/maintenance/new');
    
    // Verificar indicador offline
    cy.get('[data-testid="offline-indicator"]').should('be.visible');
    
    // Criar OS
    cy.get('[name="title"]').type('OS Offline');
    cy.get('button[type="submit"]').click();
    
    // Verificar fila
    cy.get('[data-testid="pending-sync-count"]').should('contain', '1');
  });
});
```

### 5.3 Playwright - Teste de Performance

```typescript
// tests/performance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('deve ter LCP < 2.5s', async ({ page }) => {
    await page.goto('/dashboard');
    
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          resolve(entries[entries.length - 1].startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });
    
    expect(lcp).toBeLessThan(2500);
  });

  test('deve ter FID < 100ms', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Interagir com elemento
    const button = page.locator('[data-testid="main-action"]');
    const start = Date.now();
    await button.click();
    const fid = Date.now() - start;
    
    expect(fid).toBeLessThan(100);
  });

  test('deve ter CLS < 0.1', async ({ page }) => {
    await page.goto('/dashboard');
    
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          resolve(clsValue);
        }).observe({ entryTypes: ['layout-shift'] });
        
        setTimeout(() => resolve(clsValue), 5000);
      });
    });
    
    expect(cls).toBeLessThan(0.1);
  });
});
```

---

## 6. Roteiro de Testes Manuais

### 6.1 Checklist de Smoke Test
```
□ Login com credenciais válidas
□ Dashboard carrega sem erros
□ Menu de navegação funciona
□ Criar novo registro (qualquer módulo)
□ Editar registro existente
□ Excluir registro
□ Upload de arquivo
□ Gerar relatório
□ Logout
```

### 6.2 Checklist de Teste Offline
```
□ Ativar modo avião no dispositivo
□ Verificar indicador offline visível
□ Navegar entre páginas (cache)
□ Criar registro offline
□ Verificar contador de pendentes
□ Reconectar
□ Verificar sincronização automática
□ Confirmar dados no servidor
```

---

*Casos de teste gerados em: 2025-12-05*
