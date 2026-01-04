# 🐛 NAUTILUS ONE - INCIDENT RESPONSE TEMPLATE

## INCIDENT REPORT: [TITLE]

**Incident ID:** INC-[DATE]-[NUMBER]  
**Severity:** P0 / P1 / P2 / P3  
**Status:** Investigating / Identified / Monitoring / Resolved

---

## 📊 IMPACT

- **Users Affected:** [NUMBER] ([PERCENTAGE]%)
- **Duration:** [START_TIME] - [END_TIME] ([DURATION])
- **Services Affected:** [LIST]
- **Data Loss:** Yes / No

---

## 📝 TIMELINE (UTC)

| Time | Event | Action Taken |
|------|-------|--------------|
| 14:23 | Alert triggered: Error rate >3% | On-call paged |
| 14:25 | Incident confirmed | War room opened |
| 14:30 | Root cause identified | Started mitigation |
| 14:45 | Mitigation deployed | Monitoring |
| 15:00 | Error rate back to normal | Continued monitoring |
| 15:30 | Incident resolved | Closed war room |

---

## 🔍 ROOT CAUSE

**What happened:**
[Detailed explanation of what went wrong]

**Why it happened:**
[Root cause analysis - 5 Whys technique]

**Why it wasn't caught earlier:**
[Gap in monitoring/testing]

---

## 🛠️ RESOLUTION

**Immediate Fix:**
[What was done to stop the bleeding]

**Long-term Fix:**
[What will prevent this from happening again]

---

## 📈 METRICS

- **MTTD (Mean Time To Detect):** [TIME]
- **MTTA (Mean Time To Acknowledge):** [TIME]
- **MTTR (Mean Time To Resolve):** [TIME]
- **Uptime Impact:** [PERCENTAGE]%

---

## ✅ ACTION ITEMS

| Priority | Action | Owner | Due Date | Status |
|----------|--------|-------|----------|--------|
| P0 | [Critical fix] | @name | [DATE] | ⏳ |
| P1 | [Important improvement] | @name | [DATE] | ⏳ |
| P2 | [Nice to have] | @name | [DATE] | ⏳ |

---

## 🎓 LESSONS LEARNED

**What went well:**
- Quick detection via Sentry alerts
- Team coordination was effective
- Rollback procedure worked smoothly

**What could be improved:**
- Better monitoring for [specific metric]
- More comprehensive testing for [scenario]
- Documentation for [procedure]

---

## 📋 COMMUNICATION LOG

| Time | Channel | Message |
|------|---------|---------|
| 14:25 | Slack #incident-response | Incident declared |
| 14:30 | Status Page | Updated to "Investigating" |
| 15:00 | Status Page | Updated to "Identified" |
| 15:30 | Status Page | Updated to "Resolved" |
| 16:00 | Email | Post-incident summary sent |

---

**Compiled by:** [NAME]  
**Reviewed by:** [TEAM]  
**Date:** [DATE]

---

# 🔒 SECURITY INCIDENT ADDENDUM

*Only fill this section for security-related incidents*

## Security Classification

- [ ] Data Breach
- [ ] Unauthorized Access
- [ ] Malware/Ransomware
- [ ] DDoS Attack
- [ ] Insider Threat
- [ ] Other: ___________

## Data Impact

- **Data Types Affected:** [PII, Financial, Health, etc.]
- **Number of Records:** [COUNT]
- **Encryption Status:** [Encrypted at rest / In transit / None]

## Regulatory Considerations

- [ ] GDPR notification required (72 hours)
- [ ] LGPD notification required
- [ ] Other regulatory requirements

## Forensics

- [ ] Evidence preserved
- [ ] Logs exported
- [ ] Affected systems isolated
- [ ] Third-party forensics engaged

---

**Security Lead Sign-off:** ___________  
**Legal Review:** ___________  
**Date:** ___________
