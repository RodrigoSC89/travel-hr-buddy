import { SmartEvidencePackGenerator } from "@/components/compliance/SmartEvidencePackGenerator";
import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";

export default function SmartEvidencePackPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}><SmartEvidencePackGenerator /></motion.div>
    </motion.div>
  );
}
