import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { VoyageEstimateCalculator } from "@/components/operations/VoyageEstimateCalculator";

export default function VoyageEstimatePage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="min-h-screen bg-background p-6">
      <motion.div variants={fadeUp}><VoyageEstimateCalculator /></motion.div>
    </motion.div>
  );
}
