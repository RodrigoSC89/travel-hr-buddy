import React, { useState } from 'react';
import { VesselTrackingMap } from '@/components/fleet/VesselTrackingMap';
import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";

export default function VesselTrackingPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="p-6 space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-3xl font-bold">Rastreamento de Embarcações</h1>
        <p className="text-muted-foreground mt-1">
          Posições AIS em tempo real com dados do MarineTraffic
        </p>
      </motion.div>
      
      <motion.div variants={fadeUp}>
        <VesselTrackingMap autoRefresh refreshInterval={60000} />
      </motion.div>
    </motion.div>
  );
}
