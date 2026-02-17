import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { CAPAssessment } from "@/components/compliance/CAPAssessment";

export default function CAPAssessmentPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}><CAPAssessment /></motion.div>
    </motion.div>
  );
}
