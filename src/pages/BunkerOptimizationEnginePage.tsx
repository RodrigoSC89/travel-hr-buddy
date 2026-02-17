import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { BunkerOptimizationEngine } from "@/components/operations/BunkerOptimizationEngine";

export default function BunkerOptimizationPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}><BunkerOptimizationEngine /></motion.div>
    </motion.div>
  );
}
