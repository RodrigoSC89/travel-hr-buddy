# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/ead06aad-a7d4-45d3-bdf7-e23796c6ac50

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ead06aad-a7d4-45d3-bdf7-e23796c6ac50) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Configure environment variables
cp .env.example .env
# Edit .env with your API keys - see .env.example for details

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

### Environment Variables

This project requires several API keys to function properly. Copy `.env.example` to `.env` and configure:

**Required:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

**Optional (for enhanced features):**
- **Maps & Weather:**
  - `VITE_MAPBOX_TOKEN` - Mapbox API token for interactive maps
  - `VITE_OPENWEATHER_API_KEY` - OpenWeather API key for weather data
  - `WINDY_API_KEY` - Windy API key (future integration)
- **Other Services:**
  - `VITE_OPENAI_API_KEY` - OpenAI API key for AI features
  - `VITE_AMADEUS_API_KEY` - Amadeus API key for travel data
  - `VITE_ELEVENLABS_API_KEY` - ElevenLabs API key for voice features

For Supabase Edge Functions, also configure these in your Supabase Dashboard under Edge Functions Secrets:
- `MAPBOX_PUBLIC_TOKEN` - For mapbox-token function
- `OPENWEATHER_API_KEY` - For weather-integration and maritime-weather functions

See `.env.example` for complete configuration details.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

### Quick Deploy Options

1. **Lovable (Easiest):**
   - Open [Lovable](https://lovable.dev/projects/ead06aad-a7d4-45d3-bdf7-e23796c6ac50)
   - Click Share → Publish

2. **Vercel (Recommended for Production):**
   ```bash
   npm run deploy:vercel
   ```
   Or connect your GitHub repository to Vercel for automatic deployments.

3. **Manual Deployment:**
   ```bash
   npm run build
   # Upload the dist/ folder to your hosting provider
   ```

### Deployment Documentation

**🚀 Start Here:**
- **[VERCEL_QUICK_START.md](./VERCEL_QUICK_START.md)** - 5-minute visual setup guide

**📚 Comprehensive Guides:**
- **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - Quick deployment guide for all platforms
- **[VERCEL_SETTINGS_CHECKLIST.md](./VERCEL_SETTINGS_CHECKLIST.md)** - Interactive settings checklist
- **[VERCEL_OPTIMIZATION_GUIDE.md](./VERCEL_OPTIMIZATION_GUIDE.md)** - Performance optimization strategies
- **[VERCEL_DEPLOYMENT_READINESS.md](./VERCEL_DEPLOYMENT_READINESS.md)** - Complete deployment readiness checklist
- **[DEPLOYMENT_CONFIG_REPORT.md](./DEPLOYMENT_CONFIG_REPORT.md)** - Detailed configuration report

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
