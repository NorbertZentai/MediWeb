import { Stack, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/src/contexts/ThemeContext';

export default function NotFoundScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = createStyles(theme);

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Ez az oldal nem található.</Text>
        <TouchableOpacity style={styles.link} onPress={() => router.push('/')}>
          <Text style={styles.linkText}>Vissza a főoldalra</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: theme.fontSize.lg,
      color: theme.colors.textPrimary,
    },
    link: {
      marginTop: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    linkText: {
      fontSize: theme.fontSize.base,
      color: theme.colors.primary,
    },
  });
