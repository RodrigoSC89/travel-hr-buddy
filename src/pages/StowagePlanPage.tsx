import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { StowagePlanManager } from "@/components/operations/StowagePlanManager";

export default function StowagePlanPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}><StowagePlanManager /></motion.div>
    </motion.div>
  );
}
