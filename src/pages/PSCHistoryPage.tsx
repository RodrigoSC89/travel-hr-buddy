import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { PortStateControlHistory } from "@/components/operations/PortStateControlHistory";

export default function PSCHistoryPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}><PortStateControlHistory /></motion.div>
    </motion.div>
  );
}
