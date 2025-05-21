import React, { useState, useEffect } from "react";
import { View, Text, Image, TextInput, TouchableOpacity, Alert } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { styles } from "../ProfileScreen.style";
import defaultAvatar from "assets/default-avatar.jpg";
import { updateUsername, updateEmail, updatePassword, updatePhoneNumber, updateProfileImage, fetchCurrentUser } from "features/profile/profile.api";

export default function ProfileHeader() {
  const [userId, setUserId] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState(defaultAvatar);

  const [isModalVisible, setModalVisible] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [inputValue, setInputValue] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hoveringImage, setHoveringImage] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await fetchCurrentUser();
        setUserId(user.id);
        setName(user.name ?? " - ");
        setEmail(user.email ?? " - ");
        setPhone(user.phone_number ?? " - ");
        setProfileImageUrl(user.imageUrl || defaultAvatar);
      } catch (e) {
        console.error("Nem sikerült betölteni a felhasználót.", e);
      }
    };
    loadUser();
  }, []);

  const openEditModal = (field) => {
    setEditingField(field);
    if (field === "name") setInputValue(name);
    if (field === "email") setInputValue(email);
    if (field === "phone") setInputValue(phone);
    if (field === "image") setInputValue(null);
    setModalVisible(true);
  };

  const selectImage = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) setInputValue(file);
    };
    input.click();
  };

  const handleSave = async () => {
    try {
      if (!userId) throw new Error("Nincs userId.");

      if (editingField === "image") {
        if (!inputValue) return;
        const updated = await updateProfileImage(userId, inputValue);
        setProfileImageUrl(updated.imageUrl);
        Alert.alert("Siker", "A profilkép frissítve lett.");
      }

      if (editingField === "name") {
        const updated = await updateUsername(userId, inputValue);
        setName(updated);
        Alert.alert("Siker", "A név frissítve lett.");
      }

      if (editingField === "email") {
        const updated = await updateEmail(userId, inputValue);
        setEmail(updated);
        Alert.alert("Siker", "Az email frissítve lett.");
      }

      if (editingField === "phone") {
        const updated = await updatePhoneNumber(userId, inputValue);
        setPhone(updated);
        Alert.alert("Siker", "A telefonszám frissítve lett.");
      }

      if (editingField === "password") {
        if (!currentPassword || !newPassword || !confirmPassword) {
          Alert.alert("Hiba", "Kérlek, tölts ki minden mezőt.");
          return;
        }
        if (newPassword !== confirmPassword) {
          Alert.alert("Hiba", "Az új jelszavak nem egyeznek.");
          return;
        }

        await updatePassword(userId, currentPassword, newPassword, confirmPassword);
        Alert.alert("Siker", "A jelszó frissítve lett.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }

      setModalVisible(false);
    } catch (error) {
      console.error("Mentési hiba:", error);
      Alert.alert("Hiba", "Nem sikerült frissíteni az adatot.");
    }
  };

  return (
    <>
      <View style={styles.header}>
        <View
          onMouseEnter={() => setHoveringImage(true)}
          onMouseLeave={() => setHoveringImage(false)}
          style={styles.imageWrapper}
        >
          <Image source={typeof profileImageUrl === 'string' ? { uri: profileImageUrl } : profileImageUrl} style={styles.profileImage} />
          {hoveringImage && (
            <TouchableOpacity style={styles.imageOverlay} onPress={() => openEditModal("image")}>
              <FontAwesome5 name="edit" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.inlineInfoRow}>
          <View style={styles.inlineInfoItem}>
            <Text style={styles.label}>Név:</Text>
            <Text style={styles.value}>{name}</Text>
            <FontAwesome5 name="edit" size={14} style={styles.editIcon} onPress={() => openEditModal("name")} />
          </View>
          <View style={styles.inlineInfoItem}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{email}</Text>
            <FontAwesome5 name="edit" size={14} style={styles.editIcon} onPress={() => openEditModal("email")} />
          </View>
          <View style={styles.inlineInfoItem}>
            <Text style={styles.label}>Telefonszám:</Text>
            <Text style={styles.value}>{phone}</Text>
            <FontAwesome5 name="edit" size={14} style={styles.editIcon} onPress={() => openEditModal("phone")} />
          </View>
          <View style={styles.inlineInfoItem}>
            <Text style={styles.label}>Jelszó módosítása</Text>
            <FontAwesome5 name="edit" size={14} style={styles.editIcon} onPress={() => openEditModal("password")} />
          </View>
        </View>
      </View>

      {isModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {editingField === "password" ? (
              <>
                <Text style={styles.modalTitle}>Jelszó módosítása</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Jelenlegi jelszó"
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Új jelszó"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Új jelszó megerősítése"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </>
            ) : editingField === "image" ? (
              <>
                <Text style={styles.modalTitle}>Profilkép frissítése</Text>
                <TouchableOpacity style={styles.uploadButton} onPress={selectImage}>
                  <Text style={styles.uploadText}>Fájl kiválasztása</Text>
                </TouchableOpacity>
                {inputValue && <Text style={styles.previewFilename}>{inputValue.name}</Text>}
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>
                  {editingField === "name"
                    ? "Név szerkesztése"
                    : editingField === "email"
                    ? "Email szerkesztése"
                    : "Telefonszám szerkesztése"}
                </Text>
                <TextInput
                  style={styles.modalInput}
                  value={inputValue}
                  onChangeText={setInputValue}
                  autoFocus
                />
              </>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButton}>Mégse</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave}>
                <Text style={styles.saveButton}>Mentés</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </>
  );
}