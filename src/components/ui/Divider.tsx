import type { ViewStyle } from 'react-native';
import { View } from 'react-native';
import { useAppTheme } from '@/theme';

export function Divider({ style }: { style?: ViewStyle }) {
  const { colors } = useAppTheme();

  return <View style={[{ height: 1, backgroundColor: colors.border }, style]} />;
}
