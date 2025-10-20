import { Card } from "@/components/ui/Card";
import DPIntelligenceCenter from "@/modules/dp-intelligence/DPIntelligenceCenter";
import ControlHubPanel from "@/modules/control-hub/ControlHubPanel";

export default function AccessibilityDemo() {
  return (
    <div className="min-h-screen bg-background-base p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-text-base text-4xl font-bold">
            Accessibility Improvements Demo
          </h1>
          <p className="text-text-muted text-lg">
            WCAG 2.1 AA Compliant Colors with 4.5:1 Minimum Contrast Ratio
          </p>
        </div>

        {/* Color Palette Demo */}
        <div className="space-y-6">
          <h2 className="text-text-base text-2xl font-bold">Color Palette</h2>
          
          {/* Text Colors */}
          <Card title="Text Colors">
            <div className="space-y-4">
              <div>
                <p className="text-text-base font-semibold">text.base (#f1f5f9)</p>
                <p className="text-text-base">
                  High contrast text for primary content. Contrast: 16.30:1 on base, 13.35:1 on surface
                </p>
              </div>
              <div>
                <p className="text-text-muted font-semibold">text.muted (#cbd5e1)</p>
                <p className="text-text-muted">
                  Secondary text for less important content. Contrast: 12.02:1 on base, 9.85:1 on surface
                </p>
              </div>
              <div>
                <p className="text-text-subtle font-semibold">text.subtle (#94a3b8)</p>
                <p className="text-text-subtle">
                  Subtle text for tertiary content. Contrast: 6.96:1 on base
                </p>
              </div>
            </div>
          </Card>

          {/* Alert Colors */}
          <Card title="Alert Colors">
            <div className="space-y-4">
              <div className="p-4 bg-background-elevated rounded-lg">
                <p className="text-alert-success font-bold text-lg">✓ Success Message</p>
                <p className="text-text-muted">Success alerts use #34d399 with 7.61:1 contrast</p>
              </div>
              <div className="p-4 bg-background-elevated rounded-lg">
                <p className="text-alert-warning font-bold text-lg">⚠ Warning Message</p>
                <p className="text-text-muted">Warning alerts use #fbbf24 with 8.76:1 contrast</p>
              </div>
              <div className="p-4 bg-background-elevated rounded-lg">
                <p className="text-alert-error font-bold text-lg">✗ Error Message</p>
                <p className="text-text-muted">Error alerts use #f87171 with 5.29:1 contrast</p>
              </div>
            </div>
          </Card>

          {/* Primary Colors */}
          <Card title="Primary Colors">
            <div className="space-y-4">
              <button className="px-6 py-3 bg-primary-light rounded-lg text-text-base font-semibold hover:bg-primary-DEFAULT transition-colors">
                Primary Button (5.75:1 contrast)
              </button>
              <p className="text-text-muted">
                Primary actions use accessible blue shades that maintain readability
              </p>
            </div>
          </Card>
        </div>

        {/* Module Demos */}
        <div className="space-y-6">
          <h2 className="text-text-base text-2xl font-bold">Module Examples</h2>
          
          <div className="bg-background-surface rounded-2xl p-6">
            <DPIntelligenceCenter />
          </div>

          <div className="bg-background-surface rounded-2xl p-6">
            <ControlHubPanel />
          </div>
        </div>

        {/* Contrast Information */}
        <Card title="WCAG 2.1 AA Compliance">
          <div className="space-y-4 text-text-muted">
            <p>
              <strong className="text-text-base">Level AA Requirements:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Normal text: Minimum 4.5:1 contrast ratio ✓</li>
              <li>Large text (18pt+ or 14pt+ bold): Minimum 3:1 contrast ratio ✓</li>
              <li>UI components and graphics: Minimum 3:1 contrast ratio ✓</li>
            </ul>
            <p className="mt-4">
              <strong className="text-text-base">All color combinations verified:</strong>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              <div className="p-3 bg-background-elevated rounded">
                <p className="font-semibold text-text-base">text.base on surface</p>
                <p className="text-sm">13.35:1 ✓</p>
              </div>
              <div className="p-3 bg-background-elevated rounded">
                <p className="font-semibold text-text-base">text.muted on surface</p>
                <p className="text-sm">9.85:1 ✓</p>
              </div>
              <div className="p-3 bg-background-elevated rounded">
                <p className="font-semibold text-text-base">primary.light on surface</p>
                <p className="text-sm">5.75:1 ✓</p>
              </div>
              <div className="p-3 bg-background-elevated rounded">
                <p className="font-semibold text-text-base">alert.warning on surface</p>
                <p className="text-sm">8.76:1 ✓</p>
              </div>
              <div className="p-3 bg-background-elevated rounded">
                <p className="font-semibold text-text-base">alert.error on surface</p>
                <p className="text-sm">5.29:1 ✓</p>
              </div>
              <div className="p-3 bg-background-elevated rounded">
                <p className="font-semibold text-text-base">alert.success on surface</p>
                <p className="text-sm">7.61:1 ✓</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
