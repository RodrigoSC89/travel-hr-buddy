import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { EnergyEfficiencyDashboard } from "@/components/fleet/EnergyEfficiencyDashboard";

export default function EnergyEfficiencyPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}><EnergyEfficiencyDashboard /></motion.div>
    </motion.div>
  );
}
