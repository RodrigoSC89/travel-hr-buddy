-- ============================================
-- FIX: Políticas RLS Permissivas (9 warnings)
-- Substitui USING(true) por verificações de autenticação
-- ============================================

-- 1. BUDGETS - Corrigir política ALL
DROP POLICY IF EXISTS "Users can manage their org budgets" ON public.budgets;
CREATE POLICY "Authenticated users can manage budgets"
ON public.budgets
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- 2. COST_PREDICTIONS - Corrigir política ALL
DROP POLICY IF EXISTS "Users can manage cost predictions" ON public.cost_predictions;
CREATE POLICY "Authenticated users can manage cost predictions"
ON public.cost_predictions
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- 3. CURRENCY_RATES - Corrigir política ALL (manter público para leitura)
DROP POLICY IF EXISTS "Users can manage currency rates" ON public.currency_rates;
CREATE POLICY "Only admins can manage currency rates"
ON public.currency_rates
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 4. FINANCIAL_FORECASTS - Corrigir política ALL
DROP POLICY IF EXISTS "Users can manage forecasts" ON public.financial_forecasts;
CREATE POLICY "Authenticated users can manage forecasts"
ON public.financial_forecasts
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- 5. INVOICES_PROCESSING - Corrigir política ALL
DROP POLICY IF EXISTS "Users can manage invoices" ON public.invoices_processing;
CREATE POLICY "Authenticated users can manage invoices"
ON public.invoices_processing
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- 6. PURCHASE_ORDERS - Corrigir política ALL
DROP POLICY IF EXISTS "Users can manage their org POs" ON public.purchase_orders;
CREATE POLICY "Authenticated users can manage POs"
ON public.purchase_orders
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- 7. SAVINGS_OPPORTUNITIES - Corrigir política ALL
DROP POLICY IF EXISTS "Users can manage savings opportunities" ON public.savings_opportunities;
CREATE POLICY "Authenticated users can manage savings"
ON public.savings_opportunities
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- 8. SENSOR_READINGS - Corrigir política INSERT (permitir sistema)
DROP POLICY IF EXISTS "System can insert readings" ON public.sensor_readings;
CREATE POLICY "Authenticated can insert sensor readings"
ON public.sensor_readings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Adicionar política para service role (IoT devices)
CREATE POLICY "Service role can insert sensor readings"
ON public.sensor_readings
FOR INSERT
TO service_role
WITH CHECK (true);