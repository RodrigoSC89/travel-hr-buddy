/**
 * Finance validation schemas test suite
 * Verifies Zod schemas reject invalid inputs
 */
import { describe, it, expect } from "vitest";
import {
  invoiceFormSchema,
  expenseFormSchema,
  wageRecordSchema,
  recruitmentAgencySchema,
} from "@/lib/validation/finance-schemas";

describe("invoiceFormSchema", () => {
  it("accepts valid invoice", () => {
    const result = invoiceFormSchema.safeParse({
      type: "receivable",
      description: "Charter payment Q1",
      amount: "50000",
      dueDate: "2026-03-15",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty description", () => {
    const result = invoiceFormSchema.safeParse({
      type: "payable",
      description: "",
      amount: "100",
      dueDate: "2026-04-01",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative amount", () => {
    const result = invoiceFormSchema.safeParse({
      type: "payable",
      description: "Fuel",
      amount: "-100",
      dueDate: "2026-04-01",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid type", () => {
    const result = invoiceFormSchema.safeParse({
      type: "invalid",
      description: "Test",
      amount: "100",
      dueDate: "2026-04-01",
    });
    expect(result.success).toBe(false);
  });
});

describe("expenseFormSchema", () => {
  it("accepts valid expense", () => {
    const result = expenseFormSchema.safeParse({
      description: "Port charges Santos",
      category: "Port Charges",
      amount: "2500",
      date: "2026-02-20",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing category", () => {
    const result = expenseFormSchema.safeParse({
      description: "Test",
      category: "",
      amount: "100",
      date: "2026-02-20",
    });
    expect(result.success).toBe(false);
  });
});

describe("wageRecordSchema", () => {
  it("accepts valid wage record", () => {
    const result = wageRecordSchema.safeParse({
      crew_name: "João Silva",
      rank: "Chief Officer",
      base_salary: 5000,
      pay_date: "2026-02-28",
    });
    expect(result.success).toBe(true);
  });

  it("rejects allotment > 100%", () => {
    const result = wageRecordSchema.safeParse({
      crew_name: "Test",
      rank: "AB",
      base_salary: 3000,
      allotment_percent: 150,
      pay_date: "2026-02-28",
    });
    expect(result.success).toBe(false);
  });
});

describe("recruitmentAgencySchema", () => {
  it("accepts valid agency", () => {
    const result = recruitmentAgencySchema.safeParse({
      name: "Maritime Crew Solutions",
      country: "Philippines",
      license_number: "PHL-2024-001",
      license_expiry: "2027-12-31",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing license", () => {
    const result = recruitmentAgencySchema.safeParse({
      name: "Test Agency",
      country: "Brazil",
      license_number: "",
      license_expiry: "2027-01-01",
    });
    expect(result.success).toBe(false);
  });
});
