import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { NoonReportAnalytics } from "@/components/operations/NoonReportAnalytics";

export default function NoonReportAnalyticsPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}><NoonReportAnalytics /></motion.div>
    </motion.div>
  );
}
