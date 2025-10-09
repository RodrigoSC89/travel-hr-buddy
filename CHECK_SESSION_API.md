# Check Session API Endpoint

## Overview
This endpoint checks the current Supabase authentication session.

## Endpoint
`GET /api/auth/check-session`

## Description
- Uses Supabase to retrieve the current session
- Returns session as JSON
- Returns HTTP 500 with error message if there's an issue
- Returns HTTP 200 with `{ session: null }` if no authorization header is provided
- Returns HTTP 200 with `{ session: { user } }` if a valid session exists

## Usage

### Request
```bash
GET /api/auth/check-session
Headers:
  Authorization: Bearer <access_token>
```

### Response (Authenticated)
```json
{
  "session": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      ...
    }
  }
}
```

### Response (Not Authenticated)
```json
{
  "session": null
}
```

### Response (Error)
```json
{
  "error": "Error message"
}
```

## Testing
The endpoint can be tested from the **API Tester** page at `/admin/api-tester`.

### What it tests:
1. ✅ If the session is active
2. ✅ If Supabase keys are configured correctly
3. ✅ If the user is authenticated

## Implementation Details
- Built as a Vercel serverless function
- Uses `@vercel/node` types for TypeScript support
- Integrates with Supabase auth system
- Validates JWT tokens from the Authorization header

## Environment Variables Required
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase anonymous/public key

## Files
- API Endpoint: `/api/auth/check-session.ts`
- Service Test: `/src/services/supabase-session.ts`
- UI Integration: `/src/pages/admin/api-tester.tsx`
