import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { CrewPayrollCalculator } from "@/components/crew/CrewPayrollCalculator";

export default function CrewPayrollPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="min-h-screen bg-background p-6">
      <motion.div variants={fadeUp}><CrewPayrollCalculator /></motion.div>
    </motion.div>
  );
}
