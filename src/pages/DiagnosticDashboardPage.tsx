import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { RealTimeComplianceDashboard } from '@/components/compliance/diagnostic';

export default function DiagnosticDashboardPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="container mx-auto py-6 space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-3xl font-bold">📊 Dashboard de Compliance em Tempo Real</h1>
        <p className="text-muted-foreground">Visibilidade 100% do status de conformidade - decisões baseadas em dados</p>
      </motion.div>
      <motion.div variants={fadeUp}><RealTimeComplianceDashboard /></motion.div>
    </motion.div>
  );
}
