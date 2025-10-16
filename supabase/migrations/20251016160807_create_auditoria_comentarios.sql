-- Tabela de comentários para revisão de auditorias
-- Permite adicionar comentários em auditorias IMCA para revisão e colaboração

CREATE TABLE IF NOT EXISTS public.auditoria_comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auditoria_id UUID REFERENCES public.auditorias_imca(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  comentario TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ativar RLS
ALTER TABLE public.auditoria_comentarios ENABLE ROW LEVEL SECURITY;

-- Permitir que usuários vejam comentários da auditoria a qual têm acesso
CREATE POLICY "Usuários podem ver comentários" ON public.auditoria_comentarios
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.auditorias_imca
      WHERE id = auditoria_comentarios.auditoria_id
      AND (auth.uid() = user_id OR public.get_user_role() = 'admin')
    )
  );

-- Permitir inserir comentários se for o autor
CREATE POLICY "Usuários podem comentar" ON public.auditoria_comentarios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins podem deletar (opcional: ou o próprio autor)
CREATE POLICY "Admins podem deletar comentários" ON public.auditoria_comentarios
  FOR DELETE USING (public.get_user_role() = 'admin' OR auth.uid() = user_id);

-- Criar índices para melhor performance
CREATE INDEX idx_auditoria_comentarios_auditoria_id ON public.auditoria_comentarios(auditoria_id);
CREATE INDEX idx_auditoria_comentarios_user_id ON public.auditoria_comentarios(user_id);
CREATE INDEX idx_auditoria_comentarios_created_at ON public.auditoria_comentarios(created_at DESC);

-- Comentários sobre a tabela
COMMENT ON TABLE public.auditoria_comentarios IS 'Comentários de revisão para auditorias IMCA';
COMMENT ON COLUMN public.auditoria_comentarios.id IS 'Identificador único do comentário';
COMMENT ON COLUMN public.auditoria_comentarios.auditoria_id IS 'Referência à auditoria IMCA';
COMMENT ON COLUMN public.auditoria_comentarios.user_id IS 'Usuário que criou o comentário';
COMMENT ON COLUMN public.auditoria_comentarios.comentario IS 'Texto do comentário';
COMMENT ON COLUMN public.auditoria_comentarios.created_at IS 'Data e hora de criação do comentário';
