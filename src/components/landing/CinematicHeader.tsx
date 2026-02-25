/**
 * CinematicHeader - Transparent glassmorphism header that becomes solid on scroll
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { Anchor, ArrowRight, Play } from "lucide-react";

export function CinematicHeader({ navigate }: { navigate: (path: string) => void }) {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/30 shadow-lg shadow-black/10"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Anchor className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-[hsl(190,95%,50%)] bg-clip-text text-transparent">
            Nauti One
          </span>
          <Badge variant="secondary" className="text-[10px] ml-1 hidden sm:inline-flex bg-white/5 border-white/10 text-white/50">
            v4.0
          </Badge>
        </div>
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {["features", "differentiators", "pricing", "testimonials"].map((id) => (
            <a
              key={id}
              href={`#${id}`}
              className={`transition-colors ${scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/50 hover:text-white"}`}
            >
              {t(`landing.nav.${id === "differentiators" ? "whyNautiOne" : id}`)}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <Link to="/demo">
            <Button variant="ghost" size="sm" className={`gap-1.5 ${scrolled ? "" : "text-white/70 hover:text-white hover:bg-white/10"}`}>
              <Play className="h-3 w-3" /> Demo
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="ghost" size="sm" className={scrolled ? "" : "text-white/70 hover:text-white hover:bg-white/10"}>
              {t("auth.login")}
            </Button>
          </Link>
          <Link to="/auth?mode=signup">
            <Button size="sm" className="gap-1.5 shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-[hsl(190,95%,45%)] border-0">
              {t("landing.hero.startTrial")} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
