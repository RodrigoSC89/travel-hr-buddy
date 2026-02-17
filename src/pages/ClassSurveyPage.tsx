import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import ClassSurveyTracker from "@/components/compliance/ClassSurveyTracker";

export default function ClassSurveyPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}><ClassSurveyTracker /></motion.div>
    </motion.div>
  );
}
