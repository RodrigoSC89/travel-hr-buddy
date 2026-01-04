# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 3.x.x   | :white_check_mark: |
| 2.x.x   | :x:                |
| < 2.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### Do NOT

- Open a public GitHub issue
- Discuss the vulnerability publicly
- Exploit the vulnerability

### Do

1. **Email us** at security@nautilus.app
2. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 1 week
- **Resolution Timeline**: Depends on severity
  - Critical: 24-48 hours
  - High: 1 week
  - Medium: 2 weeks
  - Low: Next release

### Recognition

We appreciate security researchers who help us keep Nautilus One secure. With your permission, we'll acknowledge your contribution in our release notes.

## Security Best Practices

### For Users

- Enable MFA on your account
- Use strong, unique passwords
- Review access logs regularly
- Report suspicious activity

### For Developers

- Never commit credentials
- Use environment variables
- Follow secure coding guidelines
- Review RLS policies

## Security Implementation Details

### JWT Token Validation

All API requests are validated using Supabase JWT tokens:
- Tokens are verified via `supabase.auth.getUser(token)`
- Results are cached for 5 minutes to reduce API calls
- Expired tokens are automatically rejected
- Role-based access control is enforced via `validateAuthWithRole()`

**Location:** `src/middleware/security.middleware.ts`

### Digital Signatures (Compliance Evidence)

Evidence entries are cryptographically signed using ECDSA:
- **Algorithm:** ECDSA P-256 with SHA-256
- **Purpose:** Tamper detection for audit trails
- **Verification:** `verifyEvidenceSignature()` validates entry authenticity

**Location:** `src/lib/crypto/digital-signature.service.ts`

### Key Security Features

| Feature | Implementation | Status |
|---------|----------------|--------|
| JWT Validation | Supabase Auth | ✅ Production |
| Digital Signatures | ECDSA P-256 | ✅ Production |
| Rate Limiting | In-memory (Redis in prod) | ✅ Active |
| CORS | Allowlist-based | ✅ Active |
| Security Headers | CSP, HSTS, etc. | ✅ Active |
| SQL Injection Detection | Pattern matching | ✅ Active |
| XSS Prevention | Input sanitization | ✅ Active |

## Contact

- **Security Team**: security@nautilus.app
- **General Support**: support@nautilus.app
