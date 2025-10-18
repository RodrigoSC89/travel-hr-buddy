-- ===========================
-- SGSO IBAMA Requirements Table
-- 17 Official IBAMA SGSO Requirements
-- ===========================

-- Create the sgso_ibama_requirements table
CREATE TABLE IF NOT EXISTS public.sgso_ibama_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_number INTEGER NOT NULL UNIQUE CHECK (requirement_number BETWEEN 1 AND 17),
  requirement_title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sgso_ibama_requirements ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read requirements
CREATE POLICY "Authenticated users can view IBAMA requirements"
  ON public.sgso_ibama_requirements FOR SELECT
  TO authenticated
  USING (true);

-- Insert the 17 official IBAMA SGSO requirements
INSERT INTO public.sgso_ibama_requirements (requirement_number, requirement_title, description) VALUES
(1, 'Política de SMS', 'A empresa deve estabelecer uma política documentada de Segurança, Meio Ambiente e Saúde (SMS), aprovada pela alta direção, divulgada e compreendida por todos os níveis da organização.'),
(2, 'Planejamento Operacional', 'A empresa deve planejar as atividades considerando os aspectos de SMS, definindo metas, indicadores e controles específicos para cada operação embarcada.'),
(3, 'Treinamento e Capacitação', 'Todos os colaboradores devem ser treinados de acordo com as funções desempenhadas, com registros, planos de capacitação e evidências atualizadas.'),
(4, 'Comunicação e Acesso à Informação', 'A empresa deve assegurar o fluxo de informações relevantes de SMS, garantindo que documentos e procedimentos estejam acessíveis e atualizados a bordo.'),
(5, 'Gestão de Riscos', 'A empresa deve identificar, avaliar e controlar riscos operacionais e ambientais associados às suas atividades embarcadas.'),
(6, 'Equipamentos Críticos', 'Deve-se identificar equipamentos críticos para segurança e meio ambiente, estabelecendo rotinas de manutenção, testes e inspeção periódicos.'),
(7, 'Procedimentos de Emergência', 'Procedimentos de resposta a emergências devem estar definidos, treinados e disponíveis, com simulações periódicas e análise de desempenho.'),
(8, 'Manutenção Preventiva', 'A embarcação deve possuir planos documentados de manutenção preventiva dos sistemas e equipamentos críticos.'),
(9, 'Inspeções e Verificações', 'Deve haver rotinas formais de inspeção, com registros, responsáveis definidos e tratamento das não conformidades encontradas.'),
(10, 'Auditorias Internas', 'Auditorias internas periódicas devem ser realizadas para verificar a conformidade do SGSO, com planos de ação e registros documentados.'),
(11, 'Gestão de Mudanças', 'Mudanças operacionais e estruturais devem ser avaliadas quanto ao impacto no SGSO, com registros, aprovações e planos de controle.'),
(12, 'Registro de Incidentes', 'Todos os incidentes, acidentes e quase-acidentes devem ser registrados, analisados e tratados formalmente com ações corretivas.'),
(13, 'Análise de Causa Raiz', 'Deve-se aplicar metodologia apropriada para identificar causas-raiz de falhas ou incidentes críticos, documentando e disseminando o aprendizado.'),
(14, 'Ações Corretivas e Preventivas', 'O SGSO deve prever a implementação, o acompanhamento e a verificação de eficácia das ações corretivas e preventivas.'),
(15, 'Monitoramento de Indicadores', 'Indicadores de desempenho em SMS devem ser definidos, monitorados, analisados e utilizados na melhoria contínua do sistema.'),
(16, 'Avaliação da Conformidade Legal', 'A empresa deve assegurar o atendimento à legislação ambiental e de segurança, com controles atualizados e verificações periódicas.'),
(17, 'Melhoria Contínua', 'O SGSO deve possuir mecanismos de revisão e melhoria contínua com base em auditorias, indicadores e lições aprendidas.');

-- Create index for faster lookups
CREATE INDEX idx_sgso_ibama_requirements_number ON public.sgso_ibama_requirements(requirement_number);

-- Add comment to the table
COMMENT ON TABLE public.sgso_ibama_requirements IS 'Official IBAMA SGSO requirements - 17 mandatory compliance items';
