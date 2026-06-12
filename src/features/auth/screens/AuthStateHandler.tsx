import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Alert, Button } from '@/components/ui';
import { Spacing, Typography, type ThemeColors } from '@/theme';

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
  /** Countdown seconds until auto-redirect (displayed in success state) */
  countdown: number;
  /** Theme colors for styling */
  colors: ThemeColors;
  /** Called when the alert's open state changes */
  onAlertOpenChange: (open: boolean) => void;
  /** Called when the user presses "Continue" in the success state */
  onContinue: () => void;
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Renders the loading, error, and success states for the auth callback flow.
 * Pure presentational component — all logic lives in AuthCallbackScreen.
 */
export function AuthStateHandler({
  loading,
  alertState,
  countdown,
  colors,
  onAlertOpenChange,
  onContinue,
}: AuthStateHandlerProps) {
  const styles = createStyles(colors);

  return (
    <>
      {/* Loading state */}
      {loading && (
        <View style={styles.loadingContainer}>
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

      {/* Error / success alert */}
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

      {/* Success state (after alert dismissed) */}
      {!loading && alertState?.variant === 'default' && !alertState.open && (
        <View style={styles.buttonContainer}>
          <Text style={styles.continueTitle}>Sign-in complete</Text>
          <Button
            label="Continue to Profile"
            onPress={onContinue}
            fullWidth
            style={styles.button}
          />
          <Text style={styles.redirectNotice}>Redirecting in {countdown}s...</Text>
        </View>
      )}
    </>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.md,
      paddingHorizontal: Spacing.xl,
      paddingBottom: Spacing.xxl,
    },
    continueTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: Typography.weight.bold,
      textAlign: 'center',
      marginBottom: Spacing.md,
    },
    button: {
      width: '100%',
    },
    redirectNotice: {
      color: colors.muted,
      fontSize: 12,
      textAlign: 'center',
    },
  });
