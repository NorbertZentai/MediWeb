import { Stack, useRouter } from 'expo-router';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useContext, useEffect } from 'react';
import { AuthContext } from '@/src/contexts/AuthContext';

export default function ProfileLayout() {
    const { theme } = useTheme();
    const { user, loading } = useContext(AuthContext);
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        }
    }, [user, loading]);

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
