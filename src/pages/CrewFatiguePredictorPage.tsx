import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { CrewFatiguePredictorDashboard } from "@/components/crew/CrewFatiguePredictorDashboard";

export default function CrewFatiguePredictorPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="py-4">
      <motion.div variants={fadeUp}><CrewFatiguePredictorDashboard /></motion.div>
    </motion.div>
  );
}
