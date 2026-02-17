import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { SmartVoyageOptimizer } from "@/components/operations/SmartVoyageOptimizer";

export default function SmartVoyageOptimizerPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}><SmartVoyageOptimizer /></motion.div>
    </motion.div>
  );
}
