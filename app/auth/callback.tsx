import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { Colors, Spacing, Typography } from '../../src/constants/theme';

export default function AuthCallbackScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ActivityIndicator size="large" color={Colors.text} />
      <Text style={styles.title}>Completing sign-in</Text>
      <Text style={styles.subtitle}>Navya is finishing your secure login.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.bg,
  },
  title: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: Typography.weight.bold,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
});
