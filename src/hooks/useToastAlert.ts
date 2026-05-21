import { useCallback, useRef } from "react";
import { useToastController } from "tamagui";

interface ToastAlertOptions {
  title: string;
  message?: string;
  variant?: "default" | "destructive";
  action?: {
    label: string;
    onPress: () => void;
  };
  duration?: number;
}

export function useToastAlert() {
  const toast = useToastController();
  const actionRef = useRef<(() => void) | null>(null);

  const showAlert = useCallback(
    ({
      title,
      message,
      variant = "default",
      action,
      duration = 4000,
    }: ToastAlertOptions) => {
      actionRef.current = action?.onPress ?? null;

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
          : undefined,
      });
    },
    [toast],
  );

  const hideAlert = useCallback(() => {
    toast.hide();
    actionRef.current = null;
  }, [toast]);

  return { showAlert, hideAlert };
}
