import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { toast } from "react-toastify";

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
  const [hoveringImage, setHoveringImage] = useState(false);

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

  return (
    <>
      <View style={styles.header}>
        <View
          onMouseEnter={() => setHoveringImage(true)}
          onMouseLeave={() => setHoveringImage(false)}
          style={styles.imageWrapper}
        >
          <Image
            source={
              typeof profileImageUrl === "string"
                ? { uri: profileImageUrl }
                : profileImageUrl
            }
            resizeMode="cover"
            style={styles.profileImage}
          />
          {hoveringImage && (
            <TouchableOpacity
              style={styles.imageOverlay}
              onPress={() => openEditModal("image")}
            >
              <FontAwesome5 name="edit" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.inlineInfoRow}>
          <View style={styles.inlineInfoItem}>
            <Text style={styles.label}>Név:</Text>
            <Text style={styles.value}>{name}</Text>
            <TouchableOpacity onPress={() => openEditModal("name")}>
              <FontAwesome5 name="edit" size={14} style={styles.editIcon} />
            </TouchableOpacity>
          </View>
          <View style={styles.inlineInfoItem}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{email}</Text>
            <TouchableOpacity onPress={() => openEditModal("email")}>
              <FontAwesome5 name="edit" size={14} style={styles.editIcon} />
            </TouchableOpacity>
          </View>
          <View style={styles.inlineInfoItem}>
            <Text style={styles.label}>Telefonszám:</Text>
            <Text style={styles.value}>{phone}</Text>
            <TouchableOpacity onPress={() => openEditModal("phone")}>
              <FontAwesome5 name="edit" size={14} style={styles.editIcon} />
            </TouchableOpacity>
          </View>
          <View style={styles.inlineInfoItem}>
            <Text style={styles.label}>Jelszó módosítása</Text>
            <TouchableOpacity onPress={() => openEditModal("password")}>
              <FontAwesome5 name="edit" size={14} style={styles.editIcon} />
            </TouchableOpacity>
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
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={selectImage}
                >
                  <Text style={styles.uploadText}>Fájl kiválasztása</Text>
                </TouchableOpacity>
                {inputValue && (
                  <Text style={styles.previewFilename}>
                    {inputValue.name}
                  </Text>
                )}
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