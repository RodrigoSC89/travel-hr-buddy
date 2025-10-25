# ✅ PATCH 153 – Digital Signature
**ICP-Brasil & OpenCert Integration**

---

## 📋 Resumo

Sistema de assinatura digital de documentos com validade jurídica através de:
- Suporte a certificados ICP-Brasil (padrão brasileiro)
- Integração com OpenCert (certificados abertos)
- Assinatura de PDFs com carimbo de tempo
- Verificação de autenticidade via chave pública
- Cadeia de custódia digital

---

## 🎯 Objetivos

- ✅ Upload e gerenciamento de certificados digitais
- ✅ Assinatura de PDFs com ICP-Brasil/OpenCert
- ✅ Verificação de assinaturas digitais
- ✅ Carimbo de tempo (timestamp) RFC 3161
- ✅ Validação de cadeia de certificação
- ✅ Armazenamento seguro de chaves privadas

---

## ✅ Checklist de Validação

### 1. Gerenciamento de Certificados

- [ ] **Upload de Certificado**
  - [ ] Suporte a formatos: .p12, .pfx, .pem
  - [ ] Validação de senha do certificado
  - [ ] Extração de informações:
    - [ ] Nome do titular (Subject)
    - [ ] Emissor (Issuer)
    - [ ] Número de série
    - [ ] Data de validade (Valid From / Valid To)
    - [ ] Chave pública
    - [ ] Fingerprint (SHA-256)
  - [ ] Armazenamento seguro (encrypted at rest)

- [ ] **Tipos de Certificado**
  - [ ] ICP-Brasil (A1, A3)
    - [ ] Validação de cadeia ICP-Brasil
    - [ ] Verificação de AC Raiz ICP-Brasil
    - [ ] Suporte a e-CPF e e-CNPJ
  - [ ] OpenCert
    - [ ] Validação de cadeia OpenCert
    - [ ] Suporte a certificados auto-assinados
  - [ ] Custom
    - [ ] Certificados de terceiros (Let's Encrypt, etc.)

- [ ] **Listagem de Certificados**
  - [ ] Exibição de certificados ativos
  - [ ] Status (válido/expirado/revogado)
  - [ ] Alerta de expiração próxima (30 dias)
  - [ ] Opção de excluir certificado

### 2. Assinatura de Documentos

- [ ] **Seleção de Documento**
  - [ ] Upload de PDF (< 10MB)
  - [ ] Preview do documento
  - [ ] Seleção de certificado para assinar

- [ ] **Processo de Assinatura**
  - [ ] Inserção de metadados:
    - [ ] Motivo da assinatura (reason)
    - [ ] Localização (location)
    - [ ] Informações de contato
  - [ ] Geração de hash SHA-256 do documento
  - [ ] Assinatura do hash com chave privada
  - [ ] Embedding da assinatura no PDF (padrão PAdES)

- [ ] **Carimbo de Tempo**
  - [ ] Requisição a TSA (Time Stamping Authority)
  - [ ] Timestamp RFC 3161
  - [ ] Embedding do timestamp no PDF
  - [ ] Validação do timestamp

- [ ] **PDF Assinado**
  - [ ] Documento original + assinatura digital
  - [ ] Visual signature (aparência no PDF)
  - [ ] Metadados de assinatura visíveis
  - [ ] Download automático
  - [ ] Armazenamento seguro

### 3. Verificação de Assinaturas

- [ ] **Upload de PDF Assinado**
  - [ ] Leitura do arquivo
  - [ ] Extração da assinatura digital
  - [ ] Extração do timestamp

- [ ] **Validação Completa**
  - [ ] Verificação da cadeia de certificação
  - [ ] Validação da assinatura digital (chave pública)
  - [ ] Verificação de integridade (hash)
  - [ ] Validação do timestamp
  - [ ] Check de revogação (CRL/OCSP)

- [ ] **Resultado da Verificação**
  - [ ] Status: Válido / Inválido
  - [ ] Assinado por: Nome do signatário
  - [ ] Data de assinatura
  - [ ] Certificado usado
  - [ ] Timestamp validado
  - [ ] Documento íntegro (não modificado)

- [ ] **Cenários de Invalidação**
  - [ ] ❌ Documento foi modificado após assinatura
  - [ ] ❌ Certificado expirado na data de assinatura
  - [ ] ❌ Certificado revogado
  - [ ] ❌ Cadeia de certificação inválida
  - [ ] ❌ Timestamp inválido

### 4. Segurança e Compliance

- [ ] **Armazenamento de Chaves**
  - [ ] Chaves privadas nunca expostas
  - [ ] Criptografia AES-256 em repouso
  - [ ] Acesso controlado por autenticação
  - [ ] Logs de uso de chaves

- [ ] **Padrões de Assinatura**
  - [ ] PAdES (PDF Advanced Electronic Signatures)
  - [ ] CAdES (CMS Advanced Electronic Signatures)
  - [ ] XAdES (XML Advanced Electronic Signatures) - futuro

- [ ] **Compliance Legal**
  - [ ] ICP-Brasil (MP 2.200-2/2001)
  - [ ] eIDAS (EU) - reconhecimento internacional
  - [ ] Validade jurídica no Brasil

---

## 🧪 Cenários de Teste

### Teste 1: Upload de Certificado ICP-Brasil

**Pré-condições:**
- Certificado ICP-Brasil válido (.p12 ou .pfx)
- Senha do certificado

**Passos:**
1. Acessar "Digital Signature" → "Certificates"
2. Clicar "Upload Certificate"
3. Selecionar arquivo .p12
4. Inserir senha do certificado
5. Selecionar tipo: "ICP-Brasil"

**Resultado Esperado:**
- ✅ Certificado importado com sucesso
- ✅ Informações extraídas corretamente:
  - Subject: "Nome do Titular:CPF"
  - Issuer: "AC [Nome da Autoridade Certificadora]"
  - Valid From/To visíveis
- ✅ Status: "Válido"
- ✅ Toast de sucesso

### Teste 2: Assinatura de PDF com ICP-Brasil

**Pré-condições:**
- Certificado ICP-Brasil carregado
- PDF de teste (< 5MB)

**Passos:**
1. Acessar "Digital Signature" → "Sign Document"
2. Upload do PDF
3. Selecionar certificado ICP-Brasil
4. Preencher metadados:
   - Reason: "Aprovação de certificado marítimo"
   - Location: "Santos, SP, Brasil"
   - Contact: "email@example.com"
5. Clicar "Sign Document"

**Resultado Esperado:**
- ✅ Processamento inicia (loading state)
- ✅ Hash SHA-256 calculado
- ✅ Assinatura digital aplicada
- ✅ Timestamp RFC 3161 adicionado
- ✅ PDF assinado disponível para download
- ✅ Visual signature aparece no documento
- ✅ Metadados visíveis no PDF

### Teste 3: Verificação de Assinatura Válida

**Pré-condições:**
- PDF assinado no Teste 2

**Passos:**
1. Acessar "Digital Signature" → "Verify Signature"
2. Upload do PDF assinado
3. Clicar "Verify"

**Resultado Esperado:**
- ✅ Status: "Valid" (verde)
- ✅ Assinado por: "Nome do Titular"
- ✅ Data de assinatura exibida
- ✅ Certificado: "ICP-Brasil"
- ✅ Timestamp verificado
- ✅ Integridade: "Document not modified"
- ✅ Cadeia de certificação: "Valid"

### Teste 4: Detecção de Documento Adulterado

**Pré-condições:**
- PDF assinado no Teste 2
- Documento modificado manualmente (adicionar texto)

**Passos:**
1. Abrir PDF assinado em editor
2. Adicionar texto "TESTE"
3. Salvar documento
4. Fazer upload para verificação

**Resultado Esperado:**
- ❌ Status: "Invalid" (vermelho)
- ❌ Mensagem: "Document has been modified after signature"
- ❌ Integridade: "Hash mismatch"
- ⚠️ Alerta: "Signature is no longer valid"
- ✅ Dados da assinatura original ainda visíveis

### Teste 5: Certificado Expirado

**Pré-condições:**
- Certificado com Valid To no passado

**Passos:**
1. Tentar assinar documento com certificado expirado

**Resultado Esperado:**
- ❌ Erro: "Certificate has expired"
- ❌ Assinatura bloqueada
- ⚠️ Sugestão: "Please upload a valid certificate"

### Teste 6: OpenCert - Certificado Auto-Assinado

**Pré-condições:**
- Certificado OpenCert ou auto-assinado

**Passos:**
1. Upload de certificado custom
2. Assinar PDF
3. Verificar assinatura

**Resultado Esperado:**
- ✅ Certificado aceito
- ⚠️ Warning: "Self-signed certificate - not ICP-Brasil validated"
- ✅ Assinatura funcional
- ✅ Verificação bem-sucedida
- ℹ️ Nota: "No legal validity in Brazil"

---

## 📂 Arquivos Relacionados

### Core Module
- `modules/digital-signature/index.tsx` - Componente principal
- `modules/digital-signature/types/index.ts` - Type definitions

### Services
- `modules/digital-signature/services/signature-service.ts` - Lógica de assinatura
  - `uploadCertificate()` - Upload e validação
  - `signDocument()` - Assinatura de PDF
  - `verifySignature()` - Verificação
  - `validateCertificateChain()` - Validação de cadeia

### Components (a criar)
- `modules/digital-signature/components/CertificateUpload.tsx` - Upload de certificados
- `modules/digital-signature/components/DocumentSigner.tsx` - Interface de assinatura
- `modules/digital-signature/components/SignatureVerifier.tsx` - Verificação de assinatura
- `modules/digital-signature/components/CertificateList.tsx` - Listagem de certificados

### Utilities (a criar)
- `modules/digital-signature/utils/pdf-signer.ts` - Assinatura de PDF (PAdES)
- `modules/digital-signature/utils/certificate-parser.ts` - Parse de certificados X.509
- `modules/digital-signature/utils/timestamp-client.ts` - Cliente TSA

### Database
- Supabase table: `digital_certificates` - Certificados armazenados
- Supabase table: `signed_documents` - Documentos assinados
- Supabase table: `signature_verifications` - Log de verificações

---

## 📊 Métricas de Sucesso

| Métrica | Target | Crítico |
|---------|--------|---------|
| Tempo de assinatura | < 5s | ✅ |
| Taxa de verificação bem-sucedida | > 99% | ✅ |
| Taxa de detecção de adulteração | 100% | ⚠️ CRÍTICO |
| Validade legal (ICP-Brasil) | 100% | ⚠️ CRÍTICO |
| Uptime do TSA | > 99.5% | ✅ |

---

## 🐛 Problemas Conhecidos

### Críticos
- ⚠️ **TSA (Time Stamping Authority) pode estar indisponível**
  - **Solução:** Implementar fallback para TSA secundária
  - **Alternativa:** Timestamp local (sem validade legal)

### Médios
- ⚠️ Certificados A3 (hardware/token) não suportados via web
  - **Solução:** Requer app desktop ou mobile nativo
  - **Workaround:** Exportar certificado A1 temporário

### Baixos
- ℹ️ PDFs muito grandes (>10MB) podem demorar para assinar
  - **Solução:** Implementar compressão prévia
  - **Limite:** 10MB para UX ideal

---

## ✅ Critérios de Aprovação

### Obrigatórios
- ✅ Upload de certificados ICP-Brasil funcional
- ✅ Assinatura de PDF com PAdES implementada
- ✅ Verificação de assinaturas 100% confiável
- ✅ Detecção de adulteração funcionando
- ✅ Timestamp RFC 3161 aplicado
- ✅ Validade legal no Brasil (ICP-Brasil)

### Desejáveis
- ✅ Suporte a OpenCert
- ✅ Visual signature no PDF
- ✅ Verificação de CRL/OCSP
- ✅ Múltiplas assinaturas no mesmo documento

---

## 📝 Notas Técnicas

### Padrão PAdES (PDF Advanced Electronic Signatures)
```
PDF Structure:
┌─────────────────────────────┐
│ Original PDF Content        │
├─────────────────────────────┤
│ Digital Signature Object    │
│ - Signer Info               │
│ - Certificate Chain         │
│ - Signature Value           │
│ - Timestamp Token (RFC 3161)│
└─────────────────────────────┘
```

### Certificado ICP-Brasil
```
Subject: CN=NOME DO TITULAR:12345678900, OU=AC, O=ICP-Brasil
Issuer: CN=AC [Nome da AC], O=ICP-Brasil, C=BR
Serial Number: 1234567890ABCDEF
Valid From: 2024-01-01 00:00:00 GMT
Valid To: 2026-01-01 23:59:59 GMT
Public Key: RSA 2048 bits
Fingerprint (SHA-256): A1B2C3D4E5F6...
```

### Timestamp RFC 3161
```http
POST /tsa HTTP/1.1
Host: timestamp.iti.gov.br
Content-Type: application/timestamp-query

[TimeStampReq ASN.1 encoded]

Response:
HTTP/1.1 200 OK
Content-Type: application/timestamp-reply

[TimeStampResp with signed timestamp]
```

### Database Schema
```sql
-- digital_certificates
{
  id: uuid (PK)
  userId: uuid (FK)
  type: 'ICP-Brasil' | 'OpenCert' | 'Custom'
  name: string
  issuer: string
  subject: string
  validFrom: timestamp
  validTo: timestamp
  serialNumber: string
  publicKey: text (PEM)
  fingerprint: string (SHA-256)
  encryptedPrivateKey: bytea (AES-256)
  uploadedAt: timestamp
}

-- signed_documents
{
  id: uuid (PK)
  originalDocumentId: uuid
  signedDocumentUrl: string
  certificateId: uuid (FK)
  signedBy: string
  signedAt: timestamp
  reason: text
  location: text
  signature: text (base64)
  timestamp: text (RFC 3161)
  verified: boolean
}
```

---

## 🔄 Próximos Passos

1. **Integração com PATCH 151**
   - Assinar certificados digitais automaticamente
   - PDF de certificado já vem assinado

2. **Integração com PATCH 154**
   - Registrar assinaturas em blockchain
   - Auditoria imutável de assinaturas

3. **Melhorias Legais**
   - Suporte a múltiplas assinaturas (contrato)
   - Assinatura em lote (batch)
   - Integração com cartórios digitais

4. **Mobile**
   - App Android/iOS para certificados A3
   - Assinatura via NFC (token)

---

## 📚 Referências

### Legislação
- [MP 2.200-2/2001](http://www.planalto.gov.br/ccivil_03/mpv/antigas_2001/2200-2.htm) - ICP-Brasil
- [Resolução 129/2016 ICP-Brasil](https://www.gov.br/iti/pt-br/centrais-de-conteudo/doc-icp-05-v-3-1-pdf) - Padrões de certificados

### Padrões Técnicos
- [ETSI TS 102 778](https://www.etsi.org/deliver/etsi_ts/102700_102799/10277801/01.01.01_60/ts_10277801v010101p.pdf) - PAdES
- [RFC 3161](https://datatracker.ietf.org/doc/html/rfc3161) - Time-Stamp Protocol
- [RFC 5280](https://datatracker.ietf.org/doc/html/rfc5280) - X.509 Certificates

### Bibliotecas
- [node-forge](https://github.com/digitalbazaar/forge) - Crypto operations
- [pdf-lib](https://github.com/Hopding/pdf-lib) - PDF manipulation
- [asn1js](https://github.com/PeculiarVentures/ASN1.js) - ASN.1 parsing

### TSAs (Time Stamping Authorities)
- ITI (Brasil): `timestamp.iti.gov.br`
- Certisign: `timestamp.certisign.com.br`
- FreeTSA: `freetsa.org`

---

**Status:** 🟡 EM DESENVOLVIMENTO  
**Última Atualização:** 2025-10-25  
**Responsável:** Nautilus One Legal & Compliance Team
