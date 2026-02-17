import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { RunningHoursTracker } from "@/components/maintenance/RunningHoursTracker";

export default function RunningHoursPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}><RunningHoursTracker /></motion.div>
    </motion.div>
  );
}
