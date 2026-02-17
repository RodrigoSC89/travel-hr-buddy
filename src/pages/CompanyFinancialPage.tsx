import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { CompanyFinancialDashboard } from "@/components/finance/CompanyFinancialDashboard";

export default function CompanyFinancialPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}><CompanyFinancialDashboard /></motion.div>
    </motion.div>
  );
}
