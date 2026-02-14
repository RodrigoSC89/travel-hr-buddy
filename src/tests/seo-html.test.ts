/**
 * SEO & HTML Structure Tests
 * Validates index.html has correct meta tags, JSON-LD, and accessibility features
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const html = readFileSync(resolve(__dirname, "../../index.html"), "utf-8");

describe("index.html SEO", () => {
  it("has lang attribute set to pt-BR", () => {
    expect(html).toContain('lang="pt-BR"');
  });

  it("has viewport meta tag", () => {
    expect(html).toContain('name="viewport"');
    expect(html).toContain("width=device-width");
  });

  it("has title under 60 characters", () => {
    const match = html.match(/<title>(.*?)<\/title>/);
    expect(match).not.toBeNull();
    expect(match![1].length).toBeLessThanOrEqual(60);
  });

  it("has meta description under 160 characters", () => {
    const match = html.match(/name="description"\s+content="(.*?)"/);
    expect(match).not.toBeNull();
    expect(match![1].length).toBeLessThanOrEqual(160);
  });

  it("has canonical URL", () => {
    expect(html).toContain('rel="canonical"');
  });

  it("has Open Graph tags", () => {
    expect(html).toContain('property="og:title"');
    expect(html).toContain('property="og:description"');
    expect(html).toContain('property="og:type"');
    expect(html).toContain('property="og:url"');
    expect(html).toContain('property="og:image"');
    expect(html).toContain('property="og:locale"');
  });

  it("has Twitter Card tags", () => {
    expect(html).toContain('name="twitter:card"');
    expect(html).toContain('name="twitter:title"');
    expect(html).toContain('name="twitter:description"');
  });

  it("has JSON-LD structured data", () => {
    expect(html).toContain('application/ld+json');
    expect(html).toContain('"@context"');
    expect(html).toContain('"SoftwareApplication"');
  });

  it("has PWA manifest", () => {
    expect(html).toContain('rel="manifest"');
  });

  it("has theme-color meta tag", () => {
    expect(html).toContain('name="theme-color"');
  });

  it("has apple-touch-icon", () => {
    expect(html).toContain('rel="apple-touch-icon"');
  });
});

describe("index.html Accessibility", () => {
  it("has skip-to-content link", () => {
    expect(html).toContain('href="#main-content"');
    expect(html).toContain("Pular para o conteúdo principal");
  });

  it("has charset meta tag", () => {
    expect(html).toContain('charset="UTF-8"');
  });
});

describe("index.html Performance", () => {
  it("preconnects to Supabase", () => {
    expect(html).toContain('rel="preconnect"');
    expect(html).toContain("supabase.co");
  });

  it("preconnects to Google Fonts", () => {
    expect(html).toContain("fonts.googleapis.com");
    expect(html).toContain("fonts.gstatic.com");
  });

  it("uses font display swap", () => {
    expect(html).toContain("display=swap");
  });

  it("has noscript fallback for fonts", () => {
    expect(html).toContain("<noscript>");
  });

  it("has module type script", () => {
    expect(html).toContain('type="module"');
  });
});
