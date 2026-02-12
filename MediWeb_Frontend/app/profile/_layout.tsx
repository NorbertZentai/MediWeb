import { Stack } from 'expo-router';
import { useTheme } from '@/src/contexts/ThemeContext';

export default function ProfileLayout() {
    const { theme } = useTheme();

    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: theme.colors.background,
                },
                headerTintColor: theme.colors.primary,
                headerTitleStyle: {
                    fontWeight: '600',
                    color: theme.colors.textPrimary,
                },
                headerShadowVisible: false,
                headerBackTitle: 'Vissza',
            }}
        >
            <Stack.Screen name="account" options={{ title: 'Fiók adatok' }} />
            <Stack.Screen name="profiles" options={{ title: 'Profilok' }} />
            <Stack.Screen name="favorites" options={{ title: 'Kedvencek' }} />
            <Stack.Screen name="intake" options={{ title: 'Bevitel' }} />
            <Stack.Screen name="statistics" options={{ title: 'Statisztikák' }} />
            <Stack.Screen name="settings" options={{ title: 'Beállítások' }} />
        </Stack>
    );
}
