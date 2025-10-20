import { describe, it, expect, vi, beforeEach } from "vitest";
import { BridgeLink } from "@/core/BridgeLink";

describe("BridgeLink", () => {
  beforeEach(() => {
    // Clear all event listeners before each test
    vi.clearAllMocks();
  });

  it("should emit events correctly", () => {
    const eventName = "test:event";
    const eventData = { message: "Test message" };
    
    const mockListener = vi.fn();
    window.addEventListener(eventName, mockListener);
    
    BridgeLink.emit(eventName, eventData);
    
    expect(mockListener).toHaveBeenCalled();
    const event = mockListener.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toEqual(eventData);
    
    window.removeEventListener(eventName, mockListener);
  });

  it("should register event listeners", () => {
    const eventName = "nautilus:event";
    const testData = { message: "Test log" };
    const callback = vi.fn();
    
    const unsubscribe = BridgeLink.on(eventName, callback);
    
    BridgeLink.emit(eventName, testData);
    
    expect(callback).toHaveBeenCalledWith(testData);
    
    unsubscribe();
  });

  it("should unsubscribe from events", () => {
    const eventName = "nautilus:event";
    const callback = vi.fn();
    
    const unsubscribe = BridgeLink.on(eventName, callback);
    unsubscribe();
    
    BridgeLink.emit(eventName, { message: "Test" });
    
    expect(callback).not.toHaveBeenCalled();
  });
});
