# IMO Watch & Compliance Alerts Module

**PATCH 634** - Monitoramento de fontes externas IMO, Equasis, Paris MoU e PSC

## Overview

The IMO Watch & Compliance Alerts module provides real-time monitoring of external maritime compliance sources, alerting systems for inspections and detentions, and comprehensive reporting capabilities.

## Features

### 🔔 Alert System
- Real-time alerts from IMO, Equasis, Paris MoU, USCG, and PSC
- Severity-based classification (Info, Warning, Critical, Urgent)
- Automated alert aggregation and deduplication
- Custom alert preferences per vessel

### 🌐 Watchlist Management
- Vessel watchlist with risk levels
- Company-wide monitoring
- Automated detention/inspection tracking
- Historical trend analysis

### 📊 PSC Monitoring
- Port State Control inspection tracking
- Deficiency code analysis
- Detention statistics and trends
- MoU region compliance tracking

### 📄 Compliance Reporting
- Reports by flag, company, or vessel
- Detention rate and deficiency rate tracking
- Risk scoring and trend analysis
- Top deficiency identification

### 🤖 Nautilus Copilot Integration
- AI-powered explanation of alerts
- Contextual recommendations
- Automated risk assessment
- Natural language compliance queries

## External Sources

### Supported Data Sources
1. **IMO (International Maritime Organization)**
   - RSS feed monitoring
   - MSC/MEPC circulars
   - Amendments and resolutions

2. **Paris MoU**
   - Inspection database
   - Detention records
   - Deficiency codes

3. **Tokyo MoU**
   - Asia-Pacific PSC inspections
   - Detention statistics

4. **USCG (United States Coast Guard)**
   - PSIX database
   - Boarding reports

5. **Equasis**
   - Vessel performance data
   - Safety ratings

## Database Schema

### Tables
- `imo_alerts` - Alert records from external sources
- `vessel_watchlist` - Monitored vessels
- `psc_inspections` - Port State Control inspections
- `compliance_reports` - Generated compliance reports
- `external_feed_config` - Feed configuration and status

## File Structure

```
src/modules/intelligence/imo-watch/
├── types.ts              # Type definitions
├── feed-connectors.ts    # External feed integration
├── alert-service.ts      # Alert management (to be created)
├── watchlist-service.ts  # Watchlist management (to be created)
├── reporting.ts          # Compliance reporting (to be created)
└── README.md             # This file
```

## Usage

### Polling External Feeds

```typescript
import { pollAllFeeds } from '@/modules/intelligence/imo-watch/feed-connectors';

const result = await pollAllFeeds();
console.log(`Fetched ${result.totalAlerts} alerts and ${result.totalInspections} inspections`);
```

### Managing Watchlist

```typescript
import { VesselWatchlist } from '@/modules/intelligence/imo-watch/types';

const watchlistEntry: VesselWatchlist = {
  vessel_imo_number: "9876543",
  vessel_name: "MV Example",
  risk_level: "high",
  alert_preferences: {
    notify_on_detention: true,
    email_notifications: true
  }
  // ...
};
```

## API Endpoints

### Feed Management
- Poll all feeds: `POST /api/imo-watch/poll`
- Get feed status: `GET /api/imo-watch/feeds/status`

### Alerts
- List alerts: `GET /api/imo-watch/alerts`
- Acknowledge alert: `POST /api/imo-watch/alerts/:id/acknowledge`

### Watchlist
- Add to watchlist: `POST /api/imo-watch/watchlist`
- Get watchlist: `GET /api/imo-watch/watchlist`

## Alert Severity Levels

- **Urgent**: Immediate action required (detentions, bans)
- **Critical**: High priority (major non-conformities)
- **Warning**: Medium priority (amendments, compliance issues)
- **Info**: General notifications (circulars, updates)

## Integration

### System Watchdog
- Alert escalation
- Automated notifications
- Compliance tracking

### Nautilus Copilot
- AI-powered alert analysis
- Contextual recommendations
- Natural language queries

## References

- IMO Website: https://www.imo.org
- Paris MoU: https://www.parismou.org
- Tokyo MoU: http://www.tokyo-mou.org
- USCG PSIX: https://www.dco.uscg.mil/psix/

---

**Version**: 1.0.0  
**Patch**: 634  
**Status**: 🚧 In Development  
**Last Updated**: 2025-11-04
