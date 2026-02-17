import React from "react";
import { motion } from "framer-motion";
import { WarrantyClaimsTracker } from "@/components/maintenance/WarrantyClaimsTracker";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";

const WarrantyClaimsPage = () => (
  <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="min-h-screen bg-background p-6">
    <motion.div variants={fadeUp}>
      <WarrantyClaimsTracker />
    </motion.div>
  </motion.div>
);

export default WarrantyClaimsPage;
