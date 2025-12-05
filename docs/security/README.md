# 🔒 Security Documentation

## Overview

Nautilus One implements enterprise-grade security for maritime HR data.

## Documents

- [Security Guide](./SECURITY.md) - Security architecture and practices
- [OAuth Integration](./OAUTH_INTEGRATION_GUIDE.md) - Authentication setup

## Security Features

### Authentication
- Multi-factor authentication (MFA)
- OAuth 2.0 / OIDC support
- Session management
- Password policies

### Authorization
- Role-based access control (RBAC)
- Row-level security (RLS)
- Permission inheritance
- Audit logging

### Data Protection
- AES-256 encryption at rest
- TLS 1.3 in transit
- PII data masking
- GDPR compliance

### Compliance
- MLC 2006 compliance
- STCW requirements
- ISO 27001 aligned
- SOC 2 ready

## Quick Security Checklist

- [ ] Enable MFA for all admin accounts
- [ ] Review RLS policies regularly
- [ ] Rotate API keys quarterly
- [ ] Monitor audit logs daily
- [ ] Update dependencies weekly
