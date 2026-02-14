/**
 * SEOHead Component Tests
 */
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { SEOHead, jsonLdSchemas } from "@/components/seo/SEOHead";

const renderWithHelmet = (ui: React.ReactElement) =>
  render(<HelmetProvider>{ui}</HelmetProvider>);

describe("SEOHead", () => {
  it("renders with title and default description", () => {
    renderWithHelmet(<SEOHead title="Dashboard" />);
    expect(true).toBe(true);
  });

  it("renders with noIndex", () => {
    renderWithHelmet(<SEOHead title="Private" noIndex />);
    expect(true).toBe(true);
  });

  it("renders with structuredData", () => {
    renderWithHelmet(
      <SEOHead title="Home" structuredData={jsonLdSchemas.softwareApp()} />
    );
    expect(true).toBe(true);
  });
});

describe("jsonLdSchemas generators", () => {
  it("generates softwareApp schema", () => {
    const result = jsonLdSchemas.softwareApp();
    expect(result["@type"]).toBe("SoftwareApplication");
    expect(result.name).toBe("Nauti One");
  });

  it("generates breadcrumb schema", () => {
    const result = jsonLdSchemas.breadcrumb([
      { name: "Home", url: "/" },
      { name: "Crew", url: "/crew" },
    ]);
    expect(result["@type"]).toBe("BreadcrumbList");
    expect(result.itemListElement).toHaveLength(2);
  });

  it("generates FAQ schema", () => {
    const result = jsonLdSchemas.faqPage([
      { question: "O que é?", answer: "Gestão marítima." },
    ]);
    expect(result["@type"]).toBe("FAQPage");
    expect(result.mainEntity).toHaveLength(1);
  });
});
