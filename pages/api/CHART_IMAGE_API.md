# Chart Image Generation API

This API endpoint generates PNG images from the restore chart by using Puppeteer to capture screenshots of the embed page.

## Overview

The implementation consists of two parts:

1. **Embed Page** (`/src/pages/embed/RestoreChartEmbed.tsx`): A minimalist page that displays only the restore chart without any UI chrome, designed specifically for automated capture.

2. **API Endpoint** (`/pages/api/generate-chart-image.ts`): A server-side function that uses Puppeteer to render the embed page and capture it as a PNG image.

## Embed Page

**URL**: `/embed/restore-chart`

The embed page is a clean, minimal React component that:
- Fetches restore data from Supabase using the `get_restore_count_by_day_with_email` RPC
- Renders a Bar chart using Chart.js and react-chartjs-2
- Has no navigation, headers, or other UI elements
- Is optimized for automated capture and embedding

### Features:
- Fixed dimensions: 600px × 300px
- Blue (#3b82f6) bar colors
- Date labels in dd/MM format
- Shows "Restaurações por dia" (Restores per day)

## API Endpoint

**URL**: `POST /api/generate-chart-image`

### Usage

This endpoint can be called to generate a PNG image of the restore chart.

```bash
# Simple GET request
curl http://localhost:8080/api/generate-chart-image > chart.png

# Or visit directly in browser
http://localhost:8080/api/generate-chart-image
```

### Response

- **Content-Type**: `image/png`
- **Cache-Control**: `public, max-age=300` (cached for 5 minutes)
- Returns the chart image as a PNG buffer

### Environment Variables

- `NEXT_PUBLIC_APP_URL`: The base URL of your application (defaults to `http://localhost:8080` in development)

## Implementation Details

### Puppeteer Configuration

The endpoint launches a headless Chrome browser with the following flags:
- `--no-sandbox`: Required for serverless environments
- `--disable-setuid-sandbox`: Additional security flag for containers
- `--disable-dev-shm-usage`: Prevents memory issues in Docker/serverless
- `--disable-accelerated-2d-canvas`: Improves compatibility
- `--no-first-run`, `--no-zygote`, `--disable-gpu`: Performance optimizations

### Viewport Settings

- Width: 700px
- Height: 400px
- Device Scale Factor: 2 (for high-quality/retina displays)

### Timeout Settings

- Page navigation: 30 seconds
- Canvas element wait: 10 seconds

## Deployment Considerations

### Vercel

For Vercel deployment, consider these alternatives:

1. **chrome-aws-lambda**: A slim Chromium binary optimized for AWS Lambda and Vercel
   ```bash
   npm install chrome-aws-lambda puppeteer-core
   ```

2. **@vercel/og**: For simpler OG image generation without full browser
   ```bash
   npm install @vercel/og
   ```

### Supabase Edge Function

For a serverless Deno implementation:

```typescript
// supabase/functions/generate-chart-image/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

serve(async (req) => {
  // Use Deno's built-in fetch or a headless browser library
  // Capture the embed page and return as image
});
```

### Docker

If deploying with Docker, ensure Chromium is installed:

```dockerfile
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-driver
```

## Scheduling with Supabase

You can schedule automated chart generation using Supabase Edge Functions with cron:

```typescript
// supabase/functions/scheduled-chart-capture/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  // Call the generate-chart-image endpoint
  const response = await fetch(`${Deno.env.get("APP_URL")}/api/generate-chart-image`);
  const imageBuffer = await response.arrayBuffer();
  
  // Store in Supabase Storage
  // Or email to stakeholders
  // Or post to Slack/Teams
});
```

Then configure in `supabase/functions/scheduled-chart-capture/cron.yaml`:

```yaml
- schedule: '0 9 * * 1' # Every Monday at 9 AM
  timezone: America/Sao_Paulo
```

## Testing

### Local Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit the embed page:
   ```
   http://localhost:8080/embed/restore-chart
   ```

3. Test the API endpoint:
   ```bash
   curl http://localhost:8080/api/generate-chart-image > test-chart.png
   ```

### Integration Testing

The endpoint can be tested programmatically:

```typescript
import { test, expect } from 'vitest';

test('generate chart image returns PNG', async () => {
  const response = await fetch('http://localhost:8080/api/generate-chart-image');
  expect(response.headers.get('content-type')).toBe('image/png');
  expect(response.status).toBe(200);
});
```

## Troubleshooting

### Common Issues

1. **Puppeteer fails to launch**: Ensure Chrome/Chromium is installed on the system
2. **Timeout errors**: Increase timeout values or check network connectivity
3. **Memory issues**: Use `--disable-dev-shm-usage` flag and increase available memory
4. **Canvas not found**: Ensure Chart.js is properly registered and data is loading

### Debug Mode

For debugging, you can disable headless mode temporarily:

```typescript
const browser = await puppeteer.launch({ 
  headless: false, // Shows browser window
  // ... other args
});
```

## Security Considerations

- Always validate and sanitize any user inputs if you extend this endpoint
- Consider rate limiting to prevent abuse
- Use authentication for production deployments
- Keep Puppeteer and Chrome up to date for security patches

## Related Files

- `/src/pages/embed/RestoreChartEmbed.tsx`: The embed page component
- `/src/pages/admin/documents/restore-dashboard.tsx`: Full dashboard with the chart
- `/src/App.tsx`: Route configuration
- `/pages/api/next-types.d.ts`: TypeScript definitions for Next.js API routes

## References

- [Puppeteer Documentation](https://pptr.dev/)
- [Chart.js Documentation](https://www.chartjs.org/)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
