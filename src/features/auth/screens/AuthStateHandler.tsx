import { ActivityIndicator, Text, View } from 'react-native';
import { Alert } from '@/components/ui';
import { Spacing, type ThemeColors } from '@/theme';

// ── Types ────────────────────────────────────────────────────────────────────

export interface AlertData {
  open: boolean;
  title: string;
  message: string;
  variant: 'default' | 'destructive';
  action?: { label: string; onPress: () => void };
  cancel?: { label: string; onPress: () => void };
}

export interface AuthStateHandlerProps {
  /** Whether the auth flow is still in progress */
  loading: boolean;
  /** Current alert state (null when no alert should show) */
  alertState: AlertData | null;
  /** Theme colors for styling */
  colors: ThemeColors;
  /** Called when the alert's open state changes */
  onAlertOpenChange: (open: boolean) => void;
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Renders the loading and alert states for the auth callback flow.
 * AuthGate handles routing — this component only shows feedback.
 */
export function AuthStateHandler({
  loading,
  alertState,
  colors,
  onAlertOpenChange,
}: AuthStateHandlerProps) {
  return (
    <>
      {loading && (
        <View style={loadingStyles}>
          <ActivityIndicator size="large" color={colors.text} />
          <Text
            style={{
              color: colors.muted,
              fontSize: 14,
              marginTop: Spacing.md,
              textAlign: 'center',
            }}
          >
            Completing sign-in...
          </Text>
        </View>
      )}

      {alertState && (
        <Alert
          open={alertState.open}
          onOpenChange={onAlertOpenChange}
          title={alertState.title}
          message={alertState.message}
          variant={alertState.variant}
          action={alertState.action}
          cancel={alertState.cancel}
        />
      )}
    </>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const loadingStyles = {
  flex: 1,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
};
