/**
 * Form Test Helpers - FASE 3
 * Funções auxiliares para interação com formulários
 */

import { Page, expect } from '@playwright/test';

/**
 * Preenche um campo de texto
 */
export async function fillField(page: Page, fieldName: string, value: string): Promise<void> {
  const selectors = [
    `input[name="${fieldName}"]`,
    `input[id="${fieldName}"]`,
    `input[placeholder*="${fieldName}"i]`,
    `textarea[name="${fieldName}"]`,
    `textarea[id="${fieldName}"]`
  ];
  
  for (const selector of selectors) {
    const field = page.locator(selector).first();
    if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
      await field.fill(value);
      return;
    }
  }
  
  throw new Error(`Campo "${fieldName}" não encontrado`);
}

/**
 * Seleciona uma opção em um select
 */
export async function selectOption(page: Page, fieldName: string, value: string): Promise<void> {
  const selectors = [
    `select[name="${fieldName}"]`,
    `select[id="${fieldName}"]`,
    `[data-testid="${fieldName}"]`
  ];
  
  for (const selector of selectors) {
    const field = page.locator(selector).first();
    if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
      await field.selectOption(value);
      return;
    }
  }
  
  throw new Error(`Select "${fieldName}" não encontrado`);
}

/**
 * Clica em um checkbox
 */
export async function checkCheckbox(page: Page, fieldName: string, checked: boolean = true): Promise<void> {
  const selectors = [
    `input[type="checkbox"][name="${fieldName}"]`,
    `input[type="checkbox"][id="${fieldName}"]`,
    `[data-testid="${fieldName}"]`
  ];
  
  for (const selector of selectors) {
    const checkbox = page.locator(selector).first();
    if (await checkbox.isVisible({ timeout: 1000 }).catch(() => false)) {
      const isChecked = await checkbox.isChecked();
      if (isChecked !== checked) {
        await checkbox.click();
      }
      return;
    }
  }
  
  throw new Error(`Checkbox "${fieldName}" não encontrado`);
}

/**
 * Submete um formulário
 */
export async function submitForm(page: Page, formSelector?: string): Promise<void> {
  if (formSelector) {
    await page.locator(`${formSelector} button[type="submit"]`).click();
  } else {
    await page.locator('button[type="submit"]').first().click();
  }
  await page.waitForLoadState('networkidle', { timeout: 10000 });
}

/**
 * Verifica mensagem de erro de validação
 */
export async function expectValidationError(page: Page, errorText: string | RegExp): Promise<void> {
  const errorSelectors = [
    '.error',
    '.error-message',
    '[role="alert"]',
    '.validation-error',
    '[class*="error"]'
  ];
  
  for (const selector of errorSelectors) {
    const error = page.locator(selector);
    if (await error.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(error).toContainText(errorText);
      return;
    }
  }
  
  // Fallback: procurar em todo o body
  await expect(page.locator('body')).toContainText(errorText);
}

/**
 * Verifica mensagem de sucesso
 */
export async function expectSuccessMessage(page: Page, successText: string | RegExp): Promise<void> {
  const successSelectors = [
    '.success',
    '.success-message',
    '[role="status"]',
    '.toast',
    '[class*="success"]',
    '[class*="toast"]'
  ];
  
  for (const selector of successSelectors) {
    const success = page.locator(selector);
    if (await success.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(success).toContainText(successText);
      return;
    }
  }
  
  // Fallback: procurar em todo o body
  await expect(page.locator('body')).toContainText(successText, { timeout: 5000 });
}

/**
 * Aguarda formulário estar pronto
 */
export async function waitForForm(page: Page, formSelector?: string): Promise<void> {
  const selector = formSelector || 'form';
  await page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
}

/**
 * Faz upload de arquivo
 */
export async function uploadFile(page: Page, inputSelector: string, filePath: string): Promise<void> {
  const fileInput = page.locator(inputSelector);
  await fileInput.setInputFiles(filePath);
}

/**
 * Limpa todos os campos de um formulário
 */
export async function clearForm(page: Page, formSelector?: string): Promise<void> {
  const selector = formSelector ? `${formSelector} input, ${formSelector} textarea` : 'input, textarea';
  const fields = page.locator(selector);
  const count = await fields.count();
  
  for (let i = 0; i < count; i++) {
    const field = fields.nth(i);
    if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
      await field.clear();
    }
  }
}
