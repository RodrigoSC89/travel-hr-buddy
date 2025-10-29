# Anonymized Database Export v3.5

## ⚠️ Data Anonymization Notice

This export contains anonymized data for audit purposes.
All personally identifiable information (PII) has been:
- Hashed or encrypted
- Replaced with fake data
- Removed where not essential

## 📊 Database Schema

### Core Tables

#### users
- id (UUID)
- email (anonymized: user_xxx@example.com)
- role (preserved)
- created_at (preserved)
- last_login (preserved)

#### crew_members
- id (UUID)
- name (anonymized: Crew Member #XXX)
- position (preserved)
- certifications (preserved)
- hire_date (preserved)

#### documents
- id (UUID)
- title (preserved)
- type (preserved)
- created_by (anonymized)
- created_at (preserved)

#### audit_logs
- id (UUID)
- action (preserved)
- user_id (anonymized)
- timestamp (preserved)
- details (sanitized)

## 📈 Statistics

### User Metrics
- Total Users: [ANONYMIZED]
- Active Users (30d): [ANONYMIZED]
- Admin Users: [COUNT]

### Content Metrics
- Total Documents: [COUNT]
- Total Crew Members: [COUNT]
- Total Operations: [COUNT]

### System Metrics
- Database Size: [SIZE]
- Average Query Time: [TIME]ms
- Cache Hit Rate: [PERCENTAGE]%

## 🔐 Security Notes

1. All passwords are hashed with bcrypt
2. API keys are not included
3. Session tokens are not included
4. Email addresses are anonymized
5. Personal data is masked

## 📋 Sample Anonymized Data

```json
{
  "users": [
    {
      "id": "uuid-1",
      "email": "user_001@example.com",
      "role": "admin",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "crew_members": [
    {
      "id": "uuid-2",
      "name": "Crew Member #001",
      "position": "Captain",
      "certifications": ["STCW", "ISPS"]
    }
  ]
}
```

## 📝 Notes for Auditors

1. This export represents production data as of 2025-10-29T20:07:29.829Z
2. Schema matches production exactly
3. Data volumes are representative of actual usage
4. Performance characteristics are preserved
5. All audit requirements can be validated

---
**Export Date**: 2025-10-29T20:07:29.829Z
**Version**: v3.5
**Anonymization Level**: Full
