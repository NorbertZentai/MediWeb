import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import {
  fetchUserPreferences,
  requestAccountDeletion,
  requestDataExport,
  updateUserPreferences,
} from "features/profile/profile.api";
import { AuthContext } from "contexts/AuthContext";
import { styles } from "./SettingsTab.style";

const DEFAULT_PREFERENCES = {
  notifications: {
    medicationReminders: true,
    summaryEmails: true,
    refillAlerts: false,
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

const LANGUAGE_OPTIONS = [{ value: "hu", label: "Magyar" }];

const THEME_OPTIONS = [
  { value: "system", label: "Rendszer" },
  { value: "light", label: "Világos" },
  { value: "dark", label: "Sötét" },
];

const TIMEZONE_OPTIONS = [
  { value: "Europe/Budapest", label: "Budapest (GMT+1)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "America/New_York", label: "New York (GMT-5)" },
];

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [initialPreferences, setInitialPreferences] = useState(
    DEFAULT_PREFERENCES
  );
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
        Alert.alert(
          "Hiba történt",
          "Nem sikerült betölteni a beállításokat. Az alapértelmezett értékeket használjuk."
        );
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

  const hasChanges = useMemo(() => {
    return (
      JSON.stringify(preferences) !== JSON.stringify(initialPreferences)
    );
  }, [preferences, initialPreferences]);

  const setPreferenceValue = (section, key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleToggle = (section, key) => (value) => {
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
      Alert.alert("Sikeres mentés", "A beállítások frissültek.");
    } catch (error) {
      console.error("Beállítások mentése sikertelen", error);
      Alert.alert(
        "Mentés sikertelen",
        "Nem sikerült menteni a módosításokat. Próbáld újra később."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDataExport = async () => {
    if (exporting) {
      return;
    }
    setExporting(true);
    try {
      await requestDataExport();
      Alert.alert(
        "Export elindítva",
        "Értesítést küldünk, amint a letöltési link rendelkezésre áll."
      );
    } catch (error) {
      console.error("Adatexport indítása sikertelen", error);
      Alert.alert(
        "Hiba történt",
        "Nem sikerült elindítani az adatexportot. Próbáld újra később."
      );
    } finally {
      setExporting(false);
    }
  };

  const performAccountDeletion = async () => {
    if (deleting) {
      return;
    }
    setDeleting(true);
    try {
      await requestAccountDeletion();
      Alert.alert(
        "Kérés rögzítve",
        "A fiók törlési kérelmét fogadtuk. Ügyfélszolgálatunk felveszi veled a kapcsolatot."
      );
    } catch (error) {
      console.error("Fiók törlési kérelem sikertelen", error);
      Alert.alert(
        "Hiba történt",
        "Nem sikerült rögzíteni a törlési kérelmet. Próbáld újra később."
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleAccountDeletion = () => {
    Alert.alert(
      "Fiók törlése",
      "Biztosan törölni szeretnéd a fiókodat? Ezt a műveletet nem lehet visszavonni.",
      [
        { text: "Mégse", style: "cancel" },
        {
          text: "Törlés",
          style: "destructive",
          onPress: performAccountDeletion,
        },
      ]
    );
  };

  const renderToggleRow = (title, helper, section, key) => (
    <View style={styles.fieldRow} key={`${section}.${key}`}>
      <View style={styles.fieldTextWrapper}>
        <Text style={styles.fieldLabel}>{title}</Text>
        {helper ? <Text style={styles.fieldHelper}>{helper}</Text> : null}
      </View>
      <View style={styles.switchWrapper}>
        <Switch
          value={preferences[section][key]}
          onValueChange={handleToggle(section, key)}
          trackColor={{ false: "#D1D5DB", true: "#10B981" }}
          thumbColor={preferences[section][key] ? "#047857" : "#F3F4F6"}
          ios_backgroundColor="#D1D5DB"
        />
      </View>
    </View>
  );

  const renderPillGroup = (
    title,
    helper,
    options,
    section,
    key,
    { disabled = false, infoText } = {}
  ) => (
    <View style={styles.fieldColumn} key={`${section}.${key}`}>
      <View>
        <Text style={styles.fieldLabel}>{title}</Text>
        {helper ? <Text style={styles.fieldHelper}>{helper}</Text> : null}
      </View>
      <View style={styles.pillGroup}>
        {options.map((option) => {
          const isActive = preferences[section][key] === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.pill,
                isActive && styles.pillActive,
                disabled && styles.pillDisabled,
              ]}
              onPress={() => {
                if (disabled) {
                  return;
                }
                handleSelect(section, key, option.value);
              }}
              activeOpacity={disabled ? 1 : 0.7}
            >
              <Text
                style={[styles.pillLabel, isActive && styles.pillLabelActive]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {infoText ? <Text style={styles.comingSoonText}>{infoText}</Text> : null}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Értesítési beállítások</Text>
              <Text style={styles.sectionSubtitle}>
                Állítsd be, hogyan szeretnél értesítéseket kapni a gyógyszereidről és
                az egészségeddel kapcsolatos teendőkről.
              </Text>
            </View>
            {renderToggleRow(
              "Gyógyszer emlékeztetők",
              "Email értesítések a közelgő gyógyszerbevételekről.",
              "notifications",
              "medicationReminders"
            )}
            {renderToggleRow(
              "Heti email összefoglaló",
              "Vasárnap délben elküldött összegző email a heti gyógyszerhasználatról.",
              "notifications",
              "summaryEmails"
            )}
            {renderToggleRow(
              "Recept megújítás",
              "Értesítés, amikor közeledik egy recept megújításának határideje.",
              "notifications",
              "refillAlerts"
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Általános beállítások</Text>
              <Text style={styles.sectionSubtitle}>
                Testreszabhatod az app megjelenését és alapvető működését.
              </Text>
            </View>
            {renderPillGroup(
              "Alkalmazás nyelve",
              "A felület fő nyelve.",
              LANGUAGE_OPTIONS,
              "general",
              "language",
              {
                infoText: "Angol nyelv hamarosan érkezik.",
              }
            )}
            {renderPillGroup(
              "Téma mód",
              "Válaszd ki a számodra kényelmes megjelenést.",
              THEME_OPTIONS,
              "general",
              "theme",
              {
                disabled: true,
                infoText: "A téma mód beállítás hamarosan elérhető.",
              }
            )}
            {renderPillGroup(
              "Időzóna",
              "Az értesítések és összefoglalók időzítéséhez használjuk.",
              TIMEZONE_OPTIONS,
              "general",
              "timezone"
            )}
            <View style={styles.inlineInputs}>
              <View style={styles.inlineInputWrapper}>
                <Text style={styles.inlineLabel}>Napi összefoglaló ideje</Text>
                <TextInput
                  style={styles.textInput}
                  value={preferences.general.dailyDigestHour}
                  onChangeText={(text) => handleInputChange("general", "dailyDigestHour", text)}
                  placeholder="08:00"
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
                <Text style={styles.fieldHelper}>
                  Melyik időpontban kapj napi összefoglaló értesítést.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Adatkezelés</Text>
              <Text style={styles.sectionSubtitle}>
                Szabályozd, hogyan kezeljük és használjuk fel az adataidat.
              </Text>
            </View>
            {renderToggleRow(
              "Anonimizált analitikák engedélyezése",
              "Segíts nekünk a szolgáltatás fejlesztésében névtelen statisztikák megosztásával.",
              "data",
              "anonymizedAnalytics"
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Fiókműveletek</Text>
              <Text style={styles.sectionSubtitle}>
                Itt tudod kikérni az adataidat vagy kérvényezni a fiókod törlését. A műveletek végrehajtása előtt emailben értesítünk.
              </Text>
            </View>
            <View style={styles.fieldColumn}>
              <TouchableOpacity
                style={[styles.actionButton, exporting && styles.actionButtonDisabled]}
                onPress={handleDataExport}
                disabled={exporting}
              >
                {exporting ? (
                  <ActivityIndicator color="#047857" />
                ) : (
                  <Text style={styles.actionButtonText}>Adatok exportálása</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.dangerButton,
                  deleting && styles.actionButtonDisabled,
                ]}
                onPress={handleAccountDeletion}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator color="#B91C1C" />
                ) : (
                  <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
                    Fiók törlése
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

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
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
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
              onPress={() => {
                Alert.alert(
                  "Kijelentkezés",
                  "Biztosan ki szeretnél jelentkezni?",
                  [
                    { text: "Mégse", style: "cancel" },
                    {
                      text: "Kijelentkezés",
                      style: "destructive",
                      onPress: () => {
                        logout();
                        router.replace("/");
                      },
                    },
                  ]
                );
              }}
            >
              <FontAwesome5 name="sign-out-alt" size={18} color="#EF4444" />
              <Text style={styles.logoutButtonText}>Kijelentkezés</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}