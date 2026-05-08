import type { ViewStyle } from 'react-native';
import { View } from 'react-native';
import { Colors } from '@/theme';

export function Divider({ style }: { style?: ViewStyle }) {
  return <View style={[{ height: 1, backgroundColor: Colors.border }, style]} />;
}
