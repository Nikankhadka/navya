import React from 'react';
import { View, StyleSheet, Platform, type ViewStyle } from 'react-native';
import { Colors } from '../../lib/theme';

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
    backgroundColor: '#06060B', // slightly darker than card bg, looks like a browser bg
    alignItems: 'center',
  },
  webContent: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    backgroundColor: Colors.bg,
    // Subtle shadow to lift the phone frame off the web bg
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 0 60px rgba(0,0,0,0.8)',
        } as ViewStyle)
      : {}),
  },
});
