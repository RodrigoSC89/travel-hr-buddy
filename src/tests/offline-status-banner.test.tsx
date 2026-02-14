/**
 * Tests for OfflineStatusBanner - PATCH v16 iOS PWA disabled component
 */
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { OfflineStatusBanner } from "@/components/dashboard/OfflineStatusBanner";

describe("OfflineStatusBanner", () => {
  it("always renders null (iOS PWA patch)", () => {
    const { container } = render(<OfflineStatusBanner />);
    expect(container.innerHTML).toBe("");
  });

  it("renders null even with props", () => {
    const { container } = render(
      <OfflineStatusBanner
        isFromCache={true}
        lastSync={new Date()}
        onRetry={() => {}}
        retryCount={3}
        maxRetries={5}
      />
    );
    expect(container.innerHTML).toBe("");
  });
});
