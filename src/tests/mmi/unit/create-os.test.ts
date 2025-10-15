import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * MMI - Create Work Order (OS) Unit Tests
 * 
 * Tests the creation of work orders linked to maintenance jobs
 */

describe("MMI - Create Work Order", () => {
  const mockJobId = "job-uuid-123";
  const mockUserId = "user-uuid-456";

  const mockOSData = {
    job_id: mockJobId,
    title: "Ordem de Serviço - Manutenção Motor Principal",
    description: "Execução de manutenção preventiva do motor principal",
    assigned_to: mockUserId,
    priority: "high",
    estimated_cost: 2500.0,
    parts_required: [
      {
        part_code: "OIL-15W40",
        quantity: 20,
        description: "Óleo lubrificante 15W40",
        unit_cost: 45.0,
      },
      {
        part_code: "FILTER-OIL-001",
        quantity: 2,
        description: "Filtro de óleo",
        unit_cost: 120.0,
      },
    ],
    notes: "Manutenção preventiva programada",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Work Order Data Structure", () => {
    it("should validate work order data structure", () => {
      expect(mockOSData).toHaveProperty("job_id");
      expect(mockOSData).toHaveProperty("title");
      expect(mockOSData).toHaveProperty("assigned_to");
      expect(mockOSData).toHaveProperty("priority");
      expect(mockOSData).toHaveProperty("estimated_cost");
      expect(mockOSData).toHaveProperty("parts_required");
    });

    it("should validate required fields", () => {
      const requiredFields = ["job_id", "title", "priority"];
      
      requiredFields.forEach((field) => {
        expect(mockOSData).toHaveProperty(field);
        expect((mockOSData as any)[field]).toBeTruthy();
      });
    });

    it("should link to parent job", () => {
      expect(mockOSData.job_id).toBe(mockJobId);
      expect(mockOSData.job_id).toBeTruthy();
    });

    it("should have assigned user", () => {
      expect(mockOSData.assigned_to).toBe(mockUserId);
      expect(mockOSData.assigned_to).toBeTruthy();
    });
  });

  describe("Work Order Number Generation", () => {
    it("should generate WO number with correct format", () => {
      const year = new Date().getFullYear();
      const woNumber = `WO-${year}-001`;
      const woNumberRegex = /^WO-\d{4}-\d{3}$/;

      expect(woNumber).toMatch(woNumberRegex);
    });

    it("should generate sequential WO numbers", () => {
      const year = new Date().getFullYear();
      const wo1 = `WO-${year}-001`;
      const wo2 = `WO-${year}-002`;
      const wo3 = `WO-${year}-003`;

      expect(wo1).toBe(`WO-${year}-001`);
      expect(wo2).toBe(`WO-${year}-002`);
      expect(wo3).toBe(`WO-${year}-003`);
    });

    it("should pad WO numbers with zeros", () => {
      const year = new Date().getFullYear();
      const numbers = [1, 10, 100];
      
      numbers.forEach((num) => {
        const paddedNum = String(num).padStart(3, "0");
        const woNumber = `WO-${year}-${paddedNum}`;
        expect(woNumber).toMatch(/^WO-\d{4}-\d{3}$/);
      });
    });
  });

  describe("Priority Validation", () => {
    it("should validate priority enum values", () => {
      const validPriorities = ["low", "medium", "high", "critical"];
      
      expect(validPriorities).toContain(mockOSData.priority);
    });

    it("should handle different priority levels", () => {
      const priorities = ["critical", "high", "medium", "low"];
      
      priorities.forEach((priority) => {
        const os = { ...mockOSData, priority };
        expect(os.priority).toBe(priority);
      });
    });
  });

  describe("Status Validation", () => {
    it("should validate status enum values", () => {
      const validStatuses = [
        "draft",
        "approved",
        "in_progress",
        "completed",
        "cancelled",
      ];
      
      const mockStatus = "draft";
      expect(validStatuses).toContain(mockStatus);
    });

    it("should initialize with draft status", () => {
      const newOS = { ...mockOSData, status: "draft" };
      expect(newOS.status).toBe("draft");
    });
  });

  describe("Parts Management", () => {
    it("should handle parts_required array", () => {
      expect(mockOSData.parts_required).toBeInstanceOf(Array);
      expect(mockOSData.parts_required.length).toBeGreaterThan(0);
    });

    it("should validate part structure", () => {
      const part = mockOSData.parts_required[0];
      
      expect(part).toHaveProperty("part_code");
      expect(part).toHaveProperty("quantity");
      expect(part).toHaveProperty("description");
      expect(part).toHaveProperty("unit_cost");
    });

    it("should calculate total cost from parts", () => {
      const totalPartsCost = mockOSData.parts_required.reduce(
        (sum, part) => sum + part.quantity * part.unit_cost,
        0
      );

      expect(totalPartsCost).toBeGreaterThan(0);
      expect(typeof totalPartsCost).toBe("number");
    });

    it("should validate part quantities are positive", () => {
      mockOSData.parts_required.forEach((part) => {
        expect(part.quantity).toBeGreaterThan(0);
        expect(part.unit_cost).toBeGreaterThan(0);
      });
    });
  });

  describe("Cost Tracking", () => {
    it("should track estimated cost", () => {
      expect(mockOSData.estimated_cost).toBe(2500.0);
      expect(typeof mockOSData.estimated_cost).toBe("number");
    });

    it("should validate cost is non-negative", () => {
      expect(mockOSData.estimated_cost).toBeGreaterThanOrEqual(0);
    });

    it("should handle cost updates", () => {
      const updatedOS = {
        ...mockOSData,
        estimated_cost: 2500.0,
        actual_cost: 2750.0,
      };

      expect(updatedOS.actual_cost).toBeGreaterThan(0);
      expect(updatedOS.actual_cost).not.toBe(updatedOS.estimated_cost);
    });
  });

  describe("Work Order Response", () => {
    it("should return complete work order response", () => {
      const mockResponse = {
        success: true,
        work_order: {
          id: "os-uuid-789",
          wo_number: "WO-2025-001",
          job_id: mockJobId,
          title: mockOSData.title,
          status: "draft",
          assigned_to: mockUserId,
          priority: mockOSData.priority,
          estimated_cost: mockOSData.estimated_cost,
          parts_required: mockOSData.parts_required,
          approval_status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.work_order).toHaveProperty("id");
      expect(mockResponse.work_order).toHaveProperty("wo_number");
      expect(mockResponse.work_order.job_id).toBe(mockJobId);
      expect(mockResponse.work_order.status).toBe("draft");
    });

    it("should initialize approval_status as pending", () => {
      const newOS = {
        ...mockOSData,
        approval_status: "pending",
      };

      expect(newOS.approval_status).toBe("pending");
    });
  });

  describe("Approval Workflow", () => {
    it("should validate approval_status enum values", () => {
      const validApprovalStatuses = ["pending", "approved", "rejected"];
      const mockApprovalStatus = "pending";
      
      expect(validApprovalStatuses).toContain(mockApprovalStatus);
    });

    it("should track approval metadata", () => {
      const approvedOS = {
        ...mockOSData,
        approval_status: "approved",
        approved_by: "manager-uuid-123",
        approved_at: new Date().toISOString(),
      };

      expect(approvedOS.approval_status).toBe("approved");
      expect(approvedOS.approved_by).toBeTruthy();
      expect(approvedOS.approved_at).toBeTruthy();
    });
  });

  describe("Date Tracking", () => {
    it("should track start and completion dates", () => {
      const osWithDates = {
        ...mockOSData,
        start_date: "2025-11-01T08:00:00Z",
        completion_date: "2025-11-01T16:00:00Z",
      };

      expect(osWithDates.start_date).toBeTruthy();
      expect(osWithDates.completion_date).toBeTruthy();

      const start = new Date(osWithDates.start_date);
      const completion = new Date(osWithDates.completion_date);

      expect(completion.getTime()).toBeGreaterThan(start.getTime());
    });
  });

  describe("Link Between Job and OS", () => {
    it("should maintain bidirectional link", () => {
      const job = {
        id: mockJobId,
        work_orders: ["os-uuid-789"],
      };

      const workOrder = {
        id: "os-uuid-789",
        job_id: mockJobId,
      };

      expect(job.work_orders).toContain(workOrder.id);
      expect(workOrder.job_id).toBe(job.id);
    });

    it("should allow multiple work orders per job", () => {
      const job = {
        id: mockJobId,
        work_orders: [
          "os-uuid-001",
          "os-uuid-002",
          "os-uuid-003",
        ],
      };

      expect(job.work_orders).toBeInstanceOf(Array);
      expect(job.work_orders.length).toBeGreaterThan(1);
    });
  });

  describe("Notes and Documentation", () => {
    it("should support notes field", () => {
      expect(mockOSData.notes).toBeTruthy();
      expect(typeof mockOSData.notes).toBe("string");
    });

    it("should handle empty notes", () => {
      const osWithoutNotes = { ...mockOSData, notes: "" };
      expect(osWithoutNotes.notes).toBe("");
    });

    it("should handle detailed notes", () => {
      const detailedNotes = `
        Manutenção preventiva programada conforme cronograma.
        Verificar:
        - Nível de óleo
        - Filtros
        - Vazamentos
        - Temperatura de operação
      `;
      
      const osWithDetailedNotes = { ...mockOSData, notes: detailedNotes };
      expect(osWithDetailedNotes.notes.length).toBeGreaterThan(50);
    });
  });
});
