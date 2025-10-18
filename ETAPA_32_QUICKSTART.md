# ETAPA 32 - Guia Rápido de Início

## 🚀 Quick Start em 5 Minutos

### Passo 1: Configurar Ambiente

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
echo "VITE_OPENAI_API_KEY=sua-chave-aqui" >> .env

# Aplicar migrations
supabase db push
```

### Passo 2: Criar Bucket de Storage

```bash
# Via Supabase CLI ou Dashboard
supabase storage create evidence-files --private
```

### Passo 3: Deploy Edge Function

```bash
# Deploy da função
supabase functions deploy audit-simulate

# Configurar secret
supabase secrets set OPENAI_API_KEY=sua-chave-openai
```

### Passo 4: Acessar Interface

1. Navegue para `/admin/audit-system`
2. Escolha uma das três abas disponíveis

---

## 📖 Guia de Uso por Módulo

### 🤖 ETAPA 32.1 - Simulação de Auditoria

#### Como Usar

1. **Acesse**: `/admin/audit-system` → Aba "Simulação de Auditoria"

2. **Preencha os campos**:
   - Nome da Embarcação: Ex: "Navio Alpha"
   - Tipo de Auditoria: Selecione entre Petrobras, IBAMA, IMO, ISO ou IMCA

3. **Clique em "Simular Auditoria"**

4. **Aguarde** ~30 segundos enquanto a IA processa

5. **Resultado**: Você receberá:
   - ✅ Conformidades detectadas
   - 🚨 Não conformidades com severidade
   - 📊 Score de 0-100 por norma aplicada
   - 📑 Relatório técnico completo
   - 📋 Plano de ação priorizado

6. **Exportar**: Clique em "Exportar PDF" para salvar o relatório

#### Exemplo de Uso

```typescript
// O sistema busca automaticamente:
// - Incidentes registrados da embarcação
// - Histórico de auditorias anteriores
// - Práticas de segurança implementadas

// E gera um relatório como:
{
  conformities: [
    "Sistema de gestão documentado e atualizado",
    "Treinamentos de segurança em dia",
    // ...
  ],
  nonConformities: [
    {
      severity: "Alta",
      description: "Falta de registro de inspeções mensais",
      clause: "ISM 10.2.1"
    }
  ],
  scoresByNorm: {
    "ISM-Code": 85,
    "SOLAS": 92
  },
  technicalReport: "Relatório completo em português...",
  actionPlan: [...]
}
```

---

### 📊 ETAPA 32.2 - Dashboard de Performance

#### Como Usar

1. **Acesse**: `/admin/audit-system` → Aba "Performance por Embarcação"

2. **Configure os filtros**:
   - Embarcação: Selecione da lista
   - Data Inicial: Ex: 2025-01-01
   - Data Final: Ex: 2025-10-18

3. **Clique em "Calcular"**

4. **Visualize as métricas**:
   - 📈 Conformidade Normativa (%)
   - ⏱️ MTTR - Tempo Médio de Reparo (horas)
   - 📊 Total de Incidentes vs Resolvidos
   - 🤖 Ações de IA vs Humanas
   - 🎓 Treinamentos Completados

5. **Exportar**: Clique no ícone de download para CSV

#### Métricas Calculadas

| Métrica | Fonte | Cálculo |
|---------|-------|---------|
| Conformidade (%) | Auditorias + IA | Média dos scores de auditoria |
| MTTR | Incidentes DP | Tempo médio entre criação e resolução |
| Taxa Resolução | Incidentes DP | Resolvidos / Total |
| Ações IA vs Humanas | Logs do sistema | Contagem por tipo |
| Treinamentos | RH + Capacitações | Total completado no período |

---

### 📂 ETAPA 32.3 - Gestão de Evidências

#### Como Usar

1. **Acesse**: `/admin/audit-system` → Aba "Evidências"

2. **Selecione**:
   - Norma: Ex: ISO-9001, ISM-Code, IMCA
   - Embarcação: Ex: "Navio Alpha"

3. **Visualize Evidências Faltantes**:
   - Sistema mostra automaticamente gaps
   - Lista cláusulas sem evidências validadas
   - Indica tipos de arquivo aceitos

4. **Fazer Upload**:
   - Clique em "Upload" na cláusula desejada
   - Selecione arquivo (PDF, DOC, XLS, etc.)
   - Aguarde confirmação

5. **Validar Evidências**:
   - Revise documento enviado
   - Clique em "Validar" para aprovar
   - Ou "Remover" para desvalidar

6. **Filtrar**:
   - Todas / Validadas / Pendentes

#### Normas Suportadas

- **ISO 9001** - Gestão da Qualidade
- **ISO 14001** - Gestão Ambiental
- **ISO 45001** - Saúde e Segurança Ocupacional
- **ISM Code** - International Safety Management
- **ISPS Code** - Ship and Port Facility Security
- **MODU Code** - Mobile Offshore Drilling Unit
- **IBAMA** - Instituto Brasileiro do Meio Ambiente
- **Petrobras** - Padrões corporativos
- **IMCA** - International Marine Contractors Association

#### Templates Pré-carregados

O sistema já vem com templates de cláusulas para cada norma:

```sql
-- Exemplo: ISO 9001
- 4.1: Understanding the organization
- 4.2: Understanding stakeholder needs
- 5.1: Leadership and commitment
- 6.1: Risk and opportunity management
- ...

-- Exemplo: ISM Code
- 1.2: Safety management objectives
- 2.1: Company responsibilities
- 3.1: Designated person
- ...
```

---

## 🎬 Cenários de Uso

### Cenário 1: Preparação para Auditoria Petrobras

```
1. Abra ETAPA 32.1
2. Selecione "Petrobras (PEO-DP)"
3. Informe nome do navio
4. Execute simulação
5. Revise não conformidades
6. Acesse ETAPA 32.3
7. Faça upload das evidências faltantes
8. Valide documentos
9. Exporte relatório final em PDF
```

### Cenário 2: Análise de Performance Mensal

```
1. Abra ETAPA 32.2
2. Selecione embarcação
3. Configure período (último mês)
4. Calcule métricas
5. Analise KPIs:
   - Conformidade caiu? Investigue
   - MTTR subiu? Revise manutenção
   - Incidentes aumentaram? Ação corretiva
6. Exporte CSV para relatório gerencial
```

### Cenário 3: Certificação ISO 9001

```
1. Abra ETAPA 32.3
2. Selecione ISO-9001
3. Selecione embarcação
4. Revise lista de evidências faltantes
5. Para cada cláusula:
   a. Prepare documento
   b. Faça upload
   c. Aguarde validação interna
6. Quando 100% validado → Solicitar auditoria externa
7. Use ETAPA 32.1 para simulação prévia
```

---

## 🔑 Dicas e Boas Práticas

### ✅ Do's

- ✅ Execute simulações mensalmente para acompanhamento
- ✅ Mantenha evidências sempre atualizadas
- ✅ Valide documentos assim que forem enviados
- ✅ Use os relatórios de IA para identificar gaps proativamente
- ✅ Exporte métricas regularmente para histórico
- ✅ Configure alertas para evidências expirando

### ❌ Don'ts

- ❌ Não espere a auditoria real para testar
- ❌ Não deixe evidências pendentes sem validação
- ❌ Não ignore não conformidades menores
- ❌ Não confie apenas na IA - valide manualmente
- ❌ Não misture documentos de diferentes embarcações

### 💡 Pro Tips

1. **Automatize**: Configure relatórios automáticos mensais
2. **Integre**: Use APIs para alimentar dados de outros sistemas
3. **Documente**: Mantenha notas sobre cada não conformidade
4. **Treine**: Capacite a equipe no uso do sistema
5. **Revise**: Faça auditorias internas antes das externas

---

## 🐛 Troubleshooting Comum

### Problema: Simulação não completa

**Causa**: OpenAI API key não configurada
**Solução**:
```bash
supabase secrets set OPENAI_API_KEY=sua-chave
supabase functions deploy audit-simulate
```

### Problema: Upload de evidência falha

**Causa**: Bucket não criado ou não é privado
**Solução**:
```bash
supabase storage create evidence-files --private
```

### Problema: Métricas não calculam

**Causa**: Função PostgreSQL não criada
**Solução**:
```bash
supabase db push
```

### Problema: Evidências não aparecem

**Causa**: RLS (Row Level Security) bloqueando acesso
**Solução**: Verifique se usuário está autenticado

---

## 📞 Suporte

Documentação completa: [ETAPA_32_IMPLEMENTATION.md](./ETAPA_32_IMPLEMENTATION.md)

Para questões técnicas detalhadas, consulte a documentação de implementação.
