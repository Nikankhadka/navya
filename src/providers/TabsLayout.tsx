import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/theme';
import { isCoachEnabled } from '@/config/env';
import { TabIcon } from '@/components/ui/TabIcon';

export default function TabsLayout() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.dim,
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              icon="home-outline"
              iconFocused="home"
              label="Home"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(workout)"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              icon="barbell-outline"
              iconFocused="barbell"
              label="Workout"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(nutrition)"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              icon="restaurant-outline"
              iconFocused="restaurant"
              label="Food"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(coach)"
        options={{
          href: isCoachEnabled ? undefined : null,
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              icon="chatbubbles-outline"
              iconFocused="chatbubbles"
              label="Coach"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              icon="person-outline"
              iconFocused="person"
              label="Profile"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="daily-diary"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
