import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { TCCharterManager } from "@/components/operations/TCCharterManager";

export default function TCCharterPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}><TCCharterManager /></motion.div>
    </motion.div>
  );
}
