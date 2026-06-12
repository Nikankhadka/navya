import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { Typography } from '@/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export interface TabIconProps {
  icon: IoniconName;
  iconFocused: IoniconName;
  label: string;
  focused: boolean;
  color: string;
}

const indicatorBase = {
  width: 0,
  height: 3,
  borderRadius: 2,
  marginBottom: 2,
} as const;

export function TabIcon({ icon, iconFocused, label, focused, color }: TabIconProps) {
  return (
    <View style={{ alignItems: 'center', gap: 3, paddingTop: 4 }}>
      <View style={[indicatorBase, { backgroundColor: color }, focused && { width: 24 }]} />
      <Ionicons name={focused ? iconFocused : icon} size={22} color={color} />
      <Text
        style={{
          fontSize: 10,
          fontWeight: focused ? Typography.weight.bold : Typography.weight.medium,
          color,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
