import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Keyboard, Mouse, Check, Info } from "lucide-react";

/**
 * Keyboard Accessibility Demo Component
 *
 * This component demonstrates all keyboard accessibility features
 * implemented across the application.
 */
export const KeyboardAccessibilityDemo: React.FC = () => {
  const [selectedAction, setSelectedAction] = useState<string>("");

  return (
    <div className="container mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="h-6 w-6" />
            Keyboard Accessibility Demo
          </CardTitle>
          <CardDescription>
            Test and verify keyboard navigation across all interactive components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              <Info className="h-5 w-5" />
              Testing Instructions
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
              <li>
                Use <Badge variant="outline">Tab</Badge> to navigate between components
              </li>
              <li>
                Use <Badge variant="outline">Enter</Badge> or <Badge variant="outline">Space</Badge>{" "}
                to activate
              </li>
              <li>
                Use <Badge variant="outline">Esc</Badge> to close modals and menus
              </li>
              <li>
                Use <Badge variant="outline">Arrow Keys</Badge> to navigate within menus
              </li>
              <li>All components should show visible focus indicators</li>
            </ul>
          </div>

          {/* Dialog Test */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">1. Dialog / Modal</h3>
            <p className="text-sm text-muted-foreground">
              Focus is trapped, Esc closes, focus returns to trigger
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open Dialog (Tab + Enter)</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Accessible Dialog</DialogTitle>
                  <DialogDescription>
                    Try navigating with Tab and close with Escape key.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm">
                    This dialog traps focus. You cannot tab outside of it while it's open.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline">First Button</Button>
                    <Button variant="outline">Second Button</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Alert Dialog Test */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">2. Alert Dialog</h3>
            <p className="text-sm text-muted-foreground">
              Confirmation dialogs with keyboard support
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Open Alert (Tab + Enter)</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This demonstrates an accessible confirmation dialog. Use Tab to move between
                    Cancel and Continue buttons.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel (Esc)</AlertDialogCancel>
                  <AlertDialogAction onClick={() => setSelectedAction("Confirmed!")}>
                    Continue (Enter)
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {selectedAction && (
              <Badge variant="default" className="ml-2">
                <Check className="h-3 w-3 mr-1" />
                {selectedAction}
              </Badge>
            )}
          </div>

          {/* Dropdown Menu Test */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">3. Dropdown Menu</h3>
            <p className="text-sm text-muted-foreground">
              Arrow keys navigate, Enter selects, Esc closes
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Open Menu (Tab + Enter)</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setSelectedAction("Profile selected")}>
                  Profile (Arrow + Enter)
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSelectedAction("Billing selected")}>
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSelectedAction("Team selected")}>
                  Team
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setSelectedAction("Logout selected")}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {selectedAction && (
              <Badge variant="default" className="ml-2">
                <Check className="h-3 w-3 mr-1" />
                {selectedAction}
              </Badge>
            )}
          </div>

          {/* Sheet Test */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">4. Sheet / Drawer</h3>
            <p className="text-sm text-muted-foreground">
              Side panel with focus trap and Esc to close
            </p>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Open Sheet (Tab + Enter)</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Accessible Sheet</SheetTitle>
                  <SheetDescription>
                    Focus is trapped within this sheet. Press Escape to close.
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-4 mt-4">
                  <Button className="w-full" variant="outline">
                    Button 1
                  </Button>
                  <Button className="w-full" variant="outline">
                    Button 2
                  </Button>
                  <Button className="w-full" variant="outline">
                    Button 3
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Popover Test */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">5. Popover</h3>
            <p className="text-sm text-muted-foreground">
              Lightweight overlay with keyboard support
            </p>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Open Popover (Tab + Enter)</Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="space-y-2">
                  <h4 className="font-medium">Popover Content</h4>
                  <p className="text-sm text-muted-foreground">
                    This popover is keyboard accessible. Click outside or press Escape to close.
                  </p>
                  <Button size="sm" variant="outline">
                    Action Button
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Select Test */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">6. Select Dropdown</h3>
            <p className="text-sm text-muted-foreground">
              Arrow keys navigate options, Enter selects
            </p>
            <Select onValueChange={value => setSelectedAction(`Selected: ${value}`)}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select an option (Tab + Enter)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1 (Arrow + Enter)</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
                <SelectItem value="option4">Option 4</SelectItem>
              </SelectContent>
            </Select>
            {selectedAction.startsWith("Selected") && (
              <Badge variant="default" className="ml-2">
                <Check className="h-3 w-3 mr-1" />
                {selectedAction}
              </Badge>
            )}
          </div>

          {/* Keyboard Shortcuts Reference */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-base">Keyboard Shortcuts Reference</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Tab</Badge>
                  <span>Next element</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Shift+Tab</Badge>
                  <span>Previous element</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Enter/Space</Badge>
                  <span>Activate</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Esc</Badge>
                  <span>Close/Cancel</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Arrow Keys</Badge>
                  <span>Navigate menu</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Home/End</Badge>
                  <span>First/Last item</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Success Message */}
          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
              <Check className="h-5 w-5" />
              <strong>All components are fully keyboard accessible!</strong> Users can navigate and
              interact with every element using only the keyboard.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KeyboardAccessibilityDemo;
