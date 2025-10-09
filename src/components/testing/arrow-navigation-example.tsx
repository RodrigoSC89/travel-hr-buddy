import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useArrowNavigation } from "@/hooks/use-arrow-navigation";
import { Code, ArrowDown, ArrowUp, Keyboard } from "lucide-react";

/**
 * Example demonstrating the useArrowNavigation hook
 */
export const ArrowNavigationExample: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const menuItems = [
    { id: "1", label: "Dashboard", icon: "📊" },
    { id: "2", label: "Settings", icon: "⚙️" },
    { id: "3", label: "Profile", icon: "👤" },
    { id: "4", label: "Notifications", icon: "🔔" },
    { id: "5", label: "Help", icon: "❓" },
  ];

  const { focusedIndex, getItemProps } = useArrowNavigation({
    isOpen: isMenuOpen,
    itemCount: menuItems.length,
    onSelect: index => {
      setSelectedItem(menuItems[index].label);
      setIsMenuOpen(false);
    },
    onClose: () => setIsMenuOpen(false),
    orientation: "vertical",
    loop: true,
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="h-6 w-6" />
            Arrow Navigation Hook Example
          </CardTitle>
          <CardDescription>
            Demonstrates the useArrowNavigation hook for keyboard-accessible menus
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Demo Menu */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button onClick={() => setIsMenuOpen(!isMenuOpen)} variant="outline">
                {isMenuOpen ? "Close Menu" : "Open Menu"}
              </Button>
              {selectedItem && <Badge variant="default">Selected: {selectedItem}</Badge>}
            </div>

            {isMenuOpen && (
              <Card className="w-full max-w-md">
                <CardContent className="p-2">
                  <div className="space-y-1" role="menu" aria-label="Navigation menu">
                    {menuItems.map((item, index) => (
                      <button
                        key={item.id}
                        {...getItemProps(index)}
                        onClick={() => {
                          setSelectedItem(item.label);
                          setIsMenuOpen(false);
                        }}
                        className={`
                          w-full text-left px-4 py-3 rounded-md transition-colors
                          flex items-center gap-3
                          ${
                            focusedIndex === index
                              ? "bg-primary text-primary-foreground ring-2 ring-primary/50"
                              : "hover:bg-accent hover:text-accent-foreground"
                          }
                          focus:outline-none
                        `}
                        role="menuitem"
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Try these keyboard shortcuts:
              </h3>
              <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <ArrowDown className="h-3 w-3" />
                    Arrow Down
                  </Badge>
                  <span>Navigate to next item</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <ArrowUp className="h-3 w-3" />
                    Arrow Up
                  </Badge>
                  <span>Navigate to previous item</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Home</Badge>
                  <span>Jump to first item</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">End</Badge>
                  <span>Jump to last item</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Enter / Space</Badge>
                  <span>Select focused item</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Esc</Badge>
                  <span>Close menu</span>
                </div>
              </div>
            </div>
          </div>

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
                {`import { useArrowNavigation } from '@/hooks/use-arrow-navigation';

const MyMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const items = [...]; // Your menu items

  const { focusedIndex, getItemProps } = useArrowNavigation({
    isOpen,
    itemCount: items.length,
    onSelect: (index) => {
      console.log('Selected:', items[index]);
      setIsOpen(false);
    },
    onClose: () => setIsOpen(false),
    orientation: 'vertical', // or 'horizontal'
    loop: true, // cycle from last to first
  });

  return (
    <div>
      {items.map((item, index) => (
        <button {...getItemProps(index)} key={item.id}>
          {item.label}
        </button>
      ))}
    </div>
  );
};`}
              </pre>
            </CardContent>
          </Card>

          {/* Features List */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Vertical Navigation</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p>• Arrow Up/Down for navigation</p>
                <p>• Enter/Space to select</p>
                <p>• Home/End for first/last</p>
                <p>• Escape to close</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Horizontal Navigation</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p>• Arrow Left/Right for navigation</p>
                <p>• Enter/Space to select</p>
                <p>• Home/End for first/last</p>
                <p>• Escape to close</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArrowNavigationExample;
