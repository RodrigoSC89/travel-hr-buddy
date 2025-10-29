# Vault AI Module

## Visão Geral

O Vault AI é um módulo de armazenamento seguro e inteligente de documentos sensíveis, com análise AI, classificação automática e controle de acesso baseado em ML.

**Categoria**: AI / Security / Documents  
**Rota**: `/vault_ai`  
**Status**: Ativo  
**Versão**: 2.0

## Componentes Principais

### SecureVault
- Armazenamento criptografado
- Access control management
- Audit trail completo
- Version control

### AIClassifier
- Automatic document classification
- Sensitivity scoring
- Content analysis
- Tag suggestion

### SmartSearch
- AI-powered search
- Semantic search
- Full-text search
- Faceted search

### AccessManager
- Role-based access control
- Permission management
- Request/approval workflow
- Audit logging

## Banco de Dados Utilizado

### Tabelas Principais
```sql
CREATE TABLE vault_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  document_type VARCHAR(100),
  classification VARCHAR(50) NOT NULL,
  sensitivity_level INTEGER DEFAULT 1,
  encrypted_content TEXT,
  encryption_key_id UUID,
  owner_id UUID REFERENCES auth.users(id),
  file_size BIGINT,
  file_hash VARCHAR(64),
  metadata JSONB DEFAULT '{}',
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vault_access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES vault_documents(id),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(50) NOT NULL,
  access_granted BOOLEAN,
  ip_address INET,
  user_agent TEXT,
  accessed_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vault_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES vault_documents(id),
  user_id UUID REFERENCES auth.users(id),
  role_id UUID REFERENCES roles(id),
  permission_level VARCHAR(20) NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Requisições API Envolvidas

### Document Management
- **GET /api/vault/documents** - Lista documentos (com filtro de permissão)
- **POST /api/vault/documents** - Upload documento
- **GET /api/vault/documents/:id** - Visualiza documento
- **PUT /api/vault/documents/:id** - Atualiza documento
- **DELETE /api/vault/documents/:id** - Remove documento

### AI Features
- **POST /api/vault/classify** - Classifica documento
- **POST /api/vault/analyze** - Analisa conteúdo
- **POST /api/vault/extract** - Extrai informações
- **GET /api/vault/search** - Busca inteligente

### Access Control
- **GET /api/vault/permissions** - Lista permissões
- **POST /api/vault/permissions** - Concede permissão
- **DELETE /api/vault/permissions/:id** - Revoga permissão
- **POST /api/vault/request-access** - Solicita acesso

### Audit
- **GET /api/vault/audit-logs** - Logs de auditoria
- **GET /api/vault/access-history/:id** - Histórico de acesso

## Features de IA

### Automatic Classification
- Document type recognition
- Content-based classification
- Sensitivity assessment
- Regulatory compliance check

### Intelligent Search
- Natural language queries
- Semantic understanding
- Context-aware results
- Relevance ranking

### Content Analysis
- Entity extraction
- Key phrase identification
- Summary generation
- Language detection

### Security Intelligence
- Anomaly detection em acessos
- Risk scoring
- Suspicious pattern recognition
- Automated alerts

## Segurança

### Encryption
- AES-256 encryption at rest
- TLS 1.3 em trânsito
- Key rotation automática
- Hardware security module (HSM) support

### Access Control
- Multi-level authentication
- Role-based access control (RBAC)
- Attribute-based access control (ABAC)
- Time-based access restrictions

### Audit & Compliance
- Complete audit trail
- Tamper-proof logging
- Compliance reporting
- Data retention policies

## Integrações

- **Document Hub**: Integração com documentos gerais
- **Compliance Hub**: Documentos de compliance
- **Crew Management**: Documentos de certificação
- **Admin Module**: Gestão de permissões

## Última Atualização

**Data**: 2025-10-29  
**Versão**: 2.0  
**Features**: AI classification, Secure storage, Smart search
