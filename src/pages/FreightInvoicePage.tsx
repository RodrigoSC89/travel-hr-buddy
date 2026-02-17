import React from "react";
import { motion } from "framer-motion";
import { FreightInvoiceManager } from "@/components/operations/FreightInvoiceManager";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";

const FreightInvoicePage = () => (
  <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="min-h-screen bg-background p-6">
    <motion.div variants={fadeUp}>
      <FreightInvoiceManager />
    </motion.div>
  </motion.div>
);

export default FreightInvoicePage;
