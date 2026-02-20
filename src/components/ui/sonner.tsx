import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      expand={false}
      richColors
      closeButton
      duration={4000}
      gap={8}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-xs",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-lg group-[.toast]:font-medium",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg",
          closeButton: "group-[.toast]:bg-background group-[.toast]:border-border group-[.toast]:text-foreground",
          success: "group-[.toaster]:border-success/30 group-[.toaster]:text-success",
          error: "group-[.toaster]:border-destructive/30 group-[.toaster]:text-destructive",
          warning: "group-[.toaster]:border-warning/30 group-[.toaster]:text-warning",
          info: "group-[.toaster]:border-primary/30 group-[.toaster]:text-primary",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
