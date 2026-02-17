import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { QHSEIncidentManager } from "@/components/compliance/QHSEIncidentManager";

export default function QHSEIncidentPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}><QHSEIncidentManager /></motion.div>
    </motion.div>
  );
}
