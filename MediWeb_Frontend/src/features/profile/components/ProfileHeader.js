import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons"
import { toast } from "utils/toast";

import { styles } from "../ProfileScreen.style";
import defaultAvatar from "assets/default-avatar.jpg";
import {
  updateUsername,
  updateEmail,
  updatePassword,
  updatePhoneNumber,
  updateProfileImage,
  fetchCurrentUser,
} from "features/profile/profile.api";

export default function ProfileHeader() {
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

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await fetchCurrentUser();
        setName(user.name ?? " - ");
        setEmail(user.email ?? " - ");
        setPhone(user.phone_number ?? " - ");
        setProfileImageUrl(user.imageUrl || defaultAvatar);
      } catch (e) {
        console.error("Nem sikerült betölteni a felhasználót.", e);
        toast.error("Nem sikerült betölteni a felhasználót.");
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
    if (Platform.OS === 'web') {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) setInputValue(file);
      };
      input.click();
    } else {
      // On native, show info that image upload is only available on web for now
      Alert.alert(
        "Profilkép",
        "A profilkép feltöltése jelenleg csak webes verzióban érhető el.",
        [{ text: "OK" }]
      );
    }
  };

  const handleSave = async () => {
    try {
      if (editingField === "image") {
        if (!inputValue) return;
        const updated = await updateProfileImage(inputValue);
        setProfileImageUrl(updated.imageUrl);
        toast.success("A profilkép frissítve lett.");
      }

      if (editingField === "name") {
        const updated = await updateUsername(inputValue);
        setName(updated);
        toast.success("A név frissítve lett.");
      }

      if (editingField === "email") {
        const updated = await updateEmail(inputValue);
        setEmail(updated);
        toast.success("Az email frissítve lett.");
      }

      if (editingField === "phone") {
        const updated = await updatePhoneNumber(inputValue);
        setPhone(updated);
        toast.success("A telefonszám frissítve lett.");
      }

      if (editingField === "password") {
        if (!currentPassword || !newPassword || !confirmPassword) {
          toast.error("Kérlek, tölts ki minden mezőt.");
          return;
        }
        if (newPassword !== confirmPassword) {
          toast.error("Az új jelszavak nem egyeznek.");
          return;
        }

        await updatePassword(currentPassword, newPassword, confirmPassword);
        toast.success("A jelszó frissítve lett.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }

      setModalVisible(false);
    } catch (error) {
      console.error("Mentési hiba:", error);
      toast.error("Nem sikerült frissíteni az adatot.");
    }
  };

  const InfoCard = ({ icon, label, value, onEdit }) => (
    <View style={styles.infoCard}>
      <View style={styles.infoCardIcon}>
        <FontAwesome5 name={icon} size={16} color="#2E7D32" />
      </View>
      <View style={styles.infoCardContent}>
        <Text style={styles.infoCardLabel}>{label}</Text>
        <Text style={styles.infoCardValue} numberOfLines={1}>{value}</Text>
      </View>
      <TouchableOpacity style={styles.infoCardEditButton} onPress={onEdit}>
        <FontAwesome5 name="pen" size={12} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <View style={styles.header}>
        {/* Top Section with Avatar and Name */}
        <View style={styles.headerTop}>
          <View style={styles.imageWrapper}>
            <Image
              source={
                typeof profileImageUrl === "string"
                  ? { uri: profileImageUrl }
                  : profileImageUrl
              }
              resizeMode="cover"
              style={styles.profileImage}
            />
            <TouchableOpacity
              style={styles.editImageButton}
              onPress={() => openEditModal("image")}
            >
              <FontAwesome5 name="camera" size={12} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.userName}>{name}</Text>
            <Text style={styles.userEmail}>{email}</Text>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoCardsContainer}>
          <InfoCard
            icon="phone"
            label="Telefonszám"
            value={phone}
            onEdit={() => openEditModal("phone")}
          />
          <InfoCard
            icon="lock"
            label="Jelszó"
            value="••••••••"
            onEdit={() => openEditModal("password")}
          />
        </View>
      </View>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalBox} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>
              {editingField === "name" && "Név szerkesztése"}
              {editingField === "email" && "Email szerkesztése"}
              {editingField === "phone" && "Telefonszám szerkesztése"}
              {editingField === "password" && "Jelszó módosítása"}
              {editingField === "image" && "Profilkép frissítése"}
            </Text>

            {editingField === "password" ? (
              <>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Jelenlegi jelszó"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Új jelszó"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Új jelszó megerősítése"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </>
            ) : editingField === "image" ? (
              <>
                <TouchableOpacity style={styles.uploadButton} onPress={selectImage}>
                  <FontAwesome5 name="cloud-upload-alt" size={32} color="#2E7D32" />
                  <Text style={styles.uploadText}>Kép kiválasztása</Text>
                </TouchableOpacity>
                {inputValue && (
                  <Text style={styles.previewFilename}>
                    {inputValue.name || inputValue.fileName || "Kiválasztva"}
                  </Text>
                )}
              </>
            ) : (
              <TextInput
                style={styles.modalInput}
                value={inputValue}
                onChangeText={setInputValue}
                placeholder={
                  editingField === "name" ? "Neved" :
                    editingField === "email" ? "Email címed" :
                      "Telefonszámod"
                }
                placeholderTextColor="#9CA3AF"
                autoFocus
                keyboardType={
                  editingField === "email" ? "email-address" :
                    editingField === "phone" ? "phone-pad" :
                      "default"
                }
              />
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Mégse</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Mentés</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}