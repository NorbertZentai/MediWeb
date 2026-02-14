import React, { useState, useMemo } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Platform } from "react-native";
import { createStyles } from "../ProfilesTab.style";
import { updateMedicationForProfile, removeMedicationFromProfile } from "features/profile/profile.api";
import { useTheme } from "contexts/ThemeContext";
import TimePickerModal from "components/ui/TimePickerModal";

const DAYS = ["H", "K", "Sze", "Cs", "P", "Szo", "V"];

export default function EditMedicationModal({ profileId, medication, onClose, onUpdated, onDeleted }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [note, setNote] = useState(medication.notes || "");
  const [reminders, setReminders] = useState(() => {
    try {
      if (Array.isArray(medication.reminders)) return medication.reminders;
      if (typeof medication.reminders === "string")
        return JSON.parse(medication.reminders || "[]");
      return [];
    } catch (e) {
      console.error("Érvénytelen reminders JSON:", e);
      return [];
    }
  });

  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [activeTimeIndex, setActiveTimeIndex] = useState({ group: null, index: null });

  const updateReminder = (index, newReminder) => {
    const updated = [...reminders];
    updated[index] = newReminder;
    setReminders(updated);
  };

  const addReminderGroup = () => {
    setReminders([...reminders, { days: [], times: [""] }]);
  };

  const deleteReminderGroup = (index) => {
    const updated = reminders.filter((_, i) => i !== index);
    setReminders(updated);
  };

  const toggleDay = (index, day) => {
    const updated = [...reminders];
    const days = updated[index].days.includes(day)
      ? updated[index].days.filter((d) => d !== day)
      : [...updated[index].days, day];
    updated[index].days = days;
    setReminders(updated);
  };

  const updateTime = (groupIndex, timeIndex, value) => {
    const updated = [...reminders];
    if (updated[groupIndex]) {
      if (!updated[groupIndex].times) updated[groupIndex].times = [];
      updated[groupIndex].times[timeIndex] = value;
      setReminders(updated);
    }
  };

  const openTimePicker = (groupIndex, timeIndex) => {
    setActiveTimeIndex({ group: groupIndex, index: timeIndex });
    setTimePickerVisible(true);
  };

  const handleTimeConfirm = (time) => {
    if (activeTimeIndex.group !== null && activeTimeIndex.index !== null) {
      updateTime(activeTimeIndex.group, activeTimeIndex.index, time);
    }
    setTimePickerVisible(false);
    setActiveTimeIndex({ group: null, index: null });
  };

  const handleSave = async () => {
    const cleanedReminders = reminders
      .map((r) => ({
        days: r.days,
        times: r.times.filter((t) => t.trim() !== ""),
      }))
      .filter((r) => r.days.length > 0 && r.times.length > 0);

    try {
      const updated = await updateMedicationForProfile(profileId, medication.itemId, {
        note,
        reminders: cleanedReminders,
      });
      onUpdated(updated);
      onClose();
    } catch (error) {
      console.error("Frissítési hiba:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await removeMedicationFromProfile(profileId, medication.itemId);
      onDeleted(medication.itemId);
      onClose();
    } catch (error) {
      console.error("Törlési hiba:", error);
    }
  };

  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={onClose}>
      <View style={Platform.OS === 'web' ? styles.modalOverlayWeb : styles.modalOverlay}>
        <View style={Platform.OS === 'web' ? styles.editMedicationModalWeb : styles.editMedicationModalContainer}>
          <View style={styles.modalHandle} />
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>Gyógyszer szerkesztése</Text>
            <Text style={styles.medicationTitle}>{medication.medicationName}</Text>

            <TextInput
              style={styles.modalInput}
              value={note}
              onChangeText={setNote}
              placeholder="Megjegyzés..."
              placeholderTextColor={theme.colors.textTertiary}
              multiline
            />

            <Text style={styles.sectionHeaderTextInModal}>Értesítések</Text>

            {reminders.length === 0 && (
              <Text style={styles.noMedicationsText}>Nincs beállított értesítés.</Text>
            )}

            {reminders.map((reminder, index) => (
              <View key={index} style={styles.reminderGroup}>
                <View style={styles.reminderRow}>
                  {/* Napválasztó gombok */}
                  <View style={styles.dayListInline}>
                    {DAYS.map((day) => {
                      const isSelected = reminder.days.includes(day);
                      return (
                        <TouchableOpacity
                          key={day}
                          onPress={() => toggleDay(index, day)}
                          style={[
                            styles.dayButton,
                            isSelected && styles.dayButtonSelected,
                          ]}
                        >
                          <Text style={[styles.dayButtonText, isSelected && styles.dayButtonTextSelected]}>
                            {day}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Időválasztók */}
                  <View style={styles.reminderTimesInline}>
                    {[0, 1, 2].map((timeIndex) => (
                      <View key={timeIndex}>
                        <TouchableOpacity
                          onPress={() => openTimePicker(index, timeIndex)}
                          style={[
                            styles.timeInput,
                            { justifyContent: "center", alignItems: "center" }
                          ]}
                        >
                          <Text style={{
                            color: reminder.times[timeIndex] ? theme.colors.textPrimary : theme.colors.textTertiary,
                            fontSize: 15
                          }}>
                            {reminder.times[timeIndex] || "--:--"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>

                <TouchableOpacity onPress={() => deleteReminderGroup(index)}>
                  <Text style={styles.deleteReminderText}>Emlékeztető törlése</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity onPress={addReminderGroup}>
              <Text style={styles.addReminderButton}>+ Új emlékeztető</Text>
            </TouchableOpacity>
          </ScrollView>

          <TimePickerModal
            visible={timePickerVisible}
            onConfirm={handleTimeConfirm}
            onCancel={() => {
              setTimePickerVisible(false);
              setActiveTimeIndex({ group: null, index: null });
            }}
            processedTime={
              activeTimeIndex.group !== null && activeTimeIndex.index !== null
                ? reminders[activeTimeIndex.group]?.times?.[activeTimeIndex.index]
                : null
            }
            title="Időpont beállítása"
          />

          <View style={styles.modalFooter}>
            <View style={styles.modalFooterRow}>
              <View style={styles.modalFooterLeft}>
                <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                  <Text style={styles.deleteButtonText}>TÖRLÉS</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalFooterRight}>
                <TouchableOpacity onPress={onClose}>
                  <Text style={styles.cancelButton}>Mégse</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave}>
                  <Text style={styles.saveButton}>Mentés</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}