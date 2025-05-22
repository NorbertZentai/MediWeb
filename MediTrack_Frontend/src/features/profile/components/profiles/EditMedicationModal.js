import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Button,
  ScrollView,
} from "react-native";
import { toast } from "react-toastify";
import { styles } from "../ProfilesTab.style";
import {
  updateMedicationForProfile,
  removeMedicationFromProfile,
} from "features/profile/profile.api";

const DAYS = ["H", "K", "Sze", "Cs", "P", "Szo", "V"];

export default function EditMedicationModal({
  profileId,
  medication,
  onClose,
  onUpdated,
  onDeleted,
}) {
  const [note, setNote] = useState(medication.note || "");
  const [reminders, setReminders] = useState(
    medication.reminders?.length > 0
      ? medication.reminders
      : [
          {
            days: [],
            times: [""],
          },
        ]
  );

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

  const updateTime = (index, timeIndex, value) => {
    const updated = [...reminders];
    updated[index].times[timeIndex] = value;
    setReminders(updated);
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
      toast.success("Gyógyszer frissítve.");
      onUpdated(updated);
      onClose();
    } catch (error) {
      console.error("Frissítési hiba:", error);
      toast.error("Nem sikerült frissíteni a gyógyszert.");
    }
  };

  const handleDelete = async () => {
    try {
      await removeMedicationFromProfile(profileId, medication.itemId);
      toast.success("Gyógyszer törölve.");
      onDeleted(medication.itemId);
      onClose();
    } catch (error) {
      console.error("Törlési hiba:", error);
      toast.error("Nem sikerült törölni a gyógyszert.");
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <ScrollView contentContainerStyle={styles.modalBox}>
        <Text style={styles.modalTitle}>Gyógyszer szerkesztése</Text>
        <Text style={styles.medicationTitle}>{medication.name}</Text>

        <TextInput
          style={styles.modalInput}
          value={note}
          onChangeText={setNote}
          placeholder="Megjegyzés..."
          multiline
        />

        <Text style={styles.sectionHeaderText}>Értesítések</Text>

        {reminders.length === 0 && (
          <Text style={styles.noRemindersText}>Nincs beállított értesítés.</Text>
        )}

        {reminders.map((reminder, index) => (
          <View key={index} style={styles.reminderGroup}>
            <Text style={styles.label}>Napok:</Text>
            <View style={styles.dayList}>
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
                    <Text>{day}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Időpontok:</Text>
            {[0, 1, 2].map((timeIndex) => (
              <TextInput
                key={timeIndex}
                style={styles.modalInput}
                placeholder="Pl. 08:00"
                value={reminder.times[timeIndex] || ""}
                onChangeText={(value) => updateTime(index, timeIndex, value)}
              />
            ))}

            <TouchableOpacity onPress={() => deleteReminderGroup(index)}>
              <Text style={styles.deleteReminderText}>Emlékeztető törlése</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity onPress={addReminderGroup}>
          <Text style={styles.addReminderButton}>+ Új emlékeztető</Text>
        </TouchableOpacity>

        <View style={styles.modalActions}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Mégse</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Mentés</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.deleteButtonContainer}>
          <Button title="Törlés" onPress={handleDelete} color="#d32f2f" />
        </View>
      </ScrollView>
    </View>
  );
}