# 🚢 Maritime Operations Suite - Quick Start Guide

> **PATCHES 151.0 - 155.0 Implementation**  
> Status: ✅ Complete | Security: ✅ Validated | Production: ✅ Ready

---

## 📋 What Was Built

5 production-ready maritime operations modules:

| Patch | Module | Description |
|-------|--------|-------------|
| 151.0 | ⚓ Certification Center | Digital certificates (ISM, ISPS, IMCA) with QR codes |
| 152.0 | 🚢 Port Authority Integration | ANTAQ/Portbase API sync |
| 153.0 | 🔏 Digital Signature | ICP-Brasil/OpenCert document signing |
| 154.0 | ⛓️ Blockchain Log Registry | Ethereum/Polygon immutable logs |
| 155.0 | 📨 Regulatory Channel | AES-256 encrypted communications |

---

## 🚀 Quick Start

### 1. Using the Modules

```typescript
import { CertificationCenter } from '@/modules/certification-center';
import { PortAuthorityIntegration } from '@/modules/port-authority-integration';
import { DigitalSignature } from '@/modules/digital-signature';
import { LogChain } from '@/modules/log-chain';
import { RegulatoryChannel } from '@/modules/regulatory-channel';

// In your routes
<Route path="/certification" element={<CertificationCenter />} />
<Route path="/port-integration" element={<PortAuthorityIntegration />} />
<Route path="/digital-signature" element={<DigitalSignature />} />
<Route path="/blockchain-logs" element={<LogChain />} />
<Route path="/regulatory" element={<RegulatoryChannel />} />
```

### 2. API Usage Examples

**Issue a Certificate:**
```typescript
import { issueCertificate } from '@/modules/certification-center';

const certificate = await issueCertificate({
  type: 'ISM',
  vesselName: 'MV Atlantic',
  imoNumber: 'IMO1234567',
  issuedBy: 'Classification Society',
  expiryDate: '2026-12-31',
  portName: 'Port of Santos',
  operationType: 'Safety Inspection',
  inspectorName: 'John Smith',
  inspectionDate: '2025-10-25',
  findings: ['All systems operational'],
  status: 'compliant'
});

// Certificate includes QR code and hash
console.log(certificate.qrCode); // Base64 QR code
console.log(certificate.hash);   // SHA-256 hash
```

**Submit to Port Authority:**
```typescript
import { submitArrivalData } from '@/modules/port-authority-integration';

const result = await submitArrivalData(
  {
    vesselId: 'V-123',
    vesselName: 'MV Atlantic',
    imoNumber: 'IMO1234567',
    portCode: 'BRSAO',
    eta: '2025-10-26T10:00:00Z'
  },
  crewMembers,
  documents
);
```

**Sign a Document:**
```typescript
import { signDocument } from '@/modules/digital-signature';

const signedDoc = await signDocument({
  documentId: 'DOC-123',
  documentName: 'Safety Report.pdf',
  documentUrl: 'https://...',
  certificateId: 'CERT-456',
  reason: 'Document approval',
  location: 'Port of Santos'
});
```

**Register on Blockchain:**
```typescript
import { registerLogOnBlockchain } from '@/modules/log-chain';

const record = await registerLogOnBlockchain({
  type: 'incident',
  severity: 'high',
  description: 'Safety incident reported',
  metadata: { vesselId: 'V-123' }
});

// View on block explorer
console.log(record.explorerUrl);
```

**Secure Submission:**
```typescript
import { submitSecureDocument } from '@/modules/regulatory-channel';

const submission = await submitSecureDocument({
  authorityId: 'AUTH-MARINHA',
  submittedBy: 'captain@vessel.com',
  subject: 'Incident Report',
  description: 'Details of incident...',
  priority: 'high',
  documents: []
});
```

---

## 🗄️ Database Setup

Run these SQL commands in Supabase:

```sql
-- Certification Center
CREATE TABLE certifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  vessel_id TEXT NOT NULL,
  vessel_name TEXT NOT NULL,
  imo_number TEXT NOT NULL,
  issued_by TEXT NOT NULL,
  issued_date TIMESTAMP NOT NULL,
  expiry_date TIMESTAMP NOT NULL,
  operation_details JSONB NOT NULL,
  hash TEXT NOT NULL,
  qr_code TEXT NOT NULL,
  validation_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Port Authority Integration
CREATE TABLE vessel_arrivals (
  id TEXT PRIMARY KEY,
  vessel_id TEXT NOT NULL,
  vessel_name TEXT NOT NULL,
  imo_number TEXT NOT NULL,
  port_code TEXT NOT NULL,
  port_name TEXT NOT NULL,
  eta TIMESTAMP NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE port_submissions (
  id TEXT PRIMARY KEY,
  arrival_id TEXT REFERENCES vessel_arrivals(id),
  vessel_id TEXT NOT NULL,
  port_code TEXT NOT NULL,
  submitted_at TIMESTAMP NOT NULL,
  status TEXT NOT NULL,
  crew JSONB NOT NULL,
  documents JSONB NOT NULL,
  missing_documents JSONB
);

-- Digital Signature
CREATE TABLE digital_certificates (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  valid_from TIMESTAMP NOT NULL,
  valid_to TIMESTAMP NOT NULL,
  public_key TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE signed_documents (
  id TEXT PRIMARY KEY,
  original_document_id TEXT NOT NULL,
  signed_document_url TEXT NOT NULL,
  certificate_id TEXT REFERENCES digital_certificates(id),
  signed_by TEXT NOT NULL,
  signed_at TIMESTAMP DEFAULT NOW(),
  signature TEXT NOT NULL
);

-- Blockchain Log Registry
CREATE TABLE log_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB NOT NULL,
  hash TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE blockchain_records (
  id TEXT PRIMARY KEY,
  log_event_id TEXT REFERENCES log_events(id),
  block_number TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  network TEXT NOT NULL,
  explorer_url TEXT NOT NULL,
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- Regulatory Channel
CREATE TABLE regulatory_authorities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT
);

CREATE TABLE regulatory_submissions (
  id TEXT PRIMARY KEY,
  authority_id TEXT REFERENCES regulatory_authorities(id),
  submitted_by TEXT NOT NULL,
  subject TEXT NOT NULL,
  encrypted_data TEXT NOT NULL,
  encryption_key TEXT NOT NULL,
  submitted_at TIMESTAMP DEFAULT NOW(),
  status TEXT NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE vessel_arrivals ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulatory_submissions ENABLE ROW LEVEL SECURITY;
```

---

## 🔒 Security Setup

### 1. Environment Variables

Create `.env.local`:

```bash
# Blockchain (optional)
VITE_ETHEREUM_RPC_URL=https://rpc-mumbai.maticvigil.com
VITE_POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
VITE_BLOCKCHAIN_NETWORK=polygon-mumbai

# Notifications (optional)
VITE_EMAIL_API_KEY=your-email-api-key
VITE_WHATSAPP_API_KEY=your-whatsapp-api-key

# Port Authority (optional)
VITE_ANTAQ_API_KEY=your-antaq-api-key
VITE_PORTBASE_API_KEY=your-portbase-api-key
```

### 2. Supabase RLS Policies

```sql
-- Example: Allow users to view their own certificates
CREATE POLICY "Users can view own certificates"
  ON certifications FOR SELECT
  USING (auth.uid()::text = vessel_id);

-- Example: Allow authenticated users to create certificates
CREATE POLICY "Authenticated users can create certificates"
  ON certifications FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [README_PATCHES_151_155.md](./modules/README_PATCHES_151_155.md) | Complete usage guide |
| [PATCHES_151_155_IMPLEMENTATION_SUMMARY.md](./PATCHES_151_155_IMPLEMENTATION_SUMMARY.md) | Technical details |
| [PATCHES_151_155_VISUAL_SUMMARY.md](./PATCHES_151_155_VISUAL_SUMMARY.md) | Architecture diagrams |
| [PATCHES_151_155_SECURITY_SUMMARY.md](./PATCHES_151_155_SECURITY_SUMMARY.md) | Security validation |

---

## ✅ Verification Checklist

Before deployment, ensure:

- [ ] Supabase tables created
- [ ] RLS policies configured
- [ ] Environment variables set
- [ ] API keys configured (if using external services)
- [ ] Notification services set up (optional)
- [ ] Blockchain RPC configured (optional)
- [ ] Build passing: `npm run build`
- [ ] Lint passing: `npm run lint`
- [ ] Tests passing: `npm test`

---

## 🐛 Troubleshooting

### Build Errors

```bash
# Clean build cache
npm run clean
npm install
npm run build
```

### Type Errors

```bash
# Check types
npm run type-check
```

### Database Connection Issues

1. Check Supabase URL and keys in `.env`
2. Verify tables exist
3. Check RLS policies

---

## 📊 Monitoring

### Key Metrics to Monitor

- Certificate issuance rate
- Validation success/failure rate
- Port submission status
- Blockchain transaction confirmations
- Regulatory submission delivery rate
- Encryption/decryption errors

### Recommended Alerts

- Failed certificate validations
- Port submission rejections
- Blockchain transaction failures
- Encryption errors
- Missing documents notifications

---

## 🆘 Support

For issues or questions:

1. Check documentation in `modules/README_PATCHES_151_155.md`
2. Review implementation summary for technical details
3. Check security summary for security best practices
4. Review inline code comments

---

## 📈 Next Steps

After deployment:

1. **Monitor Usage**
   - Track certificate issuance
   - Monitor API integrations
   - Review security logs

2. **Optimize Performance**
   - Add database indexes
   - Cache frequently accessed data
   - Optimize PDF generation

3. **Enhance Features**
   - Add more certificate types
   - Integrate with more port authorities
   - Support additional blockchain networks

4. **Security Hardening**
   - Regular security audits
   - Dependency updates
   - Penetration testing

---

**Status:** ✅ Production Ready  
**Last Updated:** October 25, 2025  
**Version:** 1.0.0
