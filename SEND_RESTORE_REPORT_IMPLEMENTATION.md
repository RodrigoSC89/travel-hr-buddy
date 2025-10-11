# Send Restore Report Feature - Implementation Summary

## Overview
This feature enables sending restore chart reports via email using SendGrid. It adds a visual chart to the restore logs dashboard and allows users to export and email the chart as a PNG attachment.

## Changes Implemented

### 1. Supabase Edge Function
**File**: `supabase/functions/send-restore-report/index.ts`
- Created a Deno-based edge function to handle email sending via SendGrid API
- Accepts base64 encoded PNG image
- Sends email with chart as attachment to configurable recipient
- Includes error handling and CORS support

### 2. Frontend Updates
**File**: `src/pages/admin/documents/restore-logs.tsx`

Added functionality:
- **Chart Visualization**: Bar chart showing restore count by date (last 10 days)
- **Chart Capture**: Uses html2canvas to convert chart to PNG image
- **Email Sending**: Function to capture and send chart via Supabase Edge Function
- **UI Button**: "📩 Enviar gráfico por e-mail" button added to dashboard

New imports:
- `html2canvas` - For capturing chart as image
- `recharts` components - For chart visualization
- `useToast` hook - For user notifications

New state/refs:
- `chartRef` - Reference to chart DOM element for capture

New functions:
- `sendEmailWithChart()` - Captures chart and sends email
- Chart data processing - Groups restore logs by date

### 3. Environment Configuration
**File**: `.env.example`
- Added `SENDGRID_API_KEY` environment variable

### 4. Dependencies
**Added**: `@sendgrid/mail` package (dev dependency)

## Configuration Required

### 1. SendGrid Setup
1. Create a SendGrid account at https://sendgrid.com
2. Generate an API key with "Mail Send" permissions
3. Verify the sender email (noreply@nautilusone.com)
4. Add API key to Supabase secrets:
   ```bash
   supabase secrets set SENDGRID_API_KEY=your-api-key-here
   ```

### 2. Deploy Edge Function
```bash
supabase functions deploy send-restore-report
```

### 3. Environment Variables
Add to your Supabase project:
- `SENDGRID_API_KEY` - Your SendGrid API key

## API Endpoint

### POST `/functions/v1/send-restore-report`

**Request Body**:
```json
{
  "imageBase64": "data:image/png;base64,iVBORw0KG...",
  "toEmail": "admin@empresa.com"  // Optional, defaults to admin@empresa.com
}
```

**Response (Success)**:
```json
{
  "message": "Email enviado com sucesso.",
  "timestamp": "2025-10-11T17:33:42.495Z"
}
```

**Response (Error)**:
```json
{
  "error": "Error message",
  "timestamp": "2025-10-11T17:33:42.495Z"
}
```

## Features

### Chart Visualization
- **Type**: Bar chart showing restore count per day
- **Data**: Last 10 days of restore activity
- **Responsive**: Adapts to screen size
- **Filters**: Respects email and date range filters

### Email Report
- **Format**: PNG image attachment
- **Recipient**: Configurable (defaults to admin@empresa.com)
- **Subject**: "📊 Restore Chart Report - Nautilus One"
- **Content**: Plain text message with chart attachment
- **Sender**: noreply@nautilusone.com

## User Flow

1. User navigates to `/admin/documents/restore-logs`
2. System displays restore logs list and chart
3. User can apply filters (email, date range)
4. Chart updates based on filters
5. User clicks "📩 Enviar gráfico por e-mail" button
6. System captures chart as PNG using html2canvas
7. System sends chart to backend edge function
8. Edge function sends email via SendGrid API
9. User receives success/error notification via toast

## Testing

### Manual Testing Steps
1. Ensure SENDGRID_API_KEY is configured in Supabase
2. Navigate to restore logs page
3. Verify chart displays with restore data
4. Click email button
5. Check for success toast notification
6. Verify email received at configured address

### Error Scenarios
- Missing SENDGRID_API_KEY: Returns error message
- Invalid email address: SendGrid API error
- No chart data: Button still works, sends empty chart
- Network failure: Error toast displayed to user

## Architecture Notes

### Why Supabase Edge Function?
This is a **Vite + React + Supabase** project, not Next.js. While the problem statement mentioned Next.js API routes, this implementation:
- Uses Supabase Edge Functions (Deno runtime) instead
- Provides the same functionality as the requested Next.js route
- Integrates seamlessly with the existing architecture
- Uses fetch API instead of @sendgrid/mail (compatible with Deno)

### Why html2canvas?
- Already installed in the project
- Simple API for DOM to image conversion
- Works well with Recharts components
- No additional dependencies needed

## Future Enhancements

Possible improvements:
1. Email recipient customization UI
2. Schedule recurring email reports
3. Multiple chart formats (PDF, SVG)
4. Custom email templates with HTML
5. Batch email sending to multiple recipients
6. Chart customization options (colors, size, type)
7. Email history/audit log

## Security Considerations

- ✅ API key stored in Supabase secrets (not exposed to client)
- ✅ CORS headers properly configured
- ✅ Input validation for image data
- ✅ Error messages don't expose sensitive information
- ⚠️ No rate limiting implemented (should be added)
- ⚠️ No authentication check on edge function (relies on Supabase RLS)

## Related Files

- `supabase/functions/send-restore-report/index.ts` - Edge function
- `src/pages/admin/documents/restore-logs.tsx` - Frontend implementation
- `.env.example` - Environment variable template
- `package.json` - Dependencies

## Documentation References

- [SendGrid API Documentation](https://docs.sendgrid.com/api-reference/mail-send/mail-send)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [html2canvas Documentation](https://html2canvas.hertzen.com/)
- [Recharts Documentation](https://recharts.org/)
