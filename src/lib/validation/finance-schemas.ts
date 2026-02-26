/**
 * Zod schemas for Finance module forms
 * Hardening: validates all user inputs before Supabase operations
 */
import { z } from "zod/v4";

export const invoiceFormSchema = z.object({
  type: z.enum(["receivable", "payable"], { message: "Tipo inválido" }),
  description: z.string().trim().min(1, "Descrição obrigatória").max(500, "Máximo 500 caracteres"),
  vendor: z.string().max(200, "Máximo 200 caracteres").optional().default(""),
  vesselName: z.string().max(200).optional().default(""),
  amount: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Valor deve ser positivo"),
  currency: z.string().min(3).max(3).default("USD"),
  issueDate: z.string().optional().default(""),
  dueDate: z.string().min(1, "Data de vencimento obrigatória"),
  category: z.string().max(100).optional().default(""),
  notes: z.string().max(2000).optional().default(""),
});

export const expenseFormSchema = z.object({
  description: z.string().trim().min(1, "Descrição obrigatória").max(500, "Máximo 500 caracteres"),
  category: z.string().min(1, "Categoria obrigatória").max(100),
  vesselName: z.string().max(200).optional().default(""),
  amount: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Valor deve ser positivo"),
  currency: z.string().min(3).max(3).default("USD"),
  date: z.string().min(1, "Data obrigatória"),
  paymentMethod: z.string().max(100).optional().default(""),
  notes: z.string().max(2000).optional().default(""),
});

export const wageRecordSchema = z.object({
  crew_name: z.string().trim().min(1, "Nome obrigatório").max(200),
  rank: z.string().trim().min(1, "Função obrigatória").max(100),
  base_salary: z.number().min(0, "Salário deve ser positivo"),
  overtime_hours: z.number().min(0).default(0),
  overtime_rate: z.number().min(0).default(0),
  deductions: z.number().min(0).default(0),
  allotment_percent: z.number().min(0).max(100).default(0),
  allotment_recipient: z.string().max(200).optional().default(""),
  pay_date: z.string().min(1, "Data de pagamento obrigatória"),
});

export const recruitmentAgencySchema = z.object({
  name: z.string().trim().min(1, "Nome obrigatório").max(300),
  country: z.string().trim().min(1, "País obrigatório").max(100),
  license_number: z.string().trim().min(1, "Nº licença obrigatório").max(100),
  license_expiry: z.string().min(1, "Data de expiração obrigatória"),
});

export type InvoiceFormData = z.infer<typeof invoiceFormSchema>;
export type ExpenseFormData = z.infer<typeof expenseFormSchema>;
export type WageRecordData = z.infer<typeof wageRecordSchema>;
export type RecruitmentAgencyData = z.infer<typeof recruitmentAgencySchema>;
