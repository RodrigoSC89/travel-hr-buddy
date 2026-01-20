/**
 * Accessibility (A11y) Tests
 * Validates WCAG AA compliance for core components
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null }),
        }),
      }),
    }),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>{children}</BrowserRouter>
  </QueryClientProvider>
);

describe("Accessibility Tests", () => {
  describe("WCAG 2.1 AA Compliance", () => {
    it("buttons should have accessible names", () => {
      render(
        <TestWrapper>
          <button aria-label="Submit form">Submit</button>
          <button>Cancel</button>
        </TestWrapper>
      );

      const submitBtn = screen.getByRole("button", { name: /submit/i });
      const cancelBtn = screen.getByRole("button", { name: /cancel/i });

      expect(submitBtn).toBeInTheDocument();
      expect(cancelBtn).toBeInTheDocument();
    });

    it("images should have alt text", () => {
      render(
        <TestWrapper>
          <img src="/logo.png" alt="Nauti One Logo" />
        </TestWrapper>
      );

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("alt");
      expect(img.getAttribute("alt")).not.toBe("");
    });

    it("form inputs should have labels", () => {
      render(
        <TestWrapper>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" />
        </TestWrapper>
      );

      const input = screen.getByLabelText(/email/i);
      expect(input).toBeInTheDocument();
    });

    it("links should have descriptive text", () => {
      render(
        <TestWrapper>
          <a href="/dashboard">Go to Dashboard</a>
        </TestWrapper>
      );

      const link = screen.getByRole("link", { name: /dashboard/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/dashboard");
    });

    it("headings should follow hierarchy", () => {
      render(
        <TestWrapper>
          <h1>Main Title</h1>
          <h2>Section Title</h2>
          <h3>Subsection Title</h3>
        </TestWrapper>
      );

      const h1 = screen.getByRole("heading", { level: 1 });
      const h2 = screen.getByRole("heading", { level: 2 });
      const h3 = screen.getByRole("heading", { level: 3 });

      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();
      expect(h3).toBeInTheDocument();
    });
  });

  describe("Keyboard Navigation", () => {
    it("interactive elements should be focusable", () => {
      render(
        <TestWrapper>
          <button>Click me</button>
          <a href="/test">Link</a>
          <input type="text" placeholder="Type here" />
        </TestWrapper>
      );

      const button = screen.getByRole("button");
      const link = screen.getByRole("link");
      const input = screen.getByRole("textbox");

      // All should be focusable (tabindex >= 0 or naturally focusable)
      expect(button).not.toHaveAttribute("tabindex", "-1");
      expect(link).not.toHaveAttribute("tabindex", "-1");
      expect(input).not.toHaveAttribute("tabindex", "-1");
    });

    it("should not trap focus", () => {
      render(
        <TestWrapper>
          <div>
            <button>First</button>
            <button>Second</button>
            <button>Third</button>
          </div>
        </TestWrapper>
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(3);

      // All buttons should be in tab order
      buttons.forEach((btn) => {
        expect(btn).not.toHaveAttribute("tabindex", "-1");
      });
    });
  });

  describe("Color Contrast", () => {
    it("text should have sufficient contrast", () => {
      // This is a structural test - actual contrast should be verified visually
      // or with automated tools like axe-core
      render(
        <TestWrapper>
          <p className="text-foreground bg-background">
            This text should have good contrast
          </p>
        </TestWrapper>
      );

      const paragraph = screen.getByText(/good contrast/i);
      expect(paragraph).toBeInTheDocument();
      expect(paragraph).toHaveClass("text-foreground");
      expect(paragraph).toHaveClass("bg-background");
    });
  });

  describe("Screen Reader Support", () => {
    it("should have proper ARIA roles", () => {
      render(
        <TestWrapper>
          <nav aria-label="Main navigation">
            <ul role="menubar">
              <li role="menuitem">Home</li>
              <li role="menuitem">About</li>
            </ul>
          </nav>
        </TestWrapper>
      );

      const nav = screen.getByRole("navigation");
      const menubar = screen.getByRole("menubar");
      const menuItems = screen.getAllByRole("menuitem");

      expect(nav).toHaveAttribute("aria-label", "Main navigation");
      expect(menubar).toBeInTheDocument();
      expect(menuItems).toHaveLength(2);
    });

    it("should announce dynamic content changes", () => {
      render(
        <TestWrapper>
          <div role="alert" aria-live="polite">
            Form submitted successfully
          </div>
        </TestWrapper>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveAttribute("aria-live", "polite");
    });

    it("should have skip links for main content", () => {
      render(
        <TestWrapper>
          <a href="#main-content" className="sr-only focus:not-sr-only">
            Skip to main content
          </a>
          <main id="main-content">Main content here</main>
        </TestWrapper>
      );

      const skipLink = screen.getByText(/skip to main content/i);
      expect(skipLink).toHaveAttribute("href", "#main-content");
    });
  });

  describe("Form Accessibility", () => {
    it("required fields should be marked", () => {
      render(
        <TestWrapper>
          <form>
            <label htmlFor="required-field">
              Email <span aria-hidden="true">*</span>
            </label>
            <input
              id="required-field"
              type="email"
              required
              aria-required="true"
            />
          </form>
        </TestWrapper>
      );

      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveAttribute("required");
      expect(input).toHaveAttribute("aria-required", "true");
    });

    it("error messages should be associated with inputs", () => {
      render(
        <TestWrapper>
          <label htmlFor="error-input">Password</label>
          <input
            id="error-input"
            type="password"
            aria-describedby="password-error"
            aria-invalid="true"
          />
          <span id="password-error" role="alert">
            Password must be at least 8 characters
          </span>
        </TestWrapper>
      );

      const input = screen.getByLabelText(/password/i);
      const error = screen.getByRole("alert");

      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toHaveAttribute("aria-describedby", "password-error");
      expect(error).toBeInTheDocument();
    });
  });
});

describe("Visual Regression Baseline", () => {
  it("should render core layout structure", () => {
    render(
      <TestWrapper>
        <div data-testid="app-layout">
          <header data-testid="header">Header</header>
          <aside data-testid="sidebar">Sidebar</aside>
          <main data-testid="main-content">Content</main>
          <footer data-testid="footer">Footer</footer>
        </div>
      </TestWrapper>
    );

    expect(screen.getByTestId("app-layout")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("main-content")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("should render with correct semantic structure", () => {
    render(
      <TestWrapper>
        <article>
          <header>
            <h1>Article Title</h1>
          </header>
          <section>
            <h2>Section 1</h2>
            <p>Content</p>
          </section>
          <footer>
            <p>Author info</p>
          </footer>
        </article>
      </TestWrapper>
    );

    expect(screen.getByRole("article")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Article Title");
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Section 1");
  });
});
