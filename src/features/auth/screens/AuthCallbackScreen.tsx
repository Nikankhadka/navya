import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import type { Session } from "@supabase/supabase-js";
import { Alert as TamaguiAlert } from "@/components/ui";
import { Spacing, Typography, useAppTheme, type ThemeColors } from "@/theme";
import { createSessionFromUrl, getAuthCallbackError } from "@/lib/auth/redirects";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    buttonContainer: {
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.md,
      paddingHorizontal: Spacing.xl,
      paddingBottom: Spacing.xxl,
    },
    continueTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: Typography.weight.bold,
      textAlign: "center",
      marginBottom: Spacing.md,
    },
    button: {
      width: "100%",
    },
    redirectNotice: {
      color: colors.muted,
      fontSize: 12,
      textAlign: "center",
    },
    redirectComplete: {
      position: "absolute",
      top: Spacing.md,
      left: 0,
      right: 0,
      color: colors.textSecondary,
      fontSize: 12,
      textAlign: "center",
    },
  });

type CallbackState = "loading" | "success" | "error";

export default function AuthCallbackScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const incomingUrl = Linking.useURL();
  const refreshProfile = useAuthStore((state) => state.refreshProfile);
  const hasHandledUrlRef = useRef<string | null>(null);

  // Callback states managed via Tamagui Alert pattern
  const [loading, setLoading] = useState(true);
  const [alertState, setAlertState] = useState<AlertData | null>({
    open: false,
    title: "",
    message: "",
    variant: "default",
  });

  interface AlertData {
    open: boolean;
    title: string;
    message: string;
    variant: "default" | "destructive";
    onOpenChange?: (open: boolean) => void;
  }

  // Auto-redirect timer reference for cleanup
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const currentUrl = incomingUrl ?? 
      (typeof window !== "undefined" ? window.location.href : null);

    if (!currentUrl || hasHandledUrlRef.current === currentUrl) {
      // Cleanup on unmount or duplicate URL check
      return () => {
        if (redirectTimerRef.current) {
          clearTimeout(redirectTimerRef.current);
        }
      };
    }

    const callbackUrl = currentUrl;
    hasHandledUrlRef.current = callbackUrl;

    // Cleanup function to cancel redirect on unmount or route change
    async function cleanup() {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
      setLoading(true);
    }

    return cleanup();
  }, [incomingUrl]);

  useEffect(() => {
    const currentUrl = incomingUrl ?? 
      (typeof window !== "undefined" ? window.location.href : null);

    if (!currentUrl || hasHandledUrlRef.current === currentUrl) {
      // Cleanup handler for unmount or route change
      return () => {
        if (redirectTimerRef.current) {
          clearTimeout(redirectTimerRef.current);
        }
      };
    }

    const callbackUrl = currentUrl;
    hasHandledUrlRef.current = callbackUrl;

    // Cleanup handler to cancel redirect on unmount or route change
    async function cleanup() {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
      setLoading(true);
    }

    return cleanup();
  }, [incomingUrl]);

  // Handle incoming callback URL - verify auth session and show appropriate alert
  async function handleCallback() {
    const authCallbackError = getAuthCallbackError(incomingUrl ?? "");

    if (authCallbackError) {
      setAlertState({
        open: true,
        title: "Authentication Error",
        message: authCallbackError,
        variant: "destructive",
        onOpenChange: async (open) => {
          // When user dismisses error alert, reset to loading state for retry
          if (!open && !incomingUrl?.includes("error")) {
            setLoading(true);
          }
        },
      });

      redirectTimerRef.current = setTimeout(() => {
        handleCallback();
      }, 3000); // Auto-retry error handling after 3 seconds

      return;
    }

    try {
      let session: Session | null = null;

      // First, check if Supabase has already created a session (user clicked login link)
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData?.session?.user.id) {
        session = sessionData.session;
      } else if (incomingUrl && incomingUrl.includes("token")) {
        // Create session from callback URL if no existing session
        const sessionResult = await createSessionFromUrl(incomingUrl);
        
        if (!sessionResult.success) {
          setAlertState({
            open: true,
            title: "Authentication Error",
            message: sessionResult.message || "Unable to complete sign-in. Please try again.",
            variant: "destructive",
            onOpenChange: async (open) => {
              if (!open) {
                setLoading(true); // Reset for retry
              }
            },
          });

          redirectTimerRef.current = setTimeout(() => {
            handleCallback();
          }, 3000);

          return;
        } else {
          session = await supabase.auth.getSession().then(r => r.data?.session ?? null);
        }
      }

      // If we have a valid session, complete the authentication flow
      if (session && !session.user.id) {
        const newSessionResult = await createSessionFromUrl(incomingUrl);
        
        if (!newSessionResult.success) {
          setAlertState({
            open: true,
            title: "Authentication Error", 
            message: newSessionResult.message || "Unable to complete sign-in.",
            variant: "destructive",
            onOpenChange: async (open) => {
              if (!open) setLoading(true);
            },
          });

          redirectTimerRef.current = setTimeout(() => handleCallback(), 3000);
          return;
        } else {
          const { data: newSessionData } = await supabase.auth.getSession();
          session = newSessionData?.session ?? null;
        }
      }

      // Verify we have a valid authenticated user
      if (!session) {
        setAlertState({
          open: true,
          title: "Authentication Error",
          message: 
            incomingUrl && incomingUrl.includes("error")
              ? getAuthCallbackError(incomingUrl ?? "") || "Sign-in failed."
              : "The sign-in session was not available. Please check your email and try again.",
          variant: "destructive",
          onOpenChange: async (open) => {
            if (!open && !incomingUrl?.includes("error")) {
              setLoading(true);
            }
          },
        });

        redirectTimerRef.current = setTimeout(() => handleCallback(), 3000);
        return;
      }

      // Auth successful - update auth store and refresh profile data
      useAuthStore.setState({
        session,
        isAuthenticated: true,
        isDemoSession: false,
      });

      await refreshProfile();

      const onboardingComplete = 
        useAuthStore.getState().user?.onboarding_complete;

      // Show success alert with "Continue to Profile" button
      setAlertState({
        open: true,
        title: "Sign-in complete",
        message: 
          onboardingComplete 
            ? "You are signed in. Redirecting to your profile." 
            : "Your account is ready. Continue to setup or profile.",
        variant: "default" as const,
      });

      // Auto-redirect after alert dismissal (4 seconds for user confirmation)
      redirectTimerRef.current = setTimeout(() => {
        router.replace(
          onboardingComplete ? "/(tabs)" : "/(onboarding)/welcome",
        );
      }, 4000);

      setLoading(false);

    } catch (error) {
      console.error("Auth callback error:", error);

      setAlertState({
        open: true,
        title: "Authentication Error",
        message: 
          "Navya hit an unexpected error while finishing sign-in. Please try again.",
        variant: "destructive",
        onOpenChange: async (open) => {
          if (!open && !incomingUrl?.includes("error")) {
            setLoading(true);
          }
        },
      });

      redirectTimerRef.current = setTimeout(() => handleCallback(), 3000);
    }
  }

  // Handle user clicking "Continue" button - navigate to profile or login based on auth state
  function handleContinue() {
    const shouldGoToProfile = useAuthStore.getState().isAuthenticated;
    
    router.replace(shouldGoToProfile ? "/(tabs)/profile" : "/(auth)/login");
  }

  // Initial mount - check if URL needs handling
  useEffect(() => {
    handleCallback();
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ActivityIndicator 
        size="large" 
        color={colors.text}
        style={loading ? { justifyContent: "center", alignItems: "center" } : undefined}
      />

      {!loading && (
        <>
          {/* Default alert state - shows success message when open */}
          {alertState?.open && alertState.variant === "default" && (
            <TamaguiAlert
              open={alertState.open}
              onOpenChange={(isOpen) => {
                if (!isOpen) {
                  // When dismissed, check if we should redirect or go to continue button
                  const shouldGoToProfile = useAuthStore.getState().isAuthenticated;
                  
                  if (redirectTimerRef.current) {
                    clearTimeout(redirectTimerRef.current);
                  }

                  router.replace(shouldGoToProfile ? "/(tabs)/profile" : "/(auth)/login");
                }
              }}
              title={alertState.title}
              message={alertState.message}
            />
          )}

          {/* Error alert state - shows error and continues to login/profile */}
          {alertState?.open && alertState.variant === "destructive" && (
            <TamaguiAlert
              open={alertState.open}
              onOpenChange={(isOpen) => {
                if (!isOpen) {
                  setLoading(true); // Reset for retry
                }
              }}
              title={alertState.title}
              message={alertState.message}
            />
          )}

          {/* Continue button shown after successful auth */}
          {!loading && !alertState?.open && (
            <View style={styles.buttonContainer}>
              <Text style={styles.continueTitle}>Sign-in complete</Text>
              <Button
                label="Continue to Profile"
                onPress={handleContinue}
                fullWidth
                style={styles.button}
              />
              {redirectTimerRef.current && (
                <Text style={styles.redirectNotice}>Redirecting in 4 seconds...</Text>
              )}
            </View>
          )}
        </>
      )}

      {!loading && !alertState?.open && redirectTimerRef.current && (
        <Text style={styles.redirectComplete}>Redirected</Text>
      )}
    </View>
  );
}