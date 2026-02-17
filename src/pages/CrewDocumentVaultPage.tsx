import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { CrewDocumentVault } from "@/components/crew/CrewDocumentVault";

export default function CrewDocumentVaultPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}><CrewDocumentVault /></motion.div>
    </motion.div>
  );
}
