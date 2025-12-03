# Admin Wall - CI/CD TV Panel

## Overview

The Admin Wall is a real-time CI/CD monitoring dashboard designed to be displayed on a TV or large monitor. It provides instant visibility into build statuses, test results, and deployment pipelines.

## Features

### ✅ Real-time Updates
- **Supabase Realtime**: Automatically updates when new test results are inserted into the database
- **Live Status Indicators**: Visual representation of build success, failures, and in-progress builds
- **Auto-refresh**: No manual refresh needed

### 💾 Offline Cache
- **localStorage Persistence**: Saves data locally for offline viewing
- **Automatic Fallback**: If the network connection fails, displays cached data
- **Visual Indicator**: Shows "📴 Modo Offline" badge when operating offline
- **Auto-recovery**: Automatically returns to online mode when connection is restored

### 🌙 Dark Mode
- **Time-based**: Automatically enables dark mode between 6 PM and 6 AM
- **Eye-friendly**: Reduces eye strain during night shifts
- **Automatic Transition**: No manual intervention required

### 🔔 Alert System
- **Sound Alerts**: Plays an audio alert when builds fail
- **Mute Toggle**: Option to mute/unmute sound alerts
- **Slack Integration**: Sends failure notifications to Slack webhook
- **Telegram Integration**: Sends failure notifications to Telegram bot
- **Smart Deduplication**: Prevents duplicate alerts for the same commit

### 📊 Visual Dashboard
- **Build Statistics**: Shows count of successful, failed, and in-progress builds
- **Recent Builds Grid**: Displays up to 12 most recent builds
- **Color-coded Status**: Easy identification of build status at a glance
- **Coverage Metrics**: Shows test coverage percentage when available
- **Branch Information**: Displays branch name and commit hash

## Setup

### 1. Database Setup

Create a `test_results` table in Supabase:

```sql
CREATE TABLE test_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'in_progress')),
  commit_hash TEXT NOT NULL,
  coverage_percent NUMERIC,
  triggered_by TEXT,
  workflow_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE test_results;

-- Create index for better performance
CREATE INDEX idx_test_results_created_at ON test_results(created_at DESC);
CREATE INDEX idx_test_results_status ON test_results(status);
```

### 2. Environment Variables

Add the following to your `.env` file:

```bash
# Supabase (required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# Slack Webhook (optional)
VITE_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Telegram Bot (optional)
VITE_TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
VITE_TELEGRAM_CHAT_ID=-1001234567890
```

### 3. Alert Sound

Place an `alert.mp3` file in the `public/` directory. This audio file will be played when a build fails. You can:

- Use a short (1-2 second) alert/beep sound
- Download free sounds from [Freesound.org](https://freesound.org/) or [Mixkit](https://mixkit.co/free-sound-effects/alert/)
- Generate one using audio editing software

The feature will work without the audio file, but the sound alert won't play.

### 4. CI/CD Integration

To send test results to the wall, integrate with your CI/CD pipeline:

#### GitHub Actions Example

```yaml
name: CI Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Tests
        run: npm test
        
      - name: Report to Wall
        if: always()
        run: |
          curl -X POST "${{ secrets.SUPABASE_URL }}/rest/v1/test_results" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{
              "branch": "${{ github.ref_name }}",
              "status": "${{ job.status }}",
              "commit_hash": "${{ github.sha }}",
              "triggered_by": "${{ github.event_name }}",
              "workflow_name": "${{ github.workflow }}"
            }'
```

## Usage

### Accessing the Wall

Navigate to `/admin/wall` in your browser:
```
https://your-app.com/admin/wall
```

### Recommended Display Setup

1. **Full-screen mode**: Press F11 to enter full-screen mode
2. **Large monitor/TV**: Best viewed on monitors 32" or larger
3. **Auto-refresh disabled**: The page updates automatically via WebSockets
4. **Kiosk mode**: Use browser kiosk mode for permanent displays

### Controls

- **Mute/Unmute Button**: Toggle sound alerts on/off
- **Offline Indicator**: Appears automatically when connection is lost

## Architecture

### Data Flow

```
CI/CD Pipeline → Supabase Database → Realtime Subscription → Wall Display
                      ↓
                 localStorage (cache)
```

### Components

- **Frontend**: React + TypeScript
- **Real-time**: Supabase Realtime (WebSocket)
- **Storage**: localStorage (browser)
- **Notifications**: Slack Webhook, Telegram Bot API
- **Audio**: HTML5 Audio API

### Performance

- **Lightweight**: Only displays last 50 results from database
- **Efficient updates**: Uses Supabase Realtime instead of polling
- **Local caching**: Reduces database queries
- **Lazy loading**: Page is lazy-loaded via React.lazy()

## Troubleshooting

### No data displayed
- Check Supabase credentials in `.env`
- Verify `test_results` table exists
- Ensure real-time is enabled on the table

### Offline mode persists
- Check network connectivity
- Verify Supabase URL is correct
- Check browser console for errors

### Sound alerts not working
- Ensure `alert.mp3` exists in `public/` directory
- Check browser audio permissions
- Verify audio is not muted

### Notifications not sent
- Verify Slack/Telegram credentials in `.env`
- Check webhook/bot token is valid
- Review browser console for API errors

## Future Enhancements

Potential features to add:

- ✅ Auto-carousel mode for rotating through different views
- 📅 Branch filters directly on the wall
- 📈 Historical trends and metrics
- 🎨 Customizable themes
- 📱 Mobile-responsive layout
- 🔐 Authentication/authorization
- 📊 Advanced analytics dashboard

## Contributing

To contribute to this feature:

1. Test thoroughly on different screen sizes
2. Ensure offline mode works correctly
3. Verify real-time updates function properly
4. Check notification integrations
5. Update this documentation as needed

## License

This feature is part of the Travel HR Buddy project.
