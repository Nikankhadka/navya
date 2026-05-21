import { useEffect } from "react";
import { useToastController } from "tamagui";

interface AlertProps {
  title: string;
  message?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: "default" | "destructive";
  action?: {
    label: string;
    onPress: () => void;
  };
  cancel?: {
    label: string;
    onPress: () => void;
  };
  duration?: number;
}

export function Alert({
  title,
  message,
  open,
  onOpenChange,
  variant = "default",
  action,
  cancel,
  duration = 4000,
}: AlertProps) {
  const toast = useToastController();

  useEffect(() => {
    if (open) {
      toast.show(title, {
        message,
        duration,
        native: false,
        ...(variant === "destructive"
          ? {
              preset: "error",
            }
          : {
              preset: "ok",
            }),
        action: action
          ? {
              label: action.label,
              onPress: () => {
                action.onPress();
                toast.hide();
              },
            }
          : cancel
            ? {
                label: cancel.label,
                onPress: () => {
                  cancel.onPress();
                  toast.hide();
                },
              }
            : undefined,
      });
    } else {
      toast.hide();
    }

    return () => {
      toast.hide();
    };
  }, [open, title, message, variant, action, cancel, duration, toast]);

  return null;
}
