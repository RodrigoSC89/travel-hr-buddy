// @ts-nocheck
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ForecastMap() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: ready ? 1 : 0.5 }}
      transition={{ duration: 1 }}
      className="relative border border-[var(--nautilus-border)] rounded-xl overflow-hidden"
      aria-label="Mapa global de previsão marítima"
    >
      {ready ? (
        <iframe
          title="Mapa de Previsão"
          src="https://ocean.nautilus.ai/map"
          className="w-full h-[480px]"
          loading="lazy"
        />
      ) : (
        <div className="flex items-center justify-center h-[480px] text-gray-500">
          Carregando mapa de previsão...
        </div>
      )}
    </motion.div>
  );
}
