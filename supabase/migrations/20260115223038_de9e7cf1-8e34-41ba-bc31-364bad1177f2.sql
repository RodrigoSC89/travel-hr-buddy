-- =====================================================
-- RLS HARDENING BATCH 7: Ports, Preovid, Priority, Proactive Tables
-- =====================================================

-- ports
DROP POLICY IF EXISTS "ports_policy" ON public.ports;
CREATE POLICY "ports_sel" ON public.ports FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "ports_admin_ins" ON public.ports FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "ports_admin_upd" ON public.ports FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "ports_admin_del" ON public.ports FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- preovid_blocks
DROP POLICY IF EXISTS "preovid_blocks_policy" ON public.preovid_blocks;
CREATE POLICY "preovid_blocks_sel" ON public.preovid_blocks FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "preovid_blocks_ins" ON public.preovid_blocks FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "preovid_blocks_upd" ON public.preovid_blocks FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "preovid_blocks_del" ON public.preovid_blocks FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- preovid_items
DROP POLICY IF EXISTS "preovid_items_policy" ON public.preovid_items;
CREATE POLICY "preovid_items_sel" ON public.preovid_items FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "preovid_items_ins" ON public.preovid_items FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "preovid_items_upd" ON public.preovid_items FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "preovid_items_del" ON public.preovid_items FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- priority_shifts
DROP POLICY IF EXISTS "priority_shifts_policy" ON public.priority_shifts;
CREATE POLICY "priority_shifts_sel" ON public.priority_shifts FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "priority_shifts_ins" ON public.priority_shifts FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "priority_shifts_upd" ON public.priority_shifts FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "priority_shifts_del" ON public.priority_shifts FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- proactive_alerts
DROP POLICY IF EXISTS "proactive_alerts_policy" ON public.proactive_alerts;
CREATE POLICY "proactive_alerts_sel" ON public.proactive_alerts FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "proactive_alerts_ins" ON public.proactive_alerts FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "proactive_alerts_upd" ON public.proactive_alerts FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "proactive_alerts_del" ON public.proactive_alerts FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- procurement_orders
DROP POLICY IF EXISTS "procurement_orders_policy" ON public.procurement_orders;
CREATE POLICY "procurement_orders_sel" ON public.procurement_orders FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "procurement_orders_ins" ON public.procurement_orders FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "procurement_orders_upd" ON public.procurement_orders FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "procurement_orders_del" ON public.procurement_orders FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- regulations
DROP POLICY IF EXISTS "regulations_policy" ON public.regulations;
CREATE POLICY "regulations_sel" ON public.regulations FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "regulations_admin_ins" ON public.regulations FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "regulations_admin_upd" ON public.regulations FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "regulations_admin_del" ON public.regulations FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- rendered_documents
DROP POLICY IF EXISTS "rendered_documents_policy" ON public.rendered_documents;
CREATE POLICY "rendered_documents_sel" ON public.rendered_documents FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "rendered_documents_ins" ON public.rendered_documents FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "rendered_documents_upd" ON public.rendered_documents FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "rendered_documents_del" ON public.rendered_documents FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- replicated_logs
DROP POLICY IF EXISTS "replicated_logs_policy" ON public.replicated_logs;
CREATE POLICY "replicated_logs_sel" ON public.replicated_logs FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "replicated_logs_ins" ON public.replicated_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "replicated_logs_admin_upd" ON public.replicated_logs FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "replicated_logs_admin_del" ON public.replicated_logs FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- reservation_payments (finance access)
DROP POLICY IF EXISTS "reservation_payments_policy" ON public.reservation_payments;
CREATE POLICY "reservation_payments_sel" ON public.reservation_payments FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "reservation_payments_fin_ins" ON public.reservation_payments FOR INSERT TO authenticated WITH CHECK (public.has_finance_access(auth.uid()));
CREATE POLICY "reservation_payments_fin_upd" ON public.reservation_payments FOR UPDATE TO authenticated USING (public.has_finance_access(auth.uid())) WITH CHECK (public.has_finance_access(auth.uid()));
CREATE POLICY "reservation_payments_fin_del" ON public.reservation_payments FOR DELETE TO authenticated USING (public.has_finance_access(auth.uid()));

-- risk_forecast
DROP POLICY IF EXISTS "risk_forecast_policy" ON public.risk_forecast;
CREATE POLICY "risk_forecast_sel" ON public.risk_forecast FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "risk_forecast_ins" ON public.risk_forecast FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "risk_forecast_upd" ON public.risk_forecast FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "risk_forecast_del" ON public.risk_forecast FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- risk_matrix
DROP POLICY IF EXISTS "risk_matrix_policy" ON public.risk_matrix;
CREATE POLICY "risk_matrix_sel" ON public.risk_matrix FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "risk_matrix_ins" ON public.risk_matrix FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "risk_matrix_upd" ON public.risk_matrix FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "risk_matrix_del" ON public.risk_matrix FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- role_permissions (admin only)
DROP POLICY IF EXISTS "role_permissions_policy" ON public.role_permissions;
CREATE POLICY "role_permissions_sel" ON public.role_permissions FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "role_permissions_admin_ins" ON public.role_permissions FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "role_permissions_admin_upd" ON public.role_permissions FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "role_permissions_admin_del" ON public.role_permissions FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- route_ai_suggestions
DROP POLICY IF EXISTS "route_ai_suggestions_policy" ON public.route_ai_suggestions;
CREATE POLICY "route_ai_suggestions_sel" ON public.route_ai_suggestions FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "route_ai_suggestions_ins" ON public.route_ai_suggestions FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "route_ai_suggestions_upd" ON public.route_ai_suggestions FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "route_ai_suggestions_del" ON public.route_ai_suggestions FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- route_optimizations
DROP POLICY IF EXISTS "route_optimizations_policy" ON public.route_optimizations;
CREATE POLICY "route_optimizations_sel" ON public.route_optimizations FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "route_optimizations_ins" ON public.route_optimizations FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "route_optimizations_upd" ON public.route_optimizations FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "route_optimizations_del" ON public.route_optimizations FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- safety_incidents
DROP POLICY IF EXISTS "safety_incidents_policy" ON public.safety_incidents;
CREATE POLICY "safety_incidents_sel" ON public.safety_incidents FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "safety_incidents_ins" ON public.safety_incidents FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "safety_incidents_upd" ON public.safety_incidents FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "safety_incidents_del" ON public.safety_incidents FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));