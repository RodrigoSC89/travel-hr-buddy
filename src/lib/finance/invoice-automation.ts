/**
 * 📄 INVOICE AUTOMATION ENGINE
 * OCR + AI powered invoice processing and validation
 */

import { supabase } from '@/integrations/supabase/client';
import type { Invoice, ExtractedInvoiceData, InvoiceValidation, OCRData } from './types';

interface ProcessedInvoice {
  invoice: Partial<Invoice>;
  extracted_data: ExtractedInvoiceData;
  validation: InvoiceValidation;
  decision: {
    action: 'auto_approve' | 'reject' | 'escalate';
    confidence: number;
    reason: string;
    suggested_payment_date?: string;
  };
}

interface ExpenseResult {
  expense_id: string;
  classification: {
    category: string;
    subcategory: string;
    confidence: number;
  };
  policy_compliant: boolean;
  auto_approved: boolean;
}

export class InvoiceAutomationEngine {
  private static instance: InvoiceAutomationEngine;

  static getInstance(): InvoiceAutomationEngine {
    if (!this.instance) {
      this.instance = new InvoiceAutomationEngine();
    }
    return this.instance;
  }

  /**
   * Process an invoice file through OCR and AI validation
   */
  async processInvoice(file: File): Promise<ProcessedInvoice> {
    // 1. OCR extraction
    const ocrData = await this.extractInvoiceData(file);

    // 2. AI validation
    const validation = await this.validateInvoice(ocrData);

    // 3. Check for duplicates
    const duplicateCheck = await this.checkDuplicates(ocrData);

    // 4. Verify math
    const mathValidation = this.validateMath(ocrData);

    // 5. Match to PO if applicable
    const poMatch = await this.matchToPO(ocrData);

    // 6. Make decision
    const decision = this.makeDecision({
      ocrData,
      validation,
      duplicateCheck,
      mathValidation,
      poMatch
    });

    // 7. Create invoice record
    const invoice = await this.createInvoiceRecord(ocrData, validation, decision);

    return {
      invoice,
      extracted_data: ocrData,
      validation: {
        is_valid: validation.is_valid && mathValidation && !duplicateCheck.isDuplicate,
        issues: validation.issues,
        po_match: poMatch.matched,
        duplicate_check: !duplicateCheck.isDuplicate,
        math_correct: mathValidation
      },
      decision
    };
  }

  /**
   * Extract data from invoice using OCR simulation
   * In production, this would use Tesseract.js or cloud OCR
   */
  private async extractInvoiceData(file: File): Promise<ExtractedInvoiceData> {
    // Simulate OCR extraction
    // In production: Use Tesseract.js or cloud OCR service
    
    // For demo, generate realistic mock data
    const now = new Date();
    const dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const lineItems = [
      {
        description: 'Marine Engine Parts - Set A',
        quantity: 5,
        unit_price: 1200,
        total: 6000
      },
      {
        description: 'Hydraulic Fluid - 20L',
        quantity: 10,
        unit_price: 85,
        total: 850
      },
      {
        description: 'Safety Equipment Bundle',
        quantity: 2,
        unit_price: 450,
        total: 900
      }
    ];

    const subtotal = lineItems.reduce((acc, item) => acc + item.total, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    return {
      vendor_name: 'Marine Supplies International',
      invoice_number: `INV-${now.getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      invoice_date: now.toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0],
      line_items: lineItems,
      subtotal,
      tax,
      total,
      currency: 'USD'
    };
  }

  /**
   * Validate extracted invoice data
   */
  private async validateInvoice(data: ExtractedInvoiceData): Promise<{
    is_valid: boolean;
    issues: Array<{ field: string; issue: string; severity: 'warning' | 'error' }>;
  }> {
    const issues: Array<{ field: string; issue: string; severity: 'warning' | 'error' }> = [];

    // Check required fields
    if (!data.vendor_name) {
      issues.push({ field: 'vendor_name', issue: 'Vendor name is missing', severity: 'error' });
    }

    if (!data.invoice_number) {
      issues.push({ field: 'invoice_number', issue: 'Invoice number is missing', severity: 'error' });
    }

    // Validate dates
    const invoiceDate = new Date(data.invoice_date);
    const dueDate = new Date(data.due_date);
    const now = new Date();

    if (invoiceDate > now) {
      issues.push({ field: 'invoice_date', issue: 'Invoice date is in the future', severity: 'warning' });
    }

    if (dueDate < invoiceDate) {
      issues.push({ field: 'due_date', issue: 'Due date is before invoice date', severity: 'error' });
    }

    // Validate amounts
    if (data.total <= 0) {
      issues.push({ field: 'total', issue: 'Invoice total must be positive', severity: 'error' });
    }

    if (data.line_items.length === 0) {
      issues.push({ field: 'line_items', issue: 'No line items found', severity: 'warning' });
    }

    // Check for unusually high amounts
    if (data.total > 100000) {
      issues.push({ field: 'total', issue: 'Amount exceeds $100,000 - requires additional review', severity: 'warning' });
    }

    return {
      is_valid: !issues.some(i => i.severity === 'error'),
      issues
    };
  }

  /**
   * Check for duplicate invoices
   */
  private async checkDuplicates(data: ExtractedInvoiceData): Promise<{
    isDuplicate: boolean;
    existingInvoiceId?: string;
  }> {
    const { data: existing } = await supabase
      .from('invoices')
      .select('id, invoice_number')
      .eq('invoice_number', data.invoice_number)
      .limit(1);

    if (existing && existing.length > 0) {
      return {
        isDuplicate: true,
        existingInvoiceId: existing[0].id
      };
    }

    return { isDuplicate: false };
  }

  /**
   * Validate invoice math
   */
  private validateMath(data: ExtractedInvoiceData): boolean {
    // Calculate expected subtotal
    const calculatedSubtotal = data.line_items.reduce((acc, item) => {
      const itemTotal = item.quantity * item.unit_price;
      if (Math.abs(itemTotal - item.total) > 0.01) {
        return NaN;
      }
      return acc + item.total;
    }, 0);

    if (isNaN(calculatedSubtotal)) return false;

    // Allow small rounding differences
    const subtotalMatch = Math.abs(calculatedSubtotal - data.subtotal) < 1;
    const totalMatch = Math.abs((data.subtotal + data.tax) - data.total) < 1;

    return subtotalMatch && totalMatch;
  }

  /**
   * Match invoice to purchase order
   */
  private async matchToPO(data: ExtractedInvoiceData): Promise<{
    matched: boolean;
    po_id?: string;
    po_number?: string;
    variance?: number;
  }> {
    // Simulate PO matching - in production would query purchase_orders table
    // For demo, randomly match ~60% of invoices
    const shouldMatch = Math.random() > 0.4;
    
    if (shouldMatch) {
      return {
        matched: true,
        po_id: crypto.randomUUID(),
        po_number: `PO-${Date.now().toString().slice(-6)}`,
        variance: (Math.random() - 0.5) * 10 // -5% to +5%
      };
    }

    return { matched: false };
  }

  /**
   * Make decision on invoice
   */
  private makeDecision(context: {
    ocrData: ExtractedInvoiceData;
    validation: { is_valid: boolean; issues: any[] };
    duplicateCheck: { isDuplicate: boolean };
    mathValidation: boolean;
    poMatch: { matched: boolean; variance?: number };
  }): {
    action: 'auto_approve' | 'reject' | 'escalate';
    confidence: number;
    reason: string;
    suggested_payment_date?: string;
  } {
    // Reject if duplicate
    if (context.duplicateCheck.isDuplicate) {
      return {
        action: 'reject',
        confidence: 0.99,
        reason: 'Duplicate invoice detected'
      };
    }

    // Reject if math is wrong
    if (!context.mathValidation) {
      return {
        action: 'reject',
        confidence: 0.95,
        reason: 'Invoice math does not add up correctly'
      };
    }

    // Reject if validation failed
    if (!context.validation.is_valid) {
      const errorIssues = context.validation.issues.filter(i => i.severity === 'error');
      return {
        action: 'reject',
        confidence: 0.9,
        reason: `Validation errors: ${errorIssues.map(i => i.issue).join(', ')}`
      };
    }

    // Auto-approve if all checks pass and amount is reasonable
    if (
      context.ocrData.total < 10000 &&
      context.poMatch.matched &&
      Math.abs(context.poMatch.variance || 0) < 5
    ) {
      const suggestedDate = new Date(context.ocrData.due_date);
      suggestedDate.setDate(suggestedDate.getDate() - 5); // Pay 5 days early for discounts

      return {
        action: 'auto_approve',
        confidence: 0.92,
        reason: 'All validations passed, PO matched, amount within threshold',
        suggested_payment_date: suggestedDate.toISOString().split('T')[0]
      };
    }

    // Escalate for human review
    const warnings = context.validation.issues.filter(i => i.severity === 'warning');
    return {
      action: 'escalate',
      confidence: 0.7,
      reason: `Requires review: ${warnings.map(w => w.issue).join(', ') || 'High value or no PO match'}`
    };
  }

  /**
   * Create invoice record in database
   */
  private async createInvoiceRecord(
    data: ExtractedInvoiceData,
    validation: { is_valid: boolean; issues: any[] },
    decision: { action: string; confidence: number; reason: string }
  ): Promise<Partial<Invoice>> {
    const invoice: Partial<Invoice> = {
      invoice_number: data.invoice_number,
      invoice_date: data.invoice_date,
      due_date: data.due_date,
      amount: data.total,
      currency: data.currency,
      status: decision.action === 'auto_approve' ? 'approved' : 
              decision.action === 'reject' ? 'rejected' : 'processing',
      ai_extracted_data: data as any,
      ai_validation: { is_valid: validation.is_valid, issues: validation.issues } as any,
      ai_decision: decision.action as any
    };

    return invoice;
  }

  /**
   * Process expense receipt
   */
  async processExpenseReceipt(file: File, userId: string): Promise<ExpenseResult> {
    // 1. OCR the receipt
    const ocrData = await this.ocrReceipt(file);

    // 2. Classify the expense
    const classification = this.classifyExpense(ocrData);

    // 3. Check policy compliance
    const policyCompliant = await this.checkPolicyCompliance(ocrData, userId);

    // 4. Determine auto-approval
    const autoApproved = policyCompliant && ocrData.amount < 500;

    // 5. Create expense record
    const expenseId = crypto.randomUUID();

    return {
      expense_id: expenseId,
      classification,
      policy_compliant: policyCompliant,
      auto_approved: autoApproved
    };
  }

  /**
   * OCR a receipt
   */
  private async ocrReceipt(file: File): Promise<{
    vendor: string;
    amount: number;
    date: string;
    items: string[];
  }> {
    // Simulate OCR - in production use Tesseract.js
    return {
      vendor: 'Maritime Supplies Co',
      amount: Math.round(Math.random() * 500 + 50),
      date: new Date().toISOString().split('T')[0],
      items: ['Office Supplies', 'Safety Equipment']
    };
  }

  /**
   * Classify expense category
   */
  private classifyExpense(data: { vendor: string; items: string[] }): {
    category: string;
    subcategory: string;
    confidence: number;
  } {
    // Simple keyword-based classification
    const vendorLower = data.vendor.toLowerCase();
    const itemsJoined = data.items.join(' ').toLowerCase();

    if (vendorLower.includes('fuel') || itemsJoined.includes('fuel')) {
      return { category: 'fuel', subcategory: 'bunker', confidence: 0.9 };
    }

    if (vendorLower.includes('supply') || itemsJoined.includes('supply')) {
      return { category: 'supplies', subcategory: 'general', confidence: 0.85 };
    }

    if (itemsJoined.includes('safety')) {
      return { category: 'safety', subcategory: 'equipment', confidence: 0.88 };
    }

    return { category: 'other', subcategory: 'miscellaneous', confidence: 0.6 };
  }

  /**
   * Check expense policy compliance
   */
  private async checkPolicyCompliance(
    data: { amount: number },
    userId: string
  ): Promise<boolean> {
    // Check against expense policies
    // In production, would check user's expense limits, category limits, etc.
    
    // Simple check: amount under $1000 is compliant
    return data.amount < 1000;
  }
}

export const invoiceAutomation = InvoiceAutomationEngine.getInstance();
