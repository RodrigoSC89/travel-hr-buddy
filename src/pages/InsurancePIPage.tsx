import { motion } from 'framer-motion';
import { InsurancePIManager } from "@/components/operations/InsurancePIManager";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";

const InsurancePIPage = () => (
  <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
    <motion.div variants={fadeUp}>
      <h1 className="text-2xl font-bold">Insurance & P&I Manager</h1>
      <p className="text-muted-foreground">Hull & Machinery, P&I Club, claims tracking, and policy management</p>
    </motion.div>
    <motion.div variants={fadeUp}>
      <InsurancePIManager />
    </motion.div>
  </motion.div>
);
export default InsurancePIPage;
