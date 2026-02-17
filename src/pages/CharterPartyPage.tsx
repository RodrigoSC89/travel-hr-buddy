import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { CharterPartyManager } from "@/components/operations/CharterPartyManager";

export default function CharterPartyPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}><CharterPartyManager /></motion.div>
    </motion.div>
  );
}
