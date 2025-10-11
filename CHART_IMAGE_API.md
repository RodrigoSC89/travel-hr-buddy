# Chart Image API Quick Reference

## Quick Start

### Access Embed Page
```
http://localhost:5173/embed/restore-chart
```

### Generate Chart Image (Development)
```bash
curl http://localhost:5173/api/generate-chart-image
```

### Generate Chart Image (Production)
```bash
export PUPPETEER_ENABLED=true
npm install puppeteer
curl http://localhost:5173/api/generate-chart-image > chart.png
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_APP_URL` | No | `http://localhost:5173` | Base URL for the application |
| `PUPPETEER_ENABLED` | No | `false` | Enable Puppeteer image generation |
| `PUPPETEER_EXECUTABLE_PATH` | No | Auto | Path to Chrome/Chromium binary |

## API Responses

### Development Mode (PUPPETEER_ENABLED=false)
```json
{
  "success": true,
  "embedUrl": "http://localhost:5173/embed/restore-chart",
  "message": "Puppeteer disabled. Use this URL to capture screenshot manually...",
  "instructions": {
    "manual": "Open embedUrl in browser and take screenshot",
    "api": "Set PUPPETEER_ENABLED=true and ensure puppeteer is installed"
  }
}
```

### Production Mode (PUPPETEER_ENABLED=true)
```
Content-Type: image/png
Cache-Control: public, max-age=300, s-maxage=300

[PNG image data]
```

### Error Response
```json
{
  "error": "Failed to generate chart image",
  "details": "Navigation timeout of 30000 ms exceeded",
  "troubleshooting": {
    "chromeMissing": "Ensure Chrome/Chromium is installed in your environment",
    "timeout": "Chart may be taking too long to load - check Supabase connection",
    "permissions": "Ensure --no-sandbox flags are set for serverless environments"
  }
}
```

## Deployment Commands

### Vercel
```bash
npm install chrome-aws-lambda puppeteer-core
vercel --prod
```

### Supabase Edge Function
```bash
supabase functions deploy generate-chart-image
```

### Docker
```bash
docker build -t chart-api .
docker run -p 5173:5173 -e PUPPETEER_ENABLED=true chart-api
```

## Integration Snippets

### Email with Nodemailer
```typescript
const response = await fetch("http://localhost:5173/api/generate-chart-image");
const imageBuffer = await response.arrayBuffer();

await transporter.sendMail({
  to: "team@company.com",
  subject: "Daily Restore Metrics",
  attachments: [{
    filename: "restore-chart.png",
    content: Buffer.from(imageBuffer),
  }],
});
```

### Slack Upload
```typescript
const response = await fetch("http://localhost:5173/api/generate-chart-image");
const imageBuffer = await response.arrayBuffer();

await slack.files.upload({
  channels: "C123456",
  file: Buffer.from(imageBuffer),
  filename: "restore-chart.png",
});
```

### Scheduled with Cron
```typescript
cron.schedule("0 9 * * *", async () => {
  const response = await fetch("http://localhost:5173/api/generate-chart-image");
  const imageBuffer = await response.arrayBuffer();
  fs.writeFileSync(`chart-${Date.now()}.png`, Buffer.from(imageBuffer));
});
```

## Component Features

### RestoreChartEmbed
- ✅ Fixed 600x300px dimensions
- ✅ Fetches from `get_restore_count_by_day_with_email` RPC
- ✅ Date format: dd/MM (Brazilian)
- ✅ Color: #3b82f6 (blue)
- ✅ Sets `window.chartReady` when loaded
- ✅ Renders outside SmartLayout (no auth/navigation)

## Testing

```bash
# All tests (114 total)
npm run test

# Embed component tests only (8 tests)
npm run test -- src/tests/pages/embed/RestoreChartEmbed.test.tsx
```

## File Locations

| File | Purpose |
|------|---------|
| `src/pages/embed/RestoreChartEmbed.tsx` | React embed component |
| `pages/api/generate-chart-image.ts` | Puppeteer API endpoint |
| `src/App.tsx` | Route configuration |
| `src/tests/pages/embed/RestoreChartEmbed.test.tsx` | Unit tests |
| `public/embed-restore-chart.html` | Static HTML fallback |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot find module 'puppeteer'" | `npm install puppeteer` or disable PUPPETEER_ENABLED |
| "Navigation timeout" | Check Supabase connection, increase timeout |
| "Chrome not found" | Install chromium, set PUPPETEER_EXECUTABLE_PATH |
| Empty chart | Wait for `window.chartReady` flag |

## Performance

- **Embed load time**: < 2 seconds to chartReady
- **Screenshot generation**: < 5 seconds
- **Cache duration**: 5 minutes
- **Viewport**: 1200x600 (2x for retina)

## Support

See `EMBED_CHART_IMPLEMENTATION.md` for:
- Detailed deployment guides
- Architecture decisions
- Integration examples
- Future enhancements
