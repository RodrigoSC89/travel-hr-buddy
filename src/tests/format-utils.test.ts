/**
 * Format Utils Test Suite
 * Tests for unified formatting utilities
 */
import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatPercent,
  formatBytes,
  formatDuration,
  formatCPF,
  formatCNPJ,
  formatPhone,
  truncateText,
  capitalize,
  titleCase,
  slugify,
  formatCoordinates,
  formatKnots,
  formatNauticalMiles,
  formatHeading,
} from "@/lib/unified";

describe("Number Formatting", () => {
  describe("formatCurrency", () => {
    it("formats BRL currency correctly", () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain("1");
      expect(result).toContain("234");
    });

    it("handles zero", () => {
      const result = formatCurrency(0);
      expect(result).toContain("0");
    });

    it("handles negative values", () => {
      const result = formatCurrency(-500);
      expect(result).toContain("500");
    });
  });

  describe("formatPercent", () => {
    it("formats percentages", () => {
      const result = formatPercent(75.5);
      expect(result).toContain("75");
    });
  });
});

describe("File Size Formatting", () => {
  describe("formatBytes", () => {
    it("formats bytes to KB", () => {
      const result = formatBytes(1024);
      expect(result).toContain("1");
      expect(result.toLowerCase()).toContain("kb");
    });

    it("formats bytes to MB", () => {
      const result = formatBytes(1048576);
      expect(result).toContain("1");
      expect(result.toLowerCase()).toContain("mb");
    });

    it("handles zero bytes", () => {
      const result = formatBytes(0);
      expect(result).toContain("0");
    });
  });
});

describe("Duration Formatting", () => {
  describe("formatDuration", () => {
    it("formats a duration value", () => {
      const result = formatDuration(90);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("handles zero", () => {
      const result = formatDuration(0);
      expect(result).toBeDefined();
    });
  });
});

describe("Document Formatting (BR)", () => {
  describe("formatCPF", () => {
    it("formats CPF with dots and dash", () => {
      const result = formatCPF("12345678901");
      expect(result).toBe("123.456.789-01");
    });

    it("handles already formatted CPF", () => {
      const result = formatCPF("123.456.789-01");
      expect(result).toContain("123");
    });
  });

  describe("formatCNPJ", () => {
    it("formats CNPJ correctly", () => {
      const result = formatCNPJ("12345678000190");
      expect(result).toBe("12.345.678/0001-90");
    });
  });

  describe("formatPhone", () => {
    it("formats phone number", () => {
      const result = formatPhone("11999887766");
      expect(result).toContain("11");
      expect(result).toContain("99988");
    });
  });
});

describe("Text Formatting", () => {
  describe("truncateText", () => {
    it("truncates long text", () => {
      const result = truncateText("Hello World This Is A Long Text", 10);
      expect(result.length).toBeLessThanOrEqual(13); // 10 + "..."
      expect(result).toContain("...");
    });

    it("returns short text unchanged", () => {
      expect(truncateText("Hi", 10)).toBe("Hi");
    });
  });

  describe("capitalize", () => {
    it("capitalizes first letter", () => {
      expect(capitalize("hello")).toBe("Hello");
    });

    it("handles empty string", () => {
      expect(capitalize("")).toBe("");
    });
  });

  describe("titleCase", () => {
    it("capitalizes each word", () => {
      expect(titleCase("hello world")).toBe("Hello World");
    });
  });

  describe("slugify", () => {
    it("converts to URL-friendly slug", () => {
      expect(slugify("Hello World")).toBe("hello-world");
    });

    it("removes special characters", () => {
      const result = slugify("Hello & World!");
      expect(result).not.toContain("&");
      expect(result).not.toContain("!");
    });
  });
});

describe("Maritime/Nautical Formatting", () => {
  describe("formatCoordinates", () => {
    it("formats lat/lng coordinates", () => {
      const result = formatCoordinates(-23.55, -46.63);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });
  });

  describe("formatKnots", () => {
    it("formats speed in knots", () => {
      const result = formatKnots(12.5);
      expect(result).toContain("12");
      expect(result.toLowerCase()).toContain("kn");
    });
  });

  describe("formatNauticalMiles", () => {
    it("formats distance in NM", () => {
      const result = formatNauticalMiles(150.3);
      expect(result).toContain("150");
    });
  });

  describe("formatHeading", () => {
    it("formats heading in degrees", () => {
      const result = formatHeading(270);
      expect(result).toContain("270");
    });
  });
});
