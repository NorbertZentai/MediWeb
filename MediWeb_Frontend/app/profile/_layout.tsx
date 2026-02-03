import { Stack } from 'expo-router';

export default function ProfileLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: '#FFFFFF',
                },
                headerTintColor: '#2E7D32',
                headerTitleStyle: {
                    fontWeight: '600',
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
