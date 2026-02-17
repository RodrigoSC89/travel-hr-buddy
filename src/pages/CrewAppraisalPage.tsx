import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { CrewAppraisalSystem } from "@/components/crew/CrewAppraisalSystem";

export default function CrewAppraisalPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}><CrewAppraisalSystem /></motion.div>
    </motion.div>
  );
}
