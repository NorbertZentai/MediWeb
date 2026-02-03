import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    Platform,
    ActivityIndicator,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { toast } from "utils/toast";
import defaultAvatar from "assets/default-avatar.jpg";
import {
    updateUsername,
    updateEmail,
    updatePassword,
    updatePhoneNumber,
    updateProfileImage,
    fetchCurrentUser,
} from "features/profile/profile.api";

export default function AccountScreen() {
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [profileImageUrl, setProfileImageUrl] = useState(null);

    const [editingField, setEditingField] = useState(null);
    const [inputValue, setInputValue] = useState("");
    const [saving, setSaving] = useState(false);

    // Password fields
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const user = await fetchCurrentUser();
            setName(user.name ?? "");
            setEmail(user.email ?? "");
            setPhone(user.phone_number ?? "");
            setProfileImageUrl(user.imageUrl || null);
        } catch (e) {
            console.error("Nem sikerült betölteni a felhasználót.", e);
            toast.error("Nem sikerült betölteni a felhasználót.");
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (field) => {
        setEditingField(field);
        if (field === "name") setInputValue(name);
        if (field === "email") setInputValue(email);
        if (field === "phone") setInputValue(phone);
    };

    const cancelEdit = () => {
        setEditingField(null);
        setInputValue("");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    const handleSave = async () => {
        setSaving(true);
        try {
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
                    setSaving(false);
                    return;
                }
                if (newPassword !== confirmPassword) {
                    toast.error("Az új jelszavak nem egyeznek.");
                    setSaving(false);
                    return;
                }
                await updatePassword(currentPassword, newPassword, confirmPassword);
                toast.success("A jelszó frissítve lett.");
            }

            cancelEdit();
        } catch (error) {
            console.error("Mentési hiba:", error);
            toast.error("Nem sikerült frissíteni az adatot.");
        } finally {
            setSaving(false);
        }
    };

    const InfoRow = ({ icon, label, value, onEdit }) => (
        <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
                <FontAwesome5 name={icon} size={16} color="#2E7D32" />
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value || "-"}</Text>
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
                <FontAwesome5 name="pen" size={12} color="#6B7280" />
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2E7D32" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
                <Image
                    source={profileImageUrl ? { uri: profileImageUrl } : defaultAvatar}
                    style={styles.avatar}
                />
                <TouchableOpacity
                    style={styles.changeAvatarBtn}
                    onPress={() => {
                        if (Platform.OS !== 'web') {
                            Alert.alert("Profilkép", "A profilkép feltöltése jelenleg csak weben érhető el.");
                        }
                    }}
                >
                    <FontAwesome5 name="camera" size={14} color="#2E7D32" />
                    <Text style={styles.changeAvatarText}>Kép módosítása</Text>
                </TouchableOpacity>
            </View>

            {/* Info Cards */}
            {editingField ? (
                <View style={styles.editCard}>
                    <Text style={styles.editCardTitle}>
                        {editingField === "name" && "Név szerkesztése"}
                        {editingField === "email" && "Email szerkesztése"}
                        {editingField === "phone" && "Telefonszám szerkesztése"}
                        {editingField === "password" && "Jelszó módosítása"}
                    </Text>

                    {editingField === "password" ? (
                        <>
                            <TextInput
                                style={styles.input}
                                placeholder="Jelenlegi jelszó"
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Új jelszó"
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry
                                value={newPassword}
                                onChangeText={setNewPassword}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Új jelszó megerősítése"
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                        </>
                    ) : (
                        <TextInput
                            style={styles.input}
                            value={inputValue}
                            onChangeText={setInputValue}
                            placeholder="Írj ide..."
                            placeholderTextColor="#9CA3AF"
                            autoFocus
                            keyboardType={
                                editingField === "email" ? "email-address" :
                                    editingField === "phone" ? "phone-pad" : "default"
                            }
                        />
                    )}

                    <View style={styles.editActions}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={cancelEdit}>
                            <Text style={styles.cancelBtnText}>Mégse</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.saveBtn}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.saveBtnText}>Mentés</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={styles.infoCard}>
                    <InfoRow
                        icon="user"
                        label="Név"
                        value={name}
                        onEdit={() => startEdit("name")}
                    />
                    <InfoRow
                        icon="envelope"
                        label="Email"
                        value={email}
                        onEdit={() => startEdit("email")}
                    />
                    <InfoRow
                        icon="phone"
                        label="Telefonszám"
                        value={phone}
                        onEdit={() => startEdit("phone")}
                    />
                    <InfoRow
                        icon="lock"
                        label="Jelszó"
                        value="••••••••"
                        onEdit={() => startEdit("password")}
                    />
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F7FA",
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5F7FA",
    },
    avatarSection: {
        alignItems: "center",
        marginBottom: 24,
        paddingTop: 8,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#E5E7EB",
        borderWidth: 3,
        borderColor: "#ECFDF5",
    },
    changeAvatarBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 12,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: "#ECFDF5",
        borderRadius: 20,
    },
    changeAvatarText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#2E7D32",
    },
    infoCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    infoIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: "#ECFDF5",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: "#9CA3AF",
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
    },
    editBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
    },
    editCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    editCardTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 16,
        textAlign: "center",
    },
    input: {
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        color: "#1F2937",
        marginBottom: 12,
    },
    editActions: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: "#F3F4F6",
        alignItems: "center",
    },
    cancelBtnText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#6B7280",
    },
    saveBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: "#2E7D32",
        alignItems: "center",
    },
    saveBtnText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
});
