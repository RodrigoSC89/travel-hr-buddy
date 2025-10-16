-- Criar tabela de auditorias IMCA
CREATE TABLE IF NOT EXISTS auditoria_imca (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_navio TEXT NOT NULL,
  contexto TEXT NOT NULL,
  relatorio TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar índice para busca por nome do navio
CREATE INDEX IF NOT EXISTS idx_auditoria_imca_nome_navio ON auditoria_imca(nome_navio);
CREATE INDEX IF NOT EXISTS idx_auditoria_imca_created_at ON auditoria_imca(created_at DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE auditoria_imca ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura para usuários autenticados
CREATE POLICY "Usuários autenticados podem ler auditorias IMCA"
  ON auditoria_imca
  FOR SELECT
  TO authenticated
  USING (true);

-- Criar política para permitir inserção para usuários autenticados
CREATE POLICY "Usuários autenticados podem criar auditorias IMCA"
  ON auditoria_imca
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Inserir alguns dados de exemplo para teste
INSERT INTO auditoria_imca (nome_navio, contexto, relatorio) VALUES
  (
    'MV Atlantic Voyager',
    'Auditoria IMCA M189 - Inspeção de Sistema de Posicionamento Dinâmico',
    E'RELATÓRIO DE AUDITORIA IMCA\n\nNavio: MV Atlantic Voyager\nData: 15/10/2025\n\n1. RESUMO EXECUTIVO\n\nFoi realizada auditoria completa do sistema de posicionamento dinâmico conforme norma IMCA M189. O navio demonstrou conformidade com os requisitos técnicos e operacionais.\n\n2. ÁREAS AVALIADAS\n\n- Sistema de Propulsão: Conforme\n- Sistema de Sensores: Conforme\n- Sistema de Controle: Conforme\n- Procedimentos Operacionais: Conforme\n- Treinamento da Tripulação: Conforme\n\n3. NÃO CONFORMIDADES\n\nNenhuma não conformidade crítica identificada.\n\n4. RECOMENDAÇÕES\n\n- Atualizar procedimentos de manutenção preventiva\n- Realizar simulações de falhas com maior frequência\n\n5. CONCLUSÃO\n\nO navio está apto para operações com sistema DP conforme normas IMCA.'
  ),
  (
    'MV Pacific Guardian',
    'Auditoria IMCA M190 - Verificação de Redundância de Sistemas',
    E'RELATÓRIO DE AUDITORIA IMCA\n\nNavio: MV Pacific Guardian\nData: 10/10/2025\n\n1. RESUMO EXECUTIVO\n\nAuditoria de verificação de redundância de sistemas críticos conforme IMCA M190. Identificadas 2 não conformidades menores.\n\n2. ÁREAS AVALIADAS\n\n- Redundância de Energia: Conforme\n- Redundância de Propulsão: Não Conforme Menor\n- Sistema de Backup: Conforme\n- Comunicações: Não Conforme Menor\n- Documentação: Conforme\n\n3. NÃO CONFORMIDADES\n\nNC001: Propulsor lateral de reserva apresenta tempo de resposta acima do especificado\nNC002: Sistema de comunicação redundante necessita calibração\n\n4. AÇÕES CORRETIVAS REQUERIDAS\n\n- Realizar manutenção no propulsor lateral (prazo: 30 dias)\n- Calibrar sistema de comunicação (prazo: 15 dias)\n\n5. CONCLUSÃO\n\nApós correção das não conformidades menores, o navio estará em plena conformidade com IMCA M190.'
  ),
  (
    'MV Ocean Explorer',
    'Auditoria IMCA M103 - Certificação de Operadores DP',
    E'RELATÓRIO DE AUDITORIA IMCA\n\nNavio: MV Ocean Explorer\nData: 05/10/2025\n\n1. RESUMO EXECUTIVO\n\nAuditoria de certificação de operadores de sistema DP conforme IMCA M103. Todos os operadores demonstraram competência adequada.\n\n2. OPERADORES AVALIADOS\n\n- João Silva - Operador Sênior: Aprovado\n- Maria Santos - Operadora: Aprovado\n- Pedro Oliveira - Operador Trainee: Aprovado com restrições\n\n3. COMPETÊNCIAS VERIFICADAS\n\n- Conhecimento teórico do sistema: ✓\n- Operação em condições normais: ✓\n- Resposta a emergências: ✓\n- Procedimentos de segurança: ✓\n- Manutenção preventiva: ✓\n\n4. RECOMENDAÇÕES\n\n- Pedro Oliveira necessita completar 40 horas adicionais de treinamento supervisionado\n- Implementar simulações de emergência mensais\n\n5. CONCLUSÃO\n\nEquipe de operadores certificada e apta para operações DP conforme normas IMCA M103.'
  );
