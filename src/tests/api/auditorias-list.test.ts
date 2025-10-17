import { describe, it, expect, vi, beforeEach } from "vitest";
import handler from "../../../pages/api/auditorias/list";
import type { NextApiRequest, NextApiResponse } from "next";

// Mock Supabase
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: mockAuditorias,
        error: null,
      }),
    })),
  })),
}));

const mockAuditorias = [
  {
    id: "1",
    navio: "PSV Atlântico",
    data: "2024-10-15",
    norma: "IMCA M 179",
    item_auditado: "Sistema de Propulsão",
    resultado: "Conforme",
    comentarios: "Sistema operando dentro dos parâmetros",
    created_at: "2024-10-15T10:00:00Z",
    updated_at: "2024-10-15T10:00:00Z",
  },
  {
    id: "2",
    navio: "AHTS Pacífico",
    data: "2024-10-14",
    norma: "IMCA M 189",
    item_auditado: "Sistema de Emergência",
    resultado: "Não Conforme",
    comentarios: "Necessita manutenção imediata",
    created_at: "2024-10-14T10:00:00Z",
    updated_at: "2024-10-14T10:00:00Z",
  },
];

describe("/api/auditorias/list", () => {
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;
  let jsonMock: any;
  let statusMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set environment variables
    process.env.VITE_SUPABASE_URL = "https://test.supabase.co";
    process.env.VITE_SUPABASE_ANON_KEY = "test-anon-key";

    jsonMock = vi.fn();
    statusMock = vi.fn(() => ({ json: jsonMock }));

    req = {
      method: "GET",
      query: {},
    };

    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  it("should return auditorias on GET request", async () => {
    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      data: mockAuditorias,
    });
  });

  it("should return 405 for non-GET requests", async () => {
    req.method = "POST";

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(405);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: "Method not allowed",
    });
  });

  it("should return 405 for PUT requests", async () => {
    req.method = "PUT";

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(405);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: "Method not allowed",
    });
  });

  it("should return 405 for DELETE requests", async () => {
    req.method = "DELETE";

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(405);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: "Method not allowed",
    });
  });

  it("should return 500 when Supabase URL is missing", async () => {
    delete process.env.VITE_SUPABASE_URL;

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: "Supabase configuration missing",
    });
  });

  it("should return 500 when Supabase key is missing", async () => {
    delete process.env.VITE_SUPABASE_ANON_KEY;

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: "Supabase configuration missing",
    });
  });

  it("should handle Supabase errors", async () => {
    const { createClient } = await import("@supabase/supabase-js");
    (createClient as any).mockReturnValueOnce({
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Database connection failed" },
        }),
      })),
    });

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: "Database connection failed",
    });
  });

  it("should handle unexpected errors", async () => {
    const { createClient } = await import("@supabase/supabase-js");
    (createClient as any).mockImplementationOnce(() => {
      throw new Error("Unexpected error");
    });

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: "Unexpected error",
    });
  });

  it("should return empty array when no auditorias exist", async () => {
    const { createClient } = await import("@supabase/supabase-js");
    (createClient as any).mockReturnValueOnce({
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      })),
    });

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      data: [],
    });
  });

  it("should use NEXT_PUBLIC environment variables as fallback", async () => {
    delete process.env.VITE_SUPABASE_URL;
    delete process.env.VITE_SUPABASE_ANON_KEY;
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://next-test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "next-test-anon-key";

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      data: mockAuditorias,
    });
  });
});
