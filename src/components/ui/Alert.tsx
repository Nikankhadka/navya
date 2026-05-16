import { Button, YStack } from "tamagui";
import { View, StyleSheet, Text } from "react-native";
import { useAppTheme } from "@/theme";

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
}

export function Alert({
  title,
  message,
  open,
  onOpenChange,
  variant = "default",
  action,
  cancel,
}: AlertProps) {
  const { colors } = useAppTheme();

  const backgroundColor = variant === "destructive" ? colors.red : colors.card;
  const titleColor = variant === "destructive" ? colors.red : colors.text;
  const messageColor =
    variant === "destructive" ? colors.red : colors.textSecondary;

  return (
    <View
      style={[
        styles.alert,
        {
          backgroundColor,
          borderColor: variant === "destructive" ? colors.red : colors.border,
        },
      ]}
    >
      <YStack style={styles.content}>
        <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
        {message && (
          <Text style={[styles.message, { color: messageColor }]}>
            {message}
          </Text>
        )}
        {(action || cancel) && (
          <View style={styles.actions}>
            {cancel && (
              <Button
                variant="outlined"
                size="sm"
                onPress={cancel.onPress}
                style={styles.actionButton}
              >
                {cancel.label}
              </Button>
            )}
            {action && (
              <Button
                size="sm"
                onPress={action.onPress}
                style={[styles.actionButton, cancel && { marginLeft: "$2" }]}
                backgroundColor={
                  variant === "destructive" ? colors.red : colors.accent
                }
              >
                {action.label}
              </Button>
            )}
          </View>
        )}
      </YStack>
    </View>
  );
}

const styles = StyleSheet.create({
  alert: {
    maxWidth: 400,
    alignSelf: "center",
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  content: {
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 8,
  },
  actionButton: {
    minWidth: 80,
  },
});
