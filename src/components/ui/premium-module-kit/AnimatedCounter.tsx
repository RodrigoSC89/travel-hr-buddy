/**
 * AnimatedCounter - Contadores animados que contam suavemente
 * Benchmark: Linear, Vercel Dashboard, Stripe
 */

import React, { useEffect, useRef, useState, memo } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  format?: "number" | "currency" | "percent" | "compact";
  locale?: string;
}

function formatValue(val: number, format: string, decimals: number, locale: string, prefix: string, suffix: string): string {
  let formatted: string;
  
  switch (format) {
    case "currency":
      formatted = new Intl.NumberFormat(locale, { 
        minimumFractionDigits: decimals, 
        maximumFractionDigits: decimals 
      }).format(val);
      break;
    case "percent":
      formatted = `${val.toFixed(decimals)}`;
      break;
    case "compact":
      if (val >= 1_000_000) formatted = `${(val / 1_000_000).toFixed(1)}M`;
      else if (val >= 1_000) formatted = `${(val / 1_000).toFixed(1)}K`;
      else formatted = val.toFixed(decimals);
      break;
    default:
      formatted = new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(val);
  }
  
  return `${prefix}${formatted}${suffix}`;
}

export const AnimatedCounter = memo(({
  value,
  duration = 1.2,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
  format = "number",
  locale = "pt-BR",
}: AnimatedCounterProps) => {
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
  const [displayValue, setDisplayValue] = useState(formatValue(0, format, decimals, locale, prefix, suffix));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      setDisplayValue(formatValue(latest, format, decimals, locale, prefix, suffix));
    });
    return unsubscribe;
  }, [spring, format, decimals, locale, prefix, suffix]);

  return (
    <motion.span
      className={`tabular-nums ${className}`}
      key={value}
      initial={{ opacity: 0.6, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {displayValue}
    </motion.span>
  );
});

AnimatedCounter.displayName = "AnimatedCounter";
