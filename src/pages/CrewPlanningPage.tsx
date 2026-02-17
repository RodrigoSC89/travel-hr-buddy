import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { CrewPlanningMatrix } from "@/components/crew/CrewPlanningMatrix";

export default function CrewPlanningPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}><CrewPlanningMatrix /></motion.div>
    </motion.div>
  );
}
