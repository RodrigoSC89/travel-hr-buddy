import { describe, it, expect } from "vitest";

describe("Basic test suite", () => {
  it("should pass a simple test", () => {
    expect(true).toBe(true);
  });

  it("should perform basic math operations", () => {
    expect(1 + 1).toBe(2);
    expect(2 * 3).toBe(6);
  });
});
