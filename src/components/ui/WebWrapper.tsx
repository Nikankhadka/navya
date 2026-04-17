import React from 'react';
import { View, StyleSheet, Platform, type ViewStyle } from 'react-native';
import { Colors, withAlpha } from '../../constants/theme';

interface WebWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * On web: constrains content to a mobile-width column centered on screen
 * On native: renders children transparently
 */
export function WebWrapper({ children, style }: WebWrapperProps) {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={styles.webRoot}>
      <View style={[styles.webContent, style]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  webRoot: {
    flex: 1,
    backgroundColor: Colors.canopyBlack,
    alignItems: 'center',
  },
  webContent: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    backgroundColor: Colors.bg,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: withAlpha(Colors.outlineVariant, 0.12),
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: `0 30px 100px ${withAlpha(Colors.secondaryContainer, 0.24)}, 0 0 0 1px ${withAlpha(
            Colors.outlineVariant,
            0.12,
          )}`,
        } as ViewStyle)
      : {}),
  },
});
