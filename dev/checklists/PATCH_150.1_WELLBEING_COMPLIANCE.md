# ✅ PATCH 150.1 — Wellbeing & Ethics Compliance

**Status:** 🔴 Revisão Crítica  
**Data:** 2025-10-25  
**Responsável:** Comitê de Ética + Validação Legal  
**Prioridade:** 🔴 Crítica (Conformidade LGPD/GDPR)

---

## 📋 Resumo do PATCH

Validação completa do módulo de Wellbeing com foco rigoroso em consentimento informado, anonimização de dados, ética em saúde mental e conformidade legal (LGPD/GDPR).

---

## 🎯 Objetivos de Validação

- [x] Consentimento explícito e informado
- [x] Dados 100% anonimizados
- [x] Conformidade LGPD/GDPR
- [x] Supervisão por profissional de saúde
- [x] Transparência nos algoritmos

---

## 🔍 Checklist de Validação

### ◼️ Consentimento Informado

- [ ] **UI de Consentimento**
  - [ ] Modal de onboarding explicando propósito do módulo
  - [ ] Termos de uso em linguagem clara (não jurídica)
  - [ ] Checkbox "Li e concordo" obrigatório
  - [ ] Opção de "Não concordo" que desabilita módulo

- [ ] **Informações Obrigatórias**
  - [ ] Tipos de dados coletados (humor, sono, estresse)
  - [ ] Como dados serão usados (analytics, IA)
  - [ ] Quem tem acesso (usuário, supervisor opcional)
  - [ ] Direito de revogação a qualquer momento

- [ ] **Consentimento Granular**
  - [ ] Opção de desabilitar analytics
  - [ ] Opção de desabilitar IA preditiva
  - [ ] Opção de desabilitar compartilhamento com supervisor
  - [ ] Histórico de consentimentos versionado

- [ ] **Revogação**
  - [ ] Botão "Revogar Consentimento" sempre visível
  - [ ] Deletar todos os dados ao revogar
  - [ ] Confirmação dupla para evitar clique acidental
  - [ ] Email de confirmação de revogação

### ◼️ Anonimização de Dados

- [ ] **Dados Coletados**
  - [ ] ID único criptografado (UUID v4)
  - [ ] Timestamps sem timezone (UTC)
  - [ ] Métricas agregadas (não raw)
  - [ ] Sem dados PII (nome, email, CPF)

- [ ] **Criptografia**
  - [ ] AES-256 para dados em repouso
  - [ ] TLS 1.3 para dados em trânsito
  - [ ] Hashing irreversível de IDs
  - [ ] Salt único por usuário

- [ ] **Agregação**
  - [ ] Relatórios sempre com ≥ 5 usuários
  - [ ] K-anonymity (k ≥ 5) para analytics
  - [ ] Differential privacy para IA
  - [ ] Sem possibilidade de re-identificação

- [ ] **Retenção de Dados**
  - [ ] TTL de 90 dias para dados detalhados
  - [ ] TTL de 1 ano para dados agregados
  - [ ] Deleção automática após TTL
  - [ ] Logs de deleção auditáveis

### ◼️ Conformidade Legal

- [ ] **LGPD (Brasil)**
  - [ ] Nomeação de DPO (Data Protection Officer)
  - [ ] RIPD (Relatório de Impacto) completo
  - [ ] Canal de comunicação com titular de dados
  - [ ] Processo de portabilidade de dados

- [ ] **GDPR (Europa)**
  - [ ] Right to Access implementado
  - [ ] Right to Erasure ("Right to be Forgotten")
  - [ ] Data Portability em formato JSON
  - [ ] Privacy by Design & Default

- [ ] **Documentação Legal**
  - [ ] Termos de Uso atualizados
  - [ ] Política de Privacidade específica para Wellbeing
  - [ ] Cookie Policy (se analytics frontend)
  - [ ] Aviso de coleta de dados sensíveis

### ◼️ Supervisão Profissional

- [ ] **Disclaimer Médico**
  - [ ] Aviso visível: "Não substitui atendimento médico"
  - [ ] Link para recursos de emergência (CVV, SAMU)
  - [ ] Recomendação de consulta profissional
  - [ ] Limitações do sistema claramente expostas

- [ ] **Escalação de Riscos**
  - [ ] Algoritmo de detecção de sinais críticos
  - [ ] Alerta automático para supervisor se score < 30
  - [ ] Opção de contato direto com psicólogo
  - [ ] Log de todas as escalações

- [ ] **Aprovação de Psicólogo**
  - [ ] Questionários validados por profissional (PHQ-9, GAD-7)
  - [ ] Algoritmo de scoring aprovado
  - [ ] Interpretação de resultados revisada
  - [ ] Atualização anual do protocolo

### ◼️ Transparência Algorítmica

- [ ] **Explicabilidade**
  - [ ] Fatores que influenciam score de wellbeing expostos
  - [ ] Lógica de recomendações explicada em linguagem simples
  - [ ] Nenhuma "caixa preta" de IA
  - [ ] Documentação técnica acessível

- [ ] **Auditabilidade**
  - [ ] Logs de predições IA (input + output)
  - [ ] Versionamento de modelos de IA
  - [ ] Métricas de performance (accuracy, bias)
  - [ ] Revisão trimestral de vieses

---

## 🧪 Cenários de Teste

### Teste 1: Fluxo de Consentimento Completo
```
1. Acessar módulo Wellbeing pela primeira vez
2. Ler modal de onboarding
3. Verificar clareza dos termos
4. Tentar prosseguir sem concordar
5. Concordar e verificar persistência
6. Revogar consentimento
7. Confirmar deleção de dados
```

**Resultado Esperado:**
- Modal bloqueante até consentimento
- Termos claros e não jurídicos
- Impossível prosseguir sem concordar
- Revogação deleta 100% dos dados
- Email de confirmação enviado

### Teste 2: Anonimização e Criptografia
```
1. Registrar dados de humor por 30 dias
2. Consultar banco de dados diretamente
3. Verificar ausência de PII
4. Tentar re-identificar usuário
5. Exportar dados para análise
```

**Resultado Esperado:**
- Zero campos de PII no banco
- IDs criptografados irreversivelmente
- Re-identificação impossível
- Dados exportados anonimizados
- Timestamps sem timezone

### Teste 3: Direito de Acesso e Portabilidade
```
1. Usuário solicita cópia de seus dados
2. Sistema gera export em JSON
3. Verificar completude dos dados
4. Validar formato legível por máquina
5. Confirmar entrega em < 48h
```

**Resultado Esperado:**
- Export completo em formato JSON
- Estrutura documentada e legível
- Dados entregues via email seguro
- Processo auditado e logado

### Teste 4: Escalação de Risco
```
1. Registrar score de wellbeing < 30 (crítico)
2. Verificar alerta automático
3. Confirmar notificação ao supervisor
4. Testar opção de contato com psicólogo
5. Validar log de escalação
```

**Resultado Esperado:**
- Alerta dispara automaticamente
- Supervisor notificado em < 5min
- Opções de suporte exibidas
- Evento logado para auditoria
- Usuário não se sente "vigiado"

### Teste 5: Transparência Algorítmica
```
1. Receber score de wellbeing de 65
2. Clicar em "Por que esse score?"
3. Verificar explicação detalhada
4. Entender fatores que impactam score
5. Validar linguagem acessível
```

**Resultado Esperado:**
- Explicação em linguagem simples
- Fatores listados com pesos relativos
- Sugestões acionáveis para melhora
- Nenhum jargão técnico
- Link para saber mais

---

## 🔧 Arquivos Relacionados

```
src/components/wellbeing/
├── ConsentModal.tsx             # Modal de onboarding e termos
├── DataPrivacySettings.tsx      # Controles de privacidade
├── WellbeingDisclaimer.tsx      # Aviso médico
└── ExplainabilityPanel.tsx      # Transparência de algoritmos

src/lib/wellbeing/
├── dataAnonymization.ts         # Criptografia e hashing
├── consentManager.ts            # Gerenciamento de consentimento
├── dataRetention.ts             # Políticas de TTL
└── riskEscalation.ts            # Lógica de escalação

src/services/
├── wellbeingCompliance.ts       # LGPD/GDPR compliance
└── dataExport.ts                # Portabilidade de dados

docs/legal/
├── WELLBEING_TERMS.md           # Termos específicos do módulo
├── PRIVACY_POLICY_WELLBEING.md  # Política de privacidade
└── RIPD_WELLBEING.pdf           # Relatório de Impacto (LGPD)
```

---

## 📊 Métricas de Sucesso

| Métrica | Meta | Atual | Status |
|---------|------|-------|--------|
| Taxa de Consentimento | > 70% | - | 🟡 |
| Revogações por Mês | < 5% | - | 🟡 |
| Tempo de Export de Dados | < 48h | - | 🟡 |
| Taxa de Re-identificação | 0% | - | 🟡 |
| Escalações de Risco | 100% logadas | - | 🟡 |
| Satisfação com Explicabilidade | > 4.0/5.0 | - | 🟡 |

---

## 🐛 Problemas Conhecidos

- [ ] **P1 CRÍTICO:** Dados não são deletados imediatamente após revogação (async job)
- [ ] **P2 CRÍTICO:** K-anonymity pode falhar em times pequenos (< 5 pessoas)
- [ ] **P3:** Explicabilidade de IA pode ser muito técnica para usuários leigos
- [ ] **P4:** Escalação de risco pode gerar falsos positivos

---

## ✅ Critérios de Aprovação

- [x] Código implementado sem erros TypeScript
- [ ] **BLOQUEANTE:** Aprovação de advogado especializado em LGPD/GDPR
- [ ] **BLOQUEANTE:** Aprovação de psicólogo licenciado (CRP)
- [ ] **BLOQUEANTE:** Auditoria de segurança externa aprovada
- [ ] Consentimento informado 100% implementado
- [ ] Anonimização verificada por especialista
- [ ] RIPD completo e aprovado
- [ ] Testes de penetração (pentest) aprovados
- [ ] Comitê de ética interno aprova lançamento

---

## 📝 Notas Técnicas

### Estrutura de Dados Anonimizados
```typescript
interface WellbeingDataAnonymized {
  id: string;                 // UUID v4 (hashed)
  timestamp: number;          // Unix UTC (sem timezone)
  moodScore: number;          // 0-100
  sleepHours: number;         // Arredondado para 0.5h
  stressLevel: number;        // 1-5
  activityMinutes: number;    // Arredondado para 10min
  // NEVER: name, email, cpf, vessel_name, etc.
}
```

### Consentimento Versionado
```typescript
interface ConsentRecord {
  userId: string;
  version: string;            // "v1.2.0"
  consentedAt: number;
  revokedAt?: number;
  scope: {
    analytics: boolean;
    aiPrediction: boolean;
    supervisorAccess: boolean;
  };
  ipAddress: string;          // Para auditoria legal
  userAgent: string;
}
```

### Algoritmo de Escalação
```typescript
const RISK_ESCALATION = {
  criticalScore: 30,          // Score abaixo disso → alerta
  consecutiveLowDays: 7,      // 7 dias seguidos < 40 → alerta
  rapidDrop: 20,              // Queda de 20 pontos em 48h → alerta
  selfReportedRisk: true      // Usuário marca "Preciso de ajuda"
};
```

---

## 🚀 Próximos Passos

1. **BLOQUEANTE:** Contratar advogado especializado em LGPD/GDPR
2. **BLOQUEANTE:** Contratar psicólogo para validar questionários
3. **BLOQUEANTE:** Realizar pentest externo (min. 2 empresas)
4. **Formar Comitê de Ética:** 3+ membros (tech, legal, saúde)
5. **Auditoria de Vieses:** Testar algoritmo em populações diversas
6. **Beta Privado:** 20 voluntários com consentimento super rigoroso
7. **RIPD Completo:** Documentar impactos e medidas mitigatórias

---

## 📖 Referências

- [LGPD - Lei Geral de Proteção de Dados](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [GDPR - General Data Protection Regulation](https://gdpr.eu/)
- [K-Anonymity Explained](https://en.wikipedia.org/wiki/K-anonymity)
- [Differential Privacy](https://en.wikipedia.org/wiki/Differential_privacy)
- [PHQ-9 Depression Scale](https://www.apa.org/depression-guideline/patient-health-questionnaire.pdf)
- [GAD-7 Anxiety Scale](https://adaa.org/sites/default/files/GAD-7_Anxiety-updated_0.pdf)
- [Ethics in AI for Healthcare](https://www.who.int/publications/i/item/9789240029200)

---

## ⚠️ AVISO LEGAL

**ESTE MÓDULO NÃO DEVE SER LANÇADO SEM:**
1. Aprovação jurídica formal (LGPD/GDPR)
2. Aprovação de psicólogo licenciado (CRP)
3. Auditoria de segurança externa
4. Comitê de ética constituído e aprovação unânime

**O não cumprimento pode resultar em:**
- Multas de até R$ 50 milhões (LGPD)
- Processo ético profissional
- Responsabilização civil e criminal
- Dano reputacional irreversível

---

**Última Atualização:** 2025-10-25  
**Status:** 🔴 **NÃO APROVADO PARA PRODUÇÃO**  
**Próxima Revisão:** Após aprovações legais e éticas obrigatórias
