import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { ProcurementWorkflow } from "@/components/operations/ProcurementWorkflow";

export default function ProcurementPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}><ProcurementWorkflow /></motion.div>
    </motion.div>
  );
}
