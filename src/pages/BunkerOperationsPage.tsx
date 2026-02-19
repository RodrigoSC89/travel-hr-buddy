import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { BunkerManager } from "@/components/operations/BunkerManager";

export default function BunkerOperationsPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}><BunkerManager /></motion.div>
    </motion.div>
  );
}
