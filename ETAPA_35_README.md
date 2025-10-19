# ETAPA 35: Automated Testing + Certification Viewer + AI Quiz System

## Quick Start Guide

This implementation provides three major features for the Travel HR Buddy system:

1. **Automated Testing Infrastructure** - E2E and Unit tests
2. **External Auditor Certification Viewer** - Secure token-based access
3. **AI-Powered Quiz System** - Maritime compliance training and certification

## 🚀 Getting Started

### Running Tests

```bash
# Run all unit tests
npm run test:unit

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run all tests
npm run test:all
```

### Using the Certification Viewer

1. **Generate a Token** (Admin):
```sql
SELECT * FROM create_cert_token(
  p_vessel_id := 'your-vessel-uuid',
  p_organization_id := 'your-org-uuid',
  p_expires_in_days := 7,
  p_auditor_name := 'John Doe',
  p_auditor_email := 'auditor@example.com'
);
```

2. **Share the Link**:
```
https://your-domain.com/cert/{token}
```

3. **External auditors** can access the link without login

### Taking a Quiz

1. Navigate to `/admin/quiz`
2. Select a standard (SGSO, IMCA, ISO, ANP, ISM Code, ISPS Code)
3. Choose difficulty level (Basic, Intermediate, Advanced)
4. Complete 10 questions
5. Pass with 70% or higher to earn a certificate

## 📊 Features Overview

### Automated Testing

- **68 E2E Tests** covering critical user flows
  - Authentication (11 tests)
  - Document Management (12 tests)
  - SGSO System (13 tests)
  - Audit Simulation (16 tests)
  - Template Operations (16 tests)

- **1804 Unit Tests** ensuring code quality
  - Including 28 new SGSO AI helper tests

### SGSO AI Helpers

Five AI-powered functions for safety management:

1. **classifyIncidentWithAI** - Categorizes incidents with severity analysis
2. **forecastRisk** - Predicts risk trends from historical data
3. **generateCorrectiveAction** - Creates action plans for incidents
4. **processNonConformity** - Analyzes and generates remediation plans
5. **analyzeIncidentPatterns** - Identifies patterns in incident data

### Certification Viewer

Secure, token-based external auditor access:
- Time-limited access tokens (default 7 days)
- Granular permissions (audits, documents, metrics)
- Read-only access with audit trail
- Automatic access tracking (IP, user agent, count)

### Quiz System

AI-powered maritime compliance training:
- 6 supported standards
- 3 difficulty levels
- GPT-4 integration for intelligent questions
- Template-based fallback system
- Automatic certificate generation
- Comprehensive statistics

## 🏗️ Architecture

### Database Tables

- `cert_view_tokens` - External auditor access tokens
- `quiz_templates` - Fallback quiz questions
- `quiz_results` - User quiz attempts and certificates

### Edge Functions

- `generate-quiz` - AI-powered quiz generation with GPT-4

### Components

- `CertViewer` - External auditor interface
- `QuizPage` - Interactive quiz interface

## 📝 API Reference

### Certification Functions

```sql
-- Create token
create_cert_token(vessel_id, org_id, days, name, email)

-- Validate token
validate_cert_token(token, ip, user_agent)

-- Revoke token
revoke_cert_token(token)

-- Cleanup expired
cleanup_expired_cert_tokens()
```

### Quiz Functions

```sql
-- User statistics
get_user_quiz_stats(user_id)

-- Leaderboard
get_quiz_leaderboard(standard, limit)

-- Generate certificate
generate_certificate_id(result_id)
```

## 🔒 Security

- Row-Level Security (RLS) on all tables
- Token-based authentication for external access
- Audit trail for all access
- User authentication required for quiz system
- Time-limited token expiration
- Granular permission system

## 📈 Monitoring

### Quiz Statistics

View user performance:
```sql
SELECT * FROM get_user_quiz_stats('user-uuid');
```

View organization leaderboard:
```sql
SELECT * FROM get_quiz_leaderboard('SGSO', 10);
```

### Token Activity

Monitor certification viewer usage:
```sql
SELECT 
  token,
  auditor_name,
  access_count,
  last_accessed_at,
  expires_at
FROM cert_view_tokens
WHERE revoked_at IS NULL
ORDER BY created_at DESC;
```

## 🎯 Standards Supported

1. **SGSO** - Sistema de Gestão de Segurança Operacional
2. **IMCA** - International Marine Contractors Association
3. **ISO** - International Standards Organization
4. **ANP** - Agência Nacional do Petróleo
5. **ISM Code** - International Safety Management Code
6. **ISPS Code** - International Ship and Port Facility Security Code

## 📚 Additional Documentation

- [ETAPA_35_IMPLEMENTATION.md](./ETAPA_35_IMPLEMENTATION.md) - Detailed implementation guide
- [ETAPA_35_VISUAL_SUMMARY.md](./ETAPA_35_VISUAL_SUMMARY.md) - Visual diagrams and flowcharts

## 🤝 Support

For issues or questions:
1. Check existing documentation
2. Review test files for usage examples
3. Contact the development team

## 📄 License

Copyright © 2025 Travel HR Buddy Team
