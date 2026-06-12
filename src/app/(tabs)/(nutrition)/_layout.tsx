import { Stack } from 'expo-router';

export default function NutritionLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Food' }} />
    </Stack>
  );
}
