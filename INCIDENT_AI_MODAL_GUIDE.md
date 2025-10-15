# Incident AI Modal - Documentação

## 📋 Visão Geral

Modal de análise de incidentes com IA implementado para fornecer análises técnicas detalhadas usando GPT-4. O sistema permite que incidentes sejam analisados automaticamente com insights sobre causa raiz, conformidade regulatória e ações recomendadas.

## 🚀 Funcionalidades

### 1. Modal de Análise IA (`IncidentAiModal.tsx`)
- ✅ Detecção automática de incidentes via localStorage
- ✅ Interface intuitiva com Dialog do shadcn/ui
- ✅ Integração com Supabase Edge Functions
- ✅ Feedback visual com toast notifications
- ✅ Suporte a dark mode
- ✅ Scroll automático para resultados longos

### 2. API Edge Function (`dp-intel-analyze`)
- ✅ Análise detalhada usando GPT-4o
- ✅ Prompt especializado em segurança marítima
- ✅ Armazenamento opcional em banco de dados
- ✅ Tratamento de erros robusto
- ✅ CORS configurado

### 3. Integração com Incident Manager
- ✅ Botão "Analisar com IA" em cada card de incidente
- ✅ Ícone Brain (lucide-react)
- ✅ Handler `handleAnalyzeWithAI` implementado

## 🔧 Como Funciona

### Fluxo de Uso

1. **Usuário clica em "Analisar com IA"** no card do incidente
   ```typescript
   handleAnalyzeWithAI(incident);
   ```

2. **Dados são salvos no localStorage**
   ```typescript
   localStorage.setItem('incident_to_analyze', JSON.stringify(incident));
   ```

3. **Modal detecta os dados e abre automaticamente**
   - Via `useEffect` que monitora localStorage
   - Dispara evento `storage` para comunicação

4. **Usuário clica em "Executar análise IA"**
   ```typescript
   const { data } = await supabase.functions.invoke('dp-intel-analyze', {
     body: { incident }
   });
   ```

5. **API processa com GPT-4**
   - Prompt especializado em segurança marítima
   - Análise de conformidade regulatória
   - Recomendações técnicas

6. **Resultado é exibido no modal**
   - Formatação com whitespace-pre-line
   - Opção de executar nova análise

## 📁 Estrutura de Arquivos

```
src/
  components/
    dp/
      IncidentAiModal.tsx          # Componente do modal
    peotram/
      peotram-incident-manager.tsx # Gerenciador com botão de análise

supabase/
  functions/
    dp-intel-analyze/
      index.ts                     # Edge Function para análise IA
```

## 🔑 Configuração Necessária

### Variáveis de Ambiente

As seguintes variáveis devem estar configuradas no Supabase:

```bash
OPENAI_API_KEY           # Chave da API OpenAI
SUPABASE_URL             # URL do projeto Supabase
SUPABASE_SERVICE_ROLE_KEY # Service role key do Supabase
```

### Banco de Dados (Opcional)

Para armazenar análises, crie a tabela:

```sql
CREATE TABLE incident_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id TEXT,
  incident_title TEXT NOT NULL,
  analysis_result TEXT NOT NULL,
  analysis_model TEXT DEFAULT 'gpt-4o',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para buscas rápidas
CREATE INDEX idx_incident_analysis_incident_id ON incident_analysis(incident_id);
CREATE INDEX idx_incident_analysis_created_at ON incident_analysis(created_at);
```

## 💡 Exemplo de Uso

### No Componente de Incidentes

```tsx
import IncidentAiModal from '@/components/dp/IncidentAiModal';

export const MyIncidentComponent = () => {
  const handleAnalyze = (incident) => {
    localStorage.setItem('incident_to_analyze', JSON.stringify({
      title: incident.title,
      description: incident.description,
      type: incident.type,
      severity: incident.severity,
      // ... outros campos
    }));
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <>
      <Button onClick={() => handleAnalyze(incident)}>
        Analisar com IA
      </Button>
      <IncidentAiModal />
    </>
  );
};
```

## 🎯 Análise Fornecida pela IA

A análise inclui:

1. **Análise Técnica**
   - Avaliação baseada em melhores práticas
   - Conformidade com normas (NRs, ISM, STCW, MARPOL)
   - Procedimentos de segurança

2. **Causa Raiz Provável**
   - Metodologia 5 Porquês
   - Diagrama de Ishikawa
   - Análise de fatores contribuintes

3. **Normas Relacionadas**
   - NRs brasileiras aplicáveis
   - Convenções internacionais
   - Regulamentações da Marinha do Brasil

4. **Ações Sugeridas**
   - Ações corretivas imediatas
   - Medidas preventivas de longo prazo
   - Priorização por risco

5. **Riscos Adicionais**
   - Riscos residuais
   - Potenciais complicações
   - Alertas de segurança

6. **Plano de Implementação**
   - Cronograma sugerido
   - Responsabilidades
   - Recursos necessários

## 🧪 Testando

### Teste Manual

1. Acesse o gerenciador de incidentes PEOTRAM
2. Localize um card de incidente
3. Clique em "Analisar com IA"
4. Modal abre automaticamente
5. Clique em "Executar análise IA"
6. Aguarde a análise (10-30 segundos)
7. Revise o resultado

### Teste da Edge Function

```bash
# Via curl
curl -X POST \
  https://[seu-projeto].supabase.co/functions/v1/dp-intel-analyze \
  -H "Authorization: Bearer [seu-anon-key]" \
  -H "Content-Type: application/json" \
  -d '{
    "incident": {
      "title": "Teste de Incidente",
      "description": "Descrição do teste",
      "type": "safety",
      "severity": "medium"
    }
  }'
```

## ⚠️ Considerações Importantes

1. **Custo**: Cada análise consome tokens da OpenAI (modelo GPT-4o)
2. **Tempo**: Análises levam 10-30 segundos dependendo da complexidade
3. **Rate Limits**: Respeite os limites da API OpenAI
4. **Privacidade**: Dados dos incidentes são enviados para OpenAI
5. **Cache**: Considere implementar cache para incidentes similares

## 🔐 Segurança

- ✅ Autenticação via Supabase
- ✅ Validação de entrada na Edge Function
- ✅ Tratamento de erros robusto
- ✅ Logs para auditoria
- ✅ CORS configurado adequadamente

## 📈 Melhorias Futuras

- [ ] Cache de análises similares
- [ ] Histórico de análises por incidente
- [ ] Comparação de análises ao longo do tempo
- [ ] Export de análises em PDF
- [ ] Notificações quando análise estiver pronta
- [ ] Análise em lote de múltiplos incidentes
- [ ] Integração com sistema de workflow
- [ ] Métricas de qualidade das análises

## 📚 Referências

- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Shadcn UI Dialog](https://ui.shadcn.com/docs/components/dialog)
- [NRs - Normas Regulamentadoras](https://www.gov.br/trabalho-e-previdencia/pt-br/composicao/orgaos-especificos/secretaria-de-trabalho/inspecao/seguranca-e-saude-no-trabalho/normas-regulamentadoras)

## 🤝 Suporte

Para problemas ou dúvidas:
1. Verifique os logs do Supabase
2. Confirme configuração das variáveis de ambiente
3. Teste a conectividade com OpenAI
4. Revise a estrutura de dados do incidente

---

**Status**: ✅ Implementado e funcionando
**Última atualização**: 2025-10-14
