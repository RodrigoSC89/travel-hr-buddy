# 🆘 Nautilus One - Disaster Recovery Plan

**Version:** 3.2.0  
**Last Updated:** 2025-01-04  
**Classification:** CONFIDENTIAL

---

## 📋 Overview

This document outlines the disaster recovery procedures for Nautilus One Maritime HR Management System.

### Recovery Objectives
| Metric | Target | Description |
|--------|--------|-------------|
| **RTO** | 4 hours | Recovery Time Objective |
| **RPO** | 1 hour | Recovery Point Objective |
| **MTTR** | 2 hours | Mean Time To Recovery |

---

## 🚨 Disaster Scenarios

### Scenario 1: Application Down
**Severity:** P0  
**Symptoms:** Users cannot access the application

**Recovery Steps:**
```bash
# 1. Verify the issue
curl -I https://nautilus.app

# 2. Check deployment status
vercel list

# 3. Check Vercel status
curl https://www.vercel-status.com/api/v2/status.json

# 4. If Vercel issue - wait for resolution
# 5. If deployment issue - rollback
vercel rollback [last-good-deployment]

# 6. Verify recovery
curl https://nautilus.app/api/health
```

**Expected Recovery Time:** 15-30 minutes

---

### Scenario 2: Database Corruption/Loss
**Severity:** P0  
**Symptoms:** Data missing, queries failing, inconsistent data

**Recovery Steps:**
```bash
# 1. Enable maintenance mode
# Set MAINTENANCE_MODE=true in Vercel

# 2. Identify corruption extent
# Supabase Dashboard > Database > Query Editor
SELECT COUNT(*) FROM critical_tables;

# 3. Restore from backup
# Supabase Dashboard > Settings > Backups
# Select backup point (within RPO)
# Click "Restore"

# 4. Verify data integrity
# Run integrity checks

# 5. Disable maintenance mode
# Set MAINTENANCE_MODE=false

# 6. Notify users
```

**Expected Recovery Time:** 1-4 hours

---

### Scenario 3: Security Breach
**Severity:** P0  
**Symptoms:** Unauthorized access, data exfiltration, suspicious activity

**Recovery Steps:**
```markdown
# IMMEDIATE (First 15 minutes)
1. [ ] Enable maintenance mode
2. [ ] Revoke all active sessions
3. [ ] Rotate all API keys
4. [ ] Alert security team
5. [ ] Preserve logs for forensics

# SHORT-TERM (1-4 hours)
1. [ ] Identify breach vector
2. [ ] Patch vulnerability
3. [ ] Audit affected data
4. [ ] Reset user passwords
5. [ ] Enable 2FA enforcement

# LONG-TERM (24-72 hours)
1. [ ] Conduct full security audit
2. [ ] Notify affected users
3. [ ] Report to authorities if required
4. [ ] Implement additional controls
5. [ ] Post-incident review
```

**Expected Recovery Time:** 4-24 hours

---

### Scenario 4: Third-Party Service Outage
**Severity:** P1-P2  
**Symptoms:** Specific features not working

**Recovery Matrix:**
| Service | Impact | Fallback |
|---------|--------|----------|
| Supabase | Database | Enable cached mode |
| OpenAI | AI features | Disable AI, show static |
| ElevenLabs | Voice | Disable TTS |
| Sentry | Monitoring | Log to console |
| Vercel | Hosting | Failover to backup |

**Recovery Steps:**
```bash
# 1. Identify which service is down
# Check respective status pages

# 2. Enable fallback mode
# Set FEATURE_FLAGS in environment

# 3. Communicate to users
# Update status page

# 4. Monitor for recovery
# Re-enable when service restored
```

---

## 🔄 Backup Strategy

### Automated Backups
| Type | Frequency | Retention | Location |
|------|-----------|-----------|----------|
| Database | Hourly | 7 days | Supabase |
| Database | Daily | 30 days | Supabase |
| Database | Weekly | 90 days | External S3 |
| Storage | Daily | 30 days | Supabase |
| Code | Every commit | Forever | GitHub |

### Manual Backup Procedure
```bash
# 1. Export database
supabase db dump -f backup-$(date +%Y%m%d).sql

# 2. Compress
gzip backup-$(date +%Y%m%d).sql

# 3. Upload to secure storage
aws s3 cp backup-*.sql.gz s3://nautilus-backups/

# 4. Verify upload
aws s3 ls s3://nautilus-backups/
```

### Restore Procedure
```bash
# 1. Download backup
aws s3 cp s3://nautilus-backups/backup-YYYYMMDD.sql.gz .

# 2. Decompress
gunzip backup-YYYYMMDD.sql.gz

# 3. Restore to database
supabase db restore backup-YYYYMMDD.sql

# 4. Verify restoration
supabase db query "SELECT COUNT(*) FROM vessels"
```

---

## 📞 Emergency Contacts

### Internal Team
| Role | Name | Phone | Availability |
|------|------|-------|--------------|
| On-call Primary | [NAME] | [PHONE] | 24/7 |
| On-call Backup | [NAME] | [PHONE] | 24/7 |
| DevOps Lead | [NAME] | [PHONE] | Business hours |
| Security Lead | [NAME] | [PHONE] | 24/7 for P0 |
| CTO | [NAME] | [PHONE] | P0 escalation |

### External Support
| Service | Support Contact | SLA |
|---------|-----------------|-----|
| Supabase | support@supabase.io | 4h response |
| Vercel | support@vercel.com | 4h response |
| AWS | aws.amazon.com/support | As per plan |

---

## 📋 Communication Templates

### Internal Alert
```
🚨 INCIDENT ALERT

Severity: P[0-3]
Service: [Affected service]
Impact: [Description]
Status: [Investigating/Identified/Monitoring/Resolved]

Current actions:
- [Action 1]
- [Action 2]

ETA: [Time estimate]

War room: [Slack channel / Zoom link]
```

### User Communication
```
⚠️ Service Update

We are currently experiencing [issue description].

Impact: [What users are experiencing]
Status: [Current status]

We are actively working to resolve this and will provide updates every [X] minutes.

For urgent matters, please contact: [support email]

Last updated: [Time]
```

---

## ✅ DR Testing Schedule

| Test Type | Frequency | Last Tested | Next Test |
|-----------|-----------|-------------|-----------|
| Backup restore | Monthly | [DATE] | [DATE] |
| Rollback | Quarterly | [DATE] | [DATE] |
| Full DR drill | Annually | [DATE] | [DATE] |
| Security response | Quarterly | [DATE] | [DATE] |

---

## 📝 Post-Incident Review Template

```markdown
# Post-Incident Review

## Incident Summary
- **Date:** 
- **Duration:** 
- **Severity:** 
- **Impact:** 

## Timeline
| Time | Event |
|------|-------|
| HH:MM | |
| HH:MM | |

## Root Cause
[Detailed analysis]

## What Went Well
- 
- 

## What Could Be Improved
- 
- 

## Action Items
| Action | Owner | Due Date |
|--------|-------|----------|
| | | |

## Lessons Learned
[Key takeaways]
```

---

*This document should be reviewed and updated quarterly.*
*Last review: 2025-01-04*
