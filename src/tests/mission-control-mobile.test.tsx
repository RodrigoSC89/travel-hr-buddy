/**
 * PATCH 548 - Mission Control Mobile Dashboard Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";

// Mock IndexedDB
const mockIndexedDB = {
  open: vi.fn(() => {
    const request = {
      onsuccess: null as any,
      onerror: null as any,
      onupgradeneeded: null as any,
      result: {
        objectStoreNames: {
          contains: vi.fn(() => false),
        },
        createObjectStore: vi.fn(() => ({
          createIndex: vi.fn(),
        })),
        transaction: vi.fn(() => ({
          objectStore: vi.fn(() => ({
            getAll: vi.fn(() => ({
              onsuccess: null as any,
              onerror: null as any,
              result: [],
            })),
            clear: vi.fn(),
            add: vi.fn(),
          })),
          oncomplete: null as any,
          onerror: null as any,
        })),
      },
    };

    setTimeout(() => {
      if (request.onsuccess) {
        request.onsuccess({ target: request } as any);
      }
    }, 0);

    return request;
  }),
};

global.indexedDB = mockIndexedDB as any;

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        in: vi.fn(() => ({
          order: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
          eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}));

import { MobileMissionDashboard } from "@/modules/mission-control/mobile";

describe("MobileMissionDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state initially", () => {
    render(<MobileMissionDashboard />);
    // The component shows a loading spinner while initializing
    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it("should initialize without errors", () => {
    expect(() => {
      render(<MobileMissionDashboard />);
    }).not.toThrow();
  });

  it("should render with user filter", () => {
    expect(() => {
      render(<MobileMissionDashboard userId="user-123" />);
    }).not.toThrow();
  });
});
