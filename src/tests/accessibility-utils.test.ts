/**
 * Accessibility Utilities Tests
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getContrastRatio,
  meetsContrastRequirement,
  generateAriaId,
  isKeyPressed,
  KeyboardKeys,
  prefersReducedMotion,
} from "@/lib/accessibility";

describe("getContrastRatio", () => {
  it("returns 21:1 for black on white", () => {
    const ratio = getContrastRatio("#000000", "#FFFFFF");
    expect(ratio).toBeCloseTo(21, 0);
  });

  it("returns 1:1 for same colors", () => {
    const ratio = getContrastRatio("#FF0000", "#FF0000");
    expect(ratio).toBeCloseTo(1, 0);
  });

  it("is commutative", () => {
    const r1 = getContrastRatio("#000000", "#3b82f6");
    const r2 = getContrastRatio("#3b82f6", "#000000");
    expect(r1).toBeCloseTo(r2, 5);
  });
});

describe("meetsContrastRequirement", () => {
  it("passes AA for black on white", () => {
    expect(meetsContrastRequirement("#000000", "#FFFFFF", "AA")).toBe(true);
  });

  it("passes AAA for black on white", () => {
    expect(meetsContrastRequirement("#000000", "#FFFFFF", "AAA")).toBe(true);
  });

  it("fails AA for low contrast pair", () => {
    expect(meetsContrastRequirement("#cccccc", "#ffffff", "AA")).toBe(false);
  });

  it("accepts lower ratio for large text at AA", () => {
    // 3:1 is sufficient for large text AA
    expect(meetsContrastRequirement("#767676", "#FFFFFF", "AA", true)).toBe(true);
  });
});

describe("generateAriaId", () => {
  it("generates unique ids", () => {
    const id1 = generateAriaId("test");
    const id2 = generateAriaId("test");
    expect(id1).not.toBe(id2);
  });

  it("uses provided prefix", () => {
    const id = generateAriaId("modal");
    expect(id).toMatch(/^modal-/);
  });
});

describe("isKeyPressed", () => {
  it("detects Enter key", () => {
    const event = new KeyboardEvent("keydown", { key: "Enter" });
    expect(isKeyPressed(event, "ENTER")).toBe(true);
  });

  it("detects Escape key", () => {
    const event = new KeyboardEvent("keydown", { key: "Escape" });
    expect(isKeyPressed(event, "ESCAPE")).toBe(true);
  });

  it("returns false for wrong key", () => {
    const event = new KeyboardEvent("keydown", { key: "a" });
    expect(isKeyPressed(event, "ENTER")).toBe(false);
  });
});

describe("prefersReducedMotion", () => {
  it("returns a boolean", () => {
    // Mock matchMedia for this test
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as any;
    expect(typeof prefersReducedMotion()).toBe("boolean");
  });
});
