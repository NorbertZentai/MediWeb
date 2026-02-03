import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

export default function FavoritesScreen() {
    const router = useRouter();
    const [favorites, setFavorites] = useState([]);

    // TODO: Implement API call to fetch favorites
    useEffect(() => {
        // Placeholder data
        setFavorites([]);
    }, []);

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Kedvencek</Text>
                    <Text style={styles.headerSubtitle}>
                        Mentett gyógyszerek és termékek
                    </Text>
                </View>

                {/* Empty State */}
                {favorites.length === 0 ? (
                    <View style={styles.emptyState}>
                        <FontAwesome5 name="heart" size={64} color="#E2E8F0" />
                        <Text style={styles.emptyTitle}>Még nincsenek kedvenceid</Text>
                        <Text style={styles.emptySubtitle}>
                            Adj hozzá gyógyszereket a kedvenceidhez a keresés során
                        </Text>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => router.push('/search')}
                        >
                            <FontAwesome5 name="search" size={16} color="#FFFFFF" />
                            <Text style={styles.primaryButtonText}>Gyógyszerek keresése</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.grid}>
                        {/* TODO: Render favorite items */}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingTop: Platform.OS === 'ios' ? 70 : 60, // Extra padding for status bar
        paddingBottom: 100,
    },
    header: {
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#64748B',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        marginTop: 24,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 32,
        paddingHorizontal: 32,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#2E7D32',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
});
