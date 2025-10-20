import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Accessibility Color Demo
 * 
 * This component demonstrates the usage of WCAG 2.1 AA compliant color tokens.
 * All color combinations shown here have been verified to meet or exceed the
 * minimum contrast ratio of 4.5:1 for normal text.
 */
export default function AccessibilityColorDemo() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-text-base mb-4">
        Accessibility Color Tokens Demo
      </h1>
      
      {/* Text Colors Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Text Color Tokens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-text-base text-xl font-semibold">
              text-base: Primary content with highest contrast (16.3:1)
            </div>
            <p className="text-text-base">
              Use <code className="bg-muted px-2 py-1 rounded">text-text-base</code> for primary
              content that requires maximum readability. This color has excellent contrast on all
              dark backgrounds.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-text-muted text-xl font-semibold">
              text-muted: Secondary content (12:1 contrast)
            </div>
            <p className="text-text-muted">
              Use <code className="bg-muted px-2 py-1 rounded">text-text-muted</code> for secondary
              information that is important but not primary. This color maintains excellent
              readability with 12:1 contrast ratio.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-text-subtle text-xl font-semibold">
              text-subtle: Tertiary content (5.12:1 minimum)
            </div>
            <p className="text-text-subtle">
              Use <code className="bg-muted px-2 py-1 rounded">text-text-subtle</code> for tertiary
              information or subtle text that still needs to meet AA standards. This color
              maintains the minimum required contrast of 4.5:1.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Alert Colors Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Color Tokens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-background-base rounded-lg border-l-4 border-alert-warning">
            <div className="flex items-start space-x-3">
              <div className="text-alert-warning text-2xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-alert-warning font-semibold text-lg mb-1">
                  Warning Message
                </h3>
                <p className="text-text-base">
                  Use <code className="bg-muted px-2 py-1 rounded">text-alert-warning</code> for
                  warning messages. This color has 10.69:1 contrast ratio on dark backgrounds.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-background-base rounded-lg border-l-4 border-alert-error">
            <div className="flex items-start space-x-3">
              <div className="text-alert-error text-2xl">❌</div>
              <div className="flex-1">
                <h3 className="text-alert-error font-semibold text-lg mb-1">
                  Error Message
                </h3>
                <p className="text-text-base">
                  Use <code className="bg-muted px-2 py-1 rounded">text-alert-error</code> for
                  error messages. This color has 9.41:1 contrast ratio on dark backgrounds.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-background-base rounded-lg border-l-4 border-alert-success">
            <div className="flex items-start space-x-3">
              <div className="text-alert-success text-2xl">✅</div>
              <div className="flex-1">
                <h3 className="text-alert-success font-semibold text-lg mb-1">
                  Success Message
                </h3>
                <p className="text-text-base">
                  Use <code className="bg-muted px-2 py-1 rounded">text-alert-success</code> for
                  success messages. This color has 9.29:1 contrast ratio on dark backgrounds.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-text-base list-disc list-inside">
            <li>
              Always use semantic color tokens (<code className="bg-muted px-2 py-1 rounded">text-text-base</code>, 
              <code className="bg-muted px-2 py-1 rounded ml-1">text-alert-error</code>, etc.) instead of 
              arbitrary color values
            </li>
            <li className="text-text-muted">
              For secondary information, use <code className="bg-muted px-2 py-1 rounded">text-text-muted</code> 
              to maintain hierarchy while ensuring readability
            </li>
            <li className="text-text-subtle">
              Use <code className="bg-muted px-2 py-1 rounded">text-text-subtle</code> sparingly 
              for least important text that still needs to be accessible
            </li>
            <li>
              Run <code className="bg-muted px-2 py-1 rounded">npm run verify:contrast</code> to 
              verify color contrast ratios
            </li>
            <li>
              Run <code className="bg-muted px-2 py-1 rounded">npm run test:accessibility</code> to 
              test with axe-core (requires dev server)
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Verification Badge */}
      <Card className="bg-gradient-to-r from-emerald-950 to-blue-950 border-emerald-500">
        <CardContent className="p-6 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-text-base mb-2">
            WCAG 2.1 AA Compliant
          </h2>
          <p className="text-text-muted">
            All color tokens in this system meet or exceed the WCAG 2.1 Level AA standard
            with a minimum contrast ratio of 4.5:1 for normal text.
          </p>
          <div className="mt-4 flex justify-center gap-4 text-sm">
            <div className="text-text-subtle">
              <strong className="text-text-base">16.3:1</strong> Maximum Contrast
            </div>
            <div className="text-text-subtle">
              <strong className="text-text-base">5.12:1</strong> Minimum Contrast
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
