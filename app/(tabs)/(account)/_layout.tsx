import { Stack } from 'expo-router';

const TabLayout: React.FC = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'white' },
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="insettings" />
    </Stack>
  );
};

export default TabLayout;
