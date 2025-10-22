import { describe, it, expect } from "vitest";

describe("sanity", () => {
  it("should pass sanity check", () => {
    expect(true).toBe(true);
  });

  it("should perform basic arithmetic", () => {
    expect(1 + 1).toBe(2);
  });

  it("should handle strings", () => {
    expect("hello".toUpperCase()).toBe("HELLO");
  });
});
