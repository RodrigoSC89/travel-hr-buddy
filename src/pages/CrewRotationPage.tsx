import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import CrewRotationMatrix from "@/components/crew/CrewRotationMatrix";

export default function CrewRotationPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}><CrewRotationMatrix /></motion.div>
    </motion.div>
  );
}
