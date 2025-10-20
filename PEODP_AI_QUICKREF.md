# PEO-DP AI - Quick Reference

## 🚀 Início Rápido

### Executar Auditoria

```typescript
import { peodpCore } from "@/modules/peodp_ai";

const auditoria = await peodpCore.iniciarAuditoria({
  vesselName: "PSV Ocean Explorer",
  dpClass: "DP2"
});
```

### Gerar Relatório PDF

```typescript
import { PEOEngine, peodpCore } from "@/modules/peodp_ai";

const auditoria = await peodpCore.iniciarAuditoria({ vesselName: "Navio X" });
const engine = new PEOEngine();
const recomendacoes = engine.gerarRecomendacoes(auditoria);

peodpCore.downloadReports(auditoria, recomendacoes, "pdf");
```

### Acessar via Interface Web

```
/admin/peodp-audit
```

## 📊 Estrutura de Dados

### Auditoria Result

```typescript
interface PEODPAuditoria {
  data: string;              // ISO timestamp
  resultado: Array<{
    item: string;            // "N101-01" ou "M117-03"
    descricao: string;       // Descrição do requisito
    cumprimento: "OK" | "N/A" | "Não Conforme" | "Pendente";
    observacoes?: string;
  }>;
  score: number;             // 0-100
  vesselName?: string;
  dpClass?: string;
  normas: string[];          // ["NORMAM-101/DPC", "IMCA M117 - ..."]
}
```

## 🎯 Normas Implementadas

### NORMAM-101 (5 requisitos)
- N101-01: Certificação DP (IMO MSC/Circ.645)
- N101-02: Logs e eventos DP
- N101-03: Tripulação certificada
- N101-04: Manutenção (IMCA M117)
- N101-05: ASOG e FMEA

### IMCA M 117 (5 requisitos)
- M117-01: DPO certificado
- M117-02: Treinamento específico
- M117-03: Experiência documentada
- M117-04: Reciclagem contínua
- M117-05: Matriz de competências

## 📈 Score Levels

| Score | Level | Ação |
|-------|-------|------|
| 90-100% | 🌟 Excelente | Operação liberada |
| 75-89% | ✅ Bom | Operação com observações |
| 60-74% | ⚠️ Aceitável | Plano de ação necessário |
| 0-59% | 🚨 Não Conforme | Operação NÃO liberada |

## 🔗 API Reference

### peodpCore

```typescript
class PEOdpCore {
  async iniciarAuditoria(options: PEODPCoreOptions): Promise<PEODPAuditoria>;
  downloadReports(auditoria, recomendacoes, format): void;
  async gerarPreview(auditoria, recomendacoes): Promise<string>;
  gerarMarkdown(auditoria, recomendacoes): string;
}
```

### PEOEngine

```typescript
class PEOEngine {
  async executarAuditoria(vesselName?, dpClass?): Promise<PEODPAuditoria>;
  gerarRecomendacoes(auditoria): string[];
}
```

### PEOReport

```typescript
class PEOReport {
  gerarRelatorio(auditoria, recomendacoes?): jsPDF;
  downloadRelatorio(auditoria, recomendacoes?, filename?): void;
  gerarPreview(auditoria, recomendacoes?): string;
  gerarMarkdown(auditoria, recomendacoes?): string;
}
```

## 🧪 Testing

```bash
# Executar todos os testes do módulo
npm run test src/tests/modules/peodp-engine.test.ts

# Executar testes do componente
npm run test src/tests/components/peodp-ai/
```

## 📁 Arquivos Principais

```
src/modules/peodp_ai/
├── peodp_core.ts          # Orquestrador principal
├── peodp_engine.ts        # Motor de auditoria
├── peodp_report.ts        # Gerador de relatórios
├── peodp_rules.ts         # Regras e validações
├── peodp_profiles/
│   ├── normam_101.json    # Requisitos NORMAM-101
│   └── imca_m117.json     # Requisitos IMCA M 117
└── README.md

src/components/peodp-ai/
└── peodp-audit-component.tsx

src/pages/admin/
└── peodp-audit.tsx

src/types/
└── peodp-audit.ts
```

## 🔍 Exemplos Rápidos

### 1. Auditoria Simples
```typescript
const auditoria = await peodpCore.iniciarAuditoria({
  vesselName: "Navio A"
});
console.log(`Score: ${auditoria.score}%`);
```

### 2. Com Auto-Download
```typescript
await peodpCore.iniciarAuditoria({
  vesselName: "Navio B",
  dpClass: "DP3",
  autoDownload: true,
  format: "both"  // PDF + Markdown
});
```

### 3. Apenas Recomendações
```typescript
const engine = new PEOEngine();
const auditoria = await engine.executarAuditoria("Navio C", "DP2");
const recs = engine.gerarRecomendacoes(auditoria);
console.log(recs);
```

### 4. Preview Base64
```typescript
const preview = await peodpCore.gerarPreview(auditoria, recomendacoes);
// Use preview como src de iframe ou img
```

## 🎨 UI Component

```tsx
import { PEODPAuditComponent } from "@/components/peodp-ai/peodp-audit-component";

function MyPage() {
  return <PEODPAuditComponent />;
}
```

## 📝 TypeScript Types

```typescript
import type { 
  PEODPAuditoria,
  PEODPResultadoItem,
  PEODPProfile,
  PEODPRequisito,
  PEODPCoreOptions 
} from "@/types/peodp-audit";
```

## 🔐 Permissões

A página `/admin/peodp-audit` requer:
- Autenticação de usuário
- Acesso ao módulo Admin

## 📚 Documentação

- [README completo](src/modules/peodp_ai/README.md)
- [Guia de integração](PEODP_AI_INTEGRATION_GUIDE.md)
- [Testes](src/tests/modules/peodp-engine.test.ts)

## 🆘 Troubleshooting

### Build Error
```bash
npm install
npm run build
```

### Test Failure
```bash
npm run test -- --reporter=verbose
```

### PDF não gera
Verifique se `jspdf` e `jspdf-autotable` estão instalados:
```bash
npm list jspdf jspdf-autotable
```

---

**v1.0.0** | [GitHub](https://github.com/RodrigoSC89/travel-hr-buddy)
