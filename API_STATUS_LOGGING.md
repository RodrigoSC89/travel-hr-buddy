# API Status Logging

## 📋 Overview

This feature allows logging API status checks to a file for monitoring and debugging purposes.

## 🚀 Implementation

### Endpoint: `/api/log-api-status`

- **Method**: POST
- **Location**: `/api/log-api-status.ts`
- **Type**: Vercel Serverless Function

### Log File

- **Path**: `/logs/api-status-log.json`
- **Format**: JSON array with comma-separated entries
- **Auto-created**: Directory is created automatically if it doesn't exist

### Payload Format

```json
{
  "timestamp": "2025-10-10T00:00:00.000Z",
  "status": [
    {
      "id": "mapbox",
      "name": "Mapbox",
      "status": "connected",
      "responseTime": 145,
      "lastTest": "2025-10-10T00:00:00.000Z"
    },
    // ... more services
  ]
}
```

## 🧪 How to Test

### Option 1: Using the UI

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:5173/admin/control-panel`

3. Click on the "APIs" tab

4. Click the "🔁 Testar Todas" button

5. Check the logs:
   ```bash
   cat logs/api-status-log.json
   ```

### Option 2: Using curl (Local Development)

```bash
curl -X POST http://localhost:5173/api/log-api-status \
  -H "Content-Type: application/json" \
  -d '[
    {
      "id": "test-api",
      "name": "Test API",
      "status": "connected",
      "responseTime": 100,
      "lastTest": "2025-10-10T00:00:00.000Z"
    }
  ]'
```

### Option 3: Using curl (Production/Vercel)

```bash
curl -X POST https://your-domain.vercel.app/api/log-api-status \
  -H "Content-Type: application/json" \
  -d '[
    {
      "id": "test-api",
      "name": "Test API",
      "status": "connected",
      "responseTime": 100,
      "lastTest": "2025-10-10T00:00:00.000Z"
    }
  ]'
```

## 📦 Files Modified

1. **`/api/log-api-status.ts`** (NEW)
   - Serverless function that handles POST requests
   - Creates log directory if needed
   - Appends status entries to JSON file

2. **`/src/components/admin/APIStatus.tsx`** (MODIFIED)
   - Updated `handleRefresh` function
   - Sends POST request to logging endpoint after testing APIs
   - Includes error handling for failed logging attempts

3. **`package.json`** (MODIFIED)
   - Added `@vercel/node` as dev dependency for TypeScript types

## ⚙️ Configuration

### .gitignore

The `/logs` directory is already included in `.gitignore` to prevent log files from being committed to the repository.

### Vercel Deployment

When deployed to Vercel, the serverless function will be automatically available at `/api/log-api-status`.

**Note**: In a serverless environment like Vercel, file writes are ephemeral and will not persist between function invocations. For production use, consider:
- Using a database (e.g., Supabase, PostgreSQL)
- Using a logging service (e.g., Logtail, Papertrail)
- Using Vercel's built-in logging

## 🎯 Next Steps

For production use, consider implementing:
- Persistent storage (database instead of file system)
- Log rotation and archiving
- Authentication/authorization for the endpoint
- Rate limiting
- Log analysis and alerting
