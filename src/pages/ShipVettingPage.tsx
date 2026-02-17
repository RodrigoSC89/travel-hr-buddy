import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { ShipVettingManager } from "@/components/compliance/ShipVettingManager";

export default function ShipVettingPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}><ShipVettingManager /></motion.div>
    </motion.div>
  );
}
