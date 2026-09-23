import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { fetchUserPreferences, updateUserPreferences } from "features/profile/profile.api";
import { AuthContext } from "contexts/AuthContext";
import { createStyles } from "./SettingsTab.style";
import { useTheme } from "contexts/ThemeContext";
import { registerForPushNotificationsAsync, getPushPermissionStatus } from "utils/notifications";
import { showAlert, showConfirm } from "utils/dialogs";
import NotificationSettingsSection from "./settings/NotificationSettingsSection";
import GeneralSettingsSection from "./settings/GeneralSettingsSection";
import DataSection from "./settings/DataSection";
import TwoFactorSection from "./settings/TwoFactorSection";
import AccountActionsSection from "./settings/AccountActionsSection";
import OfflineCacheSection from "./settings/OfflineCacheSection";

const DEFAULT_PREFERENCES = {
  notifications: {
    medicationReminders: true,
    summaryEmails: true,
    refillAlerts: false,
    pushEnabled: true,
  },
  general: {
    language: "hu",
    theme: "system",
    timezone: "Europe/Budapest",
    dailyDigestHour: "08:00",
  },
  data: {
    anonymizedAnalytics: true,
  },
};

const mergePreferences = (incoming) => ({
  notifications: {
    ...DEFAULT_PREFERENCES.notifications,
    ...(incoming?.notifications ?? {}),
  },
  general: {
    ...DEFAULT_PREFERENCES.general,
    ...(incoming?.general ?? {}),
  },
  data: {
    ...DEFAULT_PREFERENCES.data,
    ...(incoming?.data ?? {}),
  },
});

export default function SettingsTab() {
  const { logout } = useContext(AuthContext);
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [initialPreferences, setInitialPreferences] = useState(DEFAULT_PREFERENCES);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadPreferences = async () => {
      try {
        const response = await fetchUserPreferences();
        if (!isMounted) {
          return;
        }
        const merged = mergePreferences(response ?? {});
        setPreferences(merged);
        setInitialPreferences(merged);
        setLastSavedAt(new Date());
      } catch (error) {
        console.error("Beállítások betöltése sikertelen", error);
        showAlert("Hiba történt", "Nem sikerült betölteni a beállításokat. Az alapértelmezett értékeket használjuk.");
        setPreferences(DEFAULT_PREFERENCES);
        setInitialPreferences(DEFAULT_PREFERENCES);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPreferences();
    return () => {
      isMounted = false;
    };
  }, []);

  const hasChanges = useMemo(
    () => JSON.stringify(preferences) !== JSON.stringify(initialPreferences),
    [preferences, initialPreferences]
  );

  const setPreferenceValue = (section, key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleToggle = (section, key) => async (value) => {
    if (key === "pushEnabled" && value && Platform.OS !== "web") {
      const status = await getPushPermissionStatus();
      if (status !== "granted") {
        const token = await registerForPushNotificationsAsync();
        if (!token) {
          Alert.alert("Engedély szükséges", "A push értesítésekhez engedélyezned kell az értesítéseket a telefon beállításaiban.");
          return;
        }
      }
    }
    setPreferenceValue(section, key, value);
  };

  const handleSelect = (section, key, value) => {
    setPreferenceValue(section, key, value);
  };

  const handleInputChange = (section, key, value) => {
    setPreferenceValue(section, key, value);
  };

  const handleSave = async () => {
    if (saving || !hasChanges) {
      return;
    }

    setSaving(true);
    try {
      const payload = preferences;
      const response = await updateUserPreferences(payload);
      const merged = mergePreferences(response ?? payload);
      setPreferences(merged);
      setInitialPreferences(merged);
      setLastSavedAt(new Date());
      showAlert("Sikeres mentés", "A beállítások frissültek.");
    } catch (error) {
      console.error("Beállítások mentése sikertelen", error);
      showAlert("Mentés sikertelen", "Nem sikerült menteni a módosításokat. Próbáld újra később.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="large" color={theme.colors.secondary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <NotificationSettingsSection preferences={preferences} onToggle={handleToggle} />

          <GeneralSettingsSection
            preferences={preferences}
            onSelect={handleSelect}
            onInputChange={handleInputChange}
          />

          <DataSection preferences={preferences} onToggle={handleToggle} />

          <TwoFactorSection />

          <AccountActionsSection />

          {Platform.OS !== 'web' && <OfflineCacheSection />}

          <View style={styles.footer}>
            {lastSavedAt ? (
              <Text style={styles.lastSavedText}>
                Utoljára mentve: {lastSavedAt.toLocaleString("hu-HU")}
              </Text>
            ) : null}
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!hasChanges || saving) && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!hasChanges || saving}
              accessibilityRole="button"
              accessibilityLabel="Beállítások mentése"
              accessibilityState={{ disabled: !hasChanges || saving, busy: saving }}
            >
              {saving ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Beállítások mentése</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Logout Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Fiók</Text>
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              accessibilityRole="button"
              accessibilityLabel="Kijelentkezés"
              onPress={() => {
                showConfirm("Kijelentkezés", "Biztosan ki szeretnél jelentkezni?", {
                  confirmText: "Kijelentkezés",
                  destructive: true,
                  onConfirm: () => {
                    logout();
                    router.replace("/");
                  },
                });
              }}
            >
              <FontAwesome5 name="sign-out-alt" size={18} color={theme.colors.error} />
              <Text style={styles.logoutButtonText}>Kijelentkezés</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
