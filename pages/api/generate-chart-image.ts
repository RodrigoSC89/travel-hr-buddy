/**
 * API Endpoint: Generate Chart Image
 * 
 * Provides the embed URL for chart visualization.
 * 
 * Note: This is a simplified implementation that returns the embed page URL.
 * In a production environment, you can enhance this with one of these approaches:
 * 
 * 1. Puppeteer (requires Chrome/Chromium binary):
 *    - Install: npm install puppeteer
 *    - Use Puppeteer to visit the embed page and take screenshot
 *    - Best for on-premise or custom hosting
 * 
 * 2. node-canvas (lighter, but more complex):
 *    - Install: npm install canvas chart.js chartjs-node-canvas
 *    - Generate chart server-side without browser
 *    - Good for serverless with size constraints
 * 
 * 3. Screenshot service (simplest for serverless):
 *    - Use services like API Flash, URL2PNG, ScreenshotAPI
 *    - Easiest integration for serverless platforms
 *    - Requires external API subscription
 * 
 * @module generate-chart-image
 */

import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Response interface
 */
interface ChartImageResponse {
  success: boolean;
  embedUrl: string;
  message: string;
  error?: string;
}

/**
 * Main API handler
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChartImageResponse | Buffer>
) {
  // Only allow GET and POST requests
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({
      success: false,
      embedUrl: "",
      message: "Method not allowed. Use GET or POST.",
      error: "Method not allowed",
    });
  }

  try {
    // Get base URL from environment or request
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers.host;
    const baseUrl = process.env.VITE_APP_URL || 
                    process.env.APP_URL || 
                    (host ? `${protocol}://${host}` : "http://localhost:5173");

    // Construct embed URL
    const embedUrl = `${baseUrl}/embed-restore-chart.html`;

    console.log(`📊 Chart embed URL generated: ${embedUrl}`);

    return res.status(200).json({
      success: true,
      embedUrl: embedUrl,
      message: "Use this URL to capture screenshot with Puppeteer or similar tool. " +
               "For production, integrate with a screenshot service or install Puppeteer.",
    });

    // OPTION: Uncomment below to use Puppeteer (requires puppeteer npm package)
    /*
    console.log("🚀 Launching Puppeteer to capture chart...");
    
    const puppeteer = require("puppeteer");
    
    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
    });

    try {
      const page = await browser.newPage();

      // Set viewport for consistent screenshot size
      await page.setViewport({ width: 1200, height: 800 });

      console.log(`📄 Navigating to: ${embedUrl}`);
      await page.goto(embedUrl, {
        waitUntil: "networkidle0",
        timeout: 30000,
      });

      // Wait for chart to be fully rendered
      await page.waitForFunction(
        "window.chartReady === true || document.querySelector('canvas')",
        { timeout: 15000 }
      );

      // Add a small delay to ensure chart animation completes
      await page.waitForTimeout(1000);

      console.log("📸 Capturing screenshot...");
      const imageBuffer = await page.screenshot({
        type: "png",
        fullPage: false,
      });

      await browser.close();

      console.log("✅ Chart screenshot generated successfully");

      // Return image as PNG
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=3600");
      return res.send(imageBuffer);
    } catch (error) {
      await browser.close();
      throw error;
    }
    */
  } catch (error) {
    console.error("❌ Error generating chart image:", error);
    return res.status(500).json({
      success: false,
      embedUrl: "",
      message: "Failed to generate chart image",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
