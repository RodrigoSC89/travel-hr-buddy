/**
 * Tests for design system tokens and theme consistency
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

function getFileContent(path: string): string {
  try {
    return readFileSync(resolve(process.cwd(), path), "utf-8");
  } catch {
    return "";
  }
}

describe("Design System Tokens", () => {
  const indexCSS = getFileContent("src/index.css");

  it("defines required CSS custom properties in :root", () => {
    expect(indexCSS).toContain("--background");
    expect(indexCSS).toContain("--foreground");
    expect(indexCSS).toContain("--primary");
    expect(indexCSS).toContain("--secondary");
    expect(indexCSS).toContain("--muted");
    expect(indexCSS).toContain("--accent");
    expect(indexCSS).toContain("--destructive");
  });

  it("defines dark mode tokens", () => {
    expect(indexCSS).toContain(".dark");
  });

  it("tailwind config extends with design tokens", () => {
    const tailwindConfig = getFileContent("tailwind.config.ts");
    expect(tailwindConfig).toContain("primary");
    expect(tailwindConfig).toContain("secondary");
    expect(tailwindConfig).toContain("background");
    expect(tailwindConfig).toContain("foreground");
  });
});

describe("Accessibility Standards", () => {
  it("skip link component exists", () => {
    const provider = getFileContent("src/components/AccessibilityProvider.tsx");
    expect(provider).toContain("skip-link");
    expect(provider).toContain("Pular para conteúdo principal");
  });

  it("pa11y config targets WCAG2AA", () => {
    const pa11y = getFileContent(".pa11yci.json");
    expect(pa11y).toContain("WCAG2AA");
  });
});

describe("SEO Configuration", () => {
  const indexHTML = getFileContent("index.html");

  it("has viewport meta tag", () => {
    expect(indexHTML).toContain("viewport");
  });

  it("has charset meta tag", () => {
    expect(indexHTML).toContain("charset");
  });
});

describe("No Console.log in Components", () => {
  const fs = require("fs");
  const path = require("path");

  function getAllFiles(dir: string, ext: string): string[] {
    const files: string[] = [];
    try {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory() && !item.name.includes("test") && !item.name.includes("node_modules")) {
          files.push(...getAllFiles(fullPath, ext));
        } else if (item.name.endsWith(ext)) {
          files.push(fullPath);
        }
      }
    } catch { /* skip unreadable dirs */ }
    return files;
  }

  it("no console.log in src/components/", () => {
    const files = getAllFiles("src/components", ".tsx");
    const violations: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line: string, idx: number) => {
        if (/console\.log\(/.test(line) && !line.includes("//") && !line.includes("eslint-disable")) {
          violations.push(`${file}:${idx + 1}`);
        }
      });
    }
    expect(violations).toEqual([]);
  });
});
