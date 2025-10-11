import type { NextApiRequest, NextApiResponse } from "./next-types";
import puppeteer from "puppeteer";

/**
 * API Route: Generate Chart Image
 * 
 * This is a reference implementation showing how to capture the restore chart
 * as an image using Puppeteer in a Next.js-like environment.
 * 
 * For Vercel serverless functions, you may need to use @vercel/og or chrome-aws-lambda
 * instead of regular puppeteer due to serverless environment constraints.
 * 
 * For production use with Vercel, consider:
 * - Using Supabase Edge Function with Deno's puppeteer support
 * - Using @vercel/og for generating OG images
 * - Using a dedicated service like Cloudflare Workers with Puppeteer
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Launch browser with appropriate flags for serverless
    const browser = await puppeteer.launch({ 
      headless: "new", 
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu"
      ] 
    });
    
    const page = await browser.newPage();
    
    // Set viewport for consistent rendering
    await page.setViewport({
      width: 700,
      height: 400,
      deviceScaleFactor: 2, // For better quality
    });

    // Navigate to the embed page
    // In production, replace with your actual domain
    const embedUrl = process.env.NEXT_PUBLIC_APP_URL 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/embed/restore-chart`
      : "http://localhost:8080/embed/restore-chart";
    
    await page.goto(embedUrl, { 
      waitUntil: "networkidle0",
      timeout: 30000 
    });

    // Wait for the chart to be rendered
    await page.waitForSelector("canvas", { timeout: 10000 });
    
    // Take screenshot of the page
    const imageBuffer = await page.screenshot({ 
      type: "png", 
      fullPage: false 
    });

    await browser.close();

    // Set response headers
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", "inline; filename=restore-chart.png");
    res.setHeader("Cache-Control", "public, max-age=300"); // Cache for 5 minutes
    
    res.send(imageBuffer);
  } catch (error) {
    console.error("Error generating chart image:", error);
    res.status(500).json({ 
      error: "Failed to generate chart image",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
