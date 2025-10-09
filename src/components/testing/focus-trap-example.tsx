import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { Code, Lock, X } from "lucide-react";

/**
 * Example demonstrating the useFocusTrap hook
 */
export const FocusTrapExample: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [submitted, setSubmitted] = useState(false);

  const modalRef = useFocusTrap(isModalOpen);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setSubmitted(false);
    }, 1500);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-6 w-6" />
            Focus Trap Hook Example
          </CardTitle>
          <CardDescription>
            Demonstrates the useFocusTrap hook for accessible modals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Trigger Button */}
          <div className="space-y-4">
            <Button onClick={() => setIsModalOpen(true)} variant="default">
              Open Modal with Focus Trap
            </Button>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Try these interactions:
              </h3>
              <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <p>1. Click the button above to open the modal</p>
                <p>
                  2. Try to <Badge variant="outline">Tab</Badge> through elements - focus stays
                  inside
                </p>
                <p>
                  3. Use <Badge variant="outline">Shift+Tab</Badge> to go backwards
                </p>
                <p>
                  4. Press <Badge variant="outline">Esc</Badge> to close
                </p>
                <p>5. Notice focus returns to the trigger button when closed</p>
              </div>
            </div>
          </div>

          {/* Custom Modal with Focus Trap */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              {/* Overlay */}
              <div
                className="fixed inset-0 bg-black/80 animate-in fade-in"
                onClick={() => setIsModalOpen(false)}
                aria-hidden="true"
              />

              {/* Modal */}
              <div
                ref={modalRef as React.RefObject<HTMLDivElement>}
                className="relative z-50 w-full max-w-lg bg-background p-6 shadow-lg rounded-lg border animate-in fade-in zoom-in"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
              >
                {/* Close Button */}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Modal Content */}
                <div className="space-y-4">
                  <div>
                    <h2 id="modal-title" className="text-lg font-semibold">
                      Focus Trapped Modal
                    </h2>
                    <p id="modal-description" className="text-sm text-muted-foreground">
                      Try tabbing through the form. Focus stays inside!
                    </p>
                  </div>

                  {submitted ? (
                    <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800 text-center">
                      <p className="text-green-800 dark:text-green-200 font-medium">
                        ✓ Form submitted successfully!
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter your name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Enter your email"
                          required
                        />
                      </div>

                      <div className="flex gap-2 justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsModalOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Submit</Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Code Example */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Code className="h-4 w-4" />
                Usage Example
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs overflow-x-auto p-4 bg-background rounded-md border">
                {`import { useFocusTrap } from '@/hooks/use-focus-trap';

const MyModal = ({ isOpen, onClose }) => {
  const modalRef = useFocusTrap(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/80" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className="relative z-50 max-w-lg mx-auto"
      >
        <h2>Modal Title</h2>
        <button>Button 1</button>
        <button>Button 2</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};`}
              </pre>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Focus Trap Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                ✓ <strong>Automatic focus</strong> on first focusable element when activated
              </p>
              <p>
                ✓ <strong>Tab cycling</strong> - Tab goes from last to first element
              </p>
              <p>
                ✓ <strong>Shift+Tab cycling</strong> - Goes from first to last element
              </p>
              <p>
                ✓ <strong>Focus restoration</strong> - Returns focus to trigger element when closed
              </p>
              <p>
                ✓ <strong>Keyboard accessible</strong> - Works with all standard keyboard navigation
              </p>
              <p>
                ✓ <strong>Screen reader friendly</strong> - Uses proper ARIA attributes
              </p>
            </CardContent>
          </Card>

          {/* Best Practices */}
          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="text-base text-orange-900 dark:text-orange-100">
                Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-orange-800 dark:text-orange-200">
              <p>
                • Always add{" "}
                <code className="bg-orange-100 dark:bg-orange-950 px-1 rounded">
                  role=&quot;dialog&quot;
                </code>{" "}
                to modal containers
              </p>
              <p>
                • Use{" "}
                <code className="bg-orange-100 dark:bg-orange-950 px-1 rounded">
                  aria-modal=&quot;true&quot;
                </code>{" "}
                to indicate modal state
              </p>
              <p>
                • Include{" "}
                <code className="bg-orange-100 dark:bg-orange-950 px-1 rounded">
                  aria-labelledby
                </code>{" "}
                pointing to the title
              </p>
              <p>
                • Add{" "}
                <code className="bg-orange-100 dark:bg-orange-950 px-1 rounded">
                  aria-describedby
                </code>{" "}
                for descriptions
              </p>
              <p>• Provide a clear way to close (X button, Cancel, Escape key)</p>
              <p>• Store and restore focus to the trigger element</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default FocusTrapExample;
