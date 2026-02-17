import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { AdvancedCargoOperations } from "@/components/operations/AdvancedCargoOperations";

export default function AdvancedCargoPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}><AdvancedCargoOperations /></motion.div>
    </motion.div>
  );
}
