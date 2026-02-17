import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { WeatherRoutingEngine } from "@/components/operations/WeatherRoutingEngine";

export default function WeatherRoutingPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}><WeatherRoutingEngine /></motion.div>
    </motion.div>
  );
}
