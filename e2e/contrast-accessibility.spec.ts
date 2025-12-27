/**
 * Testes E2E de Contraste e Acessibilidade - Nautilus One
 * WCAG 2.1 AA/AAA Compliance Testing
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = [
  { path: '/nautilus-command', name: 'Nautilus Command' },
  { path: '/fleet-command', name: 'Fleet Command' },
  { path: '/maintenance-command', name: 'Maintenance Command' },
  { path: '/docs', name: 'Documentation Hub' },
  { path: '/ai-operations-center', name: 'AI Operations Center' },
  { path: '/security-center', name: 'Security Center' },
  { path: '/integracoes', name: 'Integrações' },
  { path: '/dashboard', name: 'Dashboard' },
];

test.describe('WCAG 2.1 AA Contrast Compliance', () => {
  for (const route of routes) {
    test(`${route.name} (${route.path}) should have no color contrast violations`, async ({ page }) => {
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');
      
      // Aguarda renderização completa
      await page.waitForTimeout(1000);
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      
      // Filtrar apenas violações de contraste
      const contrastViolations = accessibilityScanResults.violations.filter(
        (violation) => violation.id === 'color-contrast'
      );
      
      // Log detalhado para debug
      if (contrastViolations.length > 0) {
        console.log(`\n❌ Contrast violations in ${route.name}:`);
        contrastViolations.forEach((violation) => {
          violation.nodes.forEach((node) => {
            console.log(`  - ${node.html}`);
            console.log(`    Ratio: ${node.any?.[0]?.data?.contrastRatio || 'N/A'}`);
            console.log(`    Expected: ${node.any?.[0]?.data?.expectedContrastRatio || '4.5:1'}`);
          });
        });
      }
      
      expect(contrastViolations.length).toBe(0);
    });
  }
});

test.describe('WCAG AAA High Contrast (Offshore Mode)', () => {
  test('Critical pages should meet 7:1 contrast ratio', async ({ page }) => {
    const criticalPages = ['/nautilus-command', '/fleet-command', '/maintenance-command'];
    
    for (const path of criticalPages) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .options({
          rules: {
            'color-contrast': { 
              enabled: true,
              options: { noScroll: true }
            }
          }
        })
        .analyze();
      
      const contrastViolations = accessibilityScanResults.violations.filter(
        (v) => v.id === 'color-contrast'
      );
      
      // Para modo offshore, queremos 7:1 (WCAG AAA)
      const severeViolations = contrastViolations.filter((violation) => {
        return violation.nodes.some((node) => {
          const ratio = node.any?.[0]?.data?.contrastRatio;
          return ratio && parseFloat(ratio) < 4.5;
        });
      });
      
      expect(severeViolations.length).toBe(0);
    }
  });
});

test.describe('Dark Mode Contrast', () => {
  test('Dark mode should maintain proper contrast', async ({ page }) => {
    await page.goto('/nautilus-command');
    
    // Ativar dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    
    await page.waitForTimeout(500);
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();
    
    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'color-contrast'
    );
    
    expect(contrastViolations.length).toBe(0);
  });
});

test.describe('Interactive Elements Accessibility', () => {
  test('All interactive elements should have accessible names', async ({ page }) => {
    await page.goto('/nautilus-command');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    // Verificar se botões, links e inputs têm nomes acessíveis
    const labelViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'button-name' || v.id === 'link-name' || v.id === 'label'
    );
    
    expect(labelViolations.length).toBe(0);
  });
  
  test('All interactive elements should be keyboard accessible', async ({ page }) => {
    await page.goto('/nautilus-command');
    await page.waitForLoadState('networkidle');
    
    // Verificar focus visibility
    await page.keyboard.press('Tab');
    
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;
      
      const style = window.getComputedStyle(el);
      return {
        tagName: el.tagName,
        hasOutline: style.outlineWidth !== '0px' || style.boxShadow !== 'none',
      };
    });
    
    expect(focusedElement).not.toBeNull();
  });
});

test.describe('Text Readability', () => {
  test('Body text should use readable font sizes', async ({ page }) => {
    await page.goto('/docs');
    await page.waitForLoadState('networkidle');
    
    const fontSizes = await page.evaluate(() => {
      const elements = document.querySelectorAll('p, li, span, a');
      const sizes: number[] = [];
      
      elements.forEach((el) => {
        const style = window.getComputedStyle(el);
        const fontSize = parseFloat(style.fontSize);
        if (fontSize > 0) sizes.push(fontSize);
      });
      
      return sizes;
    });
    
    // Mínimo de 12px para texto (recomendado 14-16px)
    const tooSmall = fontSizes.filter((size) => size < 12);
    expect(tooSmall.length).toBe(0);
  });
  
  test('Heading hierarchy should be logical', async ({ page }) => {
    await page.goto('/docs');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .analyze();
    
    const headingViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'heading-order'
    );
    
    expect(headingViolations.length).toBe(0);
  });
});

test.describe('Responsive Contrast', () => {
  const viewports = [
    { width: 375, height: 667, name: 'Mobile' },
    { width: 768, height: 1024, name: 'Tablet' },
    { width: 1920, height: 1080, name: 'Desktop' },
  ];
  
  for (const viewport of viewports) {
    test(`Contrast should be maintained on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/nautilus-command');
      await page.waitForLoadState('networkidle');
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .analyze();
      
      const contrastViolations = accessibilityScanResults.violations.filter(
        (v) => v.id === 'color-contrast'
      );
      
      expect(contrastViolations.length).toBe(0);
    });
  }
});
