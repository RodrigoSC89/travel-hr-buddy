/**
 * Header v11.1 - World-Class Maritime Command Bar (i18n)
 * Premium header with glassmorphism, breadcrumbs, and status indicators
 */
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { useSidebar } from "@/components/ui/sidebar";
import { RealTimeNotificationCenter } from "@/components/notifications/real-time-notification-center";
import { UserMenu } from "@/components/auth/user-menu";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { SimpleGlobalSearch } from "@/components/ui/simple-global-search";
import { OrganizationSelector } from "@/components/admin/organization-selector";
import { useHighContrastTheme } from "@/hooks/useHighContrastTheme";
import { useNavigate, useLocation } from "react-router-dom";
import { Settings, Menu, Command, ChevronRight, Home } from "lucide-react";
import { logger } from '@/lib/logger';
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Header: FC = () => {
  const { t } = useTranslation();
  const { isHighContrast, toggleHighContrast } = useHighContrastTheme();
  const { isMobile, toggleSidebar, openMobile, setOpenMobile } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  // Breadcrumb mapping using i18n keys
  const pathNames: Record<string, string> = {
    command: t('nav.commandCenter'),
    ops: t('nav.operations'),
    maintenance: t('nav.maintenance'),
    ai: t('nav.ai'),
    tracking: t('nav.tracking'),
    compliance: t('nav.compliance'),
    workbench: t('nav.workbench'),
    settings: t('nav.settings'),
    admin: "Admin",
    "peo-dp": "PEO-DP",
    peotram: "PEOTRAM",
    "mlc-inspection": "MLC 2006",
    "psc-package": "PSC Package",
    sgso: "SGSO ANP",
    "pre-sire": "Pre-SIRE 2.0",
    "pre-ovid": "Pre-OVID",
    "solas-inspection": "SOLAS",
    "isps-security": "ISPS Security",
    "safety-imca": "ISM Code",
    "waste-management": "MARPOL",
    "tmsa-assessment": "TMSA",
    "premium-reports": t('nav.premiumReports'),
    "voice-copilot": "Voice Copilot",
    "crew-marketplace": "Crew Marketplace",
    "fleet-benchmarking": "Fleet Benchmark",
    "gamification": t('nav.gamification'),
    "whatsapp-bot": t('nav.whatsapp'),
    "security-dashboard": t('nav.security'),
    "performance-monitor": t('nav.performance'),
  };

  // Build breadcrumbs
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => ({
    label: pathNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
    path: '/' + pathSegments.slice(0, index + 1).join('/'),
    isLast: index === pathSegments.length - 1,
  }));

  // Direct handler for mobile menu
  const handleMenuClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isMobile) {
      setOpenMobile(!openMobile);
    } else {
      toggleSidebar();
    }
  };

  return (
    <header 
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="flex h-14 items-center px-3 md:px-4 gap-2">
        {/* Menu Trigger */}
        <button
          type="button"
          onClick={handleMenuClick}
          onTouchEnd={handleMenuClick}
          className="h-10 w-10 md:h-9 md:w-9 shrink-0 touch-manipulation active:scale-95 transition-all flex items-center justify-center rounded-lg hover:bg-accent/80"
          aria-label={t('header.openMenu')}
          aria-expanded={openMobile}
          style={{ 
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
          }}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumbs - Desktop only */}
        {!isMobile && breadcrumbs.length > 0 && (
          <nav className="hidden md:flex items-center gap-1 text-sm min-w-0" aria-label={t('header.breadcrumb')}>
            <button
              onClick={() => navigate('/command')}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-accent/50"
            >
              <Home className="h-3.5 w-3.5" />
            </button>
            {breadcrumbs.map((crumb) => (
              <div key={crumb.path} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
                {crumb.isLast ? (
                  <span className="text-xs font-medium text-foreground truncate max-w-[150px]">
                    {crumb.label}
                  </span>
                ) : (
                  <button
                    onClick={() => navigate(crumb.path)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors truncate max-w-[120px]"
                  >
                    {crumb.label}
                  </button>
                )}
              </div>
            ))}
          </nav>
        )}
        
        <div className="flex flex-1 items-center justify-end gap-2 min-w-0">
          {/* Search - Desktop */}
          <div className="hidden sm:flex flex-1 max-w-sm mx-auto" data-tour="header-search">
            <SimpleGlobalSearch />
          </div>

          {/* Keyboard shortcut hint */}
          {!isMobile && (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true });
                      document.dispatchEvent(event);
                    }}
                    className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <Command className="h-3 w-3" />
                    <span className="text-[10px] font-medium">K</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={8}>
                  <p>{t('header.commandPalette')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {/* Navigation items */}
          <nav className="flex items-center gap-1 shrink-0">
            {isMobile ? (
              <>
                <span data-tour="header-notifications"><RealTimeNotificationCenter /></span>
                <UserMenu />
              </>
            ) : (
              <>
                <LanguageSelector />
                <OrganizationSelector />
                <span data-tour="header-notifications"><RealTimeNotificationCenter /></span>
                
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 cursor-pointer hover:bg-accent/80 transition-all rounded-lg"
                        onClick={() => navigate("/settings")}
                        aria-label={t('header.settings')}
                      >
                        <Settings className="h-4 w-4 text-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={8}>
                      <p>{t('header.settings')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <UserMenu />
                
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant={isHighContrast ? "default" : "ghost"}
                        size="sm"
                        onClick={toggleHighContrast}
                        aria-label={isHighContrast ? t('header.disableHighContrast') : t('header.enableHighContrast')}
                        className="h-9 px-2.5 text-xs cursor-pointer rounded-lg"
                      >
                        Aa
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={8}>
                      <p>{isHighContrast ? t('header.disableHighContrast') : t('header.enableHighContrast')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <ThemeToggle />
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
