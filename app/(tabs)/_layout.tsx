import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow, Spacing, Typography, withAlpha } from '../../src/constants/theme';

interface TabIconProps {
  emoji: string;
  label: string;
  focused: boolean;
}

function TabIcon({ emoji, label, focused }: TabIconProps) {
  return (
    <View style={[styles.tabIcon, focused ? styles.tabIconFocused : null]}>
      <View style={[styles.tabGlow, focused ? styles.tabGlowFocused : null]}>
        <Text style={styles.tabEmoji}>{emoji}</Text>
      </View>
      <Text style={[styles.tabLabel, focused ? styles.tabLabelActive : null]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: Colors.bg,
        },
        tabBarStyle: {
          position: 'absolute',
          left: Spacing.lg,
          right: Spacing.lg,
          bottom: Math.max(insets.bottom, 12),
          height: 78,
          paddingTop: 10,
          paddingBottom: 8,
          backgroundColor: withAlpha(Colors.wetSoil, 0.96),
          borderWidth: 1,
          borderTopWidth: 1,
          borderColor: withAlpha(Colors.borderLight, 0.86),
          borderRadius: 28,
          ...Shadow.lg,
        },
        tabBarShowLabel: false,
        tabBarItemStyle: {
          paddingVertical: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🌿" label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏋️" label="Workout" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🥗" label="Food" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🧠" label="Coach" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🙂" label="Profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minWidth: 62,
  },
  tabIconFocused: {
    transform: [{ translateY: -1 }],
  },
  tabGlow: {
    width: 44,
    height: 34,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabGlowFocused: {
    backgroundColor: withAlpha(Colors.accent, 0.14),
    borderWidth: 1,
    borderColor: withAlpha(Colors.accent, 0.24),
  },
  tabEmoji: {
    fontSize: 18,
  },
  tabLabel: {
    fontSize: 10,
    color: Colors.dim,
    fontWeight: Typography.weight.medium,
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    color: Colors.text,
    fontWeight: Typography.weight.bold,
  },
});
