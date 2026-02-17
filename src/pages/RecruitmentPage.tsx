import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { RecruitmentPipeline } from "@/components/hr/RecruitmentPipeline";

export default function RecruitmentPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}><RecruitmentPipeline /></motion.div>
    </motion.div>
  );
}
