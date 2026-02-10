import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Modal,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getFavorites, removeFromFavorites } from 'features/profile/profile.api';
import { toast } from 'utils/toast';
import { theme } from 'styles/theme';

export default function FavoritesScreen() {
    const router = useRouter();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFavorite, setSelectedFavorite] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchFavoritesList = async () => {
        setLoading(true);
        try {
            const res = await getFavorites();
            setFavorites(res || []);
        } catch (err) {
            console.error("Hiba a kedvencek betöltésekor:", err);
            toast.error("Nem sikerült betölteni a kedvenceket.");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchFavoritesList();
        }, [])
    );

    const confirmDelete = (fav) => {
        setSelectedFavorite(fav);
        setModalVisible(true);
    };

    const handleDelete = async () => {
        try {
            await removeFromFavorites(selectedFavorite.id);
            toast.success("Kedvenc törölve.");
            setFavorites((prev) => prev.filter((f) => f.id !== selectedFavorite.id));
        } catch (err) {
            console.error("Hiba a kedvenc törlésekor:", err);
            toast.error("Törlés sikertelen.");
        } finally {
            setModalVisible(false);
            setSelectedFavorite(null);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Kedvencek</Text>
                    <Text style={styles.headerSubtitle}>
                        Mentett gyógyszerek és termékek
                    </Text>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                ) : favorites.length === 0 ? (
                    <View style={styles.emptyState}>
                        <FontAwesome5 name="heart" size={64} color={theme.colors.border} />
                        <Text style={styles.emptyTitle}>Még nincsenek kedvenceid</Text>
                        <Text style={styles.emptySubtitle}>
                            Adj hozzá gyógyszereket a kedvenceidhez a keresés során
                        </Text>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => router.push('/search')}
                        >
                            <FontAwesome5 name="search" size={16} color={theme.colors.white} />
                            <Text style={styles.primaryButtonText}>Gyógyszerek keresése</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.list}>
                        {favorites.map((fav) => (
                            <TouchableOpacity
                                key={fav.id}
                                style={styles.card}
                                activeOpacity={0.7}
                                onPress={() => router.push(`/medication/${fav.medicationId}`)}
                            >
                                <View style={styles.cardIconWrapper}>
                                    <FontAwesome5 name="pills" size={18} color={theme.colors.primary} />
                                </View>
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle} numberOfLines={2}>
                                        {fav.medicationName}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.deleteIconButton}
                                    onPress={() => confirmDelete(fav)}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <FontAwesome5 name="trash-alt" size={16} color={theme.colors.error} />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Törlés megerősítő modal */}
            <Modal
                animationType="fade"
                transparent
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <FontAwesome5 name="exclamation-triangle" size={28} color={theme.colors.warning} style={{ marginBottom: 12 }} />
                        <Text style={styles.modalTitle}>
                            Biztosan törölni szeretnéd?
                        </Text>
                        <Text style={styles.modalSubtitle}>
                            {selectedFavorite?.medicationName}
                        </Text>
                        <View style={styles.modalActions}>
                            <Pressable
                                style={styles.cancelButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Mégse</Text>
                            </Pressable>
                            <Pressable
                                style={styles.deleteButton}
                                onPress={handleDelete}
                            >
                                <Text style={styles.deleteButtonText}>Törlés</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: theme.spacing.md,
        paddingBottom: 100,
    },
    header: {
        marginBottom: theme.spacing.lg,
    },
    headerTitle: {
        fontSize: theme.fontSize.xxxl,
        fontWeight: theme.fontWeight.extrabold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.xs,
    },
    headerSubtitle: {
        fontSize: theme.fontSize.base,
        color: theme.colors.textSecondary,
    },
    loadingContainer: {
        paddingVertical: 80,
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyTitle: {
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.textPrimary,
        marginTop: theme.spacing.lg,
        marginBottom: theme.spacing.sm,
    },
    emptySubtitle: {
        fontSize: theme.fontSize.base,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
        paddingHorizontal: theme.spacing.xl,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: theme.colors.primary,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: theme.borderRadius.md,
        ...theme.shadows.sm,
    },
    primaryButtonText: {
        fontSize: theme.fontSize.base,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.white,
    },
    list: {
        gap: theme.spacing.sm,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.backgroundCard,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.sm,
    },
    cardIconWrapper: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: theme.colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: theme.fontSize.base,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.textPrimary,
        lineHeight: 22,
    },
    deleteIconButton: {
        padding: theme.spacing.sm,
        marginLeft: theme.spacing.sm,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: theme.components.modal.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
    },
    modalContainer: {
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
        ...theme.shadows.lg,
    },
    modalTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.sm,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.lg,
        textAlign: 'center',
    },
    modalActions: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        width: '100%',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.textSecondary,
    },
    deleteButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.error,
        alignItems: 'center',
    },
    deleteButtonText: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.white,
    },
});
