-- ===========================
-- Insert sample data for auditorias_imca table
-- ===========================

-- Sample data for testing ListaAuditoriasIMCA component
INSERT INTO public.auditorias_imca (
  user_id,
  title,
  description,
  status,
  navio,
  norma,
  item_auditado,
  resultado,
  comentarios,
  data,
  audit_date,
  score
) VALUES
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Auditoria DP System - MV Atlantic Star',
    'Verificação do sistema de posicionamento dinâmico',
    'completed',
    'MV Atlantic Star',
    'IMCA M 182',
    'Sistema de Posicionamento Dinâmico',
    'Conforme',
    'Sistema operando conforme especificações. Todos os sensores calibrados e funcionando corretamente.',
    '2025-01-15',
    '2025-01-15',
    95.5
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Auditoria Segurança - MV Pacific Explorer',
    'Verificação de procedimentos de segurança',
    'completed',
    'MV Pacific Explorer',
    'IMCA M 103',
    'Procedimentos de Segurança',
    'Não Conforme',
    'Documentação de segurança desatualizada. Alguns procedimentos não refletem as últimas revisões das normas IMCA.',
    '2025-01-16',
    '2025-01-16',
    72.0
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Auditoria Equipamentos - MV Indian Ocean',
    'Verificação de equipamentos de emergência',
    'completed',
    'MV Indian Ocean',
    'IMCA M 166',
    'Equipamentos de Emergência',
    'Observação',
    'Equipamentos em bom estado, porém alguns itens próximos da data de vencimento da certificação.',
    '2025-01-17',
    '2025-01-17',
    88.0
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Auditoria ROV - MV Atlantic Star',
    'Verificação de operações com ROV',
    'completed',
    'MV Atlantic Star',
    'IMCA R 004',
    'Operações com ROV',
    'Conforme',
    'Operações realizadas de acordo com as melhores práticas. Equipe bem treinada e equipamentos em excelente condição.',
    '2025-01-18',
    '2025-01-18',
    98.0
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Auditoria Treinamento - MV Pacific Explorer',
    'Verificação de programas de treinamento',
    'completed',
    'MV Pacific Explorer',
    'IMCA M 117',
    'Programas de Treinamento',
    'Não Conforme',
    'Registros de treinamento incompletos. Alguns tripulantes sem certificações atualizadas para operações críticas.',
    '2025-01-19',
    '2025-01-19',
    65.0
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Auditoria Ambiental - MV Indian Ocean',
    'Verificação de conformidade ambiental',
    'completed',
    'MV Indian Ocean',
    'IMCA M 220',
    'Gestão Ambiental',
    'Conforme',
    'Todos os procedimentos ambientais sendo seguidos corretamente. Registros de descarte adequados.',
    '2025-01-20',
    '2025-01-20',
    92.0
  )
ON CONFLICT (id) DO NOTHING;

-- Add comment
COMMENT ON TABLE public.auditorias_imca IS 'Tabela para armazenamento de auditorias IMCA com Row Level Security - inclui dados de exemplo';
