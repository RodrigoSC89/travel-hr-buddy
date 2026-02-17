import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { CrewChangeManager } from "@/components/operations/CrewChangeManager";

export default function CrewChangePage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}><CrewChangeManager /></motion.div>
    </motion.div>
  );
}
