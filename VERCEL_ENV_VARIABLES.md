# Vercel Environment Variables Configuration

## Required Environment Variables

Configure these variables in Vercel → Settings → Environment Variables for both **Production** and **Preview** environments:

### Application URL
- **Name:** `VITE_APP_URL`
- **Value:** `https://travel-hr-buddy.vercel.app` (or your custom domain)
- **Environment:** Production + Preview

### Supabase Configuration
- **Name:** `SUPABASE_URL`
- **Value:** `https://<your-project>.supabase.co`
- **Environment:** Production + Preview

- **Name:** `SUPABASE_ANON_KEY`
- **Value:** Your Supabase anonymous/public key
- **Environment:** Production + Preview

### MQTT Configuration
- **Name:** `VITE_MQTT_URL`
- **Value:** `wss://broker.hivemq.com:8884/mqtt`
- **Environment:** Production + Preview

## Optional Environment Variables

### Sentry (Error Tracking)
- **Name:** `SENTRY_ORG`
- **Value:** Your Sentry organization name
- **Environment:** Production

- **Name:** `SENTRY_PROJECT`
- **Value:** Your Sentry project name
- **Environment:** Production

- **Name:** `SENTRY_AUTH_TOKEN`
- **Value:** Your Sentry authentication token
- **Environment:** Production

## Verification

After setting up environment variables:

1. Push changes to trigger a new deployment
2. Check deployment logs in Vercel dashboard
3. Verify the application loads correctly
4. Check browser console for any missing environment variable warnings

## Build Configuration

The application uses these build settings in Vercel:

- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm ci` or `npm install`
- **Node Version:** 22.x

## Troubleshooting

If builds fail:

1. Check that all required environment variables are set
2. Clear build cache in Vercel settings
3. Run `npm run sync:vercel` locally to test build process
4. Review deployment logs for specific errors
