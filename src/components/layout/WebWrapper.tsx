import React from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import { useAppTheme } from '@/theme';

interface WebWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * On web: constrains content to a mobile-width column centered on screen
 * On native: renders children transparently
 */
export function WebWrapper({ children, style }: WebWrapperProps) {
  const { colors } = useAppTheme();

  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={[styles.webRoot, { backgroundColor: colors.webBackdrop }]}>
      <View
        style={[
          styles.webContent,
          {
            backgroundColor: colors.background,
            boxShadow: `0 0 60px ${colors.webShadow}`,
          } as ViewStyle,
          style,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webRoot: {
    flex: 1,
    alignItems: 'center',
  },
  webContent: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
  },
});
