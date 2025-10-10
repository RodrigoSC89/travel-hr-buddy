/**
 * Test suite for weekly-report-cron.js
 *
 * These tests validate the script's structure and error handling
 * without requiring actual email credentials or Supabase connection.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

const scriptPath = path.join(process.cwd(), "scripts", "weekly-report-cron.js");

describe("Weekly Report Cron Script", () => {
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  it("should exist and be readable", () => {
    expect(fs.existsSync(scriptPath)).toBe(true);
    expect(fs.statSync(scriptPath).isFile()).toBe(true);
  });

  it("should have valid JavaScript syntax", async () => {
    const child = spawn("node", ["--check", scriptPath]);

    await new Promise((resolve, reject) => {
      child.on("exit", code => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Syntax check failed with code ${code}`));
        }
      });

      child.on("error", err => {
        reject(err);
      });
    });
  });

  it("should fail gracefully when SUPABASE_KEY is missing", async () => {
    await new Promise((resolve, reject) => {
      const child = spawn("node", [scriptPath], {
        env: {
          ...process.env,
          VITE_SUPABASE_URL: "https://test.supabase.co",
          SUPABASE_KEY: undefined,
          VITE_SUPABASE_PUBLISHABLE_KEY: undefined,
        },
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", data => {
        stdout += data.toString();
      });

      child.stderr.on("data", data => {
        stderr += data.toString();
      });

      child.on("exit", code => {
        const output = stdout + stderr;
        if (code === 1 && output.includes("SUPABASE_KEY")) {
          resolve();
        } else {
          reject(
            new Error(
              `Expected exit code 1 with SUPABASE_KEY error, got code ${code}, output: ${output}`
            )
          );
        }
      });

      child.on("error", err => {
        reject(err);
      });
    });
  }, 10000);

  it("should fail gracefully when EMAIL credentials are missing", async () => {
    await new Promise((resolve, reject) => {
      const child = spawn("node", [scriptPath], {
        env: {
          ...process.env,
          VITE_SUPABASE_URL: "https://test.supabase.co",
          SUPABASE_KEY: "test-key",
          EMAIL_USER: undefined,
          EMAIL_PASS: undefined,
        },
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", data => {
        stdout += data.toString();
      });

      child.stderr.on("data", data => {
        stderr += data.toString();
      });

      child.on("exit", code => {
        const output = stdout + stderr;
        if (code === 1 && output.includes("EMAIL_USER")) {
          resolve();
        } else {
          reject(
            new Error(
              `Expected exit code 1 with EMAIL_USER error, got code ${code}, output: ${output}`
            )
          );
        }
      });

      child.on("error", err => {
        reject(err);
      });
    });
  }, 10000);

  it("should have proper shebang for executable", () => {
    const content = fs.readFileSync(scriptPath, "utf8");
    expect(content.startsWith("#!/usr/bin/env node")).toBe(true);
  });

  it("should contain required imports", () => {
    const content = fs.readFileSync(scriptPath, "utf8");

    // Check for required imports
    expect(content).toContain("nodemailer");
    expect(content).toContain("jsPDF");
    expect(content).toContain("html2canvas");
    expect(content).toContain("jsdom");
  });

  it("should contain main function", () => {
    const content = fs.readFileSync(scriptPath, "utf8");

    // Check for main functions
    expect(content).toContain("gerarPDF");
    expect(content).toContain("enviarEmail");
    expect(content).toContain("gerarEEnviarRelatorio");
    expect(content).toContain("formatarHTMLRelatorio");
  });

  it("should have proper error handling", () => {
    const content = fs.readFileSync(scriptPath, "utf8");

    // Check for error handling
    expect(content).toContain("try");
    expect(content).toContain("catch");
    expect(content).toContain("throw");
    expect(content).toContain("process.exit(1)");
  });

  it("should have configuration validation", () => {
    const content = fs.readFileSync(scriptPath, "utf8");

    // Check for validation
    expect(content).toContain("SUPABASE_KEY");
    expect(content).toContain("EMAIL_USER");
    expect(content).toContain("EMAIL_PASS");
  });
});
