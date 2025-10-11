import type { NextApiRequest, NextApiResponse } from "next";

/**
 * API endpoint to generate chart image using Puppeteer
 * 
 * Enterprise-grade implementation with comprehensive error handling,
 * configuration validation, and support for multiple deployment environments.
 * 
 * Features:
 * - Environment-based configuration
 * - Graceful fallback when Puppeteer unavailable
 * - Production-optimized browser settings
 * - Proper error handling and logging
 * - Cache headers for performance
 * 
 * Deployment Options:
 * 
 * 1. Vercel (Recommended for serverless):
 *    - Use chrome-aws-lambda instead of regular puppeteer
 *    - Install: npm install chrome-aws-lambda puppeteer-core
 *    - Update imports to use puppeteer-core with chrome-aws-lambda
 * 
 * 2. Supabase Edge Functions:
 *    - Implement as Deno-based Edge Function
 *    - Use external screenshot service (API Flash, URL2PNG)
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
  // Only allow POST requests
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed",
      message: "Only GET and POST requests are supported",
    });
  }

  try {
    // Get the app URL from environment with fallback chain
    const appUrl = 
      process.env.VITE_APP_URL || 
      process.env.NEXT_PUBLIC_APP_URL || 
      process.env.APP_URL ||
      "http://localhost:5173";
    
    const embedUrl = `${appUrl}/embed/restore-chart`;

    console.log(`📊 Chart image generation requested`);
    console.log(`🌐 App URL: ${appUrl}`);
    console.log(`🖼️ Embed URL: ${embedUrl}`);

    // For development/testing: Return the embed URL with instructions
    if (process.env.NODE_ENV === "development" || !process.env.PUPPETEER_ENABLED) {
      console.log("⚠️ Puppeteer disabled - returning embed URL");
      return res.status(200).json({
        success: true,
        embedUrl: embedUrl,
        message: "Puppeteer disabled. Use this URL to capture screenshot manually or enable PUPPETEER_ENABLED=true",
        instructions: {
          manual: "Open embedUrl in browser and take screenshot",
          api: "Set PUPPETEER_ENABLED=true and ensure puppeteer is installed",
          external: "Use screenshot service like API Flash, URL2PNG, or ScreenshotAPI",
        },
        configuration: {
          nodeEnv: process.env.NODE_ENV,
          puppeteerEnabled: process.env.PUPPETEER_ENABLED || "false",
        },
      });
    }

    // Production: Generate chart image with Puppeteer
    // Note: Puppeteer is an optional dependency - install only if needed
    console.log("🚀 Attempting to load Puppeteer...");
    let puppeteer;
    try {
      puppeteer = require("puppeteer");
      console.log("✅ Puppeteer loaded successfully");
    } catch (error) {
      console.error("❌ Puppeteer not installed:", error);
      return res.status(501).json({
        error: "Puppeteer not installed",
        message: "Install puppeteer with: npm install puppeteer",
        embedUrl: embedUrl,
        fallback: "Use embedUrl for manual screenshot or external service",
        alternatives: {
          vercel: "Use chrome-aws-lambda with puppeteer-core",
          external: "Use API Flash, URL2PNG, or ScreenshotAPI",
          docker: "Install Chrome in Docker container",
        },
      });
    }

    console.log("🌐 Launching headless browser...");
    // Launch browser with production-optimized settings
    const browser = await puppeteer.launch({
      headless: "new", // Use new headless mode
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage", // Overcome limited resource problems
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--single-process", // Important for serverless
        "--no-zygote", // Important for serverless
        "--disable-web-security", // Allow CORS for embed pages
      ],
      timeout: 30000, // 30 second timeout for launch
    });

    try {
      console.log("📄 Creating new page...");
      const page = await browser.newPage();

      // Set viewport for consistent sizing (2x for retina quality)
      await page.setViewport({
        width: 1200,
        height: 600,
        deviceScaleFactor: 2, // High DPI for crisp images
      });

      console.log(`🔗 Navigating to: ${embedUrl}`);
      // Navigate to embed page with generous timeout
      await page.goto(embedUrl, {
        waitUntil: "networkidle0", // Wait for network to be idle
        timeout: 30000,
      });

      console.log("⏳ Waiting for chart to be ready...");
      // Wait for chart to be ready (set by RestoreChartEmbed component)
      try {
        await page.waitForFunction("window.chartReady === true", {
          timeout: 15000,
        });
        console.log("✅ Chart ready");
      } catch (error) {
        console.warn("⚠️ chartReady flag not found, continuing anyway");
      }

      // Additional small delay to ensure chart animation is complete
      await page.waitForTimeout(500);

      console.log("📸 Capturing screenshot...");
      // Capture screenshot
      const imageBuffer = await page.screenshot({
        type: "png",
        fullPage: false, // Only capture viewport
        omitBackground: false, // Include white background
      });

      console.log("🧹 Closing browser...");
      await browser.close();
      console.log("✅ Screenshot generated successfully");

      // Set cache headers (5 minutes)
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Content-Disposition", 'inline; filename="restore-chart.png"');
      res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
      res.setHeader("X-Generation-Time", new Date().toISOString());

      return res.send(imageBuffer);
    } catch (error) {
      console.error("❌ Error during screenshot generation:", error);
      await browser.close();
      throw error;
    }
  } catch (error) {
    console.error("💥 Critical error generating chart image:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return res.status(500).json({
      error: "Failed to generate chart image",
      details: errorMessage,
      timestamp: new Date().toISOString(),
      troubleshooting: {
        chromeMissing: "Ensure Chrome/Chromium is installed in your environment",
        timeout: "Chart may be taking too long to load - check Supabase connection",
        permissions: "Ensure --no-sandbox flags are set for serverless environments",
        memory: "Serverless functions may have memory limits - consider external service",
        cors: "Check that embed page is accessible from API route",
      },
      stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
    });
  }
}
