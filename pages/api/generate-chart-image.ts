import type { NextApiRequest, NextApiResponse } from "next";

/**
 * API endpoint to generate chart image using Puppeteer
 * 
 * This endpoint captures a screenshot of the embed restore chart page
 * for use in automated reports, email attachments, or scheduled dashboards.
 * 
 * Production Deployment Options:
 * 
 * 1. Vercel (Recommended for serverless):
 *    - Use chrome-aws-lambda instead of regular puppeteer
 *    - Install: npm install chrome-aws-lambda puppeteer-core
 *    - Update imports to use puppeteer-core with chrome-aws-lambda
 * 
 * 2. Supabase Edge Functions:
 *    - Implement as Deno-based Edge Function
 *    - Use Deno's puppeteer support
 * 
 * 3. Docker/VPS:
 *    - Install Chrome/Chromium in container
 *    - Use regular puppeteer with system Chrome
 * 
 * @see /public/embed-restore-chart.html - Static HTML fallback
 * @see /src/pages/embed/RestoreChartEmbed.tsx - React-based embed page
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Get the app URL from environment or default to localhost
    const appUrl = process.env.VITE_APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173";
    const embedUrl = `${appUrl}/embed/restore-chart`;

    // For development/testing: Return the embed URL
    // This allows testing the endpoint without Puppeteer installed
    if (process.env.NODE_ENV === "development" || !process.env.PUPPETEER_ENABLED) {
      return res.status(200).json({
        success: true,
        embedUrl: embedUrl,
        message: "Puppeteer disabled. Use this URL to capture screenshot manually or enable PUPPETEER_ENABLED=true",
        instructions: {
          manual: "Open embedUrl in browser and take screenshot",
          api: "Set PUPPETEER_ENABLED=true and ensure puppeteer is installed",
        },
      });
    }

    // Production: Generate chart image with Puppeteer
    // Note: Puppeteer is an optional dependency - install only if needed
    let puppeteer;
    try {
      puppeteer = require("puppeteer");
    } catch (error) {
      return res.status(501).json({
        error: "Puppeteer not installed",
        message: "Install puppeteer with: npm install puppeteer",
        embedUrl: embedUrl,
        fallback: "Use embedUrl for manual screenshot or external service",
      });
    }

    // Launch browser with production-optimized settings
    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--single-process", // Important for serverless
        "--no-zygote", // Important for serverless
      ],
    });

    try {
      const page = await browser.newPage();

      // Set viewport for consistent sizing (2x for retina quality)
      await page.setViewport({
        width: 1200,
        height: 600,
        deviceScaleFactor: 2,
      });

      // Navigate to embed page
      await page.goto(embedUrl, {
        waitUntil: "networkidle0",
        timeout: 30000,
      });

      // Wait for chart to be ready (set by RestoreChartEmbed component)
      await page.waitForFunction("window.chartReady === true", {
        timeout: 15000,
      });

      // Additional small delay to ensure chart animation is complete
      await page.waitForTimeout(500);

      // Capture screenshot
      const imageBuffer = await page.screenshot({
        type: "png",
        fullPage: false,
      });

      await browser.close();

      // Set cache headers (5 minutes)
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Content-Disposition", "inline; filename=\"restore-chart.png\"");
      res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");

      return res.send(imageBuffer);
    } catch (error) {
      await browser.close();
      throw error;
    }
  } catch (error) {
    console.error("Error generating chart image:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return res.status(500).json({
      error: "Failed to generate chart image",
      details: errorMessage,
      troubleshooting: {
        chromeMissing: "Ensure Chrome/Chromium is installed in your environment",
        timeout: "Chart may be taking too long to load - check Supabase connection",
        permissions: "Ensure --no-sandbox flags are set for serverless environments",
      },
    });
  }
}
