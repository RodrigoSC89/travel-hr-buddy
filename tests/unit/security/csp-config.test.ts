/**
 * CSP and Security Tests
 * PATCH: QUALITY-10/10 - Security validation tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock window and document
const mockWindow = {
  location: {
    protocol: "https:",
    hostname: "nautione.com.br",
  },
};

const mockDocument = {
  querySelectorAll: vi.fn(() => []),
  createElement: vi.fn(() => ({
    textContent: "",
    innerHTML: "",
  })),
};

vi.stubGlobal("window", mockWindow);
vi.stubGlobal("document", mockDocument);

describe("CSP Configuration", () => {
  let cspModule: any;

  beforeEach(async () => {
    vi.resetModules();
    cspModule = await import("@/lib/security/csp-config");
  });

  describe("CSP_DIRECTIVES", () => {
    it("should have required directives", () => {
      expect(cspModule.CSP_DIRECTIVES).toHaveProperty("default-src");
      expect(cspModule.CSP_DIRECTIVES).toHaveProperty("script-src");
      expect(cspModule.CSP_DIRECTIVES).toHaveProperty("style-src");
      expect(cspModule.CSP_DIRECTIVES).toHaveProperty("img-src");
      expect(cspModule.CSP_DIRECTIVES).toHaveProperty("connect-src");
    });

    it("should include self in default-src", () => {
      expect(cspModule.CSP_DIRECTIVES["default-src"]).toContain("'self'");
    });

    it("should include Supabase in connect-src", () => {
      expect(cspModule.CSP_DIRECTIVES["connect-src"]).toContain(
        "https://*.supabase.co"
      );
    });

    it("should prevent framing", () => {
      expect(cspModule.CSP_DIRECTIVES["frame-ancestors"]).toContain("'none'");
    });
  });

  describe("generateCSPHeader", () => {
    it("should generate valid CSP header string", () => {
      const header = cspModule.generateCSPHeader();

      expect(typeof header).toBe("string");
      expect(header).toContain("default-src");
      expect(header).toContain("script-src");
      expect(header).toContain(";");
    });
  });

  describe("SECURITY_HEADERS", () => {
    it("should include all required security headers", () => {
      expect(cspModule.SECURITY_HEADERS).toHaveProperty(
        "Content-Security-Policy"
      );
      expect(cspModule.SECURITY_HEADERS).toHaveProperty(
        "X-Content-Type-Options"
      );
      expect(cspModule.SECURITY_HEADERS).toHaveProperty("X-Frame-Options");
      expect(cspModule.SECURITY_HEADERS).toHaveProperty("X-XSS-Protection");
      expect(cspModule.SECURITY_HEADERS).toHaveProperty("Referrer-Policy");
      expect(cspModule.SECURITY_HEADERS).toHaveProperty(
        "Strict-Transport-Security"
      );
    });

    it("should have correct X-Frame-Options", () => {
      expect(cspModule.SECURITY_HEADERS["X-Frame-Options"]).toBe("DENY");
    });

    it("should have correct X-Content-Type-Options", () => {
      expect(cspModule.SECURITY_HEADERS["X-Content-Type-Options"]).toBe(
        "nosniff"
      );
    });
  });
});

describe("validatePageSecurity", () => {
  let cspModule: any;

  beforeEach(async () => {
    vi.resetModules();
    mockDocument.querySelectorAll.mockReturnValue([]);
    cspModule = await import("@/lib/security/csp-config");
  });

  it("should return secure for HTTPS connection", () => {
    mockWindow.location.protocol = "https:";

    const result = cspModule.validatePageSecurity();

    expect(result.isSecure).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("should allow localhost HTTP", () => {
    mockWindow.location.protocol = "http:";
    mockWindow.location.hostname = "localhost";

    const result = cspModule.validatePageSecurity();

    expect(result.isSecure).toBe(true);
  });

  it("should detect insecure HTTP connection", () => {
    mockWindow.location.protocol = "http:";
    mockWindow.location.hostname = "production.com";

    const result = cspModule.validatePageSecurity();

    expect(result.isSecure).toBe(false);
    expect(result.issues).toContain("Conexão não segura (HTTP)");
  });

  it("should detect mixed content scripts", () => {
    mockWindow.location.protocol = "https:";
    mockWindow.location.hostname = "production.com";
    mockDocument.querySelectorAll.mockImplementation((selector: string) => {
      if (selector === 'script[src^="http:"]') return [1, 2];
      return [];
    });

    const result = cspModule.validatePageSecurity();

    expect(result.isSecure).toBe(false);
    expect(result.issues).toContain("2 scripts carregados via HTTP");
  });
});

describe("sanitize utilities", () => {
  let sanitize: any;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import("@/lib/security/csp-config");
    sanitize = module.sanitize;
  });

  describe("sanitize.email", () => {
    it("should validate correct email", () => {
      expect(sanitize.email("test@example.com")).toBe("test@example.com");
    });

    it("should trim and lowercase email", () => {
      expect(sanitize.email("  TEST@Example.COM  ")).toBe("test@example.com");
    });

    it("should return null for invalid email", () => {
      expect(sanitize.email("not-an-email")).toBeNull();
      expect(sanitize.email("@example.com")).toBeNull();
      expect(sanitize.email("test@")).toBeNull();
    });
  });

  describe("sanitize.sql", () => {
    it("should remove SQL injection characters", () => {
      expect(sanitize.sql("SELECT * FROM users;")).toBe("SELECT * FROM users");
      expect(sanitize.sql("1' OR '1'='1")).toBe("1 OR 1=1");
      expect(sanitize.sql("--comment")).toBe("comment");
    });
  });

  describe("sanitize.fileName", () => {
    it("should sanitize file names", () => {
      expect(sanitize.fileName("my-file.pdf")).toBe("my-file.pdf");
      expect(sanitize.fileName("my file.pdf")).toBe("my_file.pdf");
      expect(sanitize.fileName("../../../etc/passwd")).toBe(
        ".._.._.._etc_passwd"
      );
    });
  });

  describe("sanitize.url", () => {
    it("should validate HTTPS URLs", () => {
      expect(sanitize.url("https://example.com")).toBe("https://example.com/");
    });

    it("should validate HTTP URLs", () => {
      expect(sanitize.url("http://example.com")).toBe("http://example.com/");
    });

    it("should reject invalid protocols", () => {
      expect(sanitize.url("javascript:alert(1)")).toBeNull();
      expect(sanitize.url("file:///etc/passwd")).toBeNull();
    });

    it("should reject invalid URLs", () => {
      expect(sanitize.url("not-a-url")).toBeNull();
    });
  });
});

describe("ClientRateLimiter", () => {
  let ClientRateLimiter: any;

  beforeEach(async () => {
    vi.resetModules();
    vi.useFakeTimers();
    const module = await import("@/lib/security/csp-config");
    ClientRateLimiter = module.ClientRateLimiter;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should allow requests within limit", () => {
    const limiter = new ClientRateLimiter(5, 60000);

    for (let i = 0; i < 5; i++) {
      expect(limiter.canProceed()).toBe(true);
    }
  });

  it("should block requests over limit", () => {
    const limiter = new ClientRateLimiter(3, 60000);

    expect(limiter.canProceed()).toBe(true);
    expect(limiter.canProceed()).toBe(true);
    expect(limiter.canProceed()).toBe(true);
    expect(limiter.canProceed()).toBe(false);
  });

  it("should reset after window expires", () => {
    const limiter = new ClientRateLimiter(2, 1000);

    expect(limiter.canProceed()).toBe(true);
    expect(limiter.canProceed()).toBe(true);
    expect(limiter.canProceed()).toBe(false);

    vi.advanceTimersByTime(1100);

    expect(limiter.canProceed()).toBe(true);
  });

  it("should track remaining requests", () => {
    const limiter = new ClientRateLimiter(5, 60000);

    expect(limiter.getRemainingRequests()).toBe(5);

    limiter.canProceed();
    expect(limiter.getRemainingRequests()).toBe(4);

    limiter.canProceed();
    limiter.canProceed();
    expect(limiter.getRemainingRequests()).toBe(2);
  });
});
