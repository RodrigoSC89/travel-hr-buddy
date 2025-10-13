# Send Restore Dashboard Email Report

This Supabase Edge Function sends email reports for the Restore Audit Dashboard.

## Features

- Authenticates the user via session token
- Prepares HTML email with restore analytics data
- Includes summary statistics and daily data table
- Supports email filtering

## Request Body

```json
{
  "summary": {
    "total": 150,
    "unique_docs": 45,
    "avg_per_day": 10.5
  },
  "dailyData": [
    {
      "day": "2025-10-13",
      "count": 12
    }
  ],
  "filterEmail": "user@example.com",
  "generatedAt": "2025-10-13T14:00:00.000Z"
}
```

## Response

Success:
```json
{
  "success": true,
  "message": "Relatório preparado com sucesso...",
  "recipient": "user@example.com",
  "dataPoints": 15,
  "timestamp": "2025-10-13T14:00:00.000Z"
}
```

Error:
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

## Environment Variables

Required for production email sending:
- `EMAIL_FROM`: Sender email address
- `EMAIL_TO`: Default recipient email address

## Usage

Called from the Restore Dashboard page when user clicks "Enviar por E-mail" button.

## Production Integration

To enable actual email sending, integrate with:
- SendGrid
- Mailgun
- AWS SES
- Custom SMTP server

Replace the console.log statements with actual email sending logic.
