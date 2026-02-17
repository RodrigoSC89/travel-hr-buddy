import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { CrewTravelManager } from "@/components/crew/CrewTravelManager";

export default function CrewTravelPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}><CrewTravelManager /></motion.div>
    </motion.div>
  );
}
