# OAuth Integration Implementation Guide

## Overview
This guide provides complete implementation details for OAuth2 integration with Google Drive, Outlook, and Slack. The OAuth service handles authentication flows, credential management, and event logging.

## Architecture

### Components
1. **OAuthService** (`src/services/oauth-service.ts`) - Core OAuth2 implementation
2. **IntegrationsHub** (`src/components/integrations/integrations-hub.tsx`) - UI component
3. **Database Tables** - Credential and log storage

### Security Features
- **CSRF Protection**: State parameter validation prevents cross-site request forgery
- **Encrypted Storage**: Credentials stored securely in Supabase
- **Token Refresh**: Automatic refresh of expired tokens
- **Audit Logging**: All events tracked for compliance

## Database Schema

### Required Tables

#### integration_credentials
```sql
CREATE TABLE integration_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Enable RLS
ALTER TABLE integration_credentials ENABLE ROW LEVEL SECURITY;

-- Users can only access their own credentials
CREATE POLICY "Users can manage own credentials"
  ON integration_credentials
  FOR ALL
  USING (auth.uid() = user_id);
```

#### integration_logs
```sql
CREATE TABLE integration_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  event TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_integration_logs_user_provider ON integration_logs(user_id, provider);
CREATE INDEX idx_integration_logs_timestamp ON integration_logs(timestamp DESC);

-- Enable RLS
ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own logs
CREATE POLICY "Users can view own logs"
  ON integration_logs
  FOR SELECT
  USING (auth.uid() = user_id);
```

## Environment Variables

Create a `.env` file with the following variables:

```bash
# Google Drive OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret

# Outlook OAuth
VITE_OUTLOOK_CLIENT_ID=your_outlook_client_id
VITE_OUTLOOK_CLIENT_SECRET=your_outlook_client_secret

# Slack OAuth
VITE_SLACK_CLIENT_ID=your_slack_client_id
VITE_SLACK_CLIENT_SECRET=your_slack_client_secret
```

### Obtaining OAuth Credentials

#### Google Drive
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Drive API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5173/auth/callback/google`
6. Copy Client ID and Client Secret

#### Outlook
1. Go to [Azure Portal](https://portal.azure.com/)
2. Register a new application in Azure AD
3. Add Microsoft Graph API permissions (Mail.Read, Mail.Send, Calendars.Read)
4. Add redirect URI: `http://localhost:5173/auth/callback/outlook`
5. Create client secret
6. Copy Application (client) ID and client secret

#### Slack
1. Go to [Slack API](https://api.slack.com/apps)
2. Create a new app
3. Add OAuth scopes (channels:read, chat:write, users:read, files:write)
4. Add redirect URI: `http://localhost:5173/auth/callback/slack`
5. Copy Client ID and Client Secret

## Usage Examples

### Initiating OAuth Flow

```typescript
import { OAuthService } from '@/services/oauth-service';

// Button click handler
const handleConnect = async () => {
  try {
    await OAuthService.initiateOAuth('google_drive');
    // User will be redirected to Google's OAuth page
  } catch (error) {
    console.error('Failed to initiate OAuth:', error);
  }
};
```

### Handling OAuth Callback

```typescript
// In your callback route component
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { OAuthService } from '@/services/oauth-service';

export const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const provider = window.location.pathname.split('/').pop(); // e.g., 'google'
      
      if (code && state) {
        try {
          await OAuthService.handleCallback(
            `${provider}_drive` as any,
            code,
            state
          );
          // Redirect to success page
          window.location.href = '/integrations?success=true';
        } catch (error) {
          // Redirect to error page
          window.location.href = '/integrations?error=true';
        }
      }
    };
    
    handleCallback();
  }, [searchParams]);
  
  return <div>Processing authentication...</div>;
};
```

### Using Access Tokens

```typescript
// Get valid access token (automatically refreshes if expired)
const token = await OAuthService.getAccessToken('google_drive');

// Use token for API calls
const response = await fetch('https://www.googleapis.com/drive/v3/files', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Disconnecting Integration

```typescript
const handleDisconnect = async () => {
  try {
    await OAuthService.disconnect('google_drive');
    toast.success('Integration disconnected');
  } catch (error) {
    toast.error('Failed to disconnect');
  }
};
```

### Checking Connection Status

```typescript
const [isConnected, setIsConnected] = useState(false);

useEffect(() => {
  const checkStatus = async () => {
    const connected = await OAuthService.isConnected('google_drive');
    setIsConnected(connected);
  };
  checkStatus();
}, []);
```

### Viewing Integration Logs

```typescript
const [logs, setLogs] = useState([]);

useEffect(() => {
  const loadLogs = async () => {
    const logs = await OAuthService.getIntegrationLogs('google_drive', 50);
    setLogs(logs);
  };
  loadLogs();
}, []);
```

## Integration with Existing UI

Update the IntegrationsHub component to use OAuthService:

```typescript
import { OAuthService } from '@/services/oauth-service';

const handleToggleIntegration = async (integration: Integration) => {
  if (integration.isEnabled) {
    // Disconnect
    await OAuthService.disconnect(integration.id as any);
  } else {
    // Connect
    await OAuthService.initiateOAuth(integration.id as any);
  }
};
```

## Error Handling

The OAuth service throws errors in the following cases:
- Invalid state parameter (CSRF attack)
- Token exchange failure
- Missing credentials
- Network errors

Always wrap OAuth calls in try-catch blocks:

```typescript
try {
  await OAuthService.initiateOAuth('slack');
} catch (error) {
  if (error.message.includes('Invalid state')) {
    // Handle CSRF error
  } else if (error.message.includes('not configured')) {
    // Handle missing credentials
  } else {
    // Handle other errors
  }
}
```

## Security Best Practices

1. **Handle client secrets carefully**: In production, OAuth token exchange should be done server-side. The current implementation uses client secrets in environment variables for development convenience. For production:
   - Implement a backend OAuth proxy/handler
   - Never expose VITE_*_CLIENT_SECRET variables in production builds
   - Use server-side API routes to handle token exchange
   - Store client secrets only on the server
2. **Use HTTPS** in production for all OAuth flows
3. **Rotate credentials** periodically
4. **Monitor logs** for suspicious activity
5. **Implement rate limiting** on OAuth endpoints
6. **Validate redirect URIs** strictly

### Production Architecture Recommendation

For production deployments, implement a server-side OAuth handler:

```typescript
// Backend API endpoint: POST /api/oauth/exchange
export async function exchangeOAuthCode(provider: string, code: string) {
  // Client secret is only on server, never exposed to frontend
  const config = getServerOAuthConfig(provider);
  
  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret, // Only available server-side
      code,
      grant_type: 'authorization_code',
      redirect_uri: config.redirectUri
    })
  });
  
  return await response.json();
}
```

Then update the frontend OAuthService to call this backend endpoint instead of exchanging tokens directly.

## Testing

### Manual Testing Checklist
- [ ] OAuth flow completes successfully for each provider
- [ ] State parameter validation works
- [ ] Tokens are stored securely in database
- [ ] Token refresh works when expired
- [ ] Disconnect removes credentials
- [ ] Events are logged correctly
- [ ] Error handling works properly

### Integration Tests
Create tests for:
- State generation and validation
- Token storage and retrieval
- Token refresh mechanism
- Error scenarios

## Production Deployment

1. Update redirect URIs in OAuth provider settings
2. Set environment variables in production
3. Enable HTTPS
4. Configure CORS properly
5. Set up monitoring for OAuth events
6. Document OAuth setup for team

## Troubleshooting

### "OAuth not configured" error
- Verify environment variables are set
- Check `.env` file is loaded
- Restart development server

### "Invalid state parameter" error
- Clear browser cache
- Check for clock synchronization issues
- Verify state timeout (10 minutes)

### "Token exchange failed" error
- Verify client ID and secret
- Check redirect URI matches exactly
- Ensure authorization code hasn't expired

## API Reference

See `src/services/oauth-service.ts` for complete API documentation.

### Main Methods
- `initiateOAuth(provider)` - Start OAuth flow
- `handleCallback(provider, code, state)` - Handle OAuth callback
- `getAccessToken(provider)` - Get valid access token
- `refreshToken(provider)` - Manually refresh token
- `disconnect(provider)` - Remove integration
- `isConnected(provider)` - Check connection status
- `getIntegrationLogs(provider, limit)` - Get event logs

## Support

For issues or questions:
1. Check logs in `integration_logs` table
2. Review environment variable configuration
3. Verify OAuth credentials in provider console
4. Check network requests in browser DevTools
