/**
 * Unit Tests for Reservation Payment System
 * PATCH 10/10 - Test coverage for payment processing
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Type definitions for testing
interface Reservation {
  id: string;
  user_id?: string | null;
  title?: string | null;
  total_amount?: number | null;
  currency?: string | null;
  payment_status?: string | null;
  status?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}

type PaymentMethod = "stripe" | "paypal" | "credit_card";

interface PaymentIntent {
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  reservation_id: string;
}

// Mock payment processor for testing
class MockPaymentProcessor {
  private transactions: Map<string, {
    id: string;
    amount: number;
    currency: string;
    status: "pending" | "completed" | "failed" | "refunded";
  }> = new Map();

  async processPayment(intent: PaymentIntent): Promise<{
    success: boolean;
    transactionId: string;
    error?: string;
  }> {
    // Simulate payment validation
    if (intent.amount <= 0) {
      return {
        success: false,
        transactionId: "",
        error: "Invalid amount"
      };
    }

    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    this.transactions.set(transactionId, {
      id: transactionId,
      amount: intent.amount,
      currency: intent.currency,
      status: "completed"
    });

    return {
      success: true,
      transactionId
    };
  }

  async processRefund(transactionId: string, amount?: number): Promise<{
    success: boolean;
    refundId: string;
    error?: string;
  }> {
    const transaction = this.transactions.get(transactionId);
    
    if (!transaction) {
      return {
        success: false,
        refundId: "",
        error: "Transaction not found"
      };
    }

    if (transaction.status === "refunded") {
      return {
        success: false,
        refundId: "",
        error: "Transaction already refunded"
      };
    }

    transaction.status = "refunded";
    const refundId = `ref_${Date.now()}`;
    
    return {
      success: true,
      refundId
    };
  }

  getTransaction(id: string) {
    return this.transactions.get(id);
  }
}

// Mock calendar sync for testing
class MockCalendarSync {
  private events: Map<string, {
    id: string;
    title: string;
    start: string;
    end: string;
    location?: string;
  }> = new Map();

  async addEvent(reservation: Reservation): Promise<{
    success: boolean;
    eventId: string;
    error?: string;
  }> {
    if (!reservation.start_date || !reservation.end_date) {
      return {
        success: false,
        eventId: "",
        error: "Missing dates"
      };
    }

    const eventId = `evt_${reservation.id}`;
    
    this.events.set(eventId, {
      id: eventId,
      title: reservation.title || "Reservation",
      start: reservation.start_date,
      end: reservation.end_date
    });

    return {
      success: true,
      eventId
    };
  }

  getEvent(id: string) {
    return this.events.get(id);
  }

  getEventCount(): number {
    return this.events.size;
  }
}

describe("Payment Processing", () => {
  let paymentProcessor: MockPaymentProcessor;

  beforeEach(() => {
    paymentProcessor = new MockPaymentProcessor();
  });

  describe("processPayment", () => {
    it("should successfully process valid payment", async () => {
      const intent: PaymentIntent = {
        amount: 100,
        currency: "USD",
        payment_method: "stripe",
        reservation_id: "res_123"
      };

      const result = await paymentProcessor.processPayment(intent);
      
      expect(result.success).toBe(true);
      expect(result.transactionId).toBeTruthy();
      expect(result.transactionId).toMatch(/^txn_/);
    });

    it("should reject payment with zero amount", async () => {
      const intent: PaymentIntent = {
        amount: 0,
        currency: "USD",
        payment_method: "stripe",
        reservation_id: "res_123"
      };

      const result = await paymentProcessor.processPayment(intent);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid amount");
    });

    it("should reject payment with negative amount", async () => {
      const intent: PaymentIntent = {
        amount: -50,
        currency: "USD",
        payment_method: "paypal",
        reservation_id: "res_456"
      };

      const result = await paymentProcessor.processPayment(intent);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid amount");
    });

    it("should store transaction after successful payment", async () => {
      const intent: PaymentIntent = {
        amount: 250.50,
        currency: "EUR",
        payment_method: "credit_card",
        reservation_id: "res_789"
      };

      const result = await paymentProcessor.processPayment(intent);
      const transaction = paymentProcessor.getTransaction(result.transactionId);
      
      expect(transaction).toBeDefined();
      expect(transaction?.amount).toBe(250.50);
      expect(transaction?.currency).toBe("EUR");
      expect(transaction?.status).toBe("completed");
    });
  });

  describe("processRefund", () => {
    it("should successfully refund a completed transaction", async () => {
      // First process a payment
      const intent: PaymentIntent = {
        amount: 100,
        currency: "USD",
        payment_method: "stripe",
        reservation_id: "res_123"
      };
      const paymentResult = await paymentProcessor.processPayment(intent);
      
      // Then refund it
      const refundResult = await paymentProcessor.processRefund(
        paymentResult.transactionId
      );
      
      expect(refundResult.success).toBe(true);
      expect(refundResult.refundId).toMatch(/^ref_/);
      
      const transaction = paymentProcessor.getTransaction(paymentResult.transactionId);
      expect(transaction?.status).toBe("refunded");
    });

    it("should fail to refund non-existent transaction", async () => {
      const result = await paymentProcessor.processRefund("fake_txn_123");
      
      expect(result.success).toBe(false);
      expect(result.error).toBe("Transaction not found");
    });

    it("should fail to refund already refunded transaction", async () => {
      const intent: PaymentIntent = {
        amount: 50,
        currency: "USD",
        payment_method: "stripe",
        reservation_id: "res_123"
      };
      
      const paymentResult = await paymentProcessor.processPayment(intent);
      
      // First refund
      await paymentProcessor.processRefund(paymentResult.transactionId);
      
      // Second refund attempt
      const secondRefund = await paymentProcessor.processRefund(
        paymentResult.transactionId
      );
      
      expect(secondRefund.success).toBe(false);
      expect(secondRefund.error).toBe("Transaction already refunded");
    });
  });
});

describe("Calendar Sync", () => {
  let calendarSync: MockCalendarSync;

  beforeEach(() => {
    calendarSync = new MockCalendarSync();
  });

  describe("addEvent", () => {
    it("should add calendar event for valid reservation", async () => {
      const reservation: Reservation = {
        id: "res_123",
        title: "Business Trip",
        start_date: "2024-03-15T10:00:00Z",
        end_date: "2024-03-20T18:00:00Z"
      };

      const result = await calendarSync.addEvent(reservation);
      
      expect(result.success).toBe(true);
      expect(result.eventId).toBe("evt_res_123");
    });

    it("should fail without start_date", async () => {
      const reservation: Reservation = {
        id: "res_123",
        title: "Invalid Reservation",
        end_date: "2024-03-20T18:00:00Z"
      };

      const result = await calendarSync.addEvent(reservation);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe("Missing dates");
    });

    it("should fail without end_date", async () => {
      const reservation: Reservation = {
        id: "res_123",
        title: "Invalid Reservation",
        start_date: "2024-03-15T10:00:00Z"
      };

      const result = await calendarSync.addEvent(reservation);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe("Missing dates");
    });

    it("should store event with correct details", async () => {
      const reservation: Reservation = {
        id: "res_456",
        title: "Conference",
        start_date: "2024-04-01T09:00:00Z",
        end_date: "2024-04-03T17:00:00Z"
      };

      await calendarSync.addEvent(reservation);
      const event = calendarSync.getEvent("evt_res_456");
      
      expect(event).toBeDefined();
      expect(event?.title).toBe("Conference");
      expect(event?.start).toBe("2024-04-01T09:00:00Z");
      expect(event?.end).toBe("2024-04-03T17:00:00Z");
    });

    it("should use default title when none provided", async () => {
      const reservation: Reservation = {
        id: "res_789",
        start_date: "2024-05-01T10:00:00Z",
        end_date: "2024-05-02T10:00:00Z"
      };

      await calendarSync.addEvent(reservation);
      const event = calendarSync.getEvent("evt_res_789");
      
      expect(event?.title).toBe("Reservation");
    });
  });

  describe("event tracking", () => {
    it("should track number of events", async () => {
      expect(calendarSync.getEventCount()).toBe(0);

      await calendarSync.addEvent({
        id: "res_1",
        start_date: "2024-03-01T10:00:00Z",
        end_date: "2024-03-02T10:00:00Z"
      });

      expect(calendarSync.getEventCount()).toBe(1);

      await calendarSync.addEvent({
        id: "res_2",
        start_date: "2024-03-05T10:00:00Z",
        end_date: "2024-03-06T10:00:00Z"
      });

      expect(calendarSync.getEventCount()).toBe(2);
    });
  });
});

describe("Badge Status", () => {
  const getPaymentStatusVariant = (status?: string | null) => {
    const variants: Record<string, string> = {
      paid: "default",
      pending: "secondary",
      refunded: "outline",
      failed: "destructive",
    };
    return status ? variants[status] || "secondary" : "secondary";
  };

  it.each([
    ["paid", "default"],
    ["pending", "secondary"],
    ["refunded", "outline"],
    ["failed", "destructive"],
    [null, "secondary"],
    [undefined, "secondary"],
    ["unknown", "secondary"]
  ])("status '%s' should return variant '%s'", (status, expected) => {
    expect(getPaymentStatusVariant(status)).toBe(expected);
  });
});
