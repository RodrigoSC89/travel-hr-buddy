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
      aria-label="Mapa de previsões marítimas globais"
    >
      {!ready && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-900/50 z-10"
          role="status"
          aria-live="polite"
        >
          <p className="text-white">Carregando mapa...</p>
        </div>
      )}
      <iframe
        src="https://www.marinetraffic.com/en/ais/embed/zoom:4"
        title="Mapa de previsões marítimas globais"
        aria-label="Visualização interativa de previsões marítimas em tempo real"
        className="w-full h-[600px] border-0"
        loading="lazy"
      />
    </motion.div>
  );
}
