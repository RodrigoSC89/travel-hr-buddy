# Dashboard de Auditorias - Guia de Implementação

## 📋 Visão Geral

Este documento descreve a implementação do Dashboard de Resumo de Auditorias, que permite visualizar e analisar dados de auditorias PEOTRAM através de gráficos interativos.

## 🎯 Funcionalidades Implementadas

### 1. API Endpoint (Supabase Edge Function)
- **Localização**: `/supabase/functions/resumo-auditorias-api/index.ts`
- **Método**: GET
- **Parâmetros**:
  - `startDate` (opcional): Data de início para filtrar auditorias (formato: YYYY-MM-DD)
  - `endDate` (opcional): Data de fim para filtrar auditorias (formato: YYYY-MM-DD)
  - `userId` (opcional): ID do usuário para filtrar auditorias criadas por ele

#### Resposta da API:
```json
{
  "success": true,
  "dadosPorNavio": [
    {
      "nome_navio": "Nome do Navio",
      "total": 10
    }
  ],
  "tendenciaPorData": [
    {
      "data": "2024-01-15",
      "total": 5
    }
  ],
  "totalAuditorias": 50,
  "generatedAt": "2024-01-15T12:00:00.000Z"
}
```

### 2. Dashboard Page
- **Localização**: `/src/pages/admin/dashboard-auditorias.tsx`
- **Rota**: `/admin/dashboard-auditorias`

#### Componentes da Página:

1. **Filtros**:
   - Data Início: Campo de data para filtrar auditorias a partir de uma data específica
   - Data Fim: Campo de data para filtrar auditorias até uma data específica
   - Usuário (ID): Campo opcional para filtrar por usuário específico

2. **Gráfico de Barras Vertical**:
   - Mostra o número total de auditorias por navio
   - Layout vertical para melhor legibilidade dos nomes dos navios
   - Ordenado por número de auditorias (descendente)

3. **Gráfico de Linha**:
   - Exibe a tendência de auditorias ao longo do tempo
   - Mostra o número de auditorias por data
   - Útil para identificar padrões e picos de atividade

4. **Exportação para PDF**:
   - Botão para exportar os gráficos em formato PDF
   - Nome do arquivo: `auditorias-dashboard-YYYY-MM-DD.pdf`
   - Orientação paisagem (landscape) para melhor visualização

## 🔧 Tecnologias Utilizadas

- **React**: Framework para construção da interface
- **Recharts**: Biblioteca para gráficos (BarChart, LineChart)
- **html2canvas**: Captura de elementos HTML para PDF
- **jsPDF**: Geração de documentos PDF
- **Supabase**: Backend e Edge Functions
- **TypeScript**: Tipagem estática

## 📊 Estrutura de Dados

### Tabela: peotram_audits
```sql
- id: UUID
- organization_id: UUID
- vessel_id: UUID (FK para vessels)
- audit_period: TEXT
- audit_date: DATE
- status: TEXT
- created_by: UUID
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Tabela: vessels
```sql
- id: UUID
- name: TEXT (usado como nome_navio nos gráficos)
- imo_number: TEXT
- vessel_type: TEXT
```

## 🚀 Como Usar

1. **Acessar o Dashboard**:
   - Navegue para `/admin/dashboard-auditorias`

2. **Filtrar Dados**:
   - Selecione datas de início e fim (opcional)
   - Insira um ID de usuário para filtrar por criador (opcional)
   - Clique em "Filtrar" para carregar os dados

3. **Visualizar Gráficos**:
   - O gráfico de barras mostra auditorias por navio
   - O gráfico de linha mostra a tendência temporal
   - Passe o mouse sobre os gráficos para ver detalhes

4. **Exportar PDF**:
   - Clique em "Exportar PDF" para baixar os gráficos
   - O PDF será salvo automaticamente no dispositivo

## 🔐 Permissões

- Requer acesso ao painel administrativo
- Recomendado para roles: `admin`, `hr_manager`

## 📝 Exemplos de Uso

### Filtrar auditorias do último mês:
```
Data Início: 2024-12-01
Data Fim: 2024-12-31
Usuário: (deixar vazio)
```

### Ver auditorias de um usuário específico:
```
Data Início: (deixar vazio)
Data Fim: (deixar vazio)
Usuário: 550e8400-e29b-41d4-a716-446655440000
```

## 🐛 Solução de Problemas

### Erro ao carregar dados:
- Verifique se a função Supabase está implantada
- Confirme que as variáveis de ambiente estão configuradas
- Verifique as permissões de acesso à tabela `peotram_audits`

### Gráficos não aparecem:
- Certifique-se de que existem dados para o período filtrado
- Clique no botão "Filtrar" para carregar os dados
- Verifique o console do navegador para erros

### Exportação de PDF não funciona:
- Verifique se há dados carregados antes de exportar
- Certifique-se de que o navegador permite downloads

## 📚 Referências

- [Recharts Documentation](https://recharts.org/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [jsPDF Documentation](https://github.com/parallax/jsPDF)

## ✅ Checklist de Implementação

- [x] Criar Supabase Edge Function para API de resumo
- [x] Implementar endpoint com filtros (data e usuário)
- [x] Criar página do dashboard
- [x] Adicionar filtros na interface
- [x] Implementar gráfico de barras (auditorias por navio)
- [x] Implementar gráfico de linha (tendência por data)
- [x] Adicionar funcionalidade de exportação para PDF
- [x] Adicionar rota no App.tsx
- [x] Testar build do projeto
- [x] Corrigir erros de linting

## 🎨 Melhorias Futuras (Opcional)

- Adicionar mais opções de filtro (status, período)
- Implementar paginação para grandes volumes de dados
- Adicionar gráficos adicionais (pizza, área)
- Criar comparação entre períodos
- Adicionar download em outros formatos (CSV, Excel)
- Implementar cache de dados para melhor performance
