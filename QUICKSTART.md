# 🚀 Quick Start - Nautilus One

## ⚡ Instant Setup

```bash
# 1. Clone and install
git clone https://github.com/RodrigoSC89/travel-hr-buddy.git
cd travel-hr-buddy
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 3. Start development
npm run dev
```

## 🏥 Health Check

**Check if everything is configured correctly:**

```
http://localhost:8080/health
```

This page shows:
- ✅ System status
- 🔑 Required variables (Supabase)
- 🎁 Optional variables (Mapbox, OpenAI, etc.)
- 📝 Configuration help

## 📍 Key URLs

- **Local Dev**: http://localhost:8080
- **Health Check**: http://localhost:8080/health
- **Production**: https://your-deployment.vercel.app

## 🔑 Minimum Required Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-key-here
```

## 🎁 Optional Variables (Enhanced Features)

```env
VITE_MAPBOX_TOKEN=pk.eyJ...           # Maps
VITE_OPENAI_API_KEY=sk-proj-...      # AI Features
VITE_OPENWEATHER_API_KEY=...         # Weather
```

## 📦 Common Commands

```bash
npm run dev      # Start dev server (port 8080)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Check code quality
```

## 🐛 Troubleshooting

### App not loading?
1. Check `/health` page first
2. Verify `.env` file exists
3. Check browser console for errors

### Environment variables not working?
1. Restart dev server after changing `.env`
2. Clear cache: `rm -rf dist node_modules/.vite`
3. Rebuild: `npm run build`

### Build failing?
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📚 Documentation

- **Health Check Guide**: [HEALTH_CHECK_GUIDE.md](./HEALTH_CHECK_GUIDE.md)
- **API Keys Setup**: [API_KEYS_SETUP_GUIDE.md](./API_KEYS_SETUP_GUIDE.md)
- **Diagnostic Summary**: [DIAGNOSTIC_SUMMARY.md](./DIAGNOSTIC_SUMMARY.md)
- **Full README**: [README.md](./README.md)

## ✅ System Status

The application is **fully operational** and ready for:
- ✅ Local development
- ✅ Production deployment
- ✅ Testing and debugging

Visit `/health` to verify your setup!
