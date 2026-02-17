import React from "react";
import { RegulatoryChangeTracker } from "@/components/compliance/RegulatoryChangeTracker";
import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";

const RegulatoryRadarPage = () => (
  <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="min-h-screen bg-background p-6">
    <motion.div variants={fadeUp}><RegulatoryChangeTracker /></motion.div>
  </motion.div>
);

export default RegulatoryRadarPage;