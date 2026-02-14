import React, { useState, useEffect, useMemo } from "react";
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
import { useTheme } from "contexts/ThemeContext";
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
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
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
                <FontAwesome5 name={icon} size={16} color={theme.colors.primary} />
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value || "-"}</Text>
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
                <FontAwesome5 name="pen" size={12} color={theme.colors.textSecondary} />
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
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
                    <FontAwesome5 name="camera" size={14} color={theme.colors.primary} />
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
                                placeholderTextColor={theme.colors.textTertiary}
                                secureTextEntry
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Új jelszó"
                                placeholderTextColor={theme.colors.textTertiary}
                                secureTextEntry
                                value={newPassword}
                                onChangeText={setNewPassword}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Új jelszó megerősítése"
                                placeholderTextColor={theme.colors.textTertiary}
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
                            placeholderTextColor={theme.colors.textTertiary}
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
                                <ActivityIndicator size="small" color={theme.colors.white} />
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

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        width: "100%",
        maxWidth: 1000,
        alignSelf: "center",
        padding: theme.spacing.md,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.background,
    },
    avatarSection: {
        alignItems: "center",
        marginBottom: theme.spacing.lg,
        paddingTop: theme.spacing.sm,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.border,
        borderWidth: 3,
        borderColor: theme.colors.primaryMuted,
    },
    changeAvatarBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.sm,
        marginTop: theme.spacing.sm + 4,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        backgroundColor: theme.colors.primaryMuted,
        borderRadius: theme.borderRadius.xl,
    },
    changeAvatarText: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.primary,
    },
    infoCard: {
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.lg,
        overflow: "hidden",
        ...theme.shadows.md,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
    },
    infoIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: theme.colors.primaryMuted,
        justifyContent: "center",
        alignItems: "center",
        marginRight: theme.spacing.sm + 4,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textTertiary,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: theme.fontSize.base,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.textPrimary,
    },
    editBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: theme.colors.divider,
        justifyContent: "center",
        alignItems: "center",
    },
    editCard: {
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg - 4,
        ...theme.shadows.md,
    },
    editCardTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.md,
        textAlign: "center",
    },
    input: {
        backgroundColor: theme.colors.backgroundElevated,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        paddingVertical: 14,
        paddingHorizontal: theme.spacing.md,
        fontSize: theme.fontSize.base,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.sm + 4,
    },
    editActions: {
        flexDirection: "row",
        gap: theme.spacing.sm + 4,
        marginTop: theme.spacing.sm,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.backgroundElevated,
        alignItems: "center",
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cancelBtnText: {
        fontSize: theme.fontSize.base,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.textSecondary,
    },
    saveBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.primary,
        alignItems: "center",
    },
    saveBtnText: {
        fontSize: theme.fontSize.base,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.white,
    },
});
