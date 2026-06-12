import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';
import { useAppTheme } from '@/theme';

export default function NotFoundScreen() {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: 20,
      }}
    >
      <Stack.Screen options={{ title: 'Not Found' }} />
      <Text
        style={{
          color: colors.textStrong,
          fontSize: 24,
          fontWeight: 'bold',
          marginBottom: 8,
        }}
      >
        Page not found
      </Text>
      <Text style={{ color: colors.textSubtle, marginBottom: 24, textAlign: 'center' }}>
        The screen you are looking for does not exist.
      </Text>
      <Link href="/" style={{ color: colors.accent, fontWeight: 'bold' }}>
        Go home
      </Link>
    </View>
  );
}
