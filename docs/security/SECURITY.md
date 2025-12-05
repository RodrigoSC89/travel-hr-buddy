# 🔒 Security Guide

## Overview

Nautilus One implements enterprise-grade security for maritime HR data.

## Security Layers

### 1. Authentication

- **Supabase Auth** - JWT-based authentication
- **MFA Support** - TOTP authenticator apps
- **OAuth** - Google, Microsoft providers
- **Session Management** - Secure session handling

### 2. Authorization

- **Role-Based Access Control (RBAC)**
  - Admin, Manager, User, Viewer roles
  - Permission inheritance
  - Feature-level permissions

- **Row Level Security (RLS)**
  - All tables have RLS enabled
  - Organization-based isolation
  - User-specific data access

### 3. Data Protection

- **Encryption at Rest** - AES-256
- **Encryption in Transit** - TLS 1.3
- **PII Masking** - Sensitive data masked
- **Audit Logging** - All actions logged

## Security Headers

```typescript
// Implemented headers
{
  'Content-Security-Policy': "default-src 'self'; ...",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=()',
}
```

## Rate Limiting

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| API General | 100 req | 1 min |
| Authentication | 10 req | 1 min |
| File Upload | 20 req | 1 min |
| AI Endpoints | 30 req | 1 min |

## Input Validation

- All inputs sanitized
- SQL injection prevention
- XSS protection
- Path traversal blocking

## Compliance

- **MLC 2006** - Maritime Labour Convention
- **GDPR** - Data protection
- **ISO 27001** - Information security

## Security Checklist

- [ ] Enable MFA for admin accounts
- [ ] Review RLS policies regularly
- [ ] Rotate API keys quarterly
- [ ] Monitor audit logs
- [ ] Update dependencies weekly
- [ ] Conduct security audits

## Reporting Security Issues

Report vulnerabilities to: security@nautilus.app

Do NOT disclose publicly until fixed.
