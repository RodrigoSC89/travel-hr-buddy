# 📊 STATUS PAGE UPDATE TEMPLATES

## Status Levels

| Status | Icon | When to Use |
|--------|------|-------------|
| Operational | 🟢 | All systems working normally |
| Degraded Performance | 🟡 | Slower than normal, but functional |
| Partial Outage | 🟠 | Some features not working |
| Major Outage | 🔴 | Most/all features unavailable |
| Maintenance | 🔵 | Planned maintenance window |

---

## 1. INVESTIGATING

**Title:** Investigating [Service] Issues

**Body:**
```
We are currently investigating reports of [issue description].

**Impact:** [Which features/users affected]
**Started:** [TIME] UTC

Our team is actively working to identify the root cause. We will provide an update within 30 minutes.

If you're experiencing issues, please try:
- Refreshing the page
- Clearing browser cache
- Using a different browser

We apologize for any inconvenience.
```

---

## 2. IDENTIFIED

**Title:** Issue Identified - [Service]

**Body:**
```
We have identified the cause of the [issue description].

**Root Cause:** [Brief explanation]
**Impact:** [Which features/users affected]
**Started:** [TIME] UTC

Our engineering team is implementing a fix. We expect resolution within [TIMEFRAME].

**Workaround:** [If available]

Next update in 30 minutes.
```

---

## 3. MONITORING

**Title:** Fix Deployed - Monitoring [Service]

**Body:**
```
A fix has been deployed for [issue description].

**Resolution:** [What was done]
**Impact Duration:** [START_TIME] - [END_TIME] UTC

We are actively monitoring to ensure stability. If you continue to experience issues:
1. Try refreshing your browser
2. Clear cache and cookies
3. Contact support if problems persist

We will provide a final update once we confirm full resolution.
```

---

## 4. RESOLVED

**Title:** Resolved - [Service] Issue

**Body:**
```
✅ The [issue description] has been fully resolved.

**Duration:** [START_TIME] - [END_TIME] UTC ([DURATION])
**Root Cause:** [Brief explanation]
**Resolution:** [What was fixed]

**Users Affected:** [Scope of impact]

We apologize for any inconvenience caused. A full post-mortem will be conducted and shared with affected users.

If you have any questions, please contact support@nautilus.com
```

---

## 5. SCHEDULED MAINTENANCE

### Pre-Maintenance (7 days before)

**Title:** Scheduled Maintenance - [DATE]

**Body:**
```
🔵 We have scheduled maintenance for Nautilus One.

**Date:** [DATE]
**Time:** [START_TIME] - [END_TIME] UTC
**Duration:** Approximately [DURATION]

**What's happening:**
- [Description of maintenance work]
- [Database upgrades, infrastructure improvements, etc.]

**Impact:**
- [Which services will be unavailable]
- [Expected behavior during maintenance]

**Preparation:**
- Save any work in progress before [TIME]
- Download important reports beforehand
- Plan for alternative workflows if needed

No action is required on your part. You will be notified when maintenance begins and completes.

Questions? Contact support@nautilus.com
```

### Maintenance Starting

**Title:** Maintenance Starting Now

**Body:**
```
🔵 Scheduled maintenance is now in progress.

**Expected Duration:** [DURATION]
**Completion Target:** [END_TIME] UTC

**Currently Unavailable:**
- [Service 1]
- [Service 2]

**Still Available:**
- [Service that's still working]

We will update this page when maintenance is complete. Thank you for your patience.
```

### Maintenance Complete

**Title:** Maintenance Complete

**Body:**
```
✅ Scheduled maintenance has been completed successfully.

**Duration:** [START_TIME] - [END_TIME] UTC

**What was done:**
- [Improvement 1]
- [Improvement 2]
- [Upgrade 3]

All services are now fully operational. If you experience any issues, please contact support.

Thank you for your patience during this maintenance window.
```

---

## 6. SECURITY INCIDENT

**Title:** Security Advisory

**Body:**
```
🔒 We are aware of a security concern affecting [scope].

**Status:** Investigating / Contained / Resolved
**Discovered:** [TIME] UTC

**What we know:**
- [Factual description without speculation]

**What we're doing:**
- [Actions being taken]

**What you should do:**
- [User actions if needed]
- [Password reset, etc.]

We take security seriously and will provide updates as we learn more. For questions, contact security@nautilus.com
```

---

## 7. THIRD-PARTY OUTAGE

**Title:** Third-Party Service Issue Affecting [Feature]

**Body:**
```
We are aware of issues with [Feature] due to an outage at [Third-Party Provider].

**Impact:** [Which features affected]
**Provider Status:** [Link to their status page]

This issue is outside our direct control, but we are:
- Monitoring the situation closely
- In contact with the provider
- Working on alternative solutions

**Workaround:** [If available]

We will update this page as the situation develops.
```

---

## COMPONENT STATUS EXAMPLES

### Individual Components

| Component | Status | Description |
|-----------|--------|-------------|
| Web Application | 🟢 Operational | Main Nautilus One interface |
| AI Command Center | 🟢 Operational | AI-powered assistance |
| Database | 🟢 Operational | Data storage and retrieval |
| Authentication | 🟢 Operational | Login and user sessions |
| API | 🟢 Operational | External integrations |
| Voice Assistant | 🟡 Degraded | Slower response times |
| Mobile App | 🟢 Operational | iOS and Android apps |
| Webhooks | 🟢 Operational | Event notifications |
| File Storage | 🟢 Operational | Document uploads |
| Email Notifications | 🟢 Operational | System emails |

---

## COMMUNICATION TIMELINE

| Event | Update Frequency | Channel |
|-------|------------------|---------|
| Initial Detection | Immediate | Status Page + Email |
| Investigation | Every 30 min | Status Page |
| After Fix Deployed | Every 15 min | Status Page |
| Resolution | Final update | Status Page + Email |
| Post-Mortem | Within 48 hours | Email to affected users |

---

## EMAIL TEMPLATES FOR OUTAGES

### Outage Notification

**Subject:** ⚠️ Nautilus One Service Disruption - [DATE]

**Body:**
```
Hi [Name],

We're writing to inform you that Nautilus One is currently experiencing [issue description].

**Started:** [TIME] UTC
**Impact:** [What you may notice]
**Current Status:** [Investigating/Identified/Fixing]

Our team is actively working to resolve this issue. You can follow real-time updates at: [STATUS_PAGE_LINK]

We apologize for any inconvenience and will notify you once services are fully restored.

Best regards,
Nautilus One Team
```

### Resolution Notification

**Subject:** ✅ Resolved - Nautilus One Service Restored

**Body:**
```
Hi [Name],

Good news! The service disruption we reported earlier has been resolved.

**Duration:** [START_TIME] - [END_TIME] UTC
**Root Cause:** [Brief explanation]
**Resolution:** [What was fixed]

All Nautilus One services are now operating normally.

If you continue to experience any issues, please:
1. Try refreshing your browser
2. Clear your cache
3. Contact support@nautilus.com if problems persist

We apologize for any inconvenience caused. A detailed post-mortem will be available at [LINK].

Thank you for your patience.

Best regards,
Nautilus One Team
```

---

**Last Updated:** 2025-01-04
**Maintained By:** Operations Team
