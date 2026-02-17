import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import LaytimeDemurrageCalculator from "@/components/operations/LaytimeDemurrageCalculator";

export default function LaytimeDemurragePage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}><LaytimeDemurrageCalculator /></motion.div>
    </motion.div>
  );
}
