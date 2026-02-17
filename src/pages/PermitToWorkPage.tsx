import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { PermitToWork } from "@/components/compliance/PermitToWork";

export default function PermitToWorkPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}><PermitToWork /></motion.div>
    </motion.div>
  );
}
