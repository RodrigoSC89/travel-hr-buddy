# Módulo: Evidence Ledger

## ✅ Objetivo

Sistema de registro imutável de evidências com verificação criptográfica estilo blockchain para garantir integridade, autenticidade e rastreabilidade de todas as evidências de conformidade, inspeções e auditorias.

## 📁 Estrutura de Arquivos

```
src/pages/admin/
└── evidence-ledger.tsx                  # Interface principal

src/lib/compliance/
└── evidence-ledger.ts                   # Lógica do ledger

src/components/evidence/
├── LedgerViewer.tsx                     # Visualizador do ledger
├── IntegrityChecker.tsx                 # Verificador de integridade
├── EvidenceUploader.tsx                 # Upload de evidências
└── ChainVisualization.tsx               # Visualização da cadeia

tests/
└── e2e/
    └── playwright/
        └── evidence-ledger.spec.ts      # E2E tests
```

## 🛢️ Tabelas Supabase

### `evidence_ledger`
Registro imutável de evidências com hash criptográfico.

**Campos principais:**
- `id`: UUID único
- `block_number`: Número sequencial do bloco
- `previous_hash`: Hash do bloco anterior
- `current_hash`: Hash SHA-256 deste bloco
- `timestamp`: Timestamp de criação
- `evidence_type`: inspection, certificate, audit, incident
- `evidence_data`: JSONB com dados da evidência
- `file_urls`: Array de URLs de arquivos
- `uploaded_by`: UUID do usuário
- `vessel_id`: Referência à embarcação
- `metadata`: JSONB com metadados adicionais
- `verified`: Boolean de verificação
- `created_at`: Timestamp imutável

### `ledger_integrity_checks`
Histórico de verificações de integridade.

**Campos principais:**
- `id`: UUID único
- `check_date`: Data da verificação
- `blocks_checked`: Número de blocos verificados
- `integrity_status`: valid, compromised, warning
- `issues_found`: Array de problemas encontrados
- `checked_by`: UUID do verificador
- `created_at`: Timestamp

### `evidence_access_log`
Registro de acesso às evidências (auditoria).

**Campos principais:**
- `id`: UUID único
- `evidence_id`: Referência à evidência
- `accessed_by`: UUID do usuário
- `access_type`: view, download, verify, export
- `ip_address`: IP de origem
- `user_agent`: Navegador/dispositivo
- `created_at`: Timestamp

## 🔌 Integrações

### Supabase Storage
- Armazenamento seguro de arquivos
- URLs com autenticação
- Versionamento de documentos

### Cryptographic Functions
- SHA-256 para hashing
- Verificação de integridade da cadeia
- Timestamps criptograficamente seguros

### Blockchain Concepts
- Estrutura de blocos encadeados
- Imutabilidade por design
- Verificação de cadeia completa

### Export/Audit
- Exportação JSON completa
- Verificação externa de integridade
- Relatórios de auditoria

## 🧩 UI - Componentes

### LedgerViewer
- Visualização cronológica de evidências
- Filtros por tipo, data, embarcação
- Busca textual
- Detalhes de cada entrada

### IntegrityChecker
- Verificação on-demand de integridade
- Status visual da cadeia
- Identificação de anomalias
- Relatório de verificação

### EvidenceUploader
- Upload de novos registros
- Metadados obrigatórios
- Preview de evidências
- Confirmação criptográfica

### ChainVisualization
- Visualização gráfica da cadeia
- Conexões entre blocos
- Indicadores de hash
- Timeline interativa

## 🔒 RLS Policies

```sql
-- Leitura pública dentro da organização
CREATE POLICY "Organization can view evidence"
  ON evidence_ledger
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND organization_id = evidence_ledger.metadata->>'organization_id'
    )
  );

-- Apenas sistema pode inserir (via function)
CREATE POLICY "System can insert evidence"
  ON evidence_ledger
  FOR INSERT
  WITH CHECK (false); -- Via trigger/function apenas

-- Ninguém pode atualizar ou deletar
-- (Imutabilidade garantida por ausência de políticas UPDATE/DELETE)

-- Auditores podem verificar integridade
CREATE POLICY "Auditor can check integrity"
  ON ledger_integrity_checks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('auditor', 'admin')
    )
  );
```

## 📊 Status Atual

### ✅ Implementado
- Sistema de ledger imutável
- Hash criptográfico SHA-256
- Verificação de integridade da cadeia
- Interface de visualização
- Upload de evidências
- Exportação JSON
- Auditoria de acesso

### ✅ Ativo no Sidebar
- Rota: `/admin/evidence-ledger`

### ✅ Testes Automatizados
- E2E tests: `tests/e2e/playwright/evidence-ledger.spec.ts`

### 🟢 Pronto para Produção

## 📈 Melhorias Futuras

### Fase 2
- **True Blockchain Integration**: Integração com blockchain real (Ethereum, Polygon)
- **NFT Certificates**: Certificados como NFTs
- **Smart Contracts**: Contratos inteligentes para validações

### Fase 3
- **Distributed Ledger**: Ledger distribuído entre múltiplos nós
- **Zero-Knowledge Proofs**: Provas de conformidade sem revelar dados
- **Timestamping Service**: Serviço de timestamp notarizado

### Fase 4
- **Cross-Organization Ledger**: Ledger compartilhado entre organizações
- **API for Authorities**: API para autoridades marítimas verificarem evidências
- **Mobile Verification**: App móvel para verificação de evidências

## 🔗 Algoritmo de Hashing

### Estrutura do Bloco

```typescript
interface EvidenceBlock {
  blockNumber: number;
  previousHash: string;
  timestamp: number;
  evidenceData: any;
  uploadedBy: string;
}

function calculateHash(block: EvidenceBlock): string {
  const data = JSON.stringify({
    blockNumber: block.blockNumber,
    previousHash: block.previousHash,
    timestamp: block.timestamp,
    evidenceData: block.evidenceData,
    uploadedBy: block.uploadedBy
  });
  
  return sha256(data);
}
```

### Verificação de Integridade

```typescript
async function verifyLedgerIntegrity(): Promise<boolean> {
  const blocks = await getAllBlocks();
  
  for (let i = 1; i < blocks.length; i++) {
    const currentBlock = blocks[i];
    const previousBlock = blocks[i - 1];
    
    // Verificar hash do bloco
    const calculatedHash = calculateHash(currentBlock);
    if (calculatedHash !== currentBlock.currentHash) {
      return false; // Hash inválido
    }
    
    // Verificar ligação com bloco anterior
    if (currentBlock.previousHash !== previousBlock.currentHash) {
      return false; // Cadeia quebrada
    }
  }
  
  return true; // Ledger íntegro
}
```

## 📘 Casos de Uso

### 1. Registro de Inspeção
```typescript
await addToLedger({
  evidenceType: 'inspection',
  evidenceData: {
    inspectionId: 'INS-001',
    vessel: 'MV Example',
    inspector: 'John Doe',
    findings: [...],
    score: 95
  },
  fileUrls: ['https://storage.../report.pdf']
});
```

### 2. Verificação de Integridade
```typescript
const isValid = await verifyLedgerIntegrity();
console.log('Ledger integrity:', isValid ? 'VALID' : 'COMPROMISED');
```

### 3. Exportação para Auditoria
```typescript
const ledgerExport = await exportLedger({
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  vesselId: 'vessel-123'
});

downloadJSON(ledgerExport, 'evidence-ledger-2025.json');
```

---

**Versão:** 1.0.0 (PATCH 636)  
**Data:** Novembro 2025  
**Status:** ✅ Implementação Completa  
**Testes:** ✅ PATCH 638 - Cobertura E2E
