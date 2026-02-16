import React, { useEffect, useState } from "react";
import { Ship, Anchor, Compass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const MobileSplash = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-50 bg-gradient-to-br from-background via-background to-primary/20 flex items-center justify-center"
        >
          <div className="text-center">
            <motion.div
              className="mb-8 relative"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-primary/20 shadow-lg shadow-primary/10">
                <Ship className="w-8 h-8 text-primary" />
              </div>
              
              {/* Floating icons */}
              <motion.div
                className="absolute -top-4 -left-4 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Anchor className="w-4 h-4 text-primary/60" />
              </motion.div>
              <motion.div
                className="absolute -top-4 -right-4 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <Compass className="w-4 h-4 text-primary/60" />
              </motion.div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold mb-2 text-foreground"
            >
              Nauti One
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground text-lg mb-8"
            >
              Sistema de Gestão Marítima
            </motion.p>
            
            <div className="flex justify-center items-center space-x-2">
              {[0, 0.2, 0.4].map((delay, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-primary rounded-full"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
