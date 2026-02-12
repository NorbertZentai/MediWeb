import React, { useState, useCallback, useMemo } from 'react';
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
import { createStyles } from './FavoritesScreen.style';
import { useTheme } from 'contexts/ThemeContext';

export default function FavoritesScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
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
