-- PATCH 547 - Correção de Segurança: Habilitar RLS (Versão Corrigida)

-- Tabelas que precisam de RLS habilitado
ALTER TABLE IF EXISTS public.ia_performance_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ia_suggestions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.watchdog_behavior_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.system_health ENABLE ROW LEVEL SECURITY;

-- Políticas para ia_performance_log (apenas admins podem ver)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ia_performance_log') THEN
    CREATE POLICY "Admins can view performance logs"
      ON public.ia_performance_log FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
        )
      );
      
    CREATE POLICY "System can insert performance logs"
      ON public.ia_performance_log FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- Políticas para ia_suggestions_log
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ia_suggestions_log') THEN
    CREATE POLICY "Users can view their own suggestions"
      ON public.ia_suggestions_log FOR SELECT
      USING (auth.uid() = user_id);
      
    CREATE POLICY "Users can update their own suggestions"
      ON public.ia_suggestions_log FOR UPDATE
      USING (auth.uid() = user_id);
      
    CREATE POLICY "System can create suggestions"
      ON public.ia_suggestions_log FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- Políticas para watchdog_behavior_alerts (apenas admins)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'watchdog_behavior_alerts') THEN
    CREATE POLICY "Admins can view watchdog alerts"
      ON public.watchdog_behavior_alerts FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid() AND role IN ('admin', 'manager', 'supervisor')
        )
      );
      
    CREATE POLICY "System can create watchdog alerts"
      ON public.watchdog_behavior_alerts FOR INSERT
      WITH CHECK (true);
      
    CREATE POLICY "System can update watchdog alerts"
      ON public.watchdog_behavior_alerts FOR UPDATE
      USING (true);
  END IF;
END $$;

-- Políticas para system_health (apenas admins e managers)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'system_health') THEN
    CREATE POLICY "Admins can view system health"
      ON public.system_health FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
        )
      );
      
    CREATE POLICY "System can manage system health"
      ON public.system_health FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Habilitar RLS em performance_metrics
ALTER TABLE IF EXISTS public.performance_metrics ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'performance_metrics' AND policyname = 'Users can view their own metrics') THEN
    CREATE POLICY "Users can view their own metrics"
      ON public.performance_metrics FOR SELECT
      USING (auth.uid() = user_id OR user_id IS NULL);
      
    CREATE POLICY "System can create performance metrics"
      ON public.performance_metrics FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;